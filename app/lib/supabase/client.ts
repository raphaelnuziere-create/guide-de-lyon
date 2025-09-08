import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration Supabase avec vérification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Vérifier que les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Configuration manquante. Les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies.');
}

// Variable globale pour le singleton (attachée à window en browser)
declare global {
  interface Window {
    __supabase?: SupabaseClient;
  }
}

// Fonction pour obtenir l'instance unique
function getSupabaseClient(): SupabaseClient | null {
  // Si les variables ne sont pas configurées, retourner null
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Côté serveur, on retourne toujours une nouvelle instance
  if (typeof window === 'undefined') {
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  // Côté client, on utilise le singleton
  if (!window.__supabase) {
    console.log('[Supabase] Creating singleton instance');
    window.__supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: window.localStorage,
        storageKey: 'guide-lyon-auth',
        debug: false // Désactiver le debug qui peut causer des boucles
      },
    });
    
    // Logger les événements auth pour debug
    window.__supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Supabase Auth Event]:', event, session?.user?.email);
    });
  } else {
    console.log('[Supabase] Using existing singleton instance');
  }
  
  return window.__supabase;
}

// Export de l'instance unique (peut être null si non configuré)
export const supabase = getSupabaseClient();

// Helper pour vérifier l'authentification
export async function checkAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[checkAuth] Error:', error);
      return null;
    }
    console.log('[checkAuth] Session:', session?.user?.email || 'No session');
    return session;
  } catch (error) {
    console.error('[checkAuth] Exception:', error);
    return null;
  }
}

// Helper pour vérifier si l'utilisateur a un établissement
export async function checkEstablishment(userId: string) {
  try {
    const { data, error } = await supabase
      .from('establishments')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('[checkEstablishment] Result:', { hasEstablishment: !!data, error });
    return { hasEstablishment: !!data, error };
  } catch (error) {
    console.error('[checkEstablishment] Exception:', error);
    return { hasEstablishment: false, error };
  }
}

// Helper pour déconnexion
export async function signOut() {
  try {
    console.log('[signOut] Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[signOut] Error:', error);
      return false;
    }
    console.log('[signOut] Success');
    return true;
  } catch (error) {
    console.error('[signOut] Exception:', error);
    return false;
  }
}