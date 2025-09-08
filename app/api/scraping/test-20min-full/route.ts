// Route de test pour scraping complet avec 20 Minutes
import { NextResponse } from 'next/server'
import { EnhancedScraperService } from '@/app/lib/scraping/scraper-enhanced'
import { supabase } from '@/app/lib/supabase/client'

export async function GET() {
  try {
    console.log('[Test 20Min Full] Démarrage du test complet avec 20 Minutes')
    
    // Vérifier la clé OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured',
        message: 'Veuillez configurer OPENAI_API_KEY dans .env.local'
      }, { status: 500 })
    }
    
    // Créer une source temporaire 20 Minutes pour le test
    const source20Min = {
      id: 'test-20min',
      name: '20 Minutes Lyon',
      url: 'https://www.20minutes.fr/lyon/',
      feed_url: 'https://www.20minutes.fr/feeds/rss-lyon.xml',
      type: 'rss',
      is_active: true,
      description: 'Test avec 20 Minutes qui a des images'
    }
    
    // Initialiser le service
    const scraper = new EnhancedScraperService()
    
    // Traiter la source 20 Minutes
    const result = await scraper.processSource(source20Min)
    
    // Récupérer les derniers articles publiés
    const { data: published } = await supabase
      .from('scraped_articles')
      .select('*')
      .eq('status', 'published')
      .eq('source_name', '20 Minutes Lyon')
      .order('published_at', { ascending: false })
      .limit(3)
    
    return NextResponse.json({
      success: true,
      message: 'Test 20 Minutes terminé avec succès',
      stats: {
        scraped: result.scraped,
        published: result.published
      },
      recentArticles: published?.map(a => ({
        title: a.rewritten_title || a.original_title,
        slug: a.slug,
        image: a.featured_image_url,
        hasStoredImage: a.featured_image_url?.includes('supabase'),
        confidence: a.ai_confidence_score,
        url: `https://www.guide-de-lyon.fr/actualites/${a.slug}`
      })),
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[Test 20Min Full] Erreur:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    }, { status: 500 })
  }
}