/**
 * Utilitaire pour gérer les problèmes de cache navigateur
 */

export function clearAuthCache() {
  // Nettoyer localStorage
  if (typeof window !== 'undefined') {
    // Supprimer toutes les clés Supabase
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Nettoyer sessionStorage
    sessionStorage.clear();
    
    // Forcer le rechargement sans cache
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
  }
}

export function setupCacheHeaders() {
  // Headers pour éviter la mise en cache agressive
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

export function addCacheBuster(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
}

// Hook pour détecter les problèmes de session
export function useSessionValidator() {
  if (typeof window !== 'undefined') {
    // Vérifier toutes les 30 secondes si la session est valide
    setInterval(async () => {
      try {
        const response = await fetch('/api/auth/validate', {
          method: 'GET',
          headers: setupCacheHeaders()
        });
        
        if (!response.ok) {
          console.log('Session invalide détectée, nettoyage du cache...');
          clearAuthCache();
          window.location.href = '/auth/pro/connexion';
        }
      } catch (error) {
        console.error('Erreur validation session:', error);
      }
    }, 30000); // 30 secondes
  }
}