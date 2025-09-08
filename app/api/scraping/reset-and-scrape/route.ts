// Route pour reset complet et nouveau scraping
import { NextResponse } from 'next/server';
import { EnhancedScraperService } from '@/app/lib/scraping/scraper-enhanced';
import { supabase } from '@/app/lib/supabase/client';

export async function GET() {
  try {
    console.log('[Reset & Scrape] Nettoyage complet et nouveau scraping');
    
    // 1. Supprimer TOUS les articles existants
    console.log('[Reset & Scrape] Suppression de tous les articles...');
    const { error: deleteError, count } = await supabase
      .from('scraped_articles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Supprimer tout
    
    if (deleteError) {
      console.error('[Reset & Scrape] Erreur suppression:', deleteError);
    } else {
      console.log(`[Reset & Scrape] ${count || 'Tous les'} articles supprimés`);
    }
    
    // 2. Attendre un peu pour que la suppression soit effective
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Créer une source 20 Minutes fraîche
    const source20Min = {
      id: 'reset-20min',
      name: '20 Minutes Lyon',
      url: 'https://www.20minutes.fr/lyon/',
      feed_url: 'https://www.20minutes.fr/feeds/rss-lyon.xml',
      type: 'rss',
      is_active: true,
      description: 'Actualités de Lyon avec images depuis 20 Minutes'
    };
    
    // 4. Lancer le scraping avec plus d'articles
    console.log('[Reset & Scrape] Lancement du scraping 20 Minutes...');
    const scraper = new EnhancedScraperService();
    const result = await scraper.processSource(source20Min);
    
    // 5. Récupérer TOUS les articles publiés
    const { data: allArticles, error: fetchError } = await supabase
      .from('scraped_articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    if (fetchError) {
      console.error('[Reset & Scrape] Erreur récupération articles:', fetchError);
    }
    
    // 6. Compter les articles avec images Supabase
    const articlesWithSupabaseImages = allArticles?.filter(a => 
      a.featured_image_url?.includes('supabase.co/storage')
    ) || [];
    
    return NextResponse.json({
      success: true,
      message: '🎉 Reset complet et scraping terminé !',
      stats: {
        articlesDeleted: 'Tous',
        articlesScraped: result.scraped,
        articlesPublished: result.published,
        totalPublishedNow: allArticles?.length || 0,
        withSupabaseImages: articlesWithSupabaseImages.length
      },
      articles: allArticles?.slice(0, 10).map(a => ({
        title: a.rewritten_title || a.original_title,
        slug: a.slug,
        image: a.featured_image_url,
        hasSupabaseImage: a.featured_image_url?.includes('supabase.co/storage'),
        category: a.category,
        confidence: a.ai_confidence_score,
        publishedAt: a.published_at,
        url: `https://www.guide-de-lyon.fr/actualites/${a.slug}`
      })),
      note: 'Tous les anciens articles ont été supprimés et de nouveaux articles ont été publiés',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Reset & Scrape] Erreur globale:', error);
    return NextResponse.json({
      error: 'Reset et scraping échoué',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    }, { status: 500 });
  }
}

// POST fait la même chose
export async function POST() {
  return GET();
}