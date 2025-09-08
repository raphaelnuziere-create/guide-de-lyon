#!/usr/bin/env node

/**
 * Script de test pour 20 Minutes Lyon uniquement
 * Usage: node scripts/test-scraping-20min.js
 */

console.log('🚀 Test de scraping 20 Minutes Lyon\n');
console.log('=' .repeat(50));

async function testScraping() {
  try {
    // Test en local
    const apiUrl = 'http://localhost:3000/api/scraping/run-full';
    
    console.log('📡 Appel de l\'API de scraping...');
    console.log('🔗 URL: ' + apiUrl);
    console.log('⏳ Patientez, cela peut prendre 1-2 minutes...\n');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCÈS !\n');
      console.log('📊 Résultats du scraping:');
      console.log('=' .repeat(50));
      
      if (data.message) {
        console.log(data.message);
      }
      
      console.log('\n📰 Articles traités:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n' + '=' .repeat(50));
      console.log('🎯 Prochaines étapes:');
      console.log('1. Vérifier les articles sur http://localhost:3000/actualites');
      console.log('2. Les articles avec score > 0.85 sont publiés automatiquement');
      console.log('3. Le cron job reprendra toutes les heures');
      
    } else {
      console.error('❌ Erreur lors du scraping:');
      console.error(data);
      
      if (data.error?.includes('OpenAI')) {
        console.log('\n⚠️  Vérifiez votre clé OpenAI dans .env.local');
      }
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    console.error(error.message);
    console.log('\n💡 Solutions possibles:');
    console.log('1. Vérifiez que le serveur est lancé: npm run dev');
    console.log('2. Vérifiez la connexion Supabase');
    console.log('3. Vérifiez la clé OpenAI');
  }
}

// Si fetch n'est pas disponible (Node < 18)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testScraping();