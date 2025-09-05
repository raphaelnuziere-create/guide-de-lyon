#!/usr/bin/env node
/**
 * Script configuré avec VOS bonnes clés Supabase
 * Utilisation : node pexels-images-correct.mjs VOTRE_CLE_API_PEXELS
 */

import { createClient } from '@supabase/supabase-js';

// ⚠️ REMPLACEZ PAR VOTRE CLÉ API PEXELS
const PEXELS_API_KEY = process.argv[2] || 'COLLEZ_VOTRE_CLE_API_PEXELS_ICI';

// Configuration Supabase (correcte pour VOTRE projet)
// Charger les variables d'environnement
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERREUR: Variables d\'environnement Supabase manquantes dans .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Déterminer le terme de recherche selon le titre
const getSearchTerm = (title) => {
  const t = title.toLowerCase();
  
  // Recherches spécifiques selon les mots-clés
  if (t.includes('boulangerie') || t.includes('pain')) return 'french bakery bread pastry';
  if (t.includes('restaurant') && t.includes('terrasse')) return 'restaurant terrace outdoor dining';
  if (t.includes('restaurant')) return 'lyon restaurant french cuisine';
  if (t.includes('parc') || t.includes('tête')) return 'lyon park nature green';
  if (t.includes('festival') || t.includes('lumière')) return 'lyon festival lights event';
  if (t.includes('marché')) return 'french market fresh food local';
  if (t.includes('musée') || t.includes('art')) return 'museum art gallery exhibition';
  if (t.includes('brunch')) return 'brunch breakfast restaurant cafe';
  if (t.includes('café') || t.includes('coffee')) return 'french cafe coffee shop';
  if (t.includes('transport') || t.includes('tram')) return 'lyon tram public transport';
  if (t.includes('shopping') || t.includes('boutique')) return 'shopping store retail';
  if (t.includes('hôtel') || t.includes('hotel')) return 'hotel luxury accommodation';
  if (t.includes('sport') || t.includes('fitness')) return 'sport fitness gym activity';
  
  // Par défaut : Lyon
  return 'lyon france city beautiful';
};

// Récupérer une image depuis l'API Pexels
async function getPexelsImage(searchTerm) {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape&size=large`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('   ❌ Clé API Pexels invalide !');
      } else {
        console.log(`   ⚠️ Erreur API: ${response.status}`);
      }
      return null;
    }

    const data = await response.json();
    
    if (data.photos && data.photos.length > 0) {
      // Prendre une photo aléatoire parmi les résultats pour varier
      const randomIndex = Math.floor(Math.random() * Math.min(5, data.photos.length));
      const photo = data.photos[randomIndex];
      
      return {
        url: photo.src.large2x || photo.src.large || photo.src.original,
        alt: photo.alt || `Image de ${searchTerm}`,
        photographer: photo.photographer,
        photographer_url: photo.photographer_url
      };
    }
    
    console.log('   ⚠️ Aucune image trouvée pour cette recherche');
    return null;
  } catch (error) {
    console.error(`   ❌ Erreur réseau: ${error.message}`);
    return null;
  }
}

// Programme principal
async function main() {
  console.log('\n🚀 MISE À JOUR DES IMAGES AVEC PEXELS');
  console.log('=====================================\n');

  // Vérifier la clé API Pexels
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'COLLEZ_VOTRE_CLE_API_PEXELS_ICI') {
    console.error('❌ CLÉ API PEXELS MANQUANTE !\n');
    console.log('📋 Comment obtenir votre clé :');
    console.log('1. Allez sur https://www.pexels.com/api/');
    console.log('2. Créez un compte gratuit');
    console.log('3. Copiez votre API Key\n');
    console.log('📝 Utilisation :');
    console.log('   node pexels-images-correct.mjs VOTRE_CLE_API\n');
    console.log('Ou modifiez la ligne 10 du fichier avec votre clé\n');
    process.exit(1);
  }

  console.log('🔍 Connexion à Supabase...');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Projet: ikefyhxelzydaogrnwxi\n`);

  try {
    // Récupérer les articles depuis Supabase
    console.log('📚 Récupération des articles...');
    
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, image_url')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('\n❌ Erreur Supabase:', error.message);
      console.log('\n💡 Solutions possibles :');
      console.log('1. Vérifiez que la table blog_posts existe');
      console.log('2. Vérifiez les colonnes image_url et image_alt');
      console.log('3. Exécutez d\'abord le script SQL de création\n');
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('\n⚠️ Aucun article trouvé dans blog_posts');
      console.log('💡 Créez d\'abord des articles ou exécutez le script SQL de démonstration\n');
      return;
    }

    console.log(`✅ ${posts.length} articles trouvés\n`);
    console.log('🎨 Recherche d\'images sur Pexels...\n');
    console.log('-------------------------------------');

    let success = 0;
    let skipped = 0;
    let errors = 0;

    // Traiter chaque article
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      
      // Afficher la progression
      const progress = `[${i + 1}/${posts.length}]`;
      const titleShort = post.title.length > 40 ? post.title.substring(0, 40) + '...' : post.title;
      console.log(`\n${progress} ${titleShort}`);
      
      // Vérifier si l'article a déjà une image
      if (post.image_url && !process.argv.includes('--force')) {
        console.log('   ⏭️ A déjà une image');
        skipped++;
        continue;
      }

      // Déterminer le terme de recherche
      const searchTerm = getSearchTerm(post.title);
      console.log(`   🔍 Recherche: "${searchTerm}"`);
      
      // Chercher une image sur Pexels
      const image = await getPexelsImage(searchTerm);
      
      if (!image) {
        // Si pas d'image trouvée, essayer avec juste "Lyon"
        console.log('   🔄 Recherche alternative: "Lyon France"');
        const lyonImage = await getPexelsImage('Lyon France cityscape');
        
        if (!lyonImage) {
          console.log('   ❌ Aucune image disponible');
          errors++;
          continue;
        }
        
        image = lyonImage;
      }

      // Mettre à jour l'article avec l'image
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          image_url: image.url,
          image_alt: image.alt
        })
        .eq('id', post.id);

      if (updateError) {
        console.log(`   ❌ Erreur de sauvegarde: ${updateError.message}`);
        errors++;
      } else {
        console.log(`   ✅ Image ajoutée (© ${image.photographer})`);
        success++;
      }

      // Petite pause pour respecter les limites de l'API (200 requêtes/heure)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Afficher le résumé
    console.log('\n=====================================');
    console.log('📊 RÉSUMÉ');
    console.log('=====================================');
    console.log(`✅ Images ajoutées : ${success}`);
    console.log(`⏭️ Déjà présentes : ${skipped}`);
    console.log(`❌ Erreurs : ${errors}`);
    console.log('=====================================\n');
    
    if (success > 0) {
      console.log('🎉 Succès ! Vos articles ont maintenant de belles images Pexels HD\n');
      console.log('👀 Voir le résultat :');
      console.log('   https://www.guide-de-lyon.fr/blog\n');
    }
    
    if (skipped > 0 && !process.argv.includes('--force')) {
      console.log('💡 Pour remplacer les images existantes :');
      console.log('   node pexels-images-correct.mjs VOTRE_CLE --force\n');
    }
    
  } catch (error) {
    console.error('\n❌ Erreur générale:', error.message);
    console.log('\n💡 Vérifiez :');
    console.log('- Votre connexion internet');
    console.log('- Que Supabase est accessible');
    console.log('- Que votre clé API Pexels est valide\n');
  }
}

// Lancer le programme
main().catch(console.error);