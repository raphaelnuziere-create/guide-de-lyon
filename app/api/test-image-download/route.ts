// Route de test pour le téléchargement d'images
import { NextResponse } from 'next/server'
import { NewsScraperService } from '@/app/lib/scraping/scraper'
import { ImageService } from '@/app/lib/services/image-service'

export async function GET() {
  try {
    console.log('[Test Image] Démarrage du test de téléchargement d\'image')
    
    // Initialiser les services
    const scraper = new NewsScraperService()
    const imageService = new ImageService()
    
    // Scraper un article pour obtenir l'URL de l'image
    const articles = await scraper.scrapeRSS('https://www.leprogres.fr/edition-lyon-villeurbanne/rss')
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        error: 'No articles found'
      })
    }
    
    // Prendre le premier article avec une image
    const articleWithImage = articles.find(a => a.image) || articles[0]
    
    console.log('[Test Image] Article trouvé:', {
      title: articleWithImage.title,
      imageUrl: articleWithImage.image
    })
    
    // Essayer de télécharger l'image
    const slug = 'test-image-' + Date.now()
    const storedImageUrl = await imageService.downloadAndStore(
      articleWithImage.image || '', 
      slug
    )
    
    return NextResponse.json({
      success: true,
      article: {
        title: articleWithImage.title,
        originalImageUrl: articleWithImage.image,
        storedImageUrl: storedImageUrl,
        isDefaultImage: storedImageUrl?.includes('unsplash.com')
      },
      debug: {
        slug: slug,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('[Test Image] Erreur:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}