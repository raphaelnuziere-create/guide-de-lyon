// Route de test pour 20 Minutes avec images
import { NextResponse } from 'next/server'
import { NewsScraperService } from '@/app/lib/scraping/scraper'
import { ImageService } from '@/app/lib/services/image-service'

export async function GET() {
  try {
    console.log('[Test 20Min] Test avec flux 20 Minutes Lyon')
    
    // Initialiser les services
    const scraper = new NewsScraperService()
    const imageService = new ImageService()
    
    // Scraper 20 Minutes Lyon qui a des images
    const articles = await scraper.scrapeRSS('https://www.20minutes.fr/feeds/rss-lyon.xml')
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        error: 'No articles found'
      })
    }
    
    // Prendre le premier article avec une image
    const articleWithImage = articles.find(a => a.image) || articles[0]
    
    console.log('[Test 20Min] Article trouvé:', {
      title: articleWithImage.title,
      imageUrl: articleWithImage.image,
      description: articleWithImage.description?.substring(0, 100)
    })
    
    if (articleWithImage.image) {
      // Essayer de télécharger l'image
      const slug = 'test-20min-' + Date.now()
      const storedImageUrl = await imageService.downloadAndStore(
        articleWithImage.image, 
        slug
      )
      
      return NextResponse.json({
        success: true,
        article: {
          title: articleWithImage.title,
          originalImageUrl: articleWithImage.image,
          storedImageUrl: storedImageUrl,
          isDefaultImage: storedImageUrl?.includes('unsplash.com'),
          isStoredInSupabase: storedImageUrl?.includes('supabase')
        },
        debug: {
          slug: slug,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json({
        message: 'Aucune image trouvée dans les articles 20 Minutes',
        articlesChecked: articles.length,
        firstArticle: {
          title: articleWithImage.title,
          hasImage: false
        }
      })
    }
    
  } catch (error) {
    console.error('[Test 20Min] Erreur:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}