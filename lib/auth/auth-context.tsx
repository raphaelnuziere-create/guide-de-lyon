'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService, AuthUser } from './firebase-auth';
import { firebaseAuth } from '@/lib/firebase-client';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  registerMerchant: (email: string, password: string, companyName: string, phone?: string) => Promise<void>;
  registerUser: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isMerchant: () => boolean;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialiser l'écouteur d'authentification
    console.log('[AuthContext] Initialisation de l\'auth listener');
    const unsubscribe = authService.init((authUser) => {
      console.log('[AuthContext] Auth state changé:', authUser ? 'connecté' : 'déconnecté');
      setUser(authUser);
      setLoading(false);

      // Sauvegarder le token dans un cookie pour le middleware
      if (authUser) {
        firebaseAuth.currentUser?.getIdToken().then(token => {
          console.log('[AuthContext] Token récupéré et sauvegardé dans cookie');
          document.cookie = `auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
        }).catch(error => {
          console.error('[AuthContext] Erreur lors de la récupération du token:', error);
        });
      } else {
        // Supprimer le cookie si pas d'utilisateur
        console.log('[AuthContext] Suppression du cookie auth-token');
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      }

      // Redirections automatiques
      if (authUser) {
        // Si merchant sur page de login, rediriger vers dashboard
        if (pathname === '/pro/login' && authUser.role === 'merchant') {
          router.push('/pro/dashboard');
        }
        // Si admin sur page de login, rediriger vers admin
        if (pathname === '/admin/login' && authUser.role === 'admin') {
          router.push('/admin/dashboard');
        }
      } else {
        // Si non connecté et sur page protégée
        if (pathname.startsWith('/pro/') && pathname !== '/pro/login' && pathname !== '/pro/register') {
          router.push('/pro/login');
        }
        if (pathname.startsWith('/admin/') && pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Début de signIn');
      const authUser = await authService.signIn(email, password);
      console.log('[AuthContext] SignIn réussi, mise à jour du state');
      setUser(authUser);
      return authUser;
    } catch (error) {
      console.error('[AuthContext] Erreur dans signIn:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const authUser = await authService.signInWithGoogle();
    setUser(authUser);
  };

  const registerMerchant = async (
    email: string,
    password: string,
    companyName: string,
    phone?: string
  ) => {
    const authUser = await authService.registerMerchant(email, password, companyName, phone);
    setUser(authUser);
  };

  const registerUser = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    const authUser = await authService.registerUser(email, password, displayName);
    setUser(authUser);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    router.push('/');
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };

  const isMerchant = () => authService.isMerchant();
  const isAdmin = () => authService.isAdmin();
  const hasRole = (role: string) => authService.hasRole(role);

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signInWithGoogle,
    registerMerchant,
    registerUser,
    signOut,
    resetPassword,
    isMerchant,
    isAdmin,
    hasRole
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
  requiredRole?: string
) {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/login');
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