// Route API pour tester le scraping d'un seul article
import { NextResponse } from 'next/server'
import { NewsScraperService } from '@/app/lib/scraping/scraper'
import { ArticleRewriterService } from '@/app/lib/ai/rewriter'
import { ImageService } from '@/app/lib/services/image-service'
import { supabase } from '@/app/lib/supabase/client'

export async function GET() {
  try {
    console.log('[Test Single] Démarrage du test avec un article')
    
    // Vérifier la clé OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key not configured',
        message: 'Veuillez configurer OPENAI_API_KEY dans .env.local'
      }, { status: 500 })
    }
    
    // Initialiser les services
    const scraper = new NewsScraperService()
    const rewriter = new ArticleRewriterService()
    const imageService = new ImageService()
    
    // Scraper un article depuis Le Progrès
    const articles = await scraper.scrapeRSS('https://www.leprogres.fr/edition-lyon-villeurbanne/rss')
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        error: 'No articles found',
        message: 'Aucun article trouvé dans le flux RSS'
      }, { status: 404 })
    }
    
    // Prendre le premier article non traité
    const article = articles[0]
    console.log(`[Test Single] Article trouvé: ${article.title}`)
    
    // Vérifier si l'article existe déjà
    const { data: existing } = await supabase
      .from('scraped_articles')
      .select('id')
      .eq('original_url', article.link)
      .single()
    
    if (existing) {
      return NextResponse.json({
        message: 'Article déjà existant',
        article: { title: article.title, url: article.link }
      })
    }
    
    // Générer le slug
    const date = new Date().toISOString().split('T')[0]
    const slug = article.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) + `-${date}`
    
    // Télécharger et stocker l'image
    let storedImageUrl = null
    if (article.image) {
      storedImageUrl = await imageService.downloadAndStore(article.image, slug)
    }
    
    if (!storedImageUrl) {
      storedImageUrl = imageService.getDefaultImage('actualite')
    }
    
    // Sauvegarder l'article scrapé
    const { data: saved, error: saveError } = await supabase
      .from('scraped_articles')
      .insert({
        source_name: 'Le Progrès Lyon RSS',
        source_url: 'https://www.leprogres.fr/edition-lyon-villeurbanne/rss',
        original_url: article.link,
        original_title: article.title,
        original_content: article.description || article.excerpt || article.title,
        original_excerpt: article.excerpt || article.description,
        original_image_url: article.image,
        original_publish_date: article.pubDate || new Date().toISOString(),
        featured_image_url: storedImageUrl,
        status: 'scraped',
        author_name: 'Raphael',
        author_bio: 'Rédacteur en chef du Guide de Lyon',
        slug: slug,
        created_at: new Date().toISOString(),
        scraped_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (saveError) {
      return NextResponse.json({
        error: 'Save failed',
        message: saveError.message,
        details: saveError
      }, { status: 500 })
    }
    
    console.log(`[Test Single] Article sauvé, réécriture en cours...`)
    
    // Réécrire avec l'IA
    const rewritten = await rewriter.rewriteArticle({
      original_title: article.title,
      original_content: article.description || article.excerpt || article.title,
      original_publish_date: article.pubDate || new Date().toISOString()
    })
    
    if (!rewritten) {
      return NextResponse.json({
        error: 'Rewriting failed',
        message: 'La réécriture IA a échoué',
        savedArticle: saved
      }, { status: 500 })
    }
    
    // Mettre à jour avec le contenu réécrit
    const { data: updated, error: updateError } = await supabase
      .from('scraped_articles')
      .update({
        rewritten_title: rewritten.title,
        rewritten_content: rewritten.content,
        rewritten_excerpt: rewritten.excerpt,
        rewritten_meta_description: rewritten.metaDescription,
        keywords: rewritten.keywords,
        category: rewritten.category,
        ai_confidence_score: rewritten.confidence,
        openai_tokens_used: rewritten.tokensUsed,
        status: rewritten.confidence >= 0.85 ? 'published' : 'rewritten',
        rewritten_at: new Date().toISOString(),
        published_at: rewritten.confidence >= 0.85 ? new Date().toISOString() : null
      })
      .eq('id', saved.id)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json({
        error: 'Update failed',
        message: updateError.message,
        details: updateError
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: `Article ${rewritten.confidence >= 0.85 ? 'publié' : 'réécrit'} avec succès`,
      article: {
        id: updated.id,
        slug: updated.slug,
        title: updated.rewritten_title,
        category: updated.category,
        status: updated.status,
        confidence: updated.ai_confidence_score,
        url: `https://www.guide-de-lyon.fr/actualites/${updated.slug}`,
        imageUrl: updated.featured_image_url,
        author: updated.author_name
      },
      stats: {
        tokensUsed: rewritten.tokensUsed,
        wordCount: rewritten.content.split(' ').length
      }
    })
    
  } catch (error) {
    console.error('[Test Single] Erreur:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    }, { status: 500 })
  }
}