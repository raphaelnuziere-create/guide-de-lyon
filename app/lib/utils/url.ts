/**
 * Obtenir l'URL de base de l'application
 * Gère automatiquement les environnements local et production
 */
export function getBaseUrl(): string {
  // En production, utiliser l'URL définie ou celle de Vercel
  if (process.env.NODE_ENV === 'production') {
    // Priorité : NEXT_PUBLIC_APP_URL > NEXT_PUBLIC_VERCEL_URL > URL par défaut
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    // URL de production par défaut
    return 'https://www.guide-de-lyon.fr';
  }
  
  // En développement local
  return 'http://localhost:3000';
}

/**
 * Obtenir l'URL complète du callback
 */
export function getCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}

/**
 * Obtenir l'URL depuis les headers de la requête (pour les Route Handlers)
 */
export function getUrlFromRequest(request: Request): string {
  const url = new URL(request.url);
  
  // Si on est sur localhost, utiliser localhost
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return `${url.protocol}//${url.host}`;
  }
  
  // En production, forcer HTTPS et www
  if (url.hostname === 'guide-de-lyon.fr') {
    return 'https://www.guide-de-lyon.fr';
  }
  
  return `${url.protocol}//${url.host}`;
}