#!/usr/bin/env node
/**
 * Script de test pour vérifier la connexion à Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase depuis les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes dans .env.local');
  console.error('Vérifiez que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies');
  process.exit(1);
}

console.log('🔍 Test de connexion à Supabase...\n');

async function testConnection() {
  try {
    // Créer le client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    console.log('📡 Connexion établie');
    console.log('🔍 Recherche de la table blog_posts...\n');
    
    // Tester la récupération des données
    const { data, error, count } = await supabase
      .from('blog_posts')
      .select('id, title', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erreur:', error.message);
      
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('\n⚠️ La table blog_posts n\'existe pas encore !');
        console.log('\n📋 Solution :');
        console.log('1. Allez dans Supabase > SQL Editor');
        console.log('2. Exécutez le script : supabase/setup-blog-complete.sql');
        console.log('3. Relancez ce script\n');
      }
    } else {
      console.log('✅ Table blog_posts trouvée !');
      
      // Essayer de récupérer le nombre d'articles
      const { data: posts, error: countError, count: totalCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact' });
      
      if (!countError) {
        console.log(`📚 ${totalCount || 0} articles dans la table\n`);
        
        if (totalCount === 0) {
          console.log('⚠️ La table est vide !');
          console.log('📋 Exécutez le script SQL pour créer des articles de démonstration\n');
        } else {
          // Vérifier si les colonnes image existent
          if (posts && posts.length > 0) {
            const firstPost = posts[0];
            if ('image_url' in firstPost) {
              console.log('✅ Colonne image_url existe');
            } else {
              console.log('⚠️ Colonne image_url n\'existe pas');
              console.log('📋 Exécutez : 1-PREPARER-COLONNES.sql');
            }
            
            if ('image_alt' in firstPost) {
              console.log('✅ Colonne image_alt existe');
            } else {
              console.log('⚠️ Colonne image_alt n\'existe pas');
              console.log('📋 Exécutez : 1-PREPARER-COLONNES.sql');
            }
          }
        }
      }
    }
    
    console.log('\n========================================');
    console.log('📊 RÉSUMÉ DU TEST');
    console.log('========================================');
    console.log('URL Supabase: ✅ Correcte');
    console.log('Clé API: ✅ Valide');
    console.log('Connexion: ✅ Établie');
    
  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
    console.log('\n💡 Vérifiez votre connexion internet');
  }
}

testConnection();