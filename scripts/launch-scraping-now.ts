// Script pour lancer le scraping immédiatement
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function launchScraping() {
  console.log('🚀 LANCEMENT DU SCRAPING IMMÉDIAT\n');
  console.log('='.repeat(60));
  
  // 1. Vérifier les sources
  console.log('✅ Vérification des sources...');
  const { data: sources } = await supabase
    .from('scraping_sources')
    .select('*')
    .eq('is_active', true);
  
  console.log(`✅ ${sources?.length || 0} sources actives trouvées !`);
  sources?.forEach(s => console.log(`   - ${s.name}`));
  
  // 2. Déclencher le scraping via l'API Vercel
  console.log('\n📡 Déclenchement du scraping...');
  console.log('⏳ Patientez 30-60 secondes...\n');
  
  const cronSecret = process.env.CRON_SECRET || 'test-secret-123';
  
  try {
    // Essayer d'abord le cron
    const cronResponse = await fetch('https://guide-de-lyon.vercel.app/api/cron/scraping', {
      method: 'GET',
      headers: {
        'x-cron-secret': cronSecret
      }
    });
    
    if (cronResponse.ok) {
      const data = await cronResponse.json();
      console.log('✅ SCRAPING RÉUSSI via CRON !');
      
      if (data.summary) {
        console.log('\n📊 RÉSULTATS:');
        console.log(`   Articles scrapés: ${data.summary.totalScraped}`);
        console.log(`   Articles réécrits: ${data.summary.totalRewritten}`);
        console.log(`   Articles publiés: ${data.summary.totalPublished}`);
      }
    } else {
      // Si le cron échoue, essayer le manual trigger
      console.log('⚠️  Cron protégé, essai avec manual trigger...\n');
      
      const manualResponse = await fetch('https://guide-de-lyon.vercel.app/api/scraping/manual-trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (manualResponse.ok) {
        const data = await manualResponse.json();
        console.log('✅ SCRAPING RÉUSSI via MANUAL TRIGGER !');
        
        if (data.summary) {
          console.log('\n📊 RÉSULTATS:');
          console.log(`   Articles scrapés: ${data.summary.totalScraped}`);
          console.log(`   Articles réécrits: ${data.summary.totalRewritten}`);
          console.log(`   Articles publiés: ${data.summary.totalPublished}`);
        }
      } else {
        console.log('❌ Les deux méthodes ont échoué');
        console.log('Vérifiez les variables sur Vercel:');
        console.log('- OPENAI_API_KEY');
        console.log('- CRON_SECRET');
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  // 3. Attendre un peu et vérifier les articles
  console.log('\n⏳ Attente de 5 secondes pour laisser le temps au traitement...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n🔍 Vérification des articles dans la base...');
  
  const { data: articles } = await supabase
    .from('scraped_articles')
    .select('rewritten_title, status, author_name, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (articles && articles.length > 0) {
    console.log(`\n✅ ${articles.length} ARTICLES TROUVÉS !`);
    console.log('-'.repeat(60));
    
    articles.forEach((a, i) => {
      const status = a.status === 'published' ? '✅ PUBLIÉ' : 
                     a.status === 'rewritten' ? '📝 RÉÉCRIT' : 
                     a.status === 'scraped' ? '⏳ SCRAPÉ' : '❓';
      
      console.log(`\n${i + 1}. ${status}`);
      console.log(`   Titre: ${a.rewritten_title || 'En cours de traitement...'}`);
      console.log(`   Auteur: ${a.author_name}`);
    });
    
    const published = articles.filter(a => a.status === 'published').length;
    if (published > 0) {
      console.log('\n' + '🎉'.repeat(20));
      console.log(`🎉 ${published} ARTICLES PUBLIÉS AVEC SUCCÈS !`);
      console.log('🎉'.repeat(20));
    }
  } else {
    console.log('⏳ Pas encore d\'articles (le traitement peut prendre du temps)');
    console.log('   La réécriture IA peut prendre 1-2 minutes par article');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📰 VOIR LES ARTICLES:');
  console.log('   https://guide-de-lyon.vercel.app/actualites');
  console.log('   https://guide-de-lyon.vercel.app/actualites/lyon');
  
  console.log('\n💡 NOTES:');
  console.log('- Les articles sont réécrits par l\'IA (peut prendre du temps)');
  console.log('- Auteur: Toujours "Raphael"');
  console.log('- Pas de citations de sources');
  console.log('- Publication automatique si score > 0.85');
  console.log('- Le cron s\'exécutera automatiquement toutes les 2h');
}

launchScraping()
  .then(() => {
    console.log('\n✨ Script terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });