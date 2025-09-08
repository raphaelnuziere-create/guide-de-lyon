#!/usr/bin/env node

/**
 * Test simple et rapide du scraping
 */

console.log('🔍 TEST RAPIDE DU SCRAPING\n');

async function testSimple() {
  // 1. Vérifier que le serveur répond
  console.log('1️⃣ Test de connexion au serveur...');
  try {
    const healthCheck = await fetch('http://localhost:3000/api/scraping/test-single');
    if (healthCheck.ok) {
      console.log('✅ Serveur accessible\n');
    } else {
      console.log('❌ Serveur ne répond pas correctement\n');
    }
  } catch (e) {
    console.log('❌ Serveur inaccessible - Lancez: npm run dev\n');
    return;
  }

  // 2. Lancer le scraping avec timeout plus long
  console.log('2️⃣ Lancement du scraping (max 3 minutes)...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minutes
  
  try {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/scraping/run-full', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️ Durée: ${duration} secondes\n`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCÈS !');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Erreur serveur:');
      console.log(JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('❌ Timeout après 3 minutes');
      console.log('Le scraping prend trop de temps, il y a un problème.\n');
      
      console.log('Causes possibles:');
      console.log('- OpenAI API lente ou clé invalide');
      console.log('- Problème de connexion Supabase');
      console.log('- Trop d\'articles à traiter');
    } else {
      console.log('❌ Erreur:', error.message);
    }
  }
  
  // 3. Vérifier directement dans Supabase
  console.log('\n3️⃣ Vérifiez dans Supabase SQL:');
  console.log(`
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '5 minutes' THEN 1 END) as nouveaux
FROM scraped_articles;
  `);
}

testSimple();