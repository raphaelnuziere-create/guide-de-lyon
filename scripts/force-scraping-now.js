#!/usr/bin/env node

/**
 * Script pour forcer le scraping MAINTENANT après nettoyage
 */

console.log('🚀 LANCEMENT FORCÉ DU SCRAPING\n');
console.log('=' .repeat(50));

async function forceScraping() {
  try {
    // Test LOCAL d'abord
    console.log('📡 Test en LOCAL (http://localhost:3000)...\n');
    
    const localUrl = 'http://localhost:3000/api/scraping/run-full';
    
    console.log('⏳ Scraping en cours (30-60 secondes)...\n');
    
    const response = await fetch(localUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout de 2 minutes
      signal: AbortSignal.timeout(120000)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SCRAPING RÉUSSI !\n');
      console.log('📊 Résultat:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n' + '=' .repeat(50));
      console.log('✨ VÉRIFICATIONS :');
      console.log('1. LOCAL : http://localhost:3000/actualites');
      console.log('2. PROD : https://www.guide-de-lyon.fr/actualites');
      console.log('3. SUPABASE : Vérifier scraped_articles');
      console.log('\n⏰ Le cron job reprendra automatiquement toutes les heures');
      
    } else {
      console.error('❌ ERREUR:', data);
      
      if (data.error?.includes('OpenAI')) {
        console.log('\n⚠️ Problème avec OpenAI - Vérifiez la clé API');
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Timeout - Le scraping prend trop de temps');
    } else {
      console.error('❌ Erreur:', error.message);
    }
    
    console.log('\n💡 Vérifiez que :');
    console.log('1. Le serveur est lancé (npm run dev)');
    console.log('2. Les tables sont nettoyées dans Supabase');
    console.log('3. La source 20 Minutes est configurée');
  }
}

// Lancer
forceScraping();