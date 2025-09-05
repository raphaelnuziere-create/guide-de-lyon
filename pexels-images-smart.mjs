#!/usr/bin/env node
/**
 * Script INTELLIGENT pour des images vraiment pertinentes
 * Détection précise des mots-clés pour éviter les répétitions
 */

import { createClient } from '@supabase/supabase-js';

// ⚠️ REMPLACEZ PAR VOTRE CLÉ API PEXELS
const PEXELS_API_KEY = process.argv[2] || 'COLLEZ_VOTRE_CLE_API_PEXELS';

// Configuration Supabase
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

// Détection INTELLIGENTE des thèmes avec priorités
function getSmartSearchTerm(title) {
  const t = title.toLowerCase();
  
  // === LIEUX SPÉCIFIQUES DE LYON (haute priorité) ===
  if (t.includes('bellecour') || t.includes('place bellecour')) return 'place bellecour lyon square';
  if (t.includes('fourvière') || t.includes('fourviere')) return 'fourviere basilica lyon';
  if (t.includes('vieux lyon') || t.includes('vieux-lyon')) return 'vieux lyon old town historic';
  if (t.includes('croix-rousse') || t.includes('croix rousse')) return 'croix rousse lyon neighborhood';
  if (t.includes('confluence')) return 'confluence lyon modern architecture';
  if (t.includes('part-dieu') || t.includes('part dieu')) return 'part dieu lyon business district';
  if (t.includes('gerland')) return 'gerland lyon stadium';
  if (t.includes('presqu\'île') || t.includes('presquile')) return 'presquile lyon shopping';
  if (t.includes('tête d\'or') || t.includes('tete d\'or')) return 'parc tete or lyon lake';
  if (t.includes('perrache')) return 'perrache station lyon';
  if (t.includes('terreaux')) return 'place terreaux lyon fountain';
  if (t.includes('guillotière') || t.includes('guillotiere')) return 'guillotiere lyon multicultural';
  
  // === BARS & BOISSONS ===
  if (t.includes('bar à vin') || t.includes('bar a vin')) return 'wine glass red wine';
  if (t.includes('bar à cocktail') || t.includes('cocktail')) return 'cocktail drink mixology';
  if (t.includes('bar à bière') || t.includes('bière')) return 'beer glass craft beer';
  if (t.includes('bar')) return 'bar drinks people nightlife';
  if (t.includes('pub')) return 'pub beer friends';
  if (t.includes('boîte de nuit') || t.includes('club')) return 'nightclub party dancing';
  
  // === RESTAURANTS & NOURRITURE ===
  if (t.includes('bouchon')) return 'lyon bouchon traditional food';
  if (t.includes('gastronomique')) return 'gourmet plate fine dining';
  if (t.includes('pizzeria') || t.includes('pizza')) return 'pizza italian food';
  if (t.includes('sushi') || t.includes('japonais')) return 'sushi japanese food';
  if (t.includes('burger')) return 'burger fries restaurant';
  if (t.includes('végétarien') || t.includes('vegan')) return 'vegetarian food healthy';
  if (t.includes('brasserie')) return 'brasserie french food';
  if (t.includes('bistrot') || t.includes('bistro')) return 'bistro french cuisine';
  if (t.includes('restaurant')) return 'restaurant plate food dining';
  if (t.includes('brunch')) return 'brunch breakfast eggs coffee';
  if (t.includes('café') || t.includes('coffee')) return 'coffee shop latte cappuccino';
  
  // === CULTURE & LOISIRS ===
  if (t.includes('bibliothèque') || t.includes('bibliotheque')) return 'library books reading';
  if (t.includes('livre') || t.includes('librairie')) return 'books bookstore reading';
  if (t.includes('musée') || t.includes('musee')) return 'museum art gallery exhibition';
  if (t.includes('théâtre') || t.includes('theatre')) return 'theatre stage performance';
  if (t.includes('cinéma') || t.includes('cinema')) return 'cinema movie theater';
  if (t.includes('opéra') || t.includes('opera')) return 'opera house performance';
  if (t.includes('concert')) return 'concert music live performance';
  if (t.includes('festival')) return 'festival event crowd music';
  if (t.includes('exposition')) return 'art exhibition gallery';
  
  // === ANIMAUX & NATURE ===
  if (t.includes('aquarium')) return 'aquarium fish underwater';
  if (t.includes('zoo')) return 'zoo animals wildlife';
  if (t.includes('parc animalier')) return 'animal park wildlife';
  if (t.includes('jardin')) return 'garden flowers nature';
  if (t.includes('parc')) return 'park green nature trees';
  
  // === RELIGION ===
  if (t.includes('église') || t.includes('eglise')) return 'church lyon cathedral';
  if (t.includes('cathédrale') || t.includes('cathedrale')) return 'cathedral lyon saint jean';
  if (t.includes('basilique')) return 'basilica fourviere lyon';
  if (t.includes('chapelle')) return 'chapel religious architecture';
  if (t.includes('mosquée') || t.includes('mosquee')) return 'mosque architecture';
  if (t.includes('synagogue')) return 'synagogue architecture';
  
  // === SHOPPING ===
  if (t.includes('boutique')) return 'boutique shopping fashion';
  if (t.includes('marché') || t.includes('marche')) return 'market fresh produce food';
  if (t.includes('centre commercial') || t.includes('shopping')) return 'shopping mall retail';
  if (t.includes('magasin')) return 'store shop retail';
  if (t.includes('outlet')) return 'outlet shopping discount';
  
  // === SPORT & BIEN-ÊTRE ===
  if (t.includes('piscine')) return 'swimming pool water';
  if (t.includes('fitness') || t.includes('gym')) return 'gym fitness workout';
  if (t.includes('yoga')) return 'yoga meditation wellness';
  if (t.includes('spa')) return 'spa wellness relaxation';
  if (t.includes('stade')) return 'stadium football soccer';
  if (t.includes('tennis')) return 'tennis court sport';
  if (t.includes('basket')) return 'basketball court sport';
  if (t.includes('foot') || t.includes('football')) return 'football soccer stadium';
  
  // === ÉDUCATION ===
  if (t.includes('école') || t.includes('ecole')) return 'school education building';
  if (t.includes('université') || t.includes('universite')) return 'university campus education';
  if (t.includes('lycée') || t.includes('lycee')) return 'high school education';
  if (t.includes('collège') || t.includes('college')) return 'middle school education';
  
  // === TRANSPORT ===
  if (t.includes('métro') || t.includes('metro')) return 'metro subway station';
  if (t.includes('tram') || t.includes('tramway')) return 'tram public transport';
  if (t.includes('bus')) return 'bus public transport';
  if (t.includes('gare')) return 'train station railway';
  if (t.includes('aéroport') || t.includes('aeroport')) return 'airport travel';
  if (t.includes('vélo') || t.includes('velo') || t.includes('vélov')) return 'bicycle bike cycling';
  
  // === HÉBERGEMENT ===
  if (t.includes('hôtel') || t.includes('hotel')) return 'hotel room luxury';
  if (t.includes('hostel') || t.includes('auberge')) return 'hostel backpacker accommodation';
  if (t.includes('airbnb') || t.includes('appartement')) return 'apartment rental accommodation';
  if (t.includes('chambre d\'hôtes')) return 'bed breakfast accommodation';
  
  // === SERVICES ===
  if (t.includes('coiffeur') || t.includes('coiffure')) return 'hairdresser salon haircut';
  if (t.includes('banque')) return 'bank finance building';
  if (t.includes('poste')) return 'post office mail';
  if (t.includes('mairie')) return 'city hall government building';
  if (t.includes('hôpital') || t.includes('hopital')) return 'hospital medical healthcare';
  if (t.includes('clinique')) return 'clinic medical healthcare';
  if (t.includes('pharmacie')) return 'pharmacy medicine healthcare';
  
  // === ÉVÉNEMENTS ===
  if (t.includes('lumière') || t.includes('lumiere')) return 'lights festival illumination';
  if (t.includes('noël') || t.includes('noel')) return 'christmas market lights';
  if (t.includes('marché de noël')) return 'christmas market winter';
  if (t.includes('brocante') || t.includes('vide-grenier')) return 'flea market antiques';
  if (t.includes('salon')) return 'exhibition fair event';
  
  // === NOURRITURE SPÉCIFIQUE ===
  if (t.includes('boulangerie')) return 'bakery bread croissant';
  if (t.includes('pâtisserie') || t.includes('patisserie')) return 'pastry cake dessert';
  if (t.includes('chocolaterie') || t.includes('chocolat')) return 'chocolate shop sweets';
  if (t.includes('glacier') || t.includes('glace')) return 'ice cream gelato';
  if (t.includes('fromagerie') || t.includes('fromage')) return 'cheese shop french';
  if (t.includes('charcuterie')) return 'charcuterie meat delicatessen';
  if (t.includes('caviste') || t.includes('vin')) return 'wine shop bottles';
  if (t.includes('torréfacteur') || t.includes('torrefacteur')) return 'coffee roaster beans';
  
  // === DIVERTISSEMENT ===
  if (t.includes('escape game')) return 'escape room puzzle game';
  if (t.includes('laser game')) return 'laser tag game';
  if (t.includes('bowling')) return 'bowling alley pins';
  if (t.includes('billard')) return 'billiards pool table';
  if (t.includes('karaoké') || t.includes('karaoke')) return 'karaoke microphone singing';
  if (t.includes('casino')) return 'casino gambling chips';
  
  // === MOTS-CLÉS GÉNÉRAUX ===
  if (t.includes('nouveau') || t.includes('ouverture')) return 'grand opening new shop';
  if (t.includes('terrasse')) return 'terrace outdoor dining';
  if (t.includes('vue')) return 'view panoramic cityscape';
  if (t.includes('rooftop')) return 'rooftop terrace view';
  if (t.includes('historique') || t.includes('patrimoine')) return 'historic building architecture';
  if (t.includes('moderne') || t.includes('contemporain')) return 'modern architecture building';
  if (t.includes('travaux') || t.includes('rénovation')) return 'construction renovation work';
  if (t.includes('guide') || t.includes('découvrir')) return 'travel guide explore';
  if (t.includes('top') || t.includes('meilleur')) return 'best top rating';
  if (t.includes('gratuit') || t.includes('free')) return 'free event activity';
  if (t.includes('famille') || t.includes('enfant')) return 'family kids activity';
  if (t.includes('romantique') || t.includes('couple')) return 'romantic couple date';
  if (t.includes('insolite') || t.includes('original')) return 'unusual unique special';
  
  // === PAR DÉFAUT (très rare maintenant) ===
  // On essaie d'extraire le premier mot significatif
  const words = t.split(' ').filter(w => w.length > 4);
  if (words.length > 0) {
    return words[0] + ' lyon';
  }
  
  return 'lyon france city';
}

// Récupérer une image depuis Pexels
async function getPexelsImage(searchTerm, fallbackTerm = null) {
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'COLLEZ_VOTRE_CLE_API_PEXELS') {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=10&orientation=landscape&size=large`,
      { headers: { 'Authorization': PEXELS_API_KEY } }
    );

    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      // Prendre une photo aléatoire pour varier
      const randomIndex = Math.floor(Math.random() * Math.min(5, data.photos.length));
      const photo = data.photos[randomIndex];
      return {
        url: photo.src.large2x || photo.src.large,
        alt: photo.alt || searchTerm,
        photographer: photo.photographer
      };
    }
    
    // Si pas de résultat et qu'on a un fallback, essayer avec
    if (fallbackTerm && fallbackTerm !== searchTerm) {
      console.log(`   🔄 Essai avec: "${fallbackTerm}"`);
      return getPexelsImage(fallbackTerm);
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

async function updateWithSmartImages() {
  console.log('\n🧠 MISE À JOUR INTELLIGENTE DES IMAGES\n');
  console.log('=====================================\n');

  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'COLLEZ_VOTRE_CLE_API_PEXELS') {
    console.error('❌ CLÉ API PEXELS REQUISE !\n');
    console.log('Ce script nécessite une clé API pour fonctionner correctement.\n');
    console.log('1. Obtenez votre clé sur https://www.pexels.com/api/');
    console.log('2. Lancez: node pexels-images-smart.mjs VOTRE_CLE\n');
    return;
  }

  try {
    // Récupérer les articles
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, image_url')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!posts || posts.length === 0) {
      console.log('❌ Aucun article trouvé');
      return;
    }

    console.log(`📚 ${posts.length} articles à traiter`);
    console.log('🎯 Détection intelligente des mots-clés activée\n');
    console.log('-------------------------------------');
    
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const progress = `[${i+1}/${posts.length}]`;
      const titleShort = post.title.length > 40 ? post.title.substring(0, 40) + '...' : post.title;
      
      console.log(`\n${progress} ${titleShort}`);

      // Skip si on ne veut pas écraser et qu'il y a déjà une image
      if (post.image_url && !process.argv.includes('--force')) {
        console.log('   ⏭️ A déjà une image (utilisez --force pour remplacer)');
        skipped++;
        continue;
      }

      // Détection intelligente du terme de recherche
      const searchTerm = getSmartSearchTerm(post.title);
      console.log(`   🔍 Recherche: "${searchTerm}"`);
      
      // Chercher l'image avec fallback
      const image = await getPexelsImage(searchTerm, 'lyon france');
      
      if (!image) {
        console.log('   ❌ Aucune image trouvée');
        failed++;
        continue;
      }

      // Mettre à jour
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({
          image_url: image.url,
          image_alt: image.alt
        })
        .eq('id', post.id);

      if (updateError) {
        console.log(`   ❌ Erreur: ${updateError.message}`);
        failed++;
      } else {
        console.log(`   ✅ Image mise à jour (© ${image.photographer})`);
        updated++;
      }

      // Pause pour respecter les limites API
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n=====================================');
    console.log('📊 RÉSULTAT');
    console.log('=====================================');
    console.log(`✅ Mises à jour : ${updated}`);
    console.log(`⏭️ Ignorées : ${skipped}`);
    console.log(`❌ Échecs : ${failed}`);
    console.log('=====================================\n');

    if (updated > 0) {
      console.log('🎉 Les images ont été mises à jour avec des visuels pertinents !');
      console.log('\n👀 Vérifiez le résultat :');
      console.log('   https://www.guide-de-lyon.fr/blog\n');
    }

    if (skipped > 0) {
      console.log('💡 Pour remplacer TOUTES les images :');
      console.log('   node pexels-images-smart.mjs VOTRE_CLE --force\n');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

updateWithSmartImages();