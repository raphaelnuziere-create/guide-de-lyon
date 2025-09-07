import { NextRequest, NextResponse } from 'next/server';
import { NewsScraperService } from '@/app/lib/scraping/scraper';
import { ArticleRewriterService } from '@/app/lib/ai/rewriter';
import { supabase } from '@/app/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    console.log('[Manual Trigger] Starting manual scraping...');
    
    const scraper = new NewsScraperService();
    const rewriter = new ArticleRewriterService();
    
    // Fetch active sources
    const { data: sources, error: sourcesError } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true)
      .limit(1); // Start with just one source for testing
    
    if (sourcesError || !sources || sources.length === 0) {
      return NextResponse.json({ 
        error: 'No active sources found. Please run the SQL migration first.' 
      }, { status: 400 });
    }
    
    let totalScraped = 0;
    let totalRewritten = 0;
    let totalPublished = 0;
    const results = [];
    
    for (const source of sources) {
      console.log(`[Manual Trigger] Processing source: ${source.name}`);
      
      let articles = [];
      
      // Scrape based on source type
      if (source.type === 'rss') {
        articles = await scraper.scrapeRSS(source.url);
      } else if (source.type === 'html') {
        articles = await scraper.scrapeHTML(source.url, source.selectors);
      }
      
      totalScraped += articles.length;
      console.log(`[Manual Trigger] Scraped ${articles.length} articles from ${source.name}`);
      
      // Process each article
      for (const article of articles.slice(0, 3)) { // Limit to 3 for testing
        try {
          // Check if article already exists
          const { data: existing } = await supabase
            .from('scraped_articles')
            .select('id')
            .eq('original_url', article.link)
            .single();
          
          if (existing) {
            console.log(`[Manual Trigger] Article already exists: ${article.title}`);
            continue;
          }
          
          // Save scraped article
          const { data: savedArticle, error: saveError } = await supabase
            .from('scraped_articles')
            .insert({
              source_name: source.name,
              source_url: source.url,
              original_url: article.link,
              original_title: article.title,
              original_content: article.description || article.excerpt,
              original_excerpt: article.excerpt || article.description,
              original_image_url: article.image,
              original_publish_date: article.pubDate || new Date().toISOString(),
              featured_image_url: article.image,
              status: 'scraped',
              author_name: 'Raphael',
              author_bio: 'Rédacteur en chef du Guide de Lyon'
            })
            .select()
            .single();
          
          if (saveError) {
            console.error(`[Manual Trigger] Error saving article:`, saveError);
            continue;
          }
          
          // Rewrite with AI
          console.log(`[Manual Trigger] Rewriting: ${article.title}`);
          const rewritten = await rewriter.rewriteArticle({
            original_title: article.title,
            original_content: article.description || article.excerpt || article.title,
            original_publish_date: article.pubDate || new Date().toISOString()
          });
          
          if (rewritten) {
            totalRewritten++;
            
            // Save rewritten content
            const success = await rewriter.saveRewrittenArticle(savedArticle.id, rewritten);
            
            if (success && rewritten.confidence >= 0.85) {
              // Auto-publish high confidence articles
              await supabase
                .from('scraped_articles')
                .update({ 
                  status: 'published',
                  published_at: new Date().toISOString()
                })
                .eq('id', savedArticle.id);
              
              totalPublished++;
              console.log(`[Manual Trigger] Published: ${rewritten.title}`);
            }
          }
        } catch (error) {
          console.error(`[Manual Trigger] Error processing article:`, error);
        }
      }
      
      // Update source last scraped time
      await supabase
        .from('scraping_sources')
        .update({ 
          last_scraped_at: new Date().toISOString(),
          total_articles_scraped: (source.total_articles_scraped || 0) + articles.length
        })
        .eq('id', source.id);
      
      results.push({
        source: source.name,
        scraped: articles.length,
        processed: Math.min(3, articles.length)
      });
    }
    
    console.log('[Manual Trigger] Scraping completed');
    
    return NextResponse.json({
      success: true,
      summary: {
        totalScraped,
        totalRewritten,
        totalPublished,
        sources: results
      },
      message: `Scraped ${totalScraped} articles, rewrote ${totalRewritten}, published ${totalPublished}`
    });
    
  } catch (error) {
    console.error('[Manual Trigger] Error:', error);
    return NextResponse.json({ 
      error: 'Scraping failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}