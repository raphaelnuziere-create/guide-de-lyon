// Script pour déclencher le cron job sur Vercel
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function triggerCronJob() {
  console.log('🚀 Déclenchement du cron job de scraping sur Vercel\n');
  console.log('=' .repeat(60));
  
  // URL de production
  const productionUrl = 'https://guide-de-lyon.vercel.app';
  const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-here';
  
  try {
    // 1. Vérifier d'abord que les sources sont bien configurées
    console.log('📋 Vérification des sources...');
    const { data: sources, error: sourcesError } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true);
    
    if (sourcesError || !sources || sources.length === 0) {
      console.error('❌ Aucune source active trouvée dans la base de données');
      console.log('Exécutez d\'abord le SQL: 20250108_insert_sources_fixed.sql');
      return;
    }
    
    console.log(`✅ ${sources.length} sources actives trouvées:`);
    sources.forEach(s => console.log(`   - ${s.name} (${s.type})`));
    
    // 2. Déclencher le cron job
    console.log(`\n📡 Appel du cron: ${productionUrl}/api/cron/scraping`);
    console.log('⏳ Scraping en cours (30-60 secondes)...\n');
    
    const response = await fetch(`${productionUrl}/api/cron/scraping`, {
      method: 'GET',
      headers: {
        'x-cron-secret': cronSecret,
        'User-Agent': 'Mozilla/5.0 (compatible; Vercel-Cron/1.0)'
      }
    });
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }
    
    if (response.ok) {
      console.log('✅ Cron exécuté avec succès!');
      
      if (data.summary) {
        console.log('\n📊 Résumé du scraping:');
        console.log('-'.repeat(40));
        console.log(`Articles scrapés: ${data.summary.totalScraped}`);
        console.log(`Articles réécrits: ${data.summary.totalRewritten}`);
        console.log(`Articles publiés: ${data.summary.totalPublished}`);
        
        if (data.summary.sources) {
          console.log('\nDétail par source:');
          data.summary.sources.forEach((s: any) => {
            console.log(`  ${s.source}: ${s.scraped} articles`);
          });
        }
      }
      
      // 3. Vérifier les articles dans la base
      console.log('\n🔍 Vérification des articles dans la base...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2s
      
      const { data: articles, error: articlesError } = await supabase
        .from('scraped_articles')
        .select('rewritten_title, status, author_name, published_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!articlesError && articles && articles.length > 0) {
        console.log(`\n✅ ${articles.length} derniers articles:`);
        articles.forEach(a => {
          const status = a.status === 'published' ? '✅' : '⏳';
          console.log(`  ${status} ${a.rewritten_title || 'En cours de traitement...'}`);
          if (a.author_name) console.log(`     Auteur: ${a.author_name}`);
        });
      } else {
        console.log('⏳ Pas encore d\'articles (le traitement peut prendre du temps)');
      }
      
    } else {
      console.error(`❌ Erreur cron: ${response.status}`);
      console.error('Réponse:', data);
      
      if (response.status === 401) {
        console.log('\n⚠️  Erreur d\'authentification CRON_SECRET');
        console.log('Vérifiez que CRON_SECRET est configuré sur Vercel');
      } else if (response.status === 404) {
        console.log('\n⚠️  Route non trouvée. Le déploiement est peut-être en cours.');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔗 Liens pour vérifier les résultats:');
  console.log(`📰 Page actualités: ${productionUrl}/actualites`);
  console.log(`📰 Route Lyon: ${productionUrl}/actualites/lyon`);
  console.log('📊 Dashboard Supabase: https://supabase.com/dashboard');
  console.log('\n💡 Note: Les articles peuvent prendre quelques minutes pour apparaître');
  console.log('   car ils sont réécrits avec l\'IA avant publication.');
}

// Alternative: déclencher directement l'API de scraping manuel
async function triggerManualScraping() {
  console.log('\n🔄 Alternative: Déclenchement du scraping manuel...\n');
  
  try {
    const response = await fetch('https://guide-de-lyon.vercel.app/api/scraping/manual-trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Scraping manuel réussi');
      console.log('Résumé:', data.message);
    } else {
      console.log('❌ Échec du scraping manuel');
    }
  } catch (error) {
    console.log('❌ Erreur scraping manuel:', error);
  }
}

// Exécuter les tests
async function main() {
  await triggerCronJob();
  
  // Si le cron échoue, essayer le scraping manuel
  const { data: articles } = await supabase
    .from('scraped_articles')
    .select('id')
    .limit(1);
  
  if (!articles || articles.length === 0) {
    console.log('\n⚠️  Aucun article trouvé, tentative de scraping manuel...');
    await triggerManualScraping();
  }
  
  console.log('\n✨ Test terminé');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });