'use client';

// ⚠️  MIGRÉ VERS DIRECTUS ⚠️
// Ce hook redirige maintenant vers le système d'authentification Directus
// Plus d'utilisation de Supabase pour l'authentification

import { useAuth as useDirectusAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Hook d'authentification unifié - Utilise Directus
 * @deprecated Utilisez directement useAuth from '@/lib/auth/AuthContext'
 */
export function useAuth() {
  const router = useRouter();
  const directusAuth = useDirectusAuth();

  // Adapter l'interface Directus vers l'ancienne interface Supabase pour compatibilité
  const signIn = async (email: string, password: string) => {
    const result = await directusAuth.signIn(email, password);
    if (!result.success) {
      throw new Error(result.error || 'Erreur de connexion');
    }
    return { user: directusAuth.user };
  };

  const signUp = async (email: string, password: string) => {
    // Pour l'inscription, rediriger vers la page d'inscription
    router.push('/auth/pro/signup');
    throw new Error('Redirection vers la page d\'inscription');
  };

  const signOut = async () => {
    await directusAuth.signOut();
  };

  return {
    // Adapter les données Directus vers le format Supabase pour compatibilité
    user: directusAuth.user ? {
      id: directusAuth.userId,
      email: directusAuth.userEmail,
      // Autres propriétés compatibles Supabase
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } : null,
    loading: directusAuth.loading,
    signIn,
    signUp,
    signOut,
    
    // Nouvelles propriétés Directus disponibles
    establishment: directusAuth.establishment,
    plan: directusAuth.plan,
    planLimits: directusAuth.planLimits,
    isAuthenticated: directusAuth.isAuthenticated,
    error: directusAuth.error
  };
}

// Export pour compatibilité
export type User = {
  id: string | null;
  email: string | null;
  app_metadata: Record<string, any>;
  user_metadata: Record<string, any>;
  aud: string;
  created_at: string;
  updated_at: string;
};