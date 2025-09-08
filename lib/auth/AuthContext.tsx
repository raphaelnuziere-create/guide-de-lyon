'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/app/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Refs pour éviter les boucles
  const isRedirecting = useRef(false);
  const lastPathname = useRef(pathname);
  const initializationDone = useRef(false);

  // Initialisation de la session (UNE SEULE FOIS)
  useEffect(() => {
    if (initializationDone.current) return;
    initializationDone.current = true;

    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Initializing auth...');
        
        // Vérifier que Supabase est configuré
        if (!supabase) {
          console.error('[AuthContext] Supabase not configured');
          setLoading(false);
          return;
        }
        
        // Récupérer la session existante
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          setLoading(false);
          return;
        }

        if (currentSession) {
          console.log('[AuthContext] Session found:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log('[AuthContext] No session found');
        }
      } catch (error) {
        console.error('[AuthContext] Init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listener pour les changements d\'auth
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('[AuthContext] Auth state changed:', event);
          
          if (event === 'SIGNED_IN' && newSession) {
            setSession(newSession);
            setUser(newSession.user);
          } else if (event === 'SIGNED_OUT') {
            setSession(null);
            setUser(null);
          } else if (event === 'TOKEN_REFRESHED' && newSession) {
            setSession(newSession);
            setUser(newSession.user);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []); // PAS DE DÉPENDANCES PATHNAME !

  // Gestion des redirections SÉPARÉE et CONTRÔLÉE
  useEffect(() => {
    // Ne pas rediriger pendant le chargement ou si déjà en cours
    if (loading || isRedirecting.current) return;
    
    // Ne pas rediriger si on est sur la même page
    if (pathname === lastPathname.current) return;
    lastPathname.current = pathname;

    // Routes publiques qui ne nécessitent pas d\'auth
    const publicRoutes = [
      '/',
      '/annuaire',
      '/blog',
      '/auth/pro/connexion',
      '/auth/pro/inscription',
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
    if (isProtectedRoute && !user) {
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
    if (user && pathname === '/auth/pro/connexion') {
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
  }, [user, loading, pathname, router]);

  // Méthodes d\'authentification
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      
      if (!supabase) {
        return { error: new Error('Supabase not configured') };
      }
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('[AuthContext] Sign in error:', error);
        return { error };
      }

      // La session sera mise à jour via onAuthStateChange
      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Sign in exception:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      
      if (!supabase) {
        return { error: new Error('Supabase not configured') };
      }
      
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('[AuthContext] Sign up error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('[AuthContext] Sign up exception:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      isRedirecting.current = true;
      
      if (!supabase) {
        console.error('[AuthContext] Supabase not configured');
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthContext] Sign out error:', error);
      }

      // Clear all session data
      setUser(null);
      setSession(null);
      
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
      console.error('[AuthContext] Sign out exception:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const refreshSession = useCallback(async () => {
    try {
      if (!supabase) {
        console.error('[AuthContext] Supabase not configured');
        return;
      }
      
      const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[AuthContext] Refresh session error:', error);
        return;
      }

      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }
    } catch (error) {
      console.error('[AuthContext] Refresh session exception:', error);
    }
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
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

// HOC pour protéger les pages (optionnel)
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth/pro/connexion');
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}