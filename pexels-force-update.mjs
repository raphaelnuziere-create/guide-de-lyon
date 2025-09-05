#!/usr/bin/env node
/**
 * Script FORCÉ pour ajouter les images Pexels
 * Version qui force vraiment les updates
 */

import { createClient } from '@supabase/supabase-js';

// ⚠️ REMPLACEZ PAR VOTRE CLÉ API PEXELS
const PEXELS_API_KEY = process.argv[2] || 'COLLEZ_VOTRE_CLE_API_PEXELS';

// Configuration Supabase correcte
const SUPABASE_URL = 'https://ikefyhxelzydaogrnwxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTY3NTQsImV4cCI6MjA3MTI3Mjc1NH0.vJHDlWKUK0xUoXB_CCxNkVNnWhb7Wpq-mA097blKmzc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Images de secours de haute qualité
const FALLBACK_IMAGES = [
  'https://images.pexels.com/photos/2363807/pexels-photo-2363807.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/3214995/pexels-photo-3214995.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/1796715/pexels-photo-1796715.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/2411759/pexels-photo-2411759.jpeg?auto=compress&cs=tinysrgb&w=1600'
];

// Déterminer le terme de recherche
const getSearchTerm = (title) => {
  const t = title.toLowerCase();
  if (t.includes('boulangerie') || t.includes('pain')) return 'bakery bread';
  if (t.includes('restaurant')) return 'restaurant food';
  if (t.includes('terrasse')) return 'terrace outdoor';
  if (t.includes('parc') || t.includes('tête')) return 'park nature';
  if (t.includes('festival') || t.includes('lumière')) return 'festival lights';
  if (t.includes('marché')) return 'market food';
  if (t.includes('musée') || t.includes('art')) return 'museum art';
  if (t.includes('brunch')) return 'brunch cafe';
  if (t.includes('café')) return 'coffee shop';
  if (t.includes('transport') || t.includes('tram')) return 'tram transport';
  if (t.includes('shopping')) return 'shopping store';
  if (t.includes('hôtel') || t.includes('hotel')) return 'hotel luxury';
  return 'lyon france';
};

// Récupérer une image Pexels
async function getPexelsImage(searchTerm) {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=5&orientation=landscape`,
      { headers: { 'Authorization': PEXELS_API_KEY } }
    );

    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
      return {
        url: photo.src.large2x || photo.src.large,
        alt: photo.alt || searchTerm
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function forceUpdateImages() {
  console.log('\n🔥 MISE À JOUR FORCÉE DES IMAGES\n');
  console.log('=====================================\n');

  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'COLLEZ_VOTRE_CLE_API_PEXELS') {
    console.log('⚠️ Mode DÉMO sans clé API Pexels');
    console.log('   Les images par défaut seront utilisées\n');
  }

  try {
    // Récupérer TOUS les articles
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!posts || posts.length === 0) {
      console.log('❌ Aucun article trouvé');
      return;
    }

    console.log(`📚 ${posts.length} articles à traiter\n`);
    
    let success = 0;
    let errors = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      console.log(`[${i+1}/${posts.length}] ${post.title.substring(0, 40)}...`);

      let imageUrl = null;
      let imageAlt = null;

      // Si on a une clé API, chercher sur Pexels
      if (PEXELS_API_KEY && PEXELS_API_KEY !== 'COLLEZ_VOTRE_CLE_API_PEXELS') {
        const searchTerm = getSearchTerm(post.title);
        console.log(`   🔍 Recherche: "${searchTerm}"`);
        
        const pexelsImage = await getPexelsImage(searchTerm);
        if (pexelsImage) {
          imageUrl = pexelsImage.url;
          imageAlt = pexelsImage.alt;
        }
      }

      // Si pas d'image Pexels, utiliser une image de secours
      if (!imageUrl) {
        imageUrl = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
        imageAlt = `Vue de Lyon - ${post.title}`;
        console.log('   📌 Image par défaut utilisée');
      }

      // FORCER la mise à jour avec .select() pour vérifier
      const { data: updateResult, error: updateError } = await supabase
        .from('blog_posts')
        .update({
          image_url: imageUrl,
          image_alt: imageAlt
        })
        .eq('id', post.id)
        .select('id, image_url');

      if (updateError) {
        console.log(`   ❌ Erreur: ${updateError.message}`);
        errors++;
      } else if (updateResult && updateResult.length > 0) {
        console.log(`   ✅ Image ajoutée avec succès`);
        success++;
      } else {
        console.log(`   ⚠️ Update effectué mais aucune donnée retournée`);
        success++;
      }

      // Pause entre les requêtes
      if (PEXELS_API_KEY && PEXELS_API_KEY !== 'COLLEZ_VOTRE_CLE_API_PEXELS') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Vérification finale
    console.log('\n📊 Vérification finale...');
    const { data: finalCheck, error: checkError } = await supabase
      .from('blog_posts')
      .select('id')
      .not('image_url', 'is', null);

    const imagesCount = finalCheck ? finalCheck.length : 0;

    console.log('\n=====================================');
    console.log('📊 RÉSULTAT FINAL');
    console.log('=====================================');
    console.log(`✅ Updates réussis : ${success}`);
    console.log(`❌ Erreurs : ${errors}`);
    console.log(`📸 Articles avec images : ${imagesCount}/${posts.length}`);
    console.log('=====================================\n');

    if (imagesCount === 0) {
      console.log('❌ PROBLÈME : Aucune image n\'a été sauvegardée !');
      console.log('\n💡 SOLUTION :');
      console.log('1. Exécutez FIX-PERMISSIONS-IMAGES.sql dans Supabase');
      console.log('2. Puis relancez ce script\n');
    } else {
      console.log('🎉 Succès ! Les images ont été ajoutées');
      console.log('\n👀 Vérifiez :');
      console.log('- Dans Supabase Table Editor > blog_posts');
      console.log('- Sur https://www.guide-de-lyon.fr/blog\n');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

forceUpdateImages();