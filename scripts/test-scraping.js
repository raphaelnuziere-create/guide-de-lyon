#!/usr/bin/env node

/**
 * Script de test pour lancer le scraping manuellement
 * Usage: node scripts/test-scraping.js
 */

const fetch = require('node-fetch');

async function testScraping() {
  console.log('🚀 Lancement du scraping manuel...\n');
  
  // URL de l'API (changer pour production si nécessaire)
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://www.guide-de-lyon.fr/api/scraping/run-full'
    : 'http://localhost:3000/api/scraping/run-full';
  
  try {
    console.log(`📡 Appel de l'API: ${apiUrl}`);
    console.log('⏳ Cela peut prendre quelques minutes...\n');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout de 5 minutes pour le scraping
      timeout: 300000
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Scraping terminé avec succès!\n');
      console.log('📊 Résultats:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Erreur lors du scraping:');
      console.error(data);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    console.error(error.message);
    console.log('\n💡 Assurez-vous que le serveur Next.js est lancé (npm run dev)');
  }
  
  console.log('\n📝 Pour voir les articles: http://localhost:3000/actualites');
}

// Lancer le test
testScraping();