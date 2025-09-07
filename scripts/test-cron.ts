// Script pour tester le cron job de scraping
// Usage: npx tsx scripts/test-cron.ts

async function testCron() {
  console.log('🔄 Test du cron job de scraping\n');
  
  // Utiliser l'URL de production Vercel
  const productionUrl = 'https://guide-de-lyon.vercel.app';
  const cronSecret = process.env.CRON_SECRET || 'test-secret';
  
  try {
    console.log(`📡 Appel du cron: ${productionUrl}/api/cron/scraping`);
    console.log('⏳ Scraping en cours...\n');
    
    const response = await fetch(`${productionUrl}/api/cron/scraping`, {
      method: 'GET',
      headers: {
        'x-cron-secret': cronSecret
      }
    });
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
    
    if (response.ok) {
      console.log('✅ Cron exécuté avec succès!');
      console.log('Réponse:', data);
      
      console.log('\n📊 Résultats attendus:');
      console.log('- Articles scrapés des sources RSS');
      console.log('- Articles réécrits avec l\'IA');
      console.log('- Articles publiés automatiquement');
      
    } else {
      console.error('❌ Erreur cron:', response.status);
      console.error('Détails:', data);
      
      if (response.status === 401) {
        console.log('\n⚠️  Erreur d\'authentification');
        console.log('Vérifiez que CRON_SECRET est configuré sur Vercel');
      }
    }
    
    console.log('\n🔗 Liens utiles:');
    console.log(`- Voir les articles: ${productionUrl}/actualites`);
    console.log(`- Voir les articles (route Lyon): ${productionUrl}/actualites/lyon`);
    console.log('- Dashboard Vercel: https://vercel.com/dashboard');
    console.log('- Dashboard Supabase: https://supabase.com/dashboard');
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    console.log('\n💡 Vérifications:');
    console.log('1. Le site est déployé sur Vercel');
    console.log('2. Les variables d\'environnement sont configurées');
    console.log('3. La migration SQL est exécutée');
  }
}

// Test local aussi
async function testLocal() {
  console.log('\n🏠 Test local (si serveur démarré)...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/scraping/manual-trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // Timeout 10s
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Scraping local réussi');
      console.log(`Articles scrapés: ${data.summary?.totalScraped || 0}`);
      console.log(`Articles publiés: ${data.summary?.totalPublished || 0}`);
    }
  } catch (error) {
    console.log('⚠️  Serveur local non disponible');
  }
}

// Exécuter les tests
async function runTests() {
  await testCron();
  await testLocal();
  
  console.log('\n✨ Tests terminés');
  console.log('\n📝 Instructions finales:');
  console.log('1. Exécutez le SQL corrigé dans Supabase:');
  console.log('   supabase/migrations/20250108_insert_sources.sql');
  console.log('2. Vérifiez les variables sur Vercel:');
  console.log('   - OPENAI_API_KEY');
  console.log('   - CRON_SECRET');
  console.log('3. Configurez le cron job sur Vercel (toutes les 2h)');
}

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });