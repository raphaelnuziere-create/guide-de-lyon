#!/usr/bin/env node
/**
 * Version simplifiée - Ajoute des images gratuites aux articles de blog
 * Utilise Unsplash Source pour des images aléatoires
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = 'https://gscrocmpqsakzmpvhrir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzY3JvY21wcXNha3ptcHZocmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3OTU0NDMsImV4cCI6MjA0NTM3MTQ0M30.HlCJpdUKDdMuHROiMOGD7rzddPqpXgh5c7yChzQEfJU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mots-clés pour les thèmes
const THEMES = {
  'boulangerie': 'bakery,bread,croissant',
  'restaurant': 'restaurant,food,dining',
  'parc': 'park,nature,garden',
  'musée': 'museum,art,gallery',
  'shopping': 'shopping,store,retail',
  'café': 'coffee,cafe,bistro',
  'bar': 'bar,cocktail,drinks',
  'marché': 'market,produce,farmers',
  'festival': 'festival,event,concert',
  'sport': 'sport,fitness,gym',
  'théâtre': 'theatre,performance,stage',
  'cinéma': 'cinema,movie,film',
  'hôtel': 'hotel,luxury,hospitality',
  'transport': 'transport,train,metro',
  'architecture': 'architecture,building,monument'
};

// Générateur d'URL Unsplash
function getUnsplashUrl(keywords, size = '1600x900') {
  // Unsplash Source API - Images aléatoires gratuites
  const seed = Math.random().toString(36).substring(7);
  return `https://source.unsplash.com/${size}/?${keywords}&sig=${seed}`;
}

// Extraire le thème du titre
function extractTheme(title) {
  const titleLower = title.toLowerCase();
  
  for (const [theme, keywords] of Object.entries(THEMES)) {
    if (titleLower.includes(theme)) {
      return keywords;
    }
  }
  
  // Thèmes par défaut si aucun trouvé
  if (titleLower.includes('nouveau') || titleLower.includes('ouverture')) {
    return 'opening,new,business';
  }
  if (titleLower.includes('guide') || titleLower.includes('découvrir')) {
    return 'tourism,travel,discover';
  }
  if (titleLower.includes('événement') || titleLower.includes('agenda')) {
    return 'event,agenda,calendar';
  }
  
  // Par défaut : Lyon
  return 'lyon,france,city';
}

async function updateBlogImages() {
  console.log('🚀 Mise à jour des images du blog\n');
  
  try {
    // Récupérer les articles sans image
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug')
      .is('image_url', null);

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('✅ Tous les articles ont déjà une image !');
      return;
    }

    console.log(`📝 ${posts.length} articles à mettre à jour\n`);

    // Mettre à jour chaque article
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`[${i+1}/${posts.length}] "${post.title}"`);
      
      // Générer l'URL de l'image
      const keywords = extractTheme(post.title);
      const imageUrl = getUnsplashUrl(keywords);
      const imageAlt = `Image pour ${post.title}`;
      
      // Mettre à jour dans Supabase
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          image_url: imageUrl,
          image_alt: imageAlt
        })
        .eq('id', post.id);

      if (updateError) {
        console.error(`   ❌ Erreur:`, updateError.message);
      } else {
        console.log(`   ✅ Image ajoutée`);
      }
      
      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Terminé !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Lancer le script
console.log('====================================');
console.log('📸 Ajout d\'images aux articles');
console.log('====================================\n');
updateBlogImages();