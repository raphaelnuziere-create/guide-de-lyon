import { useState, useEffect, useCallback } from 'react';
import { directusService, DirectusProfessionalUser, DirectusEstablishment } from '@/lib/services/directus';

// Mapping des comptes de test avec établissements par défaut
const TEST_ACCOUNT_ESTABLISHMENTS = {
  'pro@test.com': {
    name: 'Restaurant Le Gourmet Pro',
    slug: 'restaurant-le-gourmet-pro',
    description: 'Établissement Professionnel avec avantages Pro',
    address: '25 Rue de la République',
    postal_code: '69001',
    city: 'Lyon',
    phone: '0478567890',
    website: 'https://restaurant-le-gourmet-pro.fr',
    category: 'restaurant' as const,
    price_range: 'modere' as const,
    rating: 4.5,
    latitude: 45.7640,
    longitude: 4.8357,
    plan: 'pro' as const,
    verified: true
  },
  'expert@test.com': {
    name: 'Spa Luxe Expert',
    slug: 'spa-luxe-expert',
    description: 'Établissement Premium avec tous les avantages Expert',
    address: '10 Place Bellecour',
    postal_code: '69002',
    city: 'Lyon',
    phone: '0478901234',
    website: 'https://spa-luxe-expert.fr',
    category: 'restaurant' as const,
    price_range: 'eleve' as const,
    rating: 4.8,
    latitude: 45.7579,
    longitude: 4.8320,
    plan: 'expert' as const,
    verified: true
  }
} as const;

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

  const loadUserData = useCallback(async (userEmail: string, userId?: string) => {
    try {
      setData((prev: DirectusAuthData) => ({ ...prev, isLoading: true, error: null }));

      console.log('[useDirectusAuth] Chargement des données pour:', userEmail);

      // 1. Récupérer les établissements de l'utilisateur depuis Directus
      const establishmentsResult = await directusService.getEstablishments({
        email: { _eq: userEmail }
      });

      let establishment: DirectusEstablishment | null = null;
      
      if (establishmentsResult.success && establishmentsResult.data && establishmentsResult.data.length > 0) {
        establishment = establishmentsResult.data[0];
        console.log('[useDirectusAuth] Établissement trouvé:', establishment.id);
      } else {
        // Créer un établissement par défaut pour les comptes de test
        const defaultEstablishment = TEST_ACCOUNT_ESTABLISHMENTS[userEmail as keyof typeof TEST_ACCOUNT_ESTABLISHMENTS];
        
        if (defaultEstablishment) {
          console.log('[useDirectusAuth] Création établissement par défaut pour:', userEmail);
          
          const createResult = await directusService.createEstablishment({
            ...defaultEstablishment,
            email: userEmail,
            status: 'published',
            opening_hours: {},
            professional_user_id: userId || data.userId || 'temp-id',
            date_created: new Date().toISOString(),
            date_updated: new Date().toISOString()
          });
          
          if (createResult.success) {
            establishment = createResult.data;
            console.log('[useDirectusAuth] Établissement créé:', establishment?.id);
          }
        }
      }

      // 2. Créer les données utilisateur à partir de l'authentification Directus
      const user: DirectusProfessionalUser = {
        id: userId || data.userId || 'temp-id',
        email: userEmail,
        first_name: userEmail.includes('pro') ? 'Test' : 'Test',
        last_name: userEmail.includes('pro') ? 'Pro' : 'Expert',
        company_name: establishment?.name || 'Test Company',
        phone: establishment?.phone || '',
        vat_number: userEmail.includes('expert') ? 'FR98765432109' : userEmail.includes('pro') ? 'FR12345678901' : '',
        status: 'active',
        date_created: new Date().toISOString(),
        date_updated: new Date().toISOString()
      };

      // 3. Compter les photos et événements (simulations pour maintenant)
      const photosCount = 0;
      const eventsThisMonth = 0;

      const plan = (establishment?.plan || 'basic') as UserPlan;
      const planLimits = getPlanLimits(plan);

      setData((prev: DirectusAuthData) => ({
        ...prev,
        userId: user.id,
        userEmail: user.email,
        establishmentId: establishment?.id || null,
        establishment,
        user,
        plan,
        planLimits,
        hasVatNumber: !!user.vat_number,
        isVerified: establishment?.verified || false,
        eventsThisMonth,
        photosCount,
        isLoading: false,
        error: null,
        isAuthenticated: true
      }));

      console.log('[useDirectusAuth] Données utilisateur chargées:', {
        userId: user.id,
        email: user.email,
        establishmentId: establishment?.id,
        plan
      });

    } catch (error) {
      console.error('Erreur chargement données utilisateur:', error);
      setData((prev: DirectusAuthData) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        isAuthenticated: false
      }));
    }
  }, [data.userId]);

  const login = async (email: string, password: string) => {
    try {
      setData((prev: DirectusAuthData) => ({ ...prev, isLoading: true, error: null }));

      console.log('[useDirectusAuth] Tentative de connexion:', email);
      
      const loginResult = await directusService.login(email, password);
      
      if (!loginResult.success) {
        setData((prev: DirectusAuthData) => ({
          ...prev,
          isLoading: false,
          error: loginResult.error || 'Erreur de connexion',
          isAuthenticated: false
        }));
        return { success: false, error: loginResult.error };
      }

      console.log('[useDirectusAuth] Connexion Directus réussie');
      
      // Après connexion réussie, récupérer les données utilisateur depuis Directus
      // Pour l'instant, générer un userId temporaire basé sur l'email (IDs réels des utilisateurs créés)
      const tempUserId = email === 'pro@test.com' ? '91c9681d-9c43-47c1-9915-87c0c06a94a3' : 
                         email === 'expert@test.com' ? 'a54c4022-08a0-49a2-8e67-794e0445d7e8' : 
                         `user-${Date.now()}`;
      
      setData((prev: DirectusAuthData) => ({
        ...prev,
        isAuthenticated: true,
        userEmail: email,
        userId: tempUserId,
        isLoading: true // Maintenir loading pendant le chargement des données
      }));

      // Charger les données utilisateur depuis Directus
      await loadUserData(email, tempUserId);

      return { success: true };

    } catch (error) {
      console.error('Erreur login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      
      setData((prev: DirectusAuthData) => ({
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
      
      if (refreshResult.success && data.userEmail) {
        await loadUserData(data.userEmail, data.userId || undefined);
      } else {
        setData((prev: DirectusAuthData) => ({
          ...prev,
          isAuthenticated: false,
          error: 'Session expirée'
        }));
      }
    } catch (error) {
      console.error('Erreur refresh:', error);
      setData((prev: DirectusAuthData) => ({
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
          console.log('[useDirectusAuth] Session existante valide');
          // TODO: Récupérer l'email de l'utilisateur depuis le token Directus
        } else {
          setData((prev: DirectusAuthData) => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false
          }));
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
        setData((prev: DirectusAuthData) => ({
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