/**
 * Gestion de la persistance des sessions d'authentification
 * Évite les problèmes de cache navigateur avec une approche moderne
 */

import { supabase } from '@/app/lib/supabase/client';

/**
 * Configure l'écoute des changements d'état d'authentification
 * pour maintenir la session synchronisée
 */
export function setupAuthStateListener() {
  if (typeof window === 'undefined') return;

  // Écouter les changements d'état d'authentification
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      // Stocker un indicateur de session valide
      localStorage.setItem('auth_session_valid', 'true');
      localStorage.setItem('auth_session_expires', session.expires_at?.toString() || '');
    } else if (event === 'SIGNED_OUT') {
      // Nettoyer les indicateurs
      localStorage.removeItem('auth_session_valid');
      localStorage.removeItem('auth_session_expires');
      clearStaleAuthData();
    } else if (event === 'TOKEN_REFRESHED' && session) {
      // Mettre à jour l'expiration lors du refresh
      localStorage.setItem('auth_session_expires', session.expires_at?.toString() || '');
    }
  });

  // Vérifier périodiquement la validité de la session
  setInterval(checkSessionValidity, 30000); // Toutes les 30 secondes
}

/**
 * Vérifie si la session est valide et synchronisée
 */
export async function checkSessionValidity() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      // Session invalide, nettoyer
      localStorage.removeItem('auth_session_valid');
      localStorage.removeItem('auth_session_expires');
      return false;
    }

    // Vérifier l'expiration
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      
      if (expiresAt <= now) {
        // Session expirée, tenter un refresh
        const { data: { session: newSession } } = await supabase.auth.refreshSession();
        return !!newSession;
      }
    }

    return true;
  } catch (error) {
    console.error('Erreur vérification session:', error);
    return false;
  }
}

/**
 * Nettoie les données d'authentification périmées
 */
export function clearStaleAuthData() {
  if (typeof window === 'undefined') return;

  // Nettoyer les clés Supabase spécifiques qui peuvent causer des problèmes
  const keysToCheck = [
    'supabase.auth.token',
    'supabase.auth.refreshToken',
    'supabase.auth.user'
  ];

  for (const key of keysToCheck) {
    const keys = Object.keys(localStorage).filter(k => k.includes(key));
    keys.forEach(k => {
      try {
        const data = localStorage.getItem(k);
        if (data) {
          const parsed = JSON.parse(data);
          // Vérifier si les données sont périmées (plus de 24h)
          if (parsed.timestamp && Date.now() - parsed.timestamp > 86400000) {
            localStorage.removeItem(k);
          }
        }
      } catch {
        // Si on ne peut pas parser, supprimer la clé
        localStorage.removeItem(k);
      }
    });
  }
}

/**
 * Force le rafraîchissement de la session
 */
export async function forceSessionRefresh() {
  try {
    // Tenter de rafraîchir la session
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      // Si échec, nettoyer et forcer reconnexion
      await supabase.auth.signOut();
      clearStaleAuthData();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Erreur refresh session:', error);
    return null;
  }
}

/**
 * Récupère la session avec retry automatique
 */
export async function getSessionWithRetry(maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!error && session) {
        return session;
      }
      
      // Si pas de session, essayer de refresh
      if (!session) {
        const refreshed = await forceSessionRefresh();
        if (refreshed) return refreshed;
      }
      
      retries++;
      // Attendre avant de réessayer
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    } catch (error) {
      console.error(`Tentative ${retries + 1} échouée:`, error);
      retries++;
    }
  }
  
  return null;
}

/**
 * Headers pour éviter la mise en cache des requêtes d'auth
 */
export function getNoCacheHeaders() {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Request-Time': Date.now().toString()
  };
}