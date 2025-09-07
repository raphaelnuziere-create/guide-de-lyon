// Test direct du scraper RSS
import { NewsScraperService } from '../app/lib/scraping/scraper';
import { ArticleRewriterService } from '../app/lib/ai/rewriter';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectScraping() {
  console.log('🧪 TEST DIRECT DU SCRAPING RSS\n');
  console.log('='.repeat(60));
  
  const scraper = new NewsScraperService();
  const rewriter = new ArticleRewriterService();
  
  // 1. Récupérer une source active
  const { data: sources } = await supabase
    .from('scraping_sources')
    .select('*')
    .eq('is_active', true)
    .eq('type', 'rss')
    .limit(1)
    .single();
  
  if (!sources) {
    console.error('❌ Aucune source RSS active');
    return;
  }
  
  console.log(`📰 Test avec: ${sources.name}`);
  console.log(`📡 URL: ${sources.url}\n`);
  
  // 2. Scraper le RSS
  console.log('⏳ Scraping en cours...');
  try {
    const articles = await scraper.scrapeRSS(sources.url);
    console.log(`✅ ${articles.length} articles trouvés !\n`);
    
    if (articles.length > 0) {
      // Afficher le premier article
      const first = articles[0];
      console.log('📄 Premier article:');
      console.log(`   Titre: ${first.title}`);
      console.log(`   Lien: ${first.link}`);
      console.log(`   Date: ${first.pubDate}`);
      console.log(`   Description: ${first.description?.substring(0, 100)}...\n`);
      
      // 3. Sauvegarder dans la base
      console.log('💾 Sauvegarde du premier article...');
      
      const { data: saved, error: saveError } = await supabase
        .from('scraped_articles')
        .insert({
          source_name: sources.name,
          source_url: sources.url,
          original_url: first.link,
          original_title: first.title,
          original_content: first.description || first.excerpt,
          original_excerpt: first.excerpt || first.description,
          original_image_url: first.image,
          original_publish_date: first.pubDate || new Date().toISOString(),
          featured_image_url: first.image,
          status: 'scraped',
          author_name: 'Raphael',
          author_bio: 'Rédacteur en chef du Guide de Lyon'
        })
        .select()
        .single();
      
      if (saveError) {
        if (saveError.message.includes('duplicate')) {
          console.log('⚠️  Article déjà dans la base');
        } else {
          console.error('❌ Erreur sauvegarde:', saveError.message);
        }
      } else {
        console.log('✅ Article sauvegardé avec l\'ID:', saved.id);
        
        // 4. Tester la réécriture IA
        if (process.env.OPENAI_API_KEY) {
          console.log('\n🤖 Test de réécriture IA...');
          const rewritten = await rewriter.rewriteArticle({
            original_title: first.title,
            original_content: first.description || first.title,
            original_publish_date: first.pubDate || new Date().toISOString()
          });
          
          if (rewritten) {
            console.log('✅ Article réécrit avec succès !');
            console.log(`   Nouveau titre: ${rewritten.title}`);
            console.log(`   Auteur: Raphael (pas de citations)`);
            console.log(`   Score: ${rewritten.confidence}`);
            console.log(`   Catégorie: ${rewritten.category}`);
            
            // Sauvegarder la version réécrite
            const success = await rewriter.saveRewrittenArticle(saved.id, rewritten);
            
            if (success && rewritten.confidence >= 0.85) {
              // Auto-publier
              await supabase
                .from('scraped_articles')
                .update({ 
                  status: 'published',
                  published_at: new Date().toISOString()
                })
                .eq('id', saved.id);
              
              console.log('🎉 ARTICLE PUBLIÉ AUTOMATIQUEMENT !');
            }
          } else {
            console.log('⚠️  OpenAI non configuré ou échec de réécriture');
          }
        } else {
          console.log('⚠️  OPENAI_API_KEY non configurée');
          console.log('   Configurez-la sur Vercel pour activer la réécriture IA');
        }
      }
    }
  } catch (error) {
    console.error('❌ Erreur scraping:', error);
  }
  
  // 5. Vérifier les articles dans la base
  console.log('\n📊 État final de la base:');
  const { data: finalCount } = await supabase
    .from('scraped_articles')
    .select('status', { count: 'exact', head: true });
  
  const { data: articles } = await supabase
    .from('scraped_articles')
    .select('rewritten_title, status, author_name')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (articles && articles.length > 0) {
    console.log(`\n✅ ${articles.length} derniers articles:`);
    articles.forEach((a, i) => {
      const status = a.status === 'published' ? '✅ PUBLIÉ' : 
                     a.status === 'rewritten' ? '📝 RÉÉCRIT' : '⏳ SCRAPÉ';
      console.log(`${i+1}. ${status} - ${a.rewritten_title || 'En traitement...'}`);
      if (a.author_name) console.log(`   Auteur: ${a.author_name}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔗 Voir les articles publiés:');
  console.log('   https://guide-de-lyon.vercel.app/actualites');
}

testDirectScraping()
  .then(() => {
    console.log('\n✨ Test terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });