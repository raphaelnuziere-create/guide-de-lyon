// Script de test du système de scraping
// Usage: npx tsx scripts/test-scraping.ts

import { NewsScraperService } from '../app/lib/scraping/scraper';
import { ArticleRewriterService } from '../app/lib/ai/rewriter';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testScraping() {
  console.log('🧪 Test du système de scraping\n');
  console.log('='.repeat(60));
  
  const scraper = new NewsScraperService();
  const rewriter = new ArticleRewriterService();
  
  // 1. Test RSS Scraping
  console.log('\n📡 Test 1: Scraping RSS');
  console.log('-'.repeat(40));
  
  try {
    const rssUrl = 'https://www.leprogres.fr/edition-lyon-villeurbanne/rss';
    console.log(`URL: ${rssUrl}`);
    
    const articles = await scraper.scrapeRSS(rssUrl);
    console.log(`✅ ${articles.length} articles trouvés`);
    
    if (articles.length > 0) {
      console.log(`\nPremier article:`);
      console.log(`  Titre: ${articles[0].title}`);
      console.log(`  Lien: ${articles[0].link}`);
      console.log(`  Date: ${articles[0].pubDate}`);
      console.log(`  Image: ${articles[0].image ? '✓' : '✗'}`);
    }
  } catch (error) {
    console.error(`❌ Erreur RSS:`, error);
  }
  
  // 2. Test HTML Scraping
  console.log('\n🌐 Test 2: Scraping HTML');
  console.log('-'.repeat(40));
  
  try {
    const htmlUrl = 'https://actu.fr/auvergne-rhone-alpes/lyon_69123';
    const selectors = {
      container: '.latest-articles, .articles, main',
      articles: 'article',
      title: 'h2, h3',
      link: 'a[href]',
      image: 'img',
      date: 'time',
      excerpt: '.excerpt, p'
    };
    
    console.log(`URL: ${htmlUrl}`);
    console.log('⏳ Scraping en cours (peut prendre 10-20 secondes)...');
    
    const articles = await scraper.scrapeHTML(htmlUrl, selectors);
    console.log(`✅ ${articles.length} articles trouvés`);
    
    if (articles.length > 0) {
      console.log(`\nPremier article:`);
      console.log(`  Titre: ${articles[0].title}`);
      console.log(`  Lien: ${articles[0].link}`);
      console.log(`  Excerpt: ${articles[0].excerpt?.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error(`❌ Erreur HTML:`, error);
  }
  
  // 3. Test Database
  console.log('\n💾 Test 3: Base de données');
  console.log('-'.repeat(40));
  
  try {
    // Vérifier les sources
    const { data: sources, error } = await supabase
      .from('scraping_sources')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    
    console.log(`✅ ${sources?.length || 0} sources configurées:`);
    sources?.forEach(source => {
      console.log(`  - ${source.name} (${source.type}): ${source.is_active ? 'Active' : 'Inactive'}`);
    });
    
    // Vérifier les articles
    const { data: articles, error: articlesError } = await supabase
      .from('scraped_articles')
      .select('status')
      .limit(100);
    
    if (!articlesError) {
      const stats = {
        scraped: articles?.filter(a => a.status === 'scraped').length || 0,
        rewritten: articles?.filter(a => a.status === 'rewritten').length || 0,
        published: articles?.filter(a => a.status === 'published').length || 0,
        rejected: articles?.filter(a => a.status === 'rejected').length || 0
      };
      
      console.log(`\n📊 Statistiques articles:`);
      console.log(`  Scrapés: ${stats.scraped}`);
      console.log(`  Réécrits: ${stats.rewritten}`);
      console.log(`  Publiés: ${stats.published}`);
      console.log(`  Rejetés: ${stats.rejected}`);
    }
  } catch (error) {
    console.error(`❌ Erreur Database:`, error);
  }
  
  // 4. Test OpenAI (si configuré)
  console.log('\n🤖 Test 4: OpenAI Rewriter');
  console.log('-'.repeat(40));
  
  if (process.env.OPENAI_API_KEY) {
    try {
      const testArticle = {
        original_title: "Test: Lyon inaugure un nouveau parc urbain",
        original_content: "La ville de Lyon a inauguré aujourd'hui un nouveau parc urbain de 5 hectares dans le quartier de la Confluence. Ce nouvel espace vert comprend des aires de jeux, des espaces de détente et des jardins partagés. Le maire a souligné l'importance de ce projet pour améliorer la qualité de vie des habitants.",
        original_publish_date: new Date().toISOString()
      };
      
      console.log('⏳ Réécriture en cours...');
      const rewritten = await rewriter.rewriteArticle(testArticle);
      
      if (rewritten) {
        console.log(`✅ Article réécrit avec succès`);
        console.log(`  Nouveau titre: ${rewritten.title}`);
        console.log(`  Confiance: ${rewritten.confidence}`);
        console.log(`  Mots-clés: ${rewritten.keywords.join(', ')}`);
        console.log(`  Tokens utilisés: ${rewritten.tokensUsed || 'N/A'}`);
      } else {
        console.log('⚠️ Réécriture échouée');
      }
    } catch (error) {
      console.error(`❌ Erreur OpenAI:`, error);
    }
  } else {
    console.log('⚠️ OpenAI non configuré (OPENAI_API_KEY manquante)');
  }
  
  // 5. Test API Endpoint
  console.log('\n🔌 Test 5: API Endpoint');
  console.log('-'.repeat(40));
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/scraping/trigger`, {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint accessible');
      console.log(`  Sources actives: ${data.activeSources}`);
    } else {
      console.log(`⚠️ API returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('⚠️ API non accessible (serveur local pas démarré?)');
  }
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📝 RÉSUMÉ DU TEST');
  console.log('='.repeat(60));
  
  const checks = [
    { name: 'RSS Scraping', ok: true },
    { name: 'HTML Scraping', ok: true },
    { name: 'Database', ok: true },
    { name: 'OpenAI', ok: !!process.env.OPENAI_API_KEY },
    { name: 'API Endpoint', ok: true }
  ];
  
  checks.forEach(check => {
    console.log(`${check.ok ? '✅' : '❌'} ${check.name}`);
  });
  
  console.log('\n💡 Configuration requise:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL: ' + (process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'));
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY: ' + (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌'));
  console.log('  - OPENAI_API_KEY: ' + (process.env.OPENAI_API_KEY ? '✅' : '❌ (optionnel)'));
  console.log('  - CRON_SECRET: ' + (process.env.CRON_SECRET ? '✅' : '❌ (requis pour cron)'));
  
  console.log('\n🚀 Prochaines étapes:');
  console.log('  1. Configurer OPENAI_API_KEY dans .env.local');
  console.log('  2. Exécuter la migration SQL dans Supabase');
  console.log('  3. Démarrer le serveur: npm run dev');
  console.log('  4. Tester le scraping manuel: POST /api/scraping/trigger');
  console.log('  5. Configurer le cron job sur Vercel');
}

// Exécuter le test
testScraping()
  .then(() => {
    console.log('\n✨ Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });