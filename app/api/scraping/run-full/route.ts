// Route API pour lancer le scraping complet avec toutes les sources
import { NextResponse } from 'next/server'
import { EnhancedScraperService } from '@/app/lib/scraping/scraper-enhanced'

export async function GET() {
  try {
    console.log('[Scraping Full] Démarrage du scraping complet')
    
    // Vérifier la clé OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured',
        message: 'Veuillez configurer OPENAI_API_KEY dans .env.local'
      }, { status: 500 })
    }
    
    // Initialiser le service de scraping amélioré
    const scraper = new EnhancedScraperService()
    
    // Lancer le scraping pour toutes les sources actives
    await scraper.processAllSources()
    
    return NextResponse.json({
      success: true,
      message: 'Scraping complet terminé avec succès',
      timestamp: new Date().toISOString(),
      nextRun: 'Dans 6 heures'
    })
    
  } catch (error) {
    console.error('[Scraping Full] Erreur:', error)
    return NextResponse.json({
      error: 'Scraping failed',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    }, { status: 500 })
  }
}

// Route POST pour déclencher manuellement
export async function POST() {
  return GET()
}