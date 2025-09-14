/**
 * Système de redirections SEO pour les anciennes URLs
 * Gère les patterns d'URL de l'ancien site vers le nouveau
 */

// Map des catégories anciennes vers nouvelles
const CATEGORY_REDIRECTS: Record<string, string> = {
  // Monuments et patrimoine
  '/monuments-lyon/': '/blog/',
  '/monument-lyon/': '/blog/',
  '/patrimoine-lyon/': '/blog/',
  '/sites-historiques-lyon/': '/blog/',
  
  // Restaurants
  '/restaurants-lyon/': '/blog/',
  '/restaurant-lyon/': '/blog/',
  '/bouchons-lyon/': '/blog/',
  '/bouchon-lyon/': '/blog/',
  '/gastronomie-lyon/': '/blog/',
  '/brasseries-lyon/': '/blog/',
  '/brasserie-lyon/': '/blog/',
  '/pizzerias-lyon/': '/blog/',
  '/pizzeria-lyon/': '/blog/',
  '/sushi-lyon/': '/blog/',
  '/japonais-lyon/': '/blog/',
  '/italien-lyon/': '/blog/',
  '/asiatique-lyon/': '/blog/',
  '/vegetarien-lyon/': '/blog/',
  '/brunch-lyon/': '/blog/',
  '/cafes-lyon/': '/blog/',
  '/cafe-lyon/': '/blog/',
  
  // Bars et nightlife
  '/bars-lyon/': '/blog/',
  '/bar-lyon/': '/blog/',
  '/bar-a-vin-lyon/': '/blog/',
  '/bar-a-cocktails-lyon/': '/blog/',
  '/pub-lyon/': '/blog/',
  '/pubs-lyon/': '/blog/',
  '/boites-nuit-lyon/': '/blog/',
  '/boite-nuit-lyon/': '/blog/',
  '/discotheques-lyon/': '/blog/',
  '/discotheque-lyon/': '/blog/',
  '/nightlife-lyon/': '/blog/',
  
  // Hôtels et hébergement
  '/hotels-lyon/': '/blog/',
  '/hotel-lyon/': '/blog/',
  '/hebergements-lyon/': '/blog/',
  '/hebergement-lyon/': '/blog/',
  '/chambres-hotes-lyon/': '/blog/',
  '/hostel-lyon/': '/blog/',
  '/auberge-jeunesse-lyon/': '/blog/',
  
  // Culture et musées
  '/musees-lyon/': '/blog/',
  '/musee-lyon/': '/blog/',
  '/culture-lyon/': '/blog/',
  '/galeries-lyon/': '/blog/',
  '/galerie-lyon/': '/blog/',
  '/exposition-lyon/': '/blog/',
  '/expositions-lyon/': '/blog/',
  '/art-lyon/': '/blog/',
  
  // Spectacles
  '/cinemas-lyon/': '/blog/',
  '/cinema-lyon/': '/blog/',
  '/theatres-lyon/': '/blog/',
  '/theatre-lyon/': '/blog/',
  '/concerts-lyon/': '/blog/',
  '/concert-lyon/': '/blog/',
  '/spectacles-lyon/': '/blog/',
  '/spectacle-lyon/': '/blog/',
  '/opera-lyon/': '/blog/',
  
  // Parcs et nature
  '/parcs-lyon/': '/blog/',
  '/parc-lyon/': '/blog/',
  '/jardins-lyon/': '/blog/',
  '/jardin-lyon/': '/blog/',
  '/nature-lyon/': '/blog/',
  '/espaces-verts-lyon/': '/blog/',
  
  // Shopping
  '/shopping-lyon/': '/blog/',
  '/boutiques-lyon/': '/blog/',
  '/boutique-lyon/': '/blog/',
  '/magasins-lyon/': '/blog/',
  '/magasin-lyon/': '/blog/',
  '/commerces-lyon/': '/blog/',
  '/commerce-lyon/': '/blog/',
  '/marches-lyon/': '/blog/',
  '/marche-lyon/': '/blog/',
  
  // Sport et bien-être
  '/sport-lyon/': '/blog/',
  '/sports-lyon/': '/blog/',
  '/fitness-lyon/': '/blog/',
  '/gym-lyon/': '/blog/',
  '/piscines-lyon/': '/blog/',
  '/piscine-lyon/': '/blog/',
  '/spa-lyon/': '/blog/',
  '/spas-lyon/': '/blog/',
  '/bien-etre-lyon/': '/blog/',
  '/massage-lyon/': '/blog/',
  '/yoga-lyon/': '/blog/',
  
  // Tourisme et visites
  '/tourisme-lyon/': '/blog/',
  '/visite-lyon/': '/blog/',
  '/visites-lyon/': '/blog/',
  '/guide-lyon/': '/blog/',
  '/decouvrir-lyon/': '/blog/',
  '/que-faire-lyon/': '/blog/',
  '/sortir-lyon/': '/blog/',
  '/activites-lyon/': '/blog/',
  '/activite-lyon/': '/blog/',
  '/loisirs-lyon/': '/blog/',
  
  // Événements
  '/evenements-lyon/': '/evenements',
  '/evenement-lyon/': '/evenements',
  '/agenda-lyon/': '/evenements',
  '/festival-lyon/': '/evenements',
  '/festivals-lyon/': '/evenements',
  '/fete-lyon/': '/evenements',
  '/fetes-lyon/': '/evenements',
  
  // Services
  '/services-lyon/': '/annuaire',
  '/coiffeurs-lyon/': '/annuaire',
  '/coiffeur-lyon/': '/annuaire',
  '/beaute-lyon/': '/annuaire',
  '/sante-lyon/': '/annuaire',
  '/medecin-lyon/': '/annuaire',
  '/pharmacies-lyon/': '/annuaire',
  '/pharmacie-lyon/': '/annuaire',
  
  // Quartiers
  '/vieux-lyon/': '/blog/',
  '/bellecour/': '/blog/',
  '/croix-rousse/': '/blog/',
  '/confluence/': '/blog/',
  '/part-dieu/': '/blog/',
  '/fourviere/': '/blog/',
  '/presquile/': '/blog/',
  '/gerland/': '/blog/',
  '/guillotiere/': '/blog/',
  '/terreaux/': '/blog/',
};

// Fonction pour nettoyer une URL
function cleanUrl(url: string): string {
  // Retirer le domaine si présent
  url = url.replace(/^https?:\/\/[^\/]+/, '');
  // Retirer les paramètres
  url = url.split('?')[0];
  // Retirer l'ancre
  url = url.split('#')[0];
  return url;
}

// Fonction pour extraire le slug depuis une ancienne URL
function extractSlugFromOldUrl(oldUrl: string): string {
  // Nettoyer l'URL
  const cleanedUrl = cleanUrl(oldUrl);
  
  // Retirer l'extension .html ou .php si présente
  let slug = cleanedUrl.replace(/\.(html|php|htm)$/, '');
  
  // Extraire la dernière partie après le dernier /
  const parts = slug.split('/');
  slug = parts[parts.length - 1] || parts[parts.length - 2];
  
  return slug;
}

// Fonction pour trouver la catégorie depuis l'ancienne URL
function findCategoryFromUrl(url: string): string | null {
  const cleanedUrl = cleanUrl(url).toLowerCase();
  
  for (const [oldCategory, _] of Object.entries(CATEGORY_REDIRECTS)) {
    if (cleanedUrl.includes(oldCategory.replace(/\//g, ''))) {
      return oldCategory;
    }
  }
  
  return null;
}

/**
 * Fonction principale pour obtenir la redirection
 * @param oldUrl L'ancienne URL complète
 * @param slugMapping Optionnel : mapping des anciens slugs vers les nouveaux
 */
export function getRedirection(
  oldUrl: string,
  slugMapping?: Map<string, string>
): string | null {
  const cleanedUrl = cleanUrl(oldUrl);
  
  // D'abord vérifier dans les redirections de la base de données
  const dbRedirect = getDbRedirect(cleanedUrl);
  if (dbRedirect) {
    return dbRedirect;
  }
  
  // Ensuite vérifier les redirections de catégories exactes
  for (const [oldPath, newPath] of Object.entries(CATEGORY_REDIRECTS)) {
    if (cleanedUrl.startsWith(oldPath)) {
      const remainingPath = cleanedUrl.slice(oldPath.length);
      if (remainingPath) {
        const slug = remainingPath.replace(/\.(html|php|htm)$/, '');
        
        // Si on a un mapping de slugs, l'utiliser
        if (slugMapping && slugMapping.has(slug)) {
          return `/blog/${slugMapping.get(slug)}`;
        }
        
        // Sinon utiliser le slug tel quel
        return `/blog/${slug}`;
      }
      return newPath;
    }
  }
  
  // Vérifier les patterns de catégories dans l'URL
  const detectedCategory = findCategoryFromUrl(cleanedUrl);
  if (detectedCategory) {
    const slug = extractSlugFromOldUrl(cleanedUrl);
    
    // Si on a un mapping de slugs, l'utiliser
    if (slugMapping && slugMapping.has(slug)) {
      return `/blog/${slugMapping.get(slug)}`;
    }
    
    return `/blog/${slug}`;
  }
  
  // Pattern par défaut pour les URLs avec .html
  if (cleanedUrl.endsWith('.html') || cleanedUrl.endsWith('.php')) {
    const slug = extractSlugFromOldUrl(cleanedUrl);
    
    // Si on a un mapping de slugs, l'utiliser
    if (slugMapping && slugMapping.has(slug)) {
      return `/blog/${slugMapping.get(slug)}`;
    }
    
    return `/blog/${slug}`;
  }
  
  // Cas spéciaux
  const specialCases: Record<string, string> = {
    '/': '/',
    '/index.html': '/',
    '/index.php': '/',
    '/contact.html': '/contact',
    '/contact.php': '/contact',
    '/mentions-legales.html': '/mentions-legales',
    '/mentions-legales.php': '/mentions-legales',
    '/plan-site.html': '/annuaire',
    '/plan-site.php': '/annuaire',
    '/sitemap.xml': '/sitemap.xml',
    '/robots.txt': '/robots.txt',
  };
  
  if (specialCases[cleanedUrl]) {
    return specialCases[cleanedUrl];
  }
  
  // Si aucune correspondance, retourner null
  return null;
}

/**
 * Fonction pour vérifier si une URL nécessite une redirection
 */
export function needsRedirection(url: string): boolean {
  const cleanedUrl = cleanUrl(url);
  
  // Vérifier si c'est une ancienne URL avec extension
  if (cleanedUrl.match(/\.(html|php|htm)$/)) {
    return true;
  }
  
  // Vérifier si c'est une ancienne catégorie
  for (const oldCategory of Object.keys(CATEGORY_REDIRECTS)) {
    if (cleanedUrl.startsWith(oldCategory)) {
      return true;
    }
  }
  
  // Vérifier si l'URL contient des patterns d'anciennes catégories
  const oldPatterns = [
    'monuments-lyon',
    'restaurants-lyon',
    'hotels-lyon',
    'bars-lyon',
    'musees-lyon',
    'parcs-lyon',
    'shopping-lyon',
    'culture-lyon',
    'visite-lyon',
    'tourisme-lyon'
  ];
  
  for (const pattern of oldPatterns) {
    if (cleanedUrl.includes(pattern)) {
      return true;
    }
  }
  
  return false;
}

// Import des redirections générées depuis la base de données
import { dbRedirects, getDbRedirect } from './db-redirects';

// Export des patterns pour tests et debug
export { CATEGORY_REDIRECTS, cleanUrl, extractSlugFromOldUrl };