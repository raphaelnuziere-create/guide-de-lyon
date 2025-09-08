// Route pour nettoyer et relancer un scraping propre
import { NextResponse } from 'next/server';
import { EnhancedScraperService } from '@/app/lib/scraping/scraper-enhanced';
import { supabase } from '@/app/lib/supabase/client';

export async function GET() {
  try {
    console.log('[Clean & Scrape] Nettoyage et nouveau scraping');
    
    // 1. Supprimer les anciens articles de 20 Minutes
    const { error: deleteError } = await supabase
      .from('scraped_articles')
      .delete()
      .or('source_name.eq.20 Minutes Lyon,source_name.eq.Test 20 Minutes');
    
    if (deleteError) {
      console.error('[Clean & Scrape] Erreur suppression:', deleteError);
    } else {
      console.log('[Clean & Scrape] Anciens articles supprimés');
    }
    
    // 2. Créer une source 20 Minutes
    const source20Min = {
      id: 'clean-20min',
      name: '20 Minutes Lyon',
      url: 'https://www.20minutes.fr/lyon/',
      feed_url: 'https://www.20minutes.fr/feeds/rss-lyon.xml',
      type: 'rss',
      is_active: true,
      description: 'Actualités de Lyon avec images'
    };
    
    // 3. Lancer le scraping
    const scraper = new EnhancedScraperService();
    const result = await scraper.processSource(source20Min);
    
    // 4. Récupérer les articles publiés avec images Supabase
    const { data: published } = await supabase
      .from('scraped_articles')
      .select('*')
      .eq('status', 'published')
      .like('featured_image_url', '%supabase%')
      .order('published_at', { ascending: false })
      .limit(5);
    
    // 5. Compter les images Supabase
    const supabaseImages = published?.filter(a => 
      a.featured_image_url?.includes('supabase.co/storage')
    ).length || 0;
    
    return NextResponse.json({
      success: true,
      message: 'Scraping avec images Supabase terminé',
      stats: {
        scraped: result.scraped,
        published: result.published,
        imagesInSupabase: supabaseImages
      },
      articles: published?.map(a => ({
        title: a.rewritten_title || a.original_title,
        slug: a.slug,
        image: a.featured_image_url,
        hasSupabaseImage: a.featured_image_url?.includes('supabase.co/storage'),
        url: `https://www.guide-de-lyon.fr/actualites/${a.slug}`
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Clean & Scrape] Erreur:', error);
    return NextResponse.json({
      error: 'Scraping échoué',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}