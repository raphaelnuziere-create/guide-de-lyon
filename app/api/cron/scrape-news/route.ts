// Cron job pour scraper automatiquement les news
import { NextResponse } from 'next/server';
import { NewsScraperService } from '@/app/lib/scraping/scraper';
import { ArticleRewriterService } from '@/app/lib/ai/rewriter';
import { createClient } from '@supabase/supabase-js';

// Fonction pour obtenir le client Supabase
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  return createClient(url, key);
}

export async function GET(request: Request) {
  try {
    // Vérifier le secret pour sécuriser l'endpoint
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[CRON Scraping] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON Scraping] Starting news scraping...');
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 503 }
      );
    }

    const scraper = new NewsScraperService();
    const rewriter = new ArticleRewriterService();
    
    // Récupérer les sources actives qui doivent être scrapées
    const now = new Date();
    const { data: sources, error } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true)
      .lt('consecutive_errors', 5); // Skip les sources avec trop d'erreurs
    
    if (error || !sources) {
      console.error('[CRON Scraping] Error fetching sources:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sources' },
        { status: 500 }
      );
    }
    
    const results = {
      sourcesProcessed: 0,
      articlesScraped: 0,
      articlesRewritten: 0,
      articlesPublished: 0,
      errors: []
    };
    
    // Traiter chaque source
    for (const source of sources) {
      try {
        // Vérifier la fréquence
        if (source.last_scraped_at) {
          const lastScraped = new Date(source.last_scraped_at);
          const minutesSinceLastScrape = (now.getTime() - lastScraped.getTime()) / 60000;
          
          if (minutesSinceLastScrape < source.frequency_minutes) {
            console.log(`[CRON Scraping] Skipping ${source.name} - too recent`);
            continue;
          }
        }
        
        console.log(`[CRON Scraping] Processing ${source.name}`);
        results.sourcesProcessed++;
        
        // Scraper les articles
        let articles = [];
        if (source.type === 'rss') {
          articles = await scraper.scrapeRSS(source.url);
        } else if (source.type === 'html') {
          articles = await scraper.scrapeHTML(source.url, source.selectors);
        }
        
        // Limiter le nombre d'articles par source
        const maxArticles = Math.min(
          source.max_articles_per_run || 5,
          parseInt(process.env.MAX_ARTICLES_PER_DAY || '50') / sources.length
        );
        
        const articlesToProcess = articles.slice(0, maxArticles);
        
        // Traiter chaque article
        for (const article of articlesToProcess) {
          try {
            // Sauvegarder l'article scrapé
            const articleId = await scraper.saveScrapedArticle(article, source);
            
            if (articleId) {
              results.articlesScraped++;
              
              // Si OpenAI est configuré, réécrire l'article
              if (process.env.OPENAI_API_KEY) {
                const { data: savedArticle } = await supabase
                  .from('scraped_articles')
                  .select('*')
                  .eq('id', articleId)
                  .single();
                
                if (savedArticle) {
                  const rewritten = await rewriter.rewriteArticle(savedArticle);
                  
                  if (rewritten && rewriter.validateRewrittenContent(rewritten)) {
                    const success = await rewriter.saveRewrittenArticle(articleId, rewritten);
                    
                    if (success) {
                      results.articlesRewritten++;
                      
                      // Auto-publier si confiance élevée
                      const minConfidence = parseFloat(process.env.MIN_CONFIDENCE_SCORE || '0.80');
                      if (rewritten.confidence >= minConfidence) {
                        await supabase
                          .from('scraped_articles')
                          .update({ 
                            status: 'published',
                            published_at: new Date().toISOString()
                          })
                          .eq('id', articleId);
                        
                        results.articlesPublished++;
                      }
                    }
                  }
                }
              }
            }
          } catch (articleError: any) {
            console.error(`[CRON Scraping] Error processing article:`, articleError);
          }
        }
        
        // Mettre à jour la source
        await supabase
          .from('scraping_sources')
          .update({
            last_scraped_at: now.toISOString(),
            total_articles_scraped: source.total_articles_scraped + results.articlesScraped,
            consecutive_errors: 0,
            success_rate: ((source.total_articles_scraped + results.articlesScraped) / 
                          (source.total_articles_scraped + results.articlesScraped + source.consecutive_errors) * 100)
          })
          .eq('id', source.id);
          
      } catch (sourceError: any) {
        console.error(`[CRON Scraping] Error with source ${source.name}:`, sourceError);
        results.errors.push({
          source: source.name,
          error: sourceError.message
        });
        
        // Incrémenter les erreurs
        await supabase
          .from('scraping_sources')
          .update({
            last_error: sourceError.message,
            consecutive_errors: source.consecutive_errors + 1
          })
          .eq('id', source.id);
      }
    }
    
    // Logger les résultats
    await supabase
      .from('scraping_logs')
      .insert({
        action: 'cron_scraping',
        status: 'completed',
        details: results
      });
    
    console.log('[CRON Scraping] Completed:', results);
    
    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results
    });
    
  } catch (error: any) {
    console.error('[CRON Scraping] Fatal error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}