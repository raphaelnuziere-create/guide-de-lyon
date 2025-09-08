// Route de test pour le scraping avec proxy d'images
import { NextResponse } from 'next/server';
import { NewsScraperService } from '@/app/lib/scraping/scraper';

export async function GET() {
  try {
    console.log('[Test Proxy] Test du système de proxy d\'images');
    
    const scraper = new NewsScraperService();
    
    // Scraper 20 Minutes qui a des images
    const articles = await scraper.scrapeRSS('https://www.20minutes.fr/feeds/rss-lyon.xml');
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        error: 'Aucun article trouvé'
      });
    }
    
    // Prendre les 3 premiers articles avec images
    const articlesWithImages = articles
      .filter(a => a.image)
      .slice(0, 3)
      .map(article => ({
        title: article.title,
        originalImage: article.image,
        proxyUrl: `/api/images/proxy?url=${encodeURIComponent(article.image || '')}&slug=${article.hash}`,
        directAccessTest: `http://localhost:3002/api/images/proxy?url=${encodeURIComponent(article.image || '')}&slug=${article.hash}`
      }));
    
    return NextResponse.json({
      success: true,
      message: 'Test du proxy d\'images réussi',
      totalArticles: articles.length,
      articlesWithImages: articlesWithImages.length,
      samples: articlesWithImages,
      note: 'Les images sont maintenant servies via notre proxy et seront cachées'
    });
    
  } catch (error) {
    console.error('[Test Proxy] Erreur:', error);
    return NextResponse.json({
      error: 'Test échoué',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}