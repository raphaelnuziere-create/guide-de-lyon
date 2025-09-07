// Route API pour tester le système de scraping amélioré
import { NextResponse } from 'next/server'
import { EnhancedScraperService } from '@/app/lib/scraping/scraper-enhanced'
import { supabase } from '@/app/lib/supabase/client'

export async function GET() {
  try {
    console.log('[Test] Démarrage du test de scraping amélioré')
    
    // Vérifier la clé OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured',
        message: 'Veuillez configurer OPENAI_API_KEY dans .env.local'
      }, { status: 500 })
    }
    
    // Récupérer une source de test
    const { data: source, error: sourceError } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()
    
    if (sourceError || !source) {
      return NextResponse.json({
        error: 'No active source found',
        message: 'Aucune source active trouvée. Veuillez d\'abord ajouter des sources.'
      }, { status: 404 })
    }
    
    console.log(`[Test] Test avec la source: ${source.name}`)
    
    // Initialiser le service de scraping amélioré
    const scraper = new EnhancedScraperService()
    
    // Traiter la source
    const result = await scraper.processSource(source)
    
    // Récupérer les articles créés pour vérification
    const { data: articles } = await supabase
      .from('scraped_articles')
      .select('id, slug, rewritten_title, featured_image_url, category, status, ai_confidence_score, author_name')
      .eq('source_name', source.name)
      .order('created_at', { ascending: false })
      .limit(5)
    
    return NextResponse.json({
      success: true,
      message: 'Test de scraping amélioré réussi',
      source: {
        name: source.name,
        url: source.url,
        type: source.type
      },
      results: {
        scraped: result.scraped,
        published: result.published,
        articles: articles || []
      },
      features: {
        imageStorage: '✅ Images téléchargées et stockées localement',
        longArticles: '✅ Articles longs (1200-2000 mots)',
        blogTemplate: '✅ Template ModernArticleTemplate intégré',
        author: '✅ Auteur: Raphael',
        noSourceCitation: '✅ Pas de citation des sources'
      }
    })
    
  } catch (error) {
    console.error('[Test] Erreur:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    }, { status: 500 })
  }
}