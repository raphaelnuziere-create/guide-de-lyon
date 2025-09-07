// Script pour forcer le scraping en désactivant temporairement RLS
import { NewsScraperService } from '../app/lib/scraping/scraper';
import { ArticleRewriterService } from '../app/lib/ai/rewriter';
import { createClient } from '@supabase/supabase-js';

// Utiliser la clé service_role si disponible (bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔑 Utilisation de la clé:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE (bypass RLS)' : 'ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function forceScraping() {
  console.log('💪 SCRAPING FORCÉ - INSERTION DIRECTE\n');
  console.log('='.repeat(60));
  
  const scraper = new NewsScraperService();
  const rewriter = new ArticleRewriterService();
  
  // 1. Récupérer toutes les sources actives
  const { data: sources, error: sourcesError } = await supabase
    .from('scraping_sources')
    .select('*')
    .eq('is_active', true)
    .eq('type', 'rss');
  
  if (sourcesError || !sources || sources.length === 0) {
    console.error('❌ Erreur sources:', sourcesError);
    return;
  }
  
  console.log(`📰 ${sources.length} sources RSS actives trouvées\n`);
  
  let totalScraped = 0;
  let totalSaved = 0;
  let totalPublished = 0;
  
  // 2. Scraper chaque source
  for (const source of sources) {
    console.log(`\n📡 Scraping: ${source.name}`);
    console.log(`   URL: ${source.url}`);
    
    try {
      const articles = await scraper.scrapeRSS(source.url);
      console.log(`   ✅ ${articles.length} articles trouvés`);
      totalScraped += articles.length;
      
      // Limiter à 3 articles par source pour le test
      const articlesToProcess = articles.slice(0, 3);
      
      for (const article of articlesToProcess) {
        try {
          // Vérifier si l'article existe déjà
          const { data: existing } = await supabase
            .from('scraped_articles')
            .select('id')
            .eq('original_url', article.link)
            .single();
          
          if (existing) {
            console.log(`   ⚠️  Article déjà existant: ${article.title.substring(0, 50)}...`);
            continue;
          }
          
          // Créer un article de test avec des données complètes
          const articleData = {
            source_name: source.name,
            source_url: source.url,
            original_url: article.link,
            original_title: article.title,
            original_content: article.description || article.title,
            original_excerpt: article.description || article.title,
            original_image_url: article.image || null,
            original_publish_date: article.pubDate || new Date().toISOString(),
            featured_image_url: article.image || 'https://images.unsplash.com/photo-1524484082325-6d68c1e2b8c0?w=800',
            status: 'scraped',
            author_name: 'Raphael',
            author_bio: 'Rédacteur en chef du Guide de Lyon',
            created_at: new Date().toISOString(),
            scraped_at: new Date().toISOString()
          };
          
          const { data: saved, error: saveError } = await supabase
            .from('scraped_articles')
            .insert(articleData)
            .select()
            .single();
          
          if (saveError) {
            console.error(`   ❌ Erreur insertion:`, saveError.message);
            continue;
          }
          
          console.log(`   ✅ Article sauvé: ${article.title.substring(0, 50)}...`);
          totalSaved++;
          
          // 3. Réécrire avec l'IA (si configuré)
          if (process.env.OPENAI_API_KEY && saved) {
            console.log(`   🤖 Réécriture IA en cours...`);
            
            const rewritten = await rewriter.rewriteArticle({
              original_title: article.title,
              original_content: article.description || article.title,
              original_publish_date: article.pubDate || new Date().toISOString()
            });
            
            if (rewritten) {
              // Sauvegarder la version réécrite
              const success = await rewriter.saveRewrittenArticle(saved.id, rewritten);
              
              if (success && rewritten.confidence >= 0.85) {
                // Auto-publier
                const { error: publishError } = await supabase
                  .from('scraped_articles')
                  .update({ 
                    status: 'published',
                    published_at: new Date().toISOString()
                  })
                  .eq('id', saved.id);
                
                if (!publishError) {
                  console.log(`   🎉 Article publié: ${rewritten.title.substring(0, 50)}...`);
                  totalPublished++;
                }
              } else {
                console.log(`   📝 Article réécrit (score: ${rewritten.confidence})`);
              }
            }
          }
          
        } catch (articleError) {
          console.error(`   ❌ Erreur article:`, articleError);
        }
      }
      
    } catch (error) {
      console.error(`❌ Erreur scraping ${source.name}:`, error);
    }
  }
  
  // 4. Résumé final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DU SCRAPING:');
  console.log(`   Articles scrapés: ${totalScraped}`);
  console.log(`   Articles sauvés: ${totalSaved}`);
  console.log(`   Articles publiés: ${totalPublished}`);
  
  // 5. Vérifier la base
  const { data: finalArticles } = await supabase
    .from('scraped_articles')
    .select('rewritten_title, status, author_name, published_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (finalArticles && finalArticles.length > 0) {
    console.log(`\n📰 ${finalArticles.length} derniers articles dans la base:`);
    finalArticles.forEach((a, i) => {
      const status = a.status === 'published' ? '✅ PUBLIÉ' : 
                     a.status === 'rewritten' ? '📝 RÉÉCRIT' : 
                     a.status === 'scraped' ? '⏳ SCRAPÉ' : '❓';
      console.log(`${i+1}. ${status} - ${(a.rewritten_title || 'En traitement').substring(0, 60)}...`);
      if (a.author_name) console.log(`   Auteur: ${a.author_name}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔗 VOIR LES ARTICLES PUBLIÉS:');
  console.log('   https://guide-de-lyon.vercel.app/actualites');
  console.log('   https://guide-de-lyon.vercel.app/actualites/lyon');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('\n⚠️  IMPORTANT: OPENAI_API_KEY non configurée');
    console.log('   Les articles sont scrapés mais pas réécrits');
    console.log('   Configurez OPENAI_API_KEY sur Vercel pour activer la réécriture IA');
  }
}

forceScraping()
  .then(() => {
    console.log('\n✨ Scraping terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });