// Service de scraping amélioré avec gestion des images
import { NewsScraperService } from './scraper';
import { ArticleRewriterService } from '../ai/rewriter';
import { SupabaseImageService } from '../services/supabase-image-service';
import { supabase } from '@/app/lib/supabase/client';

export class EnhancedScraperService {
  private scraper: NewsScraperService;
  private rewriter: ArticleRewriterService;
  private imageService: SupabaseImageService;

  constructor() {
    this.scraper = new NewsScraperService();
    this.rewriter = new ArticleRewriterService();
    this.imageService = new SupabaseImageService();
  }

  async processSource(source: any): Promise<{ scraped: number; published: number }> {
    console.log(`[EnhancedScraper] Traitement de ${source.name}`);
    
    let totalScraped = 0;
    let totalPublished = 0;

    try {
      // Scraper les articles - utiliser feed_url pour RSS
      const articles = source.type === 'rss' 
        ? await this.scraper.scrapeRSS(source.feed_url || source.url)
        : await this.scraper.scrapeHTML(source.url, source.selectors);

      totalScraped = articles.length;
      console.log(`[EnhancedScraper] ${articles.length} articles trouvés`);

      // Traiter chaque article (limiter à 5 pour les tests)
      const articlesToProcess = articles.slice(0, 5);

      for (const article of articlesToProcess) {
        try {
          // Vérifier si l'article existe déjà
          const { data: existing } = await supabase
            .from('scraped_articles')
            .select('id')
            .eq('original_url', article.link)
            .single();

          if (existing) {
            console.log(`[EnhancedScraper] Article déjà existant: ${article.title}`);
            continue;
          }

          // Générer le slug
          const slug = this.generateSlug(article.title);

          // Télécharger et stocker l'image dans Supabase Storage
          let storedImageUrl = null;
          if (article.image) {
            storedImageUrl = await this.imageService.downloadAndStore(article.image, slug);
            console.log(`[EnhancedScraper] Image stockée: ${storedImageUrl}`);
          }
          
          // Si pas d'image, utiliser une image par défaut
          if (!storedImageUrl) {
            storedImageUrl = this.imageService.getDefaultImage('actualite');
          }

          // Sauvegarder l'article scrapé
          const { data: saved, error: saveError } = await supabase
            .from('scraped_articles')
            .insert({
              source_name: source.name,
              source_url: source.url,
              original_url: article.link,
              original_title: article.title,
              original_content: article.description || article.excerpt || article.title,
              original_excerpt: article.excerpt || article.description,
              original_image_url: article.image,
              original_publish_date: article.pubDate || new Date().toISOString(),
              featured_image_url: storedImageUrl, // Image stockée localement
              status: 'scraped',
              author_name: 'Raphael',
              author_bio: 'Rédacteur en chef du Guide de Lyon',
              slug: slug,
              created_at: new Date().toISOString(),
              scraped_at: new Date().toISOString()
            })
            .select()
            .single();

          if (saveError) {
            console.error(`[EnhancedScraper] Erreur sauvegarde:`, saveError);
            continue;
          }

          console.log(`[EnhancedScraper] Article sauvé: ${article.title}`);

          // Réécrire avec l'IA
          if (process.env.OPENAI_API_KEY && saved) {
            console.log(`[EnhancedScraper] Réécriture IA en cours...`);
            
            const rewritten = await this.rewriter.rewriteArticle({
              original_title: article.title,
              original_content: article.description || article.excerpt || article.title,
              original_publish_date: article.pubDate || new Date().toISOString()
            });

            if (rewritten) {
              // Mettre à jour avec le contenu réécrit
              const { error: updateError } = await supabase
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
                .eq('id', saved.id);

              if (!updateError && rewritten.confidence >= 0.85) {
                console.log(`[EnhancedScraper] ✅ Article publié: ${rewritten.title}`);
                totalPublished++;
              }
            }
          }
        } catch (error) {
          console.error(`[EnhancedScraper] Erreur traitement article:`, error);
        }
      }
    } catch (error) {
      console.error(`[EnhancedScraper] Erreur source ${source.name}:`, error);
    }

    return { scraped: totalScraped, published: totalPublished };
  }

  private generateSlug(title: string): string {
    const date = new Date().toISOString().split('T')[0];
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    
    return `${slug}-${date}`;
  }

  async processAllSources(): Promise<void> {
    console.log('[EnhancedScraper] Démarrage du scraping complet');

    // Récupérer les sources actives
    const { data: sources, error } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true);

    if (error || !sources || sources.length === 0) {
      console.error('[EnhancedScraper] Aucune source active trouvée');
      return;
    }

    console.log(`[EnhancedScraper] ${sources.length} sources actives trouvées`);

    let totalScraped = 0;
    let totalPublished = 0;

    // Traiter chaque source
    for (const source of sources) {
      const result = await this.processSource(source);
      totalScraped += result.scraped;
      totalPublished += result.published;

      // Mettre à jour la dernière date de scraping
      await supabase
        .from('scraping_sources')
        .update({
          last_scraped_at: new Date().toISOString(),
          total_articles_scraped: (source.total_articles_scraped || 0) + result.scraped
        })
        .eq('id', source.id);
    }

    // Plus de nettoyage d'images car on utilise les URLs directes

    console.log('[EnhancedScraper] Scraping terminé');
    console.log(`[EnhancedScraper] Total scrapé: ${totalScraped}`);
    console.log(`[EnhancedScraper] Total publié: ${totalPublished}`);
  }
}