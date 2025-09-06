'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabaseAuth, AuthUser } from './supabase-auth';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUpMerchant: (email: string, password: string, companyName: string, phone?: string) => Promise<void>;
  signUpUser: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isMerchant: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Vérifier la session au chargement
    checkSession();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (session?.user) {
        try {
          // Pour les professionnels, on vérifie s'ils ont un établissement
          const { data: establishment } = await supabase
            .from('establishments')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          // Si c'est un professionnel avec établissement
          if (establishment) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: 'merchant',
              displayName: establishment.name,
              merchantData: {
                companyName: establishment.name,
                phone: establishment.phone,
                plan: 'free',
                verified: establishment.status === 'active',
                settings: {}
              }
            });
          } else {
            // Sinon, essayer de récupérer le profil standard
            try {
              const profile = await supabaseAuth.getProfile(session.user.id);
              setUser(profile);
            } catch (error) {
              // Si pas de profil, créer un utilisateur minimal
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: 'user',
                displayName: session.user.email?.split('@')[0]
              });
            }
          }
        } catch (error) {
          console.error('Erreur récupération profil:', error);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: 'user',
            displayName: session.user.email?.split('@')[0]
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirections automatiques basées sur le rôle
  useEffect(() => {
    if (!loading && user) {
      // Redirection après connexion
      if ((pathname === '/connexion/pro' || pathname === '/professionnel/connexion') && user.role === 'merchant') {
        router.push('/pro/dashboard');
      } else if ((pathname === '/connexion/admin' || pathname === '/administration/connexion') && user.role === 'admin') {
        router.push('/admin');
      }
    } else if (!loading && !user) {
      // Protection des routes
      if ((pathname.startsWith('/pro/') && pathname !== '/pro' && pathname !== '/pro/inscription') || 
          (pathname.startsWith('/professionnel/') && 
          !pathname.includes('/connexion') && 
          !pathname.includes('/register'))) {
        router.push('/connexion/pro');
      } else if ((pathname.startsWith('/admin') && pathname !== '/admin') || 
                 (pathname.startsWith('/administration/') && 
                 !pathname.includes('/connexion'))) {
        router.push('/connexion/admin');
      }
    }
  }, [user, loading, pathname]);

  const checkSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Vérifier si c'est un professionnel avec établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (establishment) {
          setUser({
            id: user.id,
            email: user.email || '',
            role: 'merchant',
            displayName: establishment.name,
            merchantData: {
              companyName: establishment.name,
              phone: establishment.phone,
              plan: 'free',
              verified: establishment.status === 'active',
              settings: {}
            }
          });
        } else {
          // Vérifier si c'est un admin
          if (user.email === 'admin@guide-de-lyon.fr') {
            setUser({
              id: user.id,
              email: user.email || '',
              role: 'admin',
              displayName: 'Administrateur'
            });
          } else {
            // Utilisateur standard
            setUser({
              id: user.id,
              email: user.email || '',
              role: 'user',
              displayName: user.email?.split('@')[0]
            });
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur vérification session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    
    if (error) throw error;
    if (!data.user) throw new Error('Erreur de connexion');
    
    // Vérifier si c'est un professionnel avec établissement
    const { data: establishment } = await supabase
      .from('establishments')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (establishment) {
      const authUser = {
        id: data.user.id,
        email: data.user.email || '',
        role: 'merchant' as const,
        displayName: establishment.name,
        merchantData: {
          companyName: establishment.name,
          phone: establishment.phone,
          plan: 'free' as const,
          verified: establishment.status === 'active',
          settings: {}
        }
      };
      setUser(authUser);
    } else if (data.user.email === 'admin@guide-de-lyon.fr') {
      const authUser = {
        id: data.user.id,
        email: data.user.email || '',
        role: 'admin' as const,
        displayName: 'Administrateur'
      };
      setUser(authUser);
    } else {
      const authUser = {
        id: data.user.id,
        email: data.user.email || '',
        role: 'user' as const,
        displayName: data.user.email?.split('@')[0]
      };
      setUser(authUser);
    }
  };

  const signUpMerchant = async (
    email: string, 
    password: string, 
    companyName: string, 
    phone?: string
  ) => {
    const authUser = await supabaseAuth.signUpMerchant(email, password, companyName, phone);
    setUser(authUser);
    // Redirection après inscription réussie
    router.push('/connexion/pro');
  };

  const signUpUser = async (
    email: string, 
    password: string, 
    displayName?: string
  ) => {
    const authUser = await supabaseAuth.signUpUser(email, password, displayName);
    setUser(authUser);
  };

  const signOut = async () => {
    await supabaseAuth.signOut();
    setUser(null);
    router.push('/');
  };

  const resetPassword = async (email: string) => {
    await supabaseAuth.resetPassword(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUpMerchant,
    signUpUser,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
    isMerchant: user?.role === 'merchant',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC pour protéger les pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'merchant' | 'admin'
) {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          if (requiredRole === 'admin') {
            router.push('/connexion/admin');
          } else if (requiredRole === 'merchant') {
            router.push('/connexion/pro');
          } else {
            router.push('/');
          }
        } else if (requiredRole && user.role !== requiredRole) {
          router.push('/');
        }
      }
    }, [user, loading]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user || (requiredRole && user.role !== requiredRole)) {
      return null;
    }

    return <Component {...props} />;
  };
}