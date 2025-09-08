#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration Google Maps API
 */

const { Client } = require('@googlemaps/google-maps-services-js');
const fs = require('fs');
const path = require('path');

// Lire .env.local
const envPath = path.join(__dirname, '..', '.env.local');
console.log('📁 Lecture de:', envPath);

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

console.log('\n🔍 Variables d\'environnement trouvées:');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', envVars.NEXT_PUBLIC_SUPABASE_URL ? '✅ Présent' : '❌ Manquant');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', envVars.SUPABASE_SERVICE_ROLE_KEY ? '✅ Présent' : '❌ Manquant');
console.log('   GOOGLE_MAPS_API_KEY:', envVars.GOOGLE_MAPS_API_KEY ? '✅ Présent' : '❌ Manquant');

if (!envVars.GOOGLE_MAPS_API_KEY) {
  console.log('\n⚠️  ATTENTION: Clé Google Maps API manquante dans .env.local');
  console.log('\n📝 Pour ajouter la clé:');
  console.log('1. Obtenez une clé sur https://console.cloud.google.com/');
  console.log('2. Activez l\'API "Places API"');
  console.log('3. Ajoutez dans .env.local:');
  console.log('   GOOGLE_MAPS_API_KEY=votre_cle_api');
  process.exit(1);
}

console.log('\n✅ Configuration OK - Test d\'une recherche...');

const client = new Client({});

async function testAPI() {
  try {
    const response = await client.textSearch({
      params: {
        query: 'Paul Bocuse Lyon',
        key: envVars.GOOGLE_MAPS_API_KEY,
        language: 'fr'
      }
    });
    
    if (response.data.results && response.data.results.length > 0) {
      console.log('\n🎉 API Google Maps fonctionne !');
      console.log('   Exemple trouvé:', response.data.results[0].name);
      console.log('\n✅ Vous pouvez maintenant lancer:');
      console.log('   node scripts/collect-independent-businesses.js');
    } else {
      console.log('\n⚠️  Aucun résultat trouvé - vérifiez votre clé API');
    }
  } catch (error) {
    console.error('\n❌ Erreur API:', error.response?.data?.error_message || error.message);
    if (error.response?.status === 403) {
      console.log('\n📝 Solutions possibles:');
      console.log('   1. Vérifiez que l\'API Places est activée');
      console.log('   2. Vérifiez les restrictions de la clé API');
      console.log('   3. Vérifiez le quota/facturation sur Google Cloud');
    }
  }
}

testAPI();