#!/usr/bin/env node
/**
 * Script pour mettre à jour les images du blog avec l'API Pexels
 * Utilise votre clé API pour récupérer de vraies images de haute qualité
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Configuration Supabase
const SUPABASE_URL = 'https://gscrocmpqsakzmpvhrir.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzY3JvY21wcXNha3ptcHZocmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3OTU0NDMsImV4cCI6MjA0NTM3MTQ0M30.HlCJpdUKDdMuHROiMOGD7rzddPqpXgh5c7yChzQEfJU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Thèmes de recherche optimisés pour Pexels
const SEARCH_THEMES = {
  'boulangerie': ['bakery lyon', 'french bakery', 'artisan bread', 'croissant shop'],
  'restaurant': ['restaurant lyon', 'french cuisine', 'gastronomy', 'dining terrace'],
  'parc': ['parc lyon', 'urban park', 'city garden', 'green space'],
  'musée': ['museum lyon', 'art gallery', 'cultural center', 'exhibition'],
  'marché': ['french market', 'farmers market lyon', 'fresh produce', 'local market'],
  'festival': ['festival lyon', 'light festival', 'cultural event', 'city celebration'],
  'café': ['french cafe', 'coffee shop lyon', 'cafe terrace', 'bistro'],
  'transport': ['lyon tram', 'public transport', 'metro station', 'city transport'],
  'shopping': ['shopping lyon', 'boutique', 'retail store', 'commercial street'],
  'brunch': ['brunch restaurant', 'breakfast cafe', 'sunday brunch', 'morning meal']
};

// Images de secours de Lyon (haute qualité)
const FALLBACK_LYON_IMAGES = [
  'https://images.pexels.com/photos/2363807/pexels-photo-2363807.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/3214995/pexels-photo-3214995.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1796715/pexels-photo-1796715.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/2411759/pexels-photo-2411759.jpeg?auto=compress&cs=tinysrgb&w=1600'
];

/**
 * Récupérer une image depuis Pexels
 */
async function fetchPexelsImage(query, apiKey) {
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&orientation=landscape`, {
      headers: {
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      console.log(`   ⚠️ Erreur API pour "${query}": ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      // Prendre une image aléatoire parmi les résultats pour varier
      const randomIndex = Math.floor(Math.random() * Math.min(5, data.photos.length));
      const photo = data.photos[randomIndex];
      
      return {
        url: photo.src.large2x || photo.src.large || photo.src.original,
        alt: photo.alt || query,
        photographer: photo.photographer
      };
    }
    
    return null;
  } catch (error) {
    console.error(`   ❌ Erreur fetch: ${error.message}`);
    return null;
  }
}

/**
 * Déterminer le meilleur terme de recherche
 */
function getSearchQuery(title) {
  const titleLower = title.toLowerCase();
  
  for (const [keyword, queries] of Object.entries(SEARCH_THEMES)) {
    if (titleLower.includes(keyword)) {
      // Prendre un terme aléatoire pour varier
      return queries[Math.floor(Math.random() * queries.length)];
    }
  }
  
  // Recherches par défaut basées sur le contenu
  if (titleLower.includes('nouveau') || titleLower.includes('ouverture')) {
    return 'grand opening restaurant lyon';
  }
  if (titleLower.includes('guide') || titleLower.includes('top')) {
    return 'lyon tourism guide';
  }
  if (titleLower.includes('événement') || titleLower.includes('agenda')) {
    return 'lyon event calendar';
  }
  
  // Par défaut : Lyon avec variation
  const lyonQueries = ['lyon france city', 'lyon architecture', 'lyon streets', 'lyon monuments'];
  return lyonQueries[Math.floor(Math.random() * lyonQueries.length)];
}

/**
 * Mettre à jour les images du blog
 */
async function updateBlogImages(apiKey) {
  console.log('\n🚀 Mise à jour des images avec l\'API Pexels...\n');
  
  try {
    // Récupérer les articles
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, image_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase:', error.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('ℹ️ Aucun article trouvé dans blog_posts');
      return;
    }

    console.log(`📚 ${posts.length} articles trouvés\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      // Skip si l'article a déjà une image (sauf si on veut forcer)
      if (post.image_url && !process.argv.includes('--force')) {
        console.log(`⏭️  "${post.title}" - A déjà une image`);
        skippedCount++;
        continue;
      }

      console.log(`\n📝 Article: "${post.title}"`);
      
      // Obtenir le terme de recherche
      const searchQuery = getSearchQuery(post.title);
      console.log(`   🔍 Recherche: "${searchQuery}"`);
      
      // Chercher l'image
      let image = await fetchPexelsImage(searchQuery, apiKey);
      
      // Si pas d'image trouvée, essayer avec "Lyon"
      if (!image) {
        console.log('   🔄 Recherche alternative: "Lyon France"');
        image = await fetchPexelsImage('Lyon France beautiful', apiKey);
      }
      
      // Si toujours rien, utiliser une image de secours
      if (!image) {
        const fallbackIndex = updatedCount % FALLBACK_LYON_IMAGES.length;
        image = {
          url: FALLBACK_LYON_IMAGES[fallbackIndex],
          alt: `Vue de Lyon - ${post.title}`
        };
        console.log('   📌 Utilisation image de secours');
      }
      
      // Mettre à jour dans Supabase
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          image_url: image.url,
          image_alt: image.alt
        })
        .eq('id', post.id);

      if (updateError) {
        console.error(`   ❌ Erreur mise à jour: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Image mise à jour${image.photographer ? ` (© ${image.photographer})` : ''}`);
        updatedCount++;
      }
      
      // Pause pour respecter les limites API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Résumé
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(50));
    console.log(`✅ Mises à jour réussies: ${updatedCount}`);
    console.log(`⏭️  Ignorées (ont déjà une image): ${skippedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📝 Total traité: ${posts.length}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
  }
}

// Programme principal
async function main() {
  console.log('====================================');
  console.log('📸 Mise à jour des images du blog');
  console.log('====================================');
  
  // Vérifier si la clé API est passée en argument
  let apiKey = process.argv[2];
  
  if (!apiKey || apiKey === '--force') {
    console.log('\n📝 Entrez votre clé API Pexels');
    console.log('   (Obtenez-la sur https://www.pexels.com/api/)\n');
    
    apiKey = await new Promise(resolve => {
      rl.question('Clé API Pexels: ', resolve);
    });
  }
  
  if (!apiKey || apiKey.length < 20) {
    console.error('\n❌ Clé API invalide ou manquante');
    console.log('\nUtilisation:');
    console.log('  node update-blog-with-pexels.js VOTRE_CLE_API');
    console.log('  node update-blog-with-pexels.js VOTRE_CLE_API --force (pour remplacer les images existantes)\n');
    process.exit(1);
  }
  
  await updateBlogImages(apiKey);
  rl.close();
}

// Lancer le script
main().catch(console.error);