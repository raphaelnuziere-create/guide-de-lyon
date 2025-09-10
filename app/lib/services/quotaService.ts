// Service pour gérer les quotas d'événements et de photos
import { supabase } from '@/app/lib/supabase/client';

export interface QuotaInfo {
  eventsUsed: number;
  photosUsed: number;
  eventsLimit: number;
  photosLimit: number;
  lastReset: Date;
  canCreateEvent: boolean;
  canUploadPhoto: boolean;
  daysUntilReset: number;
}


// @deprecated - Export non utilisé détecté lors de l'audit 2025-09-10T21-46-50
// TODO: Supprimer après vérification complète
export class QuotaService {
  /**
   * Récupère les informations de quota pour un établissement
   */
  static async getQuotaInfo(establishmentId: string, plan: string = 'basic'): Promise<QuotaInfo> {
    try {
      // Récupérer les données de l'établissement
      const { data: establishment, error } = await supabase
        .from('establishments')
        .select('events_this_month, photos_this_month, last_quota_reset')
        .eq('id', establishmentId)
        .single();

      if (error) {
        console.error('[QuotaService] Error fetching establishment:', error);
        throw error;
      }

      // Déterminer les limites selon le plan
      const limits = this.getPlanLimits(plan);
      
      // Calculer les jours jusqu'au prochain reset
      const lastReset = establishment?.last_quota_reset 
        ? new Date(establishment.last_quota_reset)
        : new Date();
      
      const nextReset = new Date(lastReset);
      nextReset.setMonth(nextReset.getMonth() + 1);
      nextReset.setDate(1);
      
      const today = new Date();
      const daysUntilReset = Math.ceil(
        (nextReset.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const eventsUsed = establishment?.events_this_month || 0;
      const photosUsed = establishment?.photos_this_month || 0;

      return {
        eventsUsed,
        photosUsed,
        eventsLimit: limits.maxEvents,
        photosLimit: limits.maxPhotos,
        lastReset,
        canCreateEvent: eventsUsed < limits.maxEvents,
        canUploadPhoto: photosUsed < limits.maxPhotos,
        daysUntilReset
      };
    } catch (error) {
      console.error('[QuotaService] Error getting quota info:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        eventsUsed: 0,
        photosUsed: 0,
        eventsLimit: 1,
        photosLimit: 5,
        lastReset: new Date(),
        canCreateEvent: true,
        canUploadPhoto: true,
        daysUntilReset: 30
      };
    }
  }

  /**
   * Vérifie si un établissement peut créer un événement
   */
  static async canCreateEvent(establishmentId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('can_create_event', { est_id: establishmentId });

      if (error) {
        console.error('[QuotaService] Error checking event creation:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('[QuotaService] Error:', error);
      return false;
    }
  }

  /**
   * Incrémente le compteur d'événements
   */
  static async incrementEventCount(establishmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('establishments')
        .update({ 
          events_this_month: supabase.raw('events_this_month + 1')
        })
        .eq('id', establishmentId);

      if (error) {
        console.error('[QuotaService] Error incrementing event count:', error);
        throw error;
      }
    } catch (error) {
      console.error('[QuotaService] Error:', error);
      throw error;
    }
  }

  /**
   * Incrémente le compteur de photos
   */
  static async incrementPhotoCount(establishmentId: string, count: number = 1): Promise<void> {
    try {
      const { error } = await supabase
        .from('establishments')
        .update({ 
          photos_this_month: supabase.raw(`photos_this_month + ${count}`)
        })
        .eq('id', establishmentId);

      if (error) {
        console.error('[QuotaService] Error incrementing photo count:', error);
        throw error;
      }
    } catch (error) {
      console.error('[QuotaService] Error:', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des resets pour un établissement
   */
  static async getResetHistory(establishmentId: string) {
    try {
      const { data, error } = await supabase
        .from('quota_reset_history')
        .select('*')
        .eq('establishment_id', establishmentId)
        .order('reset_date', { ascending: false })
        .limit(12); // Derniers 12 mois

      if (error) {
        console.error('[QuotaService] Error fetching reset history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[QuotaService] Error:', error);
      return [];
    }
  }

  /**
   * Obtient les limites selon le plan
   */
  static getPlanLimits(plan: string) {
    switch (plan) {
      case 'expert':
        return {
          maxEvents: 6,
          maxPhotos: 20,
          features: ['homepage', 'newsletter', 'social', 'priority']
        };
      case 'pro':
        return {
          maxEvents: 3,
          maxPhotos: 10,
          features: ['homepage', 'newsletter']
        };
      case 'basic':
      default:
        return {
          maxEvents: 3,
          maxPhotos: 5,
          features: ['establishment_page']
        };
    }
  }

  /**
   * Formate le message de quota pour l'affichage
   */
  static formatQuotaMessage(quotaInfo: QuotaInfo): string {
    const eventsRemaining = quotaInfo.eventsLimit - quotaInfo.eventsUsed;
    const photosRemaining = quotaInfo.photosLimit - quotaInfo.photosUsed;

    if (eventsRemaining <= 0 && photosRemaining <= 0) {
      return `Quotas mensuels atteints. Reset dans ${quotaInfo.daysUntilReset} jours.`;
    }

    const messages = [];
    
    if (eventsRemaining > 0) {
      messages.push(`${eventsRemaining} événement${eventsRemaining > 1 ? 's' : ''}`);
    }
    
    if (photosRemaining > 0) {
      messages.push(`${photosRemaining} photo${photosRemaining > 1 ? 's' : ''}`);
    }

    return `Il vous reste : ${messages.join(' et ')}`;
  }

  /**
   * Calcule le pourcentage d'utilisation
   */
  static getUsagePercentage(used: number, limit: number): number {
    if (limit === 0) return 100;
    return Math.min(100, Math.round((used / limit) * 100));
  }
}