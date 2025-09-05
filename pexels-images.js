#!/usr/bin/env node
/**
 * Script SIMPLE pour ajouter les images Pexels avec votre clé API
 * Exécutez : node pexels-images.js VOTRE_CLE_API
 */

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// ⚠️ REMPLACEZ ICI VOTRE CLÉ API PEXELS
const PEXELS_API_KEY = process.argv[2] || 'COLLEZ_VOTRE_CLE_API_ICI';

// Configuration Supabase (déjà configurée)
const SUPABASE_URL = 'https://gscrocmpqsakzmpvhrir.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzY3JvY21wcXNha3ptcHZocmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3OTU0NDMsImV4cCI6MjA0NTM3MTQ0M30.HlCJpdUKDdMuHROiMOGD7rzddPqpXgh5c7yChzQEfJU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Recherches optimisées pour Lyon
const getSearchTerm = (title) => {
  const t = title.toLowerCase();
  if (t.includes('boulangerie')) return 'french bakery bread';
  if (t.includes('restaurant')) return 'lyon restaurant cuisine';
  if (t.includes('terrasse')) return 'restaurant terrace outdoor';
  if (t.includes('parc') || t.includes('tête')) return 'lyon park nature';
  if (t.includes('festival') || t.includes('lumière')) return 'lyon festival lights';
  if (t.includes('marché')) return 'french market fresh food';
  if (t.includes('musée') || t.includes('art')) return 'museum art gallery';
  if (t.includes('brunch')) return 'brunch breakfast restaurant';
  if (t.includes('café')) return 'french cafe coffee';
  if (t.includes('transport') || t.includes('tram')) return 'lyon tram transport';
  if (t.includes('shopping')) return 'shopping boutique store';
  return 'lyon france city';
};

async function getPexelsImage(searchTerm) {
  try {
    console.log(`   🔍 Recherche: "${searchTerm}"`);
    
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=5&orientation=landscape`,
      {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) {
      console.log(`   ⚠️ Erreur API: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      // Prendre une photo aléatoire parmi les résultats
      const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
      return {
        url: photo.src.large2x || photo.src.large,
        alt: photo.alt || searchTerm,
        photographer: photo.photographer
      };
    }
    
    return null;
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
    return null;
  }
}

async function updateAllImages() {
  console.log('\n🚀 MISE À JOUR DES IMAGES AVEC PEXELS API\n');
  console.log('=========================================\n');

  // Vérifier la clé API
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'COLLEZ_VOTRE_CLE_API_ICI') {
    console.error('❌ ERREUR: Clé API manquante!\n');
    console.log('Utilisation:');
    console.log('  node pexels-images.js VOTRE_CLE_API');
    console.log('\nOu modifiez la ligne 10 du fichier avec votre clé\n');
    process.exit(1);
  }

  try {
    // 1. D'abord, créer les colonnes si elles n'existent pas
    console.log('📝 Vérification de la structure de la table...\n');
    
    // Récupérer les articles
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, image_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase:', error.message);
      console.log('\n💡 Vérifiez que la table blog_posts existe dans Supabase');
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('ℹ️ Aucun article trouvé');
      return;
    }

    console.log(`📚 ${posts.length} articles trouvés\n`);
    console.log('🎨 Ajout des images en cours...\n');
    console.log('-----------------------------------------');

    let success = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      // Progress
      console.log(`\n[${i+1}/${posts.length}] ${post.title.substring(0, 50)}...`);
      
      // Skip si déjà une image
      if (post.image_url && !process.argv.includes('--force')) {
        console.log('   ⏭️ A déjà une image');
        skipped++;
        continue;
      }

      // Chercher une image
      const searchTerm = getSearchTerm(post.title);
      const image = await getPexelsImage(searchTerm);
      
      if (!image) {
        console.log('   ❌ Pas d\'image trouvée');
        errors++;
        continue;
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
        console.log(`   ❌ Erreur mise à jour`);
        errors++;
      } else {
        console.log(`   ✅ Image ajoutée (© ${image.photographer})`);
        success++;
      }

      // Petite pause pour respecter les limites
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Résumé
    console.log('\n=========================================');
    console.log('📊 TERMINÉ !');
    console.log('=========================================');
    console.log(`✅ Images ajoutées: ${success}`);
    console.log(`⏭️ Ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log('=========================================\n');
    
    console.log('🎉 Allez voir le résultat sur:');
    console.log('   https://www.guide-de-lyon.fr/blog\n');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

// Lancer le script
updateAllImages();