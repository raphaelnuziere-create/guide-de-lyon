// Route API pour forcer le scraping d'un nouvel article (skip les existants)
import { NextResponse } from 'next/server'
import { NewsScraperService } from '@/app/lib/scraping/scraper'
import { ArticleRewriterService } from '@/app/lib/ai/rewriter'
import { ImageService } from '@/app/lib/services/image-service'
import { supabase } from '@/app/lib/supabase/client'

export async function GET() {
  try {
    console.log('[Force New] Recherche d\'un nouvel article à scraper')
    
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
    
    // Scraper plusieurs articles depuis Le Progrès
    const articles = await scraper.scrapeRSS('https://www.leprogres.fr/edition-lyon-villeurbanne/rss')
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        error: 'No articles found',
        message: 'Aucun article trouvé dans le flux RSS'
      }, { status: 404 })
    }
    
    // Chercher le premier article qui n'existe pas encore
    let articleToProcess = null
    let skipCount = 0
    
    for (const article of articles) {
      const { data: existing } = await supabase
        .from('scraped_articles')
        .select('id')
        .eq('original_url', article.link)
        .single()
      
      if (!existing) {
        articleToProcess = article
        break
      }
      skipCount++
    }
    
    if (!articleToProcess) {
      // Si tous les articles existent, prendre un article de 20 Minutes
      console.log('[Force New] Tous les articles du Progrès existent, essai avec 20 Minutes')
      const articles20min = await scraper.scrapeRSS('https://www.20minutes.fr/feeds/rss-lyon.xml')
      
      for (const article of articles20min) {
        const { data: existing } = await supabase
          .from('scraped_articles')
          .select('id')
          .eq('original_url', article.link)
          .single()
        
        if (!existing) {
          articleToProcess = article
          break
        }
      }
    }
    
    if (!articleToProcess) {
      return NextResponse.json({
        message: 'Tous les articles récents ont déjà été traités',
        stats: {
          checkedProgres: articles.length,
          skipped: skipCount
        }
      })
    }
    
    console.log(`[Force New] Article trouvé après ${skipCount} articles déjà traités: ${articleToProcess.title}`)
    
    // Générer le slug
    const date = new Date().toISOString().split('T')[0]
    const slug = articleToProcess.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) + `-${date}`
    
    // Télécharger et stocker l'image
    let storedImageUrl = null
    if (articleToProcess.image) {
      storedImageUrl = await imageService.downloadAndStore(articleToProcess.image, slug)
    }
    
    if (!storedImageUrl) {
      storedImageUrl = imageService.getDefaultImage('actualite')
    }
    
    // Sauvegarder l'article scrapé
    const { data: saved, error: saveError } = await supabase
      .from('scraped_articles')
      .insert({
        source_name: skipCount < articles.length ? 'Le Progrès Lyon RSS' : '20 Minutes Lyon',
        source_url: skipCount < articles.length ? 'https://www.leprogres.fr/edition-lyon-villeurbanne/rss' : 'https://www.20minutes.fr/feeds/rss-lyon.xml',
        original_url: articleToProcess.link,
        original_title: articleToProcess.title,
        original_content: articleToProcess.description || articleToProcess.excerpt || articleToProcess.title,
        original_excerpt: articleToProcess.excerpt || articleToProcess.description,
        original_image_url: articleToProcess.image,
        original_publish_date: articleToProcess.pubDate || new Date().toISOString(),
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
    
    console.log(`[Force New] Article sauvé, réécriture en cours...`)
    
    // Réécrire avec l'IA
    const rewritten = await rewriter.rewriteArticle({
      original_title: articleToProcess.title,
      original_content: articleToProcess.description || articleToProcess.excerpt || articleToProcess.title,
      original_publish_date: articleToProcess.pubDate || new Date().toISOString()
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
      skippedArticles: skipCount,
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
        wordCount: rewritten.content.split(' ').length,
        skippedExisting: skipCount
      }
    })
    
  } catch (error) {
    console.error('[Force New] Erreur:', error)
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    }, { status: 500 })
  }
}

// Route pour nettoyer et recommencer
export async function DELETE() {
  try {
    // Supprimer tous les articles non publiés
    const { error } = await supabase
      .from('scraped_articles')
      .delete()
      .neq('status', 'published')
    
    if (error) {
      return NextResponse.json({
        error: 'Cleanup failed',
        message: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Articles non publiés supprimés'
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Cleanup failed',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}