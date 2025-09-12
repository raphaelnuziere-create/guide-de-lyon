import { useState, useEffect, useCallback } from 'react';
import { directusService, DirectusProfessionalUser, DirectusEstablishment } from '@/lib/services/directus';

export type UserPlan = 'basic' | 'pro' | 'expert';

export interface PlanLimits {
  maxPhotos: number;
  maxEventsPerMonth: number;
  hasAdvancedStats: boolean;
  canShowOnHomepage: boolean;
  requiresTVA: boolean;
}

export const getPlanLimits = (plan: UserPlan): PlanLimits => {
  switch (plan) {
    case 'basic':
      return {
        maxPhotos: 1,
        maxEventsPerMonth: 1,
        hasAdvancedStats: false,
        canShowOnHomepage: false,
        requiresTVA: false
      };
    case 'pro':
      return {
        maxPhotos: 10,
        maxEventsPerMonth: 5,
        hasAdvancedStats: true,
        canShowOnHomepage: true,
        requiresTVA: true
      };
    case 'expert':
      return {
        maxPhotos: -1, // illimité
        maxEventsPerMonth: -1, // illimité
        hasAdvancedStats: true,
        canShowOnHomepage: true,
        requiresTVA: true
      };
    default:
      return getPlanLimits('basic');
  }
};

interface DirectusAuthData {
  userId: string | null;
  userEmail: string | null;
  establishmentId: string | null;
  establishment: DirectusEstablishment | null;
  user: DirectusProfessionalUser | null;
  plan: UserPlan;
  planLimits: PlanLimits;
  isLoading: boolean;
  error: string | null;
  hasVatNumber: boolean;
  isVerified: boolean;
  eventsThisMonth: number;
  photosCount: number;
  isAuthenticated: boolean;
}

export function useDirectusAuth(): DirectusAuthData & {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
} {
  const [data, setData] = useState<DirectusAuthData>({
    userId: null,
    userEmail: null,
    establishmentId: null,
    establishment: null,
    user: null,
    plan: 'basic',
    planLimits: getPlanLimits('basic'),
    isLoading: true,
    error: null,
    hasVatNumber: false,
    isVerified: false,
    eventsThisMonth: 0,
    photosCount: 0,
    isAuthenticated: false
  });

  const loadUserData = useCallback(async (userId: string) => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // 1. Charger les données utilisateur
      const userResult = await directusService.getProfessionalUser(userId);
      if (!userResult.success) {
        throw new Error(userResult.error || 'Utilisateur non trouvé');
      }

      const user = userResult.data;

      // 2. Charger l'établissement de l'utilisateur
      const establishmentsResult = await directusService.getUserEstablishments(userId);
      if (!establishmentsResult.success) {
        throw new Error(establishmentsResult.error || 'Établissement non trouvé');
      }

      const establishments = establishmentsResult.data;
      const establishment = establishments && establishments.length > 0 ? establishments[0] : null;

      if (!establishment) {
        throw new Error('Aucun établissement trouvé pour cet utilisateur');
      }

      // 3. Charger le nombre de photos
      const photosResult = await directusService.getEstablishmentPhotos(establishment.id);
      const photosCount = photosResult.success ? photosResult.data.length : 0;

      // 4. Charger les événements du mois
      const eventsResult = await directusService.getEstablishmentEvents(establishment.id);
      const eventsThisMonth = eventsResult.success ? 
        eventsResult.data.filter(event => {
          const eventDate = new Date(event.start_date);
          const now = new Date();
          return eventDate.getMonth() === now.getMonth() && 
                 eventDate.getFullYear() === now.getFullYear();
        }).length : 0;

      const plan = (establishment.plan || 'basic') as UserPlan;
      const planLimits = getPlanLimits(plan);

      setData(prev => ({
        ...prev,
        userId: user.id,
        userEmail: user.email,
        establishmentId: establishment.id,
        establishment,
        user,
        plan,
        planLimits,
        hasVatNumber: !!user.vat_number,
        isVerified: establishment.verified,
        eventsThisMonth,
        photosCount,
        isLoading: false,
        error: null,
        isAuthenticated: true
      }));

      console.log('[useDirectusAuth] Données utilisateur chargées:', {
        userId: user.id,
        email: user.email,
        establishmentId: establishment.id,
        plan
      });

    } catch (error) {
      console.error('Erreur chargement données utilisateur:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isAuthenticated: false
      }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const loginResult = await directusService.login(email, password);
      
      if (!loginResult.success) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: loginResult.error || 'Erreur de connexion',
          isAuthenticated: false
        }));
        return { success: false, error: loginResult.error };
      }

      // Après connexion réussie, nous devons obtenir l'ID utilisateur
      // Dans Directus, cela nécessiterait d'obtenir les infos de l'utilisateur connecté
      // Pour l'instant, nous utilisons l'email pour trouver l'utilisateur
      // TODO: Améliorer avec la méthode correcte pour obtenir l'utilisateur actuel
      
      setData(prev => ({
        ...prev,
        isAuthenticated: true,
        userEmail: email,
        isLoading: false
      }));

      return { success: true };

    } catch (error) {
      console.error('Erreur login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false
      }));

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await directusService.logout();
      
      setData({
        userId: null,
        userEmail: null,
        establishmentId: null,
        establishment: null,
        user: null,
        plan: 'basic',
        planLimits: getPlanLimits('basic'),
        isLoading: false,
        error: null,
        hasVatNumber: false,
        isVerified: false,
        eventsThisMonth: 0,
        photosCount: 0,
        isAuthenticated: false
      });

    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshResult = await directusService.refresh();
      
      if (refreshResult.success && data.userId) {
        await loadUserData(data.userId);
      } else {
        setData(prev => ({
          ...prev,
          isAuthenticated: false,
          error: 'Session expirée'
        }));
      }
    } catch (error) {
      console.error('Erreur refresh:', error);
      setData(prev => ({
        ...prev,
        isAuthenticated: false,
        error: 'Erreur de rafraîchissement'
      }));
    }
  };

  // Auto-refresh au montage du composant
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Tenter de rafraîchir la session existante
        const refreshResult = await directusService.refresh();
        
        if (refreshResult.success) {
          // Si on a une session valide mais pas d'infos utilisateur, les charger
          if (!data.userId && data.userEmail) {
            // TODO: Implémenter la récupération de l'ID utilisateur depuis l'email
          }
        } else {
          setData(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false
          }));
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false
        }));
      }
    };

    initAuth();
  }, []);

  return {
    ...data,
    login,
    logout,
    refreshAuth
  };
}

// Hook pour les permissions (compatible avec l'ancien système)
export function useDirectusPermissions() {
  const authData = useDirectusAuth();
  
  return {
    ...authData,
    can: {
      uploadPhotos: (count: number) => {
        const maxPhotos = authData.planLimits.maxPhotos;
        return maxPhotos === -1 || count < maxPhotos;
      },
      createEvents: () => {
        const maxEvents = authData.planLimits.maxEventsPerMonth;
        return maxEvents === -1 || authData.eventsThisMonth < maxEvents;
      },
      accessAdvancedStats: () => authData.planLimits.hasAdvancedStats,
      showOnHomepage: () => authData.planLimits.canShowOnHomepage,
      requireTVA: () => authData.planLimits.requiresTVA
    }
  };
}