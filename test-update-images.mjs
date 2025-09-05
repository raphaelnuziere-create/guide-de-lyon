#!/usr/bin/env node
/**
 * Script de TEST pour vérifier que les updates fonctionnent
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = 'https://ikefyhxelzydaogrnwxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTY3NTQsImV4cCI6MjA3MTI3Mjc1NH0.vJHDlWKUK0xUoXB_CCxNkVNnWhb7Wpq-mA097blKmzc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testUpdate() {
  console.log('🔍 TEST DE MISE À JOUR DES IMAGES\n');
  console.log('=====================================\n');

  try {
    // 1. Récupérer le premier article
    console.log('1️⃣ Récupération du premier article...');
    const { data: posts, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, title, image_url')
      .limit(1);

    if (fetchError) {
      console.error('❌ Erreur récupération:', fetchError.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('❌ Aucun article trouvé');
      return;
    }

    const firstPost = posts[0];
    console.log(`✅ Article trouvé: "${firstPost.title}"`);
    console.log(`   ID: ${firstPost.id}`);
    console.log(`   Image actuelle: ${firstPost.image_url || 'AUCUNE'}\n`);

    // 2. Essayer de mettre à jour avec une image de test
    const testImageUrl = 'https://images.pexels.com/photos/TEST123.jpg';
    console.log('2️⃣ Test de mise à jour avec une image de test...');
    console.log(`   URL test: ${testImageUrl}`);

    const { data: updateData, error: updateError } = await supabase
      .from('blog_posts')
      .update({
        image_url: testImageUrl,
        image_alt: 'Image de test'
      })
      .eq('id', firstPost.id)
      .select();

    if (updateError) {
      console.error('❌ Erreur update:', updateError.message);
      console.log('\n💡 Problèmes possibles:');
      console.log('- Les colonnes image_url/image_alt n\'existent pas');
      console.log('- Row Level Security (RLS) est activé');
      console.log('- Permissions insuffisantes\n');
      return;
    }

    console.log('✅ Update exécuté');
    if (updateData && updateData.length > 0) {
      console.log('   Données retournées:', updateData[0].image_url);
    }

    // 3. Vérifier que l'update a bien fonctionné
    console.log('\n3️⃣ Vérification de la mise à jour...');
    const { data: checkPost, error: checkError } = await supabase
      .from('blog_posts')
      .select('image_url')
      .eq('id', firstPost.id)
      .single();

    if (checkError) {
      console.error('❌ Erreur vérification:', checkError.message);
      return;
    }

    if (checkPost.image_url === testImageUrl) {
      console.log('✅ SUCCÈS ! L\'image a bien été mise à jour\n');
      
      // 4. Nettoyer - remettre à null
      console.log('4️⃣ Nettoyage (remise à null)...');
      await supabase
        .from('blog_posts')
        .update({ image_url: null, image_alt: null })
        .eq('id', firstPost.id);
      
      console.log('✅ Nettoyage effectué\n');
      
      console.log('========================================');
      console.log('📊 RÉSULTAT DU TEST');
      console.log('========================================');
      console.log('✅ Les updates fonctionnent correctement !');
      console.log('✅ Les colonnes existent');
      console.log('✅ Les permissions sont OK');
      console.log('\n🎯 Le problème venait probablement du script Pexels');
      console.log('   Relancez-le pour ajouter les vraies images\n');
      
    } else {
      console.log(`❌ ÉCHEC ! L'image n'a pas été mise à jour`);
      console.log(`   Attendu: ${testImageUrl}`);
      console.log(`   Obtenu: ${checkPost.image_url}\n`);
      
      console.log('💡 Solutions:');
      console.log('1. Exécutez AJOUTER-COLONNES-IMAGES.sql dans Supabase');
      console.log('2. Vérifiez que RLS est désactivé pour blog_posts');
      console.log('3. Vérifiez les permissions de votre clé API\n');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Test des colonnes
async function checkColumns() {
  console.log('📋 Vérification des colonnes...\n');
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }
  
  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log('Colonnes disponibles:');
    columns.forEach(col => {
      const icon = (col === 'image_url' || col === 'image_alt') ? '✅' : '  ';
      console.log(`${icon} ${col}`);
    });
    
    if (!columns.includes('image_url')) {
      console.log('\n❌ PROBLÈME: La colonne image_url n\'existe pas !');
      console.log('📋 Solution: Exécutez AJOUTER-COLONNES-IMAGES.sql dans Supabase\n');
    }
    if (!columns.includes('image_alt')) {
      console.log('\n❌ PROBLÈME: La colonne image_alt n\'existe pas !');
      console.log('📋 Solution: Exécutez AJOUTER-COLONNES-IMAGES.sql dans Supabase\n');
    }
  }
  
  console.log('\n');
}

// Lancer les tests
async function main() {
  await checkColumns();
  await testUpdate();
}

main().catch(console.error);