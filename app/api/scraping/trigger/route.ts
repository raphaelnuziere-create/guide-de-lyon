// API Route pour déclencher le scraping manuel
import { NextRequest, NextResponse } from 'next/server';
import { NewsScraperService } from '@/app/lib/scraping/scraper';
import { ArticleRewriterService } from '@/app/lib/ai/rewriter';
import { createClient } from '@supabase/supabase-js';

// Obtenir le client Supabase
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 503 }
      );
    }

    const { sourceId, forceAll = false } = await request.json();
    
    const scraper = new NewsScraperService();
    const rewriter = new ArticleRewriterService();
    
    // Récupérer la source ou toutes les sources actives
    const query = sourceId 
      ? supabase.from('scraping_sources').select('*').eq('id', sourceId).single()
      : supabase.from('scraping_sources').select('*').eq('is_active', true);
    
    const { data: sources, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Source not found' },
        { status: 404 }
      );
    }
    
    const sourcesArray = Array.isArray(sources) ? sources : [sources];
    const results = {
      totalScraped: 0,
      totalRewritten: 0,
      errors: []
    };
    
    // Traiter chaque source
    for (const source of sourcesArray) {
      try {
        console.log(`[API] Processing source: ${source.name}`);
        
        // Scraper selon le type
        let articles = [];
        if (source.type === 'rss') {
          articles = await scraper.scrapeRSS(source.url);
        } else if (source.type === 'html') {
          articles = await scraper.scrapeHTML(source.url, source.selectors);
        }
        
        // Limiter le nombre d'articles
        const articlesToProcess = forceAll 
          ? articles 
          : articles.slice(0, source.max_articles_per_run || 5);
        
        // Sauvegarder et traiter chaque article
        for (const article of articlesToProcess) {
          const articleId = await scraper.saveScrapedArticle(article, source);
          
          if (articleId) {
            results.totalScraped++;
            
            // Récupérer l'article complet pour la réécriture
            const { data: savedArticle } = await supabase
              .from('scraped_articles')
              .select('*')
              .eq('id', articleId)
              .single();
            
            if (savedArticle && process.env.OPENAI_API_KEY) {
              // Réécrire avec OpenAI
              const rewritten = await rewriter.rewriteArticle(savedArticle);
              
              if (rewritten) {
                const success = await rewriter.saveRewrittenArticle(articleId, rewritten);
                if (success) {
                  results.totalRewritten++;
                  
                  // Auto-publier si haute confiance
                  if (rewritten.confidence > 0.85) {
                    await supabase
                      .from('scraped_articles')
                      .update({ 
                        status: 'published',
                        published_at: new Date().toISOString()
                      })
                      .eq('id', articleId);
                  }
                }
              }
            }
          }
        }
        
        // Mettre à jour la source
        await supabase
          .from('scraping_sources')
          .update({
            last_scraped_at: new Date().toISOString(),
            total_articles_scraped: source.total_articles_scraped + results.totalScraped,
            consecutive_errors: 0
          })
          .eq('id', source.id);
          
      } catch (error: any) {
        console.error(`[API] Error processing source ${source.name}:`, error);
        results.errors.push({
          source: source.name,
          error: error.message
        });
        
        // Incrémenter les erreurs consécutives
        await supabase
          .from('scraping_sources')
          .update({
            last_error: error.message,
            consecutive_errors: source.consecutive_errors + 1
          })
          .eq('id', source.id);
      }
    }
    
    return NextResponse.json({
      success: true,
      results,
      message: `Scraped ${results.totalScraped} articles, rewritten ${results.totalRewritten}`
    });
    
  } catch (error: any) {
    console.error('[API] Scraping trigger error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET pour obtenir le statut
export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 503 }
      );
    }

    // Récupérer les statistiques
    const { data: stats } = await supabase
      .rpc('get_scraping_stats');
    
    const { data: sources } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true);
    
    return NextResponse.json({
      stats,
      activeSources: sources?.length || 0,
      lastUpdate: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}