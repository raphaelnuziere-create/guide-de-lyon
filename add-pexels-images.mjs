#!/usr/bin/env node
/**
 * Script moderne pour ajouter les images Pexels
 * Utilisation : node add-pexels-images.mjs VOTRE_CLE_API
 */

import { createClient } from '@supabase/supabase-js';

// ⚠️ REMPLACEZ VOTRE CLÉ API ICI OU PASSEZ-LA EN ARGUMENT
const PEXELS_API_KEY = process.argv[2] || 'COLLEZ_VOTRE_CLE_API_ICI';

// Configuration Supabase - VOTRE projet
const SUPABASE_URL = 'https://ikefyhxelzydaogrnwxi.supabase.co';
// ⚠️ REMPLACEZ CETTE CLÉ PAR VOTRE ANON KEY (trouvez-la dans Settings > API)
const SUPABASE_KEY = 'VOTRE_ANON_KEY_SUPABASE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Déterminer le terme de recherche
const getSearchTerm = (title) => {
  const t = title.toLowerCase();
  if (t.includes('boulangerie')) return 'french bakery bread';
  if (t.includes('restaurant')) return 'lyon restaurant food';
  if (t.includes('terrasse')) return 'restaurant terrace outdoor';
  if (t.includes('parc') || t.includes('tête')) return 'lyon park green';
  if (t.includes('festival') || t.includes('lumière')) return 'lyon festival lights';
  if (t.includes('marché')) return 'french market food';
  if (t.includes('musée') || t.includes('art')) return 'museum art gallery';
  if (t.includes('brunch')) return 'brunch breakfast cafe';
  if (t.includes('café')) return 'french cafe coffee';
  if (t.includes('transport') || t.includes('tram')) return 'lyon tram city';
  if (t.includes('shopping')) return 'shopping boutique';
  return 'lyon france city';
};

// Récupérer une image depuis Pexels
async function getPexelsImage(searchTerm) {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=5&orientation=landscape`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      console.log(`   ⚠️ Erreur API: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
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

// Programme principal
async function main() {
  console.log('\n🚀 AJOUT DES IMAGES PEXELS\n');
  console.log('=====================================\n');

  // Vérifier la clé API
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'COLLEZ_VOTRE_CLE_API_ICI') {
    console.error('❌ CLÉ API MANQUANTE !\n');
    console.log('Utilisation:');
    console.log('  node add-pexels-images.mjs VOTRE_CLE_API\n');
    console.log('Ou modifiez la ligne 10 du fichier\n');
    process.exit(1);
  }

  try {
    // Récupérer les articles
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, image_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase:', error.message);
      console.log('\n💡 Solutions:');
      console.log('1. Vérifiez que la table blog_posts existe');
      console.log('2. Exécutez le script SQL de création\n');
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('ℹ️ Aucun article trouvé');
      return;
    }

    console.log(`📚 ${posts.length} articles trouvés\n`);

    let success = 0;
    let skipped = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      console.log(`[${i+1}/${posts.length}] ${post.title.substring(0, 40)}...`);
      
      // Skip si déjà une image
      if (post.image_url) {
        console.log('   ⏭️ A déjà une image');
        skipped++;
        continue;
      }

      // Chercher l'image
      const searchTerm = getSearchTerm(post.title);
      console.log(`   🔍 Recherche: "${searchTerm}"`);
      
      const image = await getPexelsImage(searchTerm);
      
      if (!image) {
        console.log('   ❌ Pas d\'image trouvée');
        continue;
      }

      // Sauvegarder
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          image_url: image.url,
          image_alt: image.alt
        })
        .eq('id', post.id);

      if (updateError) {
        console.log(`   ❌ Erreur sauvegarde`);
      } else {
        console.log(`   ✅ Image ajoutée (© ${image.photographer})`);
        success++;
      }

      // Pause pour respecter les limites
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log('\n=====================================');
    console.log('✅ TERMINÉ !');
    console.log('=====================================');
    console.log(`Images ajoutées: ${success}`);
    console.log(`Déjà présentes: ${skipped}`);
    console.log('\n🎉 Voir le résultat:');
    console.log('https://www.guide-de-lyon.fr/blog\n');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
  }
}

main();