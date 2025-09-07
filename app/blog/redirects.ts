/**
 * Gestion des redirections SEO pour les anciennes URLs du blog
 * Maintient le référencement lors du changement de structure
 */

export const blogRedirects: Record<string, string> = {
  // Anciennes URLs vers nouvelles
  '/blog/decouvrir-vieux-lyon': '/blog/decouvrir-vieux-lyon',
  '/blog/meilleurs-bouchons-lyonnais': '/blog/meilleurs-bouchons-lyonnais',
  '/blog/fete-des-lumieres-2024': '/blog/festival-lumieres-2024-programme',
  
  // Redirections depuis les anciennes catégories
  // '/actualites': '/blog', // Commenté car nous avons maintenant une vraie page actualités
  '/news': '/blog',
  '/articles': '/blog',
  
  // Redirections des slugs mal formés
  '/blog/nouvelle_boulangerie_vieux_lyon': '/blog/nouvelle-boulangerie-vieux-lyon',
  '/blog/top_10_restaurants_terrasse_ete': '/blog/top-10-restaurants-terrasse-ete',
  '/blog/parc_tete_or_renovation': '/blog/parc-tete-or-renovation',
  
  // Redirections pour les anciens formats d'URL
  '/post/': '/blog/',
  '/article/': '/blog/',
  '/actualite/': '/blog/',
};

/**
 * Vérifier si une URL nécessite une redirection
 */
export function checkRedirect(path: string): string | null {
  // Redirection directe
  if (blogRedirects[path]) {
    return blogRedirects[path];
  }
  
  // Vérifier les patterns
  if (path.startsWith('/post/')) {
    return path.replace('/post/', '/blog/');
  }
  
  if (path.startsWith('/article/')) {
    return path.replace('/article/', '/blog/');
  }
  
  if (path.startsWith('/actualite/')) {
    return path.replace('/actualite/', '/blog/');
  }
  
  // Normaliser les underscores en tirets
  if (path.includes('_')) {
    return path.replace(/_/g, '-');
  }
  
  return null;
}