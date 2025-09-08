#!/usr/bin/env node

/**
 * Script de debug pour comprendre ce qui se passe
 */

const fetch = require('node-fetch');

async function debugScraping() {
  console.log('🔍 DEBUG DU SCRAPING\n');
  console.log('='.repeat(50));
  
  // 1. Tester le feed RSS directement
  console.log('\n1️⃣ Test du flux RSS 20 Minutes Lyon:');
  try {
    const rssUrl = 'https://www.20minutes.fr/feeds/rss-lyon.xml';
    const response = await fetch(rssUrl);
    const text = await response.text();
    
    if (response.ok) {
      console.log('✅ RSS accessible');
      // Compter les items
      const itemCount = (text.match(/<item>/g) || []).length;
      console.log(`📰 ${itemCount} articles trouvés dans le flux`);
      
      // Afficher le premier titre
      const firstTitle = text.match(/<title>(.*?)<\/title>/);
      if (firstTitle) {
        console.log(`📝 Premier article: ${firstTitle[1]}`);
      }
    } else {
      console.log('❌ RSS inaccessible:', response.status);
    }
  } catch (error) {
    console.log('❌ Erreur RSS:', error.message);
  }

  // 2. Vérifier les articles dans Supabase
  console.log('\n2️⃣ Vérification de la base de données:');
  console.log('Connectez-vous à Supabase et exécutez:');
  console.log(`
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as recent
FROM scraped_articles;
  `);

  // 3. Tester l'API avec plus de détails
  console.log('\n3️⃣ Test détaillé de l\'API de scraping:');
  try {
    const apiUrl = 'http://localhost:3000/api/scraping/test-single';
    console.log('Appel de:', apiUrl);
    
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await apiResponse.json();
    console.log('\nRéponse API:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.log('❌ Erreur API:', error.message);
    console.log('\n💡 Assurez-vous que le serveur est lancé (npm run dev)');
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 Points à vérifier:');
  console.log('1. La source 20 Minutes est-elle active dans scraping_sources?');
  console.log('2. Y a-t-il des erreurs dans consecutive_errors?');
  console.log('3. La clé OpenAI est-elle valide?');
  console.log('4. Les articles sont-ils déjà en base (doublons)?');
}

debugScraping();