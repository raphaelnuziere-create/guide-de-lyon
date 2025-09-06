import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Instance unique du client Supabase pour le navigateur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Helper pour vérifier l'authentification
export async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Helper pour vérifier si l'utilisateur a un établissement
export async function checkEstablishment(userId: string) {
  const { data, error } = await supabase
    .from('establishments')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  
  return { hasEstablishment: !!data, error };
}

// Helper pour déconnexion
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
  return !error;
}