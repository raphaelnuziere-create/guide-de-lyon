import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';

export async function GET() {
  try {
    // Récupérer tous les articles
    const { data: articles, error } = await supabase
      .from('scraped_articles')
      .select('id, slug, rewritten_title, featured_image_url, status, published_at')
      .order('published_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        error: 'Database error',
        details: error
      }, { status: 500 });
    }

    // Compter les articles par statut
    const publishedCount = articles?.filter(a => a.status === 'published').length || 0;
    const draftCount = articles?.filter(a => a.status === 'draft').length || 0;
    const totalCount = articles?.length || 0;

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCount,
        published: publishedCount,
        draft: draftCount
      },
      articles: articles?.slice(0, 5).map(a => ({
        title: a.rewritten_title,
        slug: a.slug,
        status: a.status,
        image: a.featured_image_url,
        hasImage: !!a.featured_image_url,
        publishedAt: a.published_at
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}