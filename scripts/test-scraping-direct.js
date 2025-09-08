#!/usr/bin/env node

/**
 * Test direct du scraping pour diagnostiquer
 */

async function testDirect() {
  console.log('🔍 Test direct du scraping\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/scraping/run-full', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const text = await response.text();
    console.log('Réponse brute:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('\nDonnées parsées:');
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Impossible de parser le JSON');
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
  
  console.log('\n📝 Vérifiez aussi dans Supabase SQL Editor:');
  console.log(`
-- Voir la configuration de la source
SELECT * FROM scraping_sources;

-- Voir les derniers articles scrapés
SELECT 
  original_title,
  original_url,
  status,
  created_at
FROM scraped_articles
ORDER BY created_at DESC
LIMIT 10;

-- Voir s'il y a des erreurs
SELECT last_error, consecutive_errors 
FROM scraping_sources 
WHERE name = '20 Minutes Lyon';
  `);
}

testDirect();