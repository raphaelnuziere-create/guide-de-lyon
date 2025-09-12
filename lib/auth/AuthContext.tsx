'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDirectusAuth, UserPlan } from '@/lib/hooks/useDirectusAuth';
import { DirectusEstablishment, DirectusProfessionalUser } from '@/lib/services/directus';

interface AuthContextType {
  // Données utilisateur Directus
  user: DirectusProfessionalUser | null;
  establishment: DirectusEstablishment | null;
  userId: string | null;
  userEmail: string | null;
  establishmentId: string | null;
  
  // Plan et limites
  plan: UserPlan;
  planLimits: {
    maxPhotos: number;
    maxEventsPerMonth: number;
    hasAdvancedStats: boolean;
    canShowOnHomepage: boolean;
    requiresTVA: boolean;
  };
  
  // États
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Données métier
  hasVatNumber: boolean;
  isVerified: boolean;
  eventsThisMonth: number;
  photosCount: number;
  
  // Méthodes
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  establishment: null,
  userId: null,
  userEmail: null,
  establishmentId: null,
  plan: 'basic',
  planLimits: {
    maxPhotos: 1,
    maxEventsPerMonth: 1,
    hasAdvancedStats: false,
    canShowOnHomepage: false,
    requiresTVA: false
  },
  isAuthenticated: false,
  loading: true,
  error: null,
  hasVatNumber: false,
  isVerified: false,
  eventsThisMonth: 0,
  photosCount: 0,
  signIn: async () => ({ success: false }),
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Refs pour éviter les boucles
  const isRedirecting = useRef(false);
  const lastPathname = useRef(pathname);
  
  // Utilisation du hook Directus
  const directusAuth = useDirectusAuth();

  // Gestion des redirections
  useEffect(() => {
    // Ne pas rediriger pendant le chargement ou si déjà en cours
    if (directusAuth.isLoading || isRedirecting.current) return;
    
    // Ne pas rediriger si on est sur la même page
    if (pathname === lastPathname.current) return;
    lastPathname.current = pathname;

    // Routes publiques qui ne nécessitent pas d'auth
    const publicRoutes = [
      '/',
      '/annuaire',
      '/blog',
      '/auth/pro/connexion',
      '/auth/pro/signup',
      '/etablissement',
      '/evenements',
      '/actualites',
      '/contact',
      '/inscription',
      '/espace-pro'
    ];

    // Routes protégées qui nécessitent une auth
    const protectedRoutes = [
      '/pro/dashboard',
      '/pro/etablissement',
      '/pro/evenements',
      '/pro/photos',
      '/pro/horaires',
      '/pro/settings',
      '/pro/verification',
      '/pro/upgrade'
    ];

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Si route protégée et pas connecté -> redirection
    if (isProtectedRoute && !directusAuth.isAuthenticated) {
      // Exception pour /pro/inscription qui a sa propre logique
      if (pathname === '/pro/inscription') return;
      
      console.log('[AuthContext] Protected route without auth, redirecting to login');
      isRedirecting.current = true;
      
      // Sauvegarder la route demandée pour redirection après login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      
      router.push('/auth/pro/connexion');
      
      // Reset le flag après un délai
      setTimeout(() => {
        isRedirecting.current = false;
      }, 1000);
      return;
    }

    // Si connecté et sur page de connexion -> redirection vers dashboard
    if (directusAuth.isAuthenticated && pathname === '/auth/pro/connexion') {
      console.log('[AuthContext] User logged in on login page, redirecting to dashboard');
      isRedirecting.current = true;
      
      // Vérifier si on a une redirection sauvegardée
      let redirectTo = '/pro/dashboard';
      if (typeof window !== 'undefined') {
        const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
        if (savedRedirect) {
          redirectTo = savedRedirect;
          sessionStorage.removeItem('redirectAfterLogin');
        }
      }
      
      router.push(redirectTo);
      
      setTimeout(() => {
        isRedirecting.current = false;
      }, 1000);
      return;
    }
  }, [directusAuth.isAuthenticated, directusAuth.isLoading, pathname, router]);

  // Méthodes d'authentification wrappées
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await directusAuth.login(email, password);
      return result;
    } catch (error) {
      console.error('[AuthContext] Sign in error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    }
  }, [directusAuth]);

  const signOut = useCallback(async () => {
    try {
      isRedirecting.current = true;
      
      await directusAuth.logout();
      
      // Clear any stored data
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      
      // Redirect to home
      router.push('/');
      
      setTimeout(() => {
        isRedirecting.current = false;
      }, 1000);
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error);
    }
  }, [directusAuth, router]);

  const refreshSession = useCallback(async () => {
    try {
      await directusAuth.refreshAuth();
    } catch (error) {
      console.error('[AuthContext] Refresh session error:', error);
    }
  }, [directusAuth]);

  // Valeur du contexte basée sur les données Directus
  const value: AuthContextType = {
    // Données utilisateur
    user: directusAuth.user,
    establishment: directusAuth.establishment,
    userId: directusAuth.userId,
    userEmail: directusAuth.userEmail,
    establishmentId: directusAuth.establishmentId,
    
    // Plan et limites
    plan: directusAuth.plan,
    planLimits: directusAuth.planLimits,
    
    // États
    isAuthenticated: directusAuth.isAuthenticated,
    loading: directusAuth.isLoading,
    error: directusAuth.error,
    
    // Données métier
    hasVatNumber: directusAuth.hasVatNumber,
    isVerified: directusAuth.isVerified,
    eventsThisMonth: directusAuth.eventsThisMonth,
    photosCount: directusAuth.photosCount,
    
    // Méthodes
    signIn,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC pour protéger les pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/auth/pro/connexion');
      }
    }, [isAuthenticated, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
            <div className="mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full inline-block">
              ✨ Powered by Directus
            </div>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}

// Alias pour compatibilité avec l'ancien système
export const session = null; // Directus n'utilise pas le concept de session Supabase
export type User = DirectusProfessionalUser;