import { createBrowserClient } from '@supabase/ssr';

// Configuration Supabase avec vérification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Vérifier que les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Configuration manquante. Les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies.');
}

// Créer un singleton pour éviter les instances multiples
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Si pas de configuration, retourner null
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Si l'instance existe déjà, la retourner
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Créer une nouvelle instance
  supabaseInstance = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'guide-lyon-auth-v2', // Nouvelle clé pour éviter les conflits avec l'ancien cache
        storage: {
          getItem: (key) => {
            if (typeof window === 'undefined') return null;
            return window.localStorage.getItem(key);
          },
          setItem: (key, value) => {
            if (typeof window === 'undefined') return;
            window.localStorage.setItem(key, value);
          },
          removeItem: (key) => {
            if (typeof window === 'undefined') return;
            window.localStorage.removeItem(key);
          },
        },
      },
    }
  );

  // Logger les événements auth en mode dev seulement
  if (process.env.NODE_ENV === 'development') {
    supabaseInstance.auth.onAuthStateChange((event, session) => {
      console.log('[Supabase Auth Event]:', event, session?.user?.email || 'no session');
    });
  }

  return supabaseInstance;
}

// Export de l'instance unique
export const supabase = createClient();