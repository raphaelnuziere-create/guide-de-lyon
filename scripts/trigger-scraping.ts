// Script pour déclencher le scraping manuellement
// Usage: npx tsx scripts/trigger-scraping.ts

async function triggerScraping() {
  console.log('🚀 Déclenchement du scraping manuel...\n');
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  try {
    console.log(`📡 Appel de l'API: ${baseUrl}/api/scraping/manual-trigger`);
    console.log('⏳ Scraping en cours (peut prendre 30-60 secondes)...\n');
    
    const response = await fetch(`${baseUrl}/api/scraping/manual-trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Scraping terminé avec succès!\n');
      console.log('📊 Résumé:');
      console.log('='.repeat(40));
      console.log(`Articles scrapés: ${data.summary.totalScraped}`);
      console.log(`Articles réécrits: ${data.summary.totalRewritten}`);
      console.log(`Articles publiés: ${data.summary.totalPublished}`);
      
      if (data.summary.sources && data.summary.sources.length > 0) {
        console.log('\n📰 Détail par source:');
        data.summary.sources.forEach((source: any) => {
          console.log(`  - ${source.source}: ${source.scraped} articles (${source.processed} traités)`);
        });
      }
      
      console.log('\n🎯 Prochaines étapes:');
      console.log('1. Vérifiez les articles sur: ' + baseUrl + '/actualites');
      console.log('2. Les articles avec score > 0.85 sont auto-publiés');
      console.log('3. Configurez le cron job pour automatiser le processus');
      
    } else {
      console.error('❌ Erreur lors du scraping:');
      console.error(data.error);
      if (data.details) {
        console.error('Détails:', data.details);
      }
      
      if (data.error?.includes('No active sources')) {
        console.log('\n⚠️  IMPORTANT: Exécutez d\'abord la migration SQL dans Supabase');
        console.log('Voir: MIGRATION_INSTRUCTIONS.md');
      }
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    console.log('\n💡 Assurez-vous que:');
    console.log('1. Le serveur est démarré (npm run dev)');
    console.log('2. La migration SQL est exécutée dans Supabase');
    console.log('3. Les variables d\'environnement sont configurées');
  }
}

// Exécuter le script
triggerScraping()
  .then(() => {
    console.log('\n✨ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  });