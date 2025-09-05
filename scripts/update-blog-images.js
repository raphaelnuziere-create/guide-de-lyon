#!/usr/bin/env node
/**
 * Script pour ajouter automatiquement des images Pexels aux articles de blog
 * Utilise l'API Pexels pour récupérer des images en fonction du titre de l'article
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Configuration
const SUPABASE_URL = 'https://gscrocmpqsakzmpvhrir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzY3JvY21wcXNha3ptcHZocmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3OTU0NDMsImV4cCI6MjA0NTM3MTQ0M30.HlCJpdUKDdMuHROiMOGD7rzddPqpXgh5c7yChzQEfJU';

// Clé API Pexels - Gratuite à obtenir sur https://www.pexels.com/api/
// Pour ce script, j'utilise une clé de démonstration
const PEXELS_API_KEY = '563492ad6f91700001000001b3b1a8e8a8314f5b8e8c8f8e8e8e8e8e'; // Clé exemple

// Initialiser Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mots-clés pour identifier les thèmes dans les titres
const THEMES = {
  'boulangerie': ['bakery', 'bread', 'croissant', 'patisserie'],
  'restaurant': ['restaurant', 'cuisine', 'dining', 'food'],
  'parc': ['park', 'garden', 'nature', 'green space'],
  'musée': ['museum', 'art', 'gallery', 'culture'],
  'shopping': ['shopping', 'boutique', 'store', 'retail'],
  'café': ['coffee', 'cafe', 'bistro', 'terrace'],
  'bar': ['bar', 'cocktail', 'nightlife', 'drinks'],
  'marché': ['market', 'fresh produce', 'farmers market'],
  'festival': ['festival', 'event', 'celebration', 'concert'],
  'sport': ['sport', 'fitness', 'gym', 'athletics'],
  'théâtre': ['theatre', 'performance', 'stage', 'drama'],
  'cinéma': ['cinema', 'movie', 'film', 'theatre'],
  'hôtel': ['hotel', 'accommodation', 'hospitality', 'luxury'],
  'transport': ['transport', 'metro', 'tram', 'station'],
  'architecture': ['architecture', 'building', 'historical', 'monument']
};

// Images par défaut de Lyon (URLs de démonstration)
const LYON_DEFAULT_IMAGES = [
  'https://images.pexels.com/photos/2363807/pexels-photo-2363807.jpeg',
  'https://images.pexels.com/photos/3214995/pexels-photo-3214995.jpeg',
  'https://images.pexels.com/photos/2104882/pexels-photo-2104882.jpeg',
  'https://images.pexels.com/photos/1796715/pexels-photo-1796715.jpeg',
  'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg'
];

let lyonImageIndex = 0;

/**
 * Extraire le thème principal du titre
 */
function extractTheme(title) {
  const titleLower = title.toLowerCase();
  
  for (const [theme, keywords] of Object.entries(THEMES)) {
    if (titleLower.includes(theme)) {
      return keywords[0]; // Retourne le mot-clé en anglais pour Pexels
    }
  }
  
  // Si aucun thème trouvé, chercher des mots-clés génériques
  if (titleLower.includes('nouveau') || titleLower.includes('ouverture')) {
    return 'grand opening';
  }
  if (titleLower.includes('guide') || titleLower.includes('découvrir')) {
    return 'tourism';
  }
  if (titleLower.includes('événement') || titleLower.includes('agenda')) {
    return 'event';
  }
  
  return null; // Pas de thème trouvé, on utilisera Lyon
}

/**
 * Récupérer une image depuis Pexels
 */
async function fetchPexelsImage(query) {
  try {
    console.log(`🔍 Recherche Pexels pour: "${query}"`);
    
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&locale=fr-FR`, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ Erreur API Pexels: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      // Prendre une image aléatoire parmi les 5 premières
      const randomIndex = Math.floor(Math.random() * Math.min(5, data.photos.length));
      const photo = data.photos[randomIndex];
      
      return {
        url: photo.src.large || photo.src.original,
        alt: photo.alt || query
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération Pexels:', error.message);
    return null;
  }
}

/**
 * Obtenir une image par défaut de Lyon
 */
function getDefaultLyonImage() {
  const image = LYON_DEFAULT_IMAGES[lyonImageIndex % LYON_DEFAULT_IMAGES.length];
  lyonImageIndex++;
  return {
    url: image,
    alt: 'Vue de Lyon'
  };
}

/**
 * Mettre à jour les articles avec des images
 */
async function updateBlogImages() {
  console.log('🚀 Début de la mise à jour des images du blog\n');
  
  try {
    // 1. Récupérer tous les articles sans image
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug')
      .is('image_url', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur lors de la récupération des articles:', error);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('✅ Tous les articles ont déjà une image !');
      return;
    }

    console.log(`📝 ${posts.length} articles à mettre à jour\n`);

    // 2. Pour chaque article, trouver et ajouter une image
    for (const post of posts) {
      console.log(`\n📄 Article: "${post.title}"`);
      
      // Extraire le thème du titre
      const theme = extractTheme(post.title);
      let image = null;
      
      if (theme) {
        // Chercher une image en rapport avec le thème
        console.log(`   Thème détecté: ${theme}`);
        image = await fetchPexelsImage(theme);
        
        // Attendre un peu pour respecter les limites de l'API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Si pas d'image trouvée, utiliser une image de Lyon
      if (!image) {
        console.log('   Utilisation d\'une image par défaut de Lyon');
        const lyonQuery = `Lyon France ${['cityscape', 'architecture', 'street', 'monument'][Math.floor(Math.random() * 4)]}`;
        image = await fetchPexelsImage(lyonQuery);
        
        // Si toujours pas d'image, utiliser une URL par défaut
        if (!image) {
          image = getDefaultLyonImage();
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // 3. Mettre à jour l'article avec l'image
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          image_url: image.url,
          image_alt: image.alt
        })
        .eq('id', post.id);

      if (updateError) {
        console.error(`   ❌ Erreur mise à jour:`, updateError);
      } else {
        console.log(`   ✅ Image ajoutée: ${image.url.substring(0, 50)}...`);
      }
    }

    console.log('\n🎉 Mise à jour terminée !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Message d'information
console.log('====================================');
console.log('📸 Mise à jour des images du blog');
console.log('====================================');
console.log('\n⚠️  IMPORTANT: Pour utiliser l\'API Pexels, vous devez:');
console.log('1. Créer un compte gratuit sur https://www.pexels.com/api/');
console.log('2. Obtenir votre clé API');
console.log('3. Remplacer PEXELS_API_KEY dans ce script\n');
console.log('Pour l\'instant, le script utilisera des images de démonstration.\n');

// Lancer la mise à jour
updateBlogImages();