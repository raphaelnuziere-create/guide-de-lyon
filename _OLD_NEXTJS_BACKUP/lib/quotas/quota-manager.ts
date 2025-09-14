import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase-client';
import { httpsCallable } from 'firebase/functions';
import { firebaseFunctions } from '@/lib/firebase-client';

export interface PlanLimits {
  maxPlaces: number; // Toujours 1 pour tous les plans
  maxEvents: number; // Nombre d'événements par mois
  maxPhotosPerPlace: number;
  eventsOnHomepage: boolean; // Si les événements apparaissent sur la page d'accueil
  eventsPromoted: number; // Nombre d'événements mis en avant
  socialMediaPush: boolean; // Publication automatique réseaux sociaux
  monthlyBlogPost: boolean; // Article de blog SEO mensuel
  analyticsRetention: number; // jours
  prioritySupport: boolean;
}

export interface QuotaUsage {
  merchantId: string;
  month: string; // YYYY-MM
  placesUsed: number; // Toujours 1 max
  eventsUsed: number; // Événements créés ce mois
  eventsPromotedUsed: number; // Événements promus utilisés
  blogPostsUsed: number; // Articles de blog ce mois
  storageUsed: number; // MB
  lastUpdated: Timestamp;
}

export type PlanType = 'free' | 'pro_visibility' | 'pro_boost';

export class QuotaManager {
  private static instance: QuotaManager;
  
  // Définition des plans mis à jour
  private readonly plans: Record<PlanType, PlanLimits> = {
    free: {
      maxPlaces: 1, // Un seul établissement
      maxEvents: 3, // 3 événements/mois
      maxPhotosPerPlace: 3,
      eventsOnHomepage: false, // Visible uniquement sur page établissement
      eventsPromoted: 0,
      socialMediaPush: false,
      monthlyBlogPost: false,
      analyticsRetention: 7,
      prioritySupport: false
    },
    pro_visibility: { // Ancien pro_events, renommé
      maxPlaces: 1, // Un seul établissement
      maxEvents: 3, // 3 événements/mois
      maxPhotosPerPlace: 10,
      eventsOnHomepage: true, // Visible sur page d'accueil !
      eventsPromoted: 3, // 3 événements mis en avant
      socialMediaPush: false,
      monthlyBlogPost: false,
      analyticsRetention: 30,
      prioritySupport: true
    },
    pro_boost: {
      maxPlaces: 1, // Un seul établissement
      maxEvents: 6, // 6 événements/mois
      maxPhotosPerPlace: 50,
      eventsOnHomepage: true, // Visible sur page d'accueil
      eventsPromoted: 6, // 6 événements mis en avant
      socialMediaPush: true, // Publication auto Facebook/Instagram !
      monthlyBlogPost: true, // Article SEO mensuel !
      analyticsRetention: 90,
      prioritySupport: true
    }
  };

  private constructor() {}

  static getInstance(): QuotaManager {
    if (!QuotaManager.instance) {
      QuotaManager.instance = new QuotaManager();
    }
    return QuotaManager.instance;
  }

  // Obtenir les limites d'un plan
  getPlanLimits(plan: PlanType): PlanLimits {
    return this.plans[plan];
  }

  // Obtenir le mois actuel au format YYYY-MM
  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  // Obtenir l'usage actuel d'un merchant
  async getUsage(merchantId: string): Promise<QuotaUsage> {
    const month = this.getCurrentMonth();
    const usageRef = doc(firebaseDb, 'quotas_usage', `${merchantId}_${month}`);
    
    try {
      const usageDoc = await getDoc(usageRef);
      
      if (usageDoc.exists()) {
        return usageDoc.data() as QuotaUsage;
      } else {
        // Créer un nouveau document d'usage pour ce mois
        const newUsage: QuotaUsage = {
          merchantId,
          month,
          placesUsed: 0,
          eventsUsed: 0,
          eventsPromotedUsed: 0,
          blogPostsUsed: 0,
          storageUsed: 0,
          lastUpdated: Timestamp.now()
        };
        
        await setDoc(usageRef, newUsage);
        return newUsage;
      }
    } catch (error) {
      console.error('Error getting usage:', error);
      throw error;
    }
  }

  // Vérifier si une action est autorisée
  async canPerformAction(
    merchantId: string, 
    plan: PlanType, 
    action: 'create_place' | 'create_event' | 'upload_photo' | 'request_blog_post'
  ): Promise<{ allowed: boolean; reason?: string }> {
    const limits = this.getPlanLimits(plan);
    const usage = await this.getUsage(merchantId);

    switch (action) {
      case 'create_place':
        // Toujours limité à 1 établissement
        if (usage.placesUsed >= 1) {
          return { 
            allowed: false, 
            reason: `Limite atteinte : 1 établissement maximum` 
          };
        }
        return { allowed: true };

      case 'create_event':
        if (usage.eventsUsed >= limits.maxEvents) {
          return { 
            allowed: false, 
            reason: `Limite atteinte : ${limits.maxEvents} événement(s) maximum ce mois` 
          };
        }
        return { allowed: true };

      case 'upload_photo':
        // Vérifier l'espace de stockage
        const storageLimit = plan === 'free' ? 100 : plan === 'pro_visibility' ? 500 : 1000;
        if (usage.storageUsed >= storageLimit) {
          return { 
            allowed: false, 
            reason: `Limite de stockage atteinte : ${storageLimit}MB maximum` 
          };
        }
        return { allowed: true };

      case 'request_blog_post':
        if (!limits.monthlyBlogPost) {
          return { 
            allowed: false, 
            reason: 'Article de blog SEO disponible uniquement avec le plan Pro Boost' 
          };
        }
        if (usage.blogPostsUsed >= 1) {
          return { 
            allowed: false, 
            reason: 'Vous avez déjà demandé votre article mensuel' 
          };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  }

  // Vérifier si un événement peut être promu
  async canPromoteEvent(
    merchantId: string,
    plan: PlanType
  ): Promise<{ allowed: boolean; reason?: string }> {
    const limits = this.getPlanLimits(plan);
    const usage = await this.getUsage(merchantId);

    if (!limits.eventsOnHomepage) {
      return {
        allowed: false,
        reason: 'La mise en avant sur la page d\'accueil nécessite un plan Pro'
      };
    }

    if (usage.eventsPromotedUsed >= limits.eventsPromoted) {
      return {
        allowed: false,
        reason: `Limite atteinte : ${limits.eventsPromoted} événement(s) mis en avant maximum ce mois`
      };
    }

    return { allowed: true };
  }

  // Incrémenter l'usage après une action
  async incrementUsage(
    merchantId: string,
    action: 'place' | 'event' | 'event_promoted' | 'blog_post' | 'storage',
    amount: number = 1
  ): Promise<void> {
    const month = this.getCurrentMonth();
    const usageRef = doc(firebaseDb, 'quotas_usage', `${merchantId}_${month}`);

    const updateData: any = {
      lastUpdated: serverTimestamp()
    };

    switch (action) {
      case 'place':
        updateData.placesUsed = increment(amount);
        break;
      case 'event':
        updateData.eventsUsed = increment(amount);
        break;
      case 'event_promoted':
        updateData.eventsPromotedUsed = increment(amount);
        break;
      case 'blog_post':
        updateData.blogPostsUsed = increment(amount);
        break;
      case 'storage':
        updateData.storageUsed = increment(amount); // amount en MB
        break;
    }

    try {
      await updateDoc(usageRef, updateData);
    } catch (error) {
      // Si le document n'existe pas, le créer
      await this.getUsage(merchantId);
      await updateDoc(usageRef, updateData);
    }
  }

  // Obtenir les statistiques d'usage
  async getUsageStats(merchantId: string, plan: PlanType): Promise<{
    usage: QuotaUsage;
    limits: PlanLimits;
    percentages: {
      places: number;
      events: number;
      eventsPromoted: number;
      storage: number;
    };
  }> {
    const usage = await this.getUsage(merchantId);
    const limits = this.getPlanLimits(plan);

    // Calculer les pourcentages d'utilisation
    const percentages = {
      places: (usage.placesUsed / 1) * 100, // Toujours sur 1
      events: (usage.eventsUsed / limits.maxEvents) * 100,
      eventsPromoted: limits.eventsPromoted > 0 
        ? (usage.eventsPromotedUsed / limits.eventsPromoted) * 100 
        : 0,
      storage: 0 // À implémenter selon les limites
    };

    return {
      usage,
      limits,
      percentages
    };
  }

  // Vérifier si un upgrade est nécessaire
  suggestUpgrade(usage: QuotaUsage, currentPlan: PlanType): {
    shouldUpgrade: boolean;
    reason?: string;
    suggestedPlan?: PlanType;
  } {
    const limits = this.getPlanLimits(currentPlan);

    // Suggestions basées sur l'usage des événements
    if (currentPlan === 'free') {
      if (usage.eventsUsed >= 2) {
        return {
          shouldUpgrade: true,
          reason: 'Passez Pro pour que vos événements apparaissent sur la page d\'accueil !',
          suggestedPlan: 'pro_visibility'
        };
      }
    }

    if (currentPlan === 'pro_visibility') {
      if (usage.eventsUsed >= limits.maxEvents || usage.eventsPromotedUsed >= 2) {
        return {
          shouldUpgrade: true,
          reason: 'Boostez votre visibilité avec la publication automatique sur les réseaux sociaux et un article SEO mensuel !',
          suggestedPlan: 'pro_boost'
        };
      }
    }

    return { shouldUpgrade: false };
  }

  // Appeler une Cloud Function pour upgrade
  async upgradePlan(merchantId: string, newPlan: PlanType): Promise<void> {
    const upgradeFunction = httpsCallable(firebaseFunctions, 'upgradeMerchantPlan');
    
    try {
      await upgradeFunction({ merchantId, newPlan });
      
      // Mettre à jour le plan dans Firestore
      await updateDoc(doc(firebaseDb, 'users', merchantId), {
        plan: newPlan,
        planUpdatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error upgrading plan:', error);
      throw error;
    }
  }

  // Obtenir le nom du plan en français
  getPlanDisplayName(plan: PlanType): string {
    const names = {
      free: 'Gratuit',
      pro_visibility: 'Pro Visibilité',
      pro_boost: 'Pro Boost'
    };
    return names[plan] || 'Gratuit';
  }

  // Obtenir les features principales d'un plan
  getPlanFeatures(plan: PlanType): string[] {
    const limits = this.getPlanLimits(plan);
    const features = [];

    features.push(`${limits.maxEvents} événements par mois`);
    
    if (limits.eventsOnHomepage) {
      features.push('Événements visibles sur la page d\'accueil');
      features.push(`${limits.eventsPromoted} événements mis en avant`);
    } else {
      features.push('Événements sur votre page uniquement');
    }

    if (limits.socialMediaPush) {
      features.push('Publication automatique Facebook/Instagram');
    }

    if (limits.monthlyBlogPost) {
      features.push('Article de blog SEO mensuel');
    }

    features.push(`${limits.maxPhotosPerPlace} photos maximum`);
    features.push(`Statistiques ${limits.analyticsRetention} jours`);

    if (limits.prioritySupport) {
      features.push('Support prioritaire');
    }

    return features;
  }
}

// Export singleton
export const quotaManager = QuotaManager.getInstance();