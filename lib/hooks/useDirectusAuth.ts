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

      // 1. Pour l'instant, simuler les données utilisateur depuis les collections créées
      const user = {
        id: userId,
        email: data.userEmail || '',
        first_name: 'Test',
        last_name: 'User',
        company_name: 'Test Company',
        phone: '',
        vat_number: '',
        status: 'active' as const,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString()
      } as DirectusProfessionalUser;

      // 2. Simuler un établissement pour les comptes de test
      const establishment = {
        id: 'test-establishment-' + userId,
        status: 'published' as const,
        name: data.userEmail?.includes('pro') ? 'Restaurant Le Gourmet Pro' : 'Spa Luxe Expert',
        slug: data.userEmail?.includes('pro') ? 'restaurant-le-gourmet-pro' : 'spa-luxe-expert',
        description: 'Établissement de test',
        address: '25 Rue de Test',
        postal_code: '69001',
        city: 'Lyon',
        phone: '0478567890',
        email: data.userEmail || '',
        website: 'https://test.fr',
        category: 'restaurant' as const,
        price_range: 'modere' as const,
        rating: 4.5,
        latitude: 45.7640,
        longitude: 4.8357,
        opening_hours: {},
        plan: data.userEmail?.includes('expert') ? 'expert' as const : 'pro' as const,
        verified: true,
        professional_user_id: userId,
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString()
      } as DirectusEstablishment;

      // 3. Pour les tests, simuler les données
      const photosCount = 0; // Pas de photos pour les comptes de test
      const eventsThisMonth = 0; // Pas d'événements pour les comptes de test

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

      // Après connexion réussie, générer un ID utilisateur et charger les données
      const userId = email === 'pro@test.com' ? 'user-pro-test' : 'user-expert-test';
      
      setData(prev => ({
        ...prev,
        isAuthenticated: true,
        userEmail: email,
        userId: userId,
        isLoading: false
      }));

      // Charger les données utilisateur simulées
      await loadUserData(userId);

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