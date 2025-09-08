#!/usr/bin/env node

/**
 * Script de test pour le scraping Google Places
 * Teste avec seulement 3 établissements pour validation
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration - La clé API Google sera prise depuis les variables d'environnement
let GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'YOUR_GOOGLE_PLACES_API_KEY';

// Lire les variables d'environnement depuis .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

// Si la clé API n'est pas dans les variables d'environnement, essayer depuis .env.local
if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
  GOOGLE_API_KEY = envVars.GOOGLE_PLACES_API_KEY || GOOGLE_API_KEY;
}

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

// Test avec seulement 3 établissements connus
const TEST_ESTABLISHMENTS = [
  {
    name: 'Paul Bocuse Collonges',
    category: 'restaurant-food'
  },
  {
    name: 'Musée des Confluences Lyon',
    category: 'culture-loisirs'
  },
  {
    name: 'Le Sucre Lyon',
    category: 'bar-nightlife'
  }
];

// Fonction pour rechercher un lieu via Google Places
async function searchPlace(query) {
  try {
    console.log(`🔍 Recherche: ${query}`);
    
    // Text Search pour trouver le lieu
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
      console.log(`❌ Aucun résultat pour: ${query}`);
      console.log(`   Status: ${searchData.status}`);
      if (searchData.error_message) {
        console.log(`   Error: ${searchData.error_message}`);
      }
      return null;
    }
    
    const place = searchData.results[0];
    console.log(`   ✅ Trouvé: ${place.name}`);
    
    return place;
  } catch (error) {
    console.error(`❌ Erreur API pour ${query}:`, error);
    return null;
  }
}

// Fonction pour obtenir les détails d'un lieu
async function getPlaceDetails(placeId) {
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,user_ratings_total,geometry,business_status,types,editorial_summary&language=fr&key=${GOOGLE_API_KEY}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== 'OK') {
      console.log(`❌ Erreur détails, status: ${detailsData.status}`);
      if (detailsData.error_message) {
        console.log(`   Error: ${detailsData.error_message}`);
      }
      return null;
    }
    
    return detailsData.result;
  } catch (error) {
    console.error(`❌ Erreur API détails:`, error);
    return null;
  }
}

// Fonction de test
async function testGooglePlaces() {
  console.log('🚀 Test du scraping Google Places...\n');
  
  // Vérifier la clé API
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
    console.error('❌ ERREUR: Clé API Google Places non configurée');
    console.log('\n📝 Pour configurer la clé API:');
    console.log('1. Allez sur https://console.cloud.google.com/');
    console.log('2. Activez "Places API" et "Maps JavaScript API"');
    console.log('3. Créez une clé API dans "Credentials"');
    console.log('4. Ajoutez GOOGLE_PLACES_API_KEY=votre_clé dans .env.local');
    return;
  }

  console.log('✅ Clé API configurée');
  console.log('✅ Connection Supabase OK');
  console.log(`\n📍 Test avec ${TEST_ESTABLISHMENTS.length} établissements:\n`);

  let totalSuccess = 0;
  let totalErrors = 0;

  for (const establishment of TEST_ESTABLISHMENTS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏢 ${establishment.name} (${establishment.category})`);
    console.log(`${'='.repeat(60)}`);

    // Rechercher le lieu
    const place = await searchPlace(establishment.name);
    if (!place) {
      totalErrors++;
      continue;
    }

    // Obtenir les détails
    console.log(`🔍 Obtention des détails...`);
    const details = await getPlaceDetails(place.place_id);
    if (!details) {
      totalErrors++;
      continue;
    }

    // Afficher les informations récupérées
    console.log(`\n📊 Informations récupérées:`);
    console.log(`   📍 Nom: ${details.name}`);
    console.log(`   📍 Adresse: ${details.formatted_address || 'N/A'}`);
    console.log(`   📞 Téléphone: ${details.formatted_phone_number || 'N/A'}`);
    console.log(`   🌐 Site web: ${details.website || 'N/A'}`);
    console.log(`   ⭐ Note: ${details.rating || 'N/A'}/5 (${details.user_ratings_total || 0} avis)`);
    console.log(`   📷 Photos: ${details.photos?.length || 0}`);
    console.log(`   🕒 Horaires: ${details.opening_hours?.weekday_text?.length || 0} jours définis`);
    console.log(`   📍 Localisation: ${details.geometry?.location?.lat || 'N/A'}, ${details.geometry?.location?.lng || 'N/A'}`);

    if (details.opening_hours?.weekday_text) {
      console.log(`\n🕒 Horaires détaillés:`);
      details.opening_hours.weekday_text.forEach(day => {
        console.log(`   ${day}`);
      });
    }

    totalSuccess++;
    
    // Pause entre les requêtes
    console.log(`\n⏳ Pause de 2 secondes...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RÉSUMÉ DU TEST`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Succès: ${totalSuccess}/${TEST_ESTABLISHMENTS.length}`);
  console.log(`❌ Erreurs: ${totalErrors}/${TEST_ESTABLISHMENTS.length}`);
  
  if (totalSuccess > 0) {
    console.log(`\n✨ Test réussi ! Le script peut récupérer les données Google Places.`);
    console.log(`💡 Vous pouvez maintenant lancer le script complet avec:`);
    console.log(`   node scripts/scrape-google-places.js`);
  } else {
    console.log(`\n❌ Test échoué. Vérifiez votre clé API et la configuration.`);
  }
}

// Lancer le test
testGooglePlaces().catch(console.error);