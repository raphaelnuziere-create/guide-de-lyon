// GUIDE DE LYON - SUPABASE SERVER CLIENT
// Créé automatiquement lors du nettoyage

import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('Missing env.NEXT_PUBLIC_SUPABASE_URL - using fallback');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Missing env.SUPABASE_SERVICE_ROLE_KEY - using anon key fallback');
}

// Client Supabase pour le serveur avec service role key
export function createServiceSupabaseClient() {
  // Fallback si les variables d'environnement manquent
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return createClient(
    supabaseUrl,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Client Supabase pour le serveur avec auth context
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return createClient(supabaseUrl, anonKey);
}

export default createServiceSupabaseClient;