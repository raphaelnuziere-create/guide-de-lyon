// Service de scraping pour les actualités de Lyon
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import crypto from 'crypto';
import { supabase } from '@/app/lib/supabase/client';

interface ScrapedArticle {
  title: string;
  link: string;
  content?: string;
  excerpt?: string;
  pubDate?: string;
  image?: string;
  hash: string;
}

export class NewsScraperService {
  private parser = new Parser({
    customFields: {
      item: ['enclosure', 'media:content', 'media:thumbnail']
    }
  });
  
  // 1. SCRAPER RSS
  async scrapeRSS(feedUrl: string): Promise<ScrapedArticle[]> {
    try {
      console.log(`[Scraper] Scraping RSS: ${feedUrl}`);
      const feed = await this.parser.parseURL(feedUrl);
      
      return feed.items.map(item => ({
        title: item.title || '',
        link: item.link || '',
        content: item.content || item.contentSnippet || '',
        excerpt: item.contentSnippet || '',
        pubDate: item.pubDate || new Date().toISOString(),
        image: this.extractImageFromRSS(item),
        hash: this.generateHash(item.link || item.title || '')
      }));
    } catch (error) {
      console.error(`[Scraper] RSS scraping failed for ${feedUrl}:`, error);
      throw error;
    }
  }
  
  // Extraire l'image d'un item RSS
  private extractImageFromRSS(item: any): string | undefined {
    // Chercher dans différents champs possibles
    if (item.enclosure?.url) return item.enclosure.url;
    if (item['media:content']?.$ ?.url) return item['media:content'].$.url;
    if (item['media:thumbnail']?.$ ?.url) return item['media:thumbnail'].$.url;
    
    // Chercher une image dans la description (Le Progrès met les images là)
    if (item.description) {
      const $ = cheerio.load(item.description);
      const firstImg = $('img').first().attr('src');
      if (firstImg) {
        // Assurer que l'URL est absolue
        if (firstImg.startsWith('//')) {
          return 'https:' + firstImg;
        }
        if (firstImg.startsWith('/')) {
          return 'https://www.leprogres.fr' + firstImg;
        }
        return firstImg;
      }
    }
    
    // Chercher une image dans le contenu HTML
    if (item.content) {
      const $ = cheerio.load(item.content);
      const firstImg = $('img').first().attr('src');
      if (firstImg) {
        if (firstImg.startsWith('//')) {
          return 'https:' + firstImg;
        }
        if (firstImg.startsWith('/')) {
          return 'https://www.leprogres.fr' + firstImg;
        }
        return firstImg;
      }
    }
    
    console.log('[Scraper] Pas d\'image trouvée pour:', item.title?.substring(0, 50));
    return undefined;
  }
  
  // 2. SCRAPER HTML (pour Actu.fr et autres)
  async scrapeHTML(url: string, selectors: any): Promise<ScrapedArticle[]> {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      console.log(`[Scraper] Scraping HTML: ${url}`);
      const page = await browser.newPage();
      
      // User agent pour éviter les blocages
      await page.setUserAgent('Mozilla/5.0 (compatible; GuideLyonBot/1.0; +https://guide-de-lyon.fr/bot)');
      
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Attendre que le contenu soit chargé
      try {
        await page.waitForSelector(selectors.container, { timeout: 10000 });
      } catch {
        console.log('[Scraper] Container not found, trying alternative selectors');
      }
      
      const articles = await page.evaluate((sel) => {
        const findArticles = () => {
          // Essayer plusieurs sélecteurs si le principal échoue
          const containers = [
            sel.container,
            '.articles',
            '.news-list',
            'main article',
            '[role="main"] article'
          ];
          
          for (const containerSel of containers) {
            const container = document.querySelector(containerSel);
            if (container) {
              const articleElements = container.querySelectorAll(sel.articles || 'article');
              if (articleElements.length > 0) {
                return Array.from(articleElements);
              }
            }
          }
          
          // Fallback: chercher tous les articles
          return Array.from(document.querySelectorAll('article'));
        };
        
        const articleElements = findArticles();
        
        return articleElements.slice(0, 10).map(article => {
          const titleEl = article.querySelector(sel.title || 'h2, h3, h1');
          const linkEl = article.querySelector(sel.link || 'a[href]');
          const imageEl = article.querySelector(sel.image || 'img');
          const dateEl = article.querySelector(sel.date || 'time, .date');
          const excerptEl = article.querySelector(sel.excerpt || '.excerpt, .summary, p');
          
          return {
            title: titleEl?.textContent?.trim() || '',
            link: linkEl?.getAttribute('href') || '',
            image: imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || '',
            date: dateEl?.getAttribute('datetime') || dateEl?.textContent || '',
            excerpt: excerptEl?.textContent?.trim() || ''
          };
        }).filter(a => a.title && a.link); // Filtrer les articles invalides
      }, selectors);
      
      // Convertir les URLs relatives en absolues
      const baseUrl = new URL(url);
      return articles.map(article => ({
        ...article,
        link: article.link.startsWith('http') 
          ? article.link 
          : new URL(article.link, baseUrl.origin).href,
        image: article.image && !article.image.startsWith('http')
          ? new URL(article.image, baseUrl.origin).href
          : article.image,
        hash: this.generateHash(article.link)
      }));
      
    } finally {
      await browser.close();
    }
  }
  
  // 3. SCRAPER ARTICLE COMPLET
  async scrapeFullArticle(articleUrl: string): Promise<any> {
    const browser = await chromium.launch({ headless: true });
    
    try {
      console.log(`[Scraper] Scraping full article: ${articleUrl}`);
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (compatible; GuideLyonBot/1.0)');
      
      await page.goto(articleUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Stratégies pour extraire le contenu selon le site
      const content = await page.evaluate(() => {
        // Sélecteurs communs pour articles
        const selectors = [
          'article',
          '[role="main"]',
          '.article-content',
          '.entry-content',
          '.post-content',
          '.content-article',
          'main article',
          '#content'
        ];
        
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            // Nettoyer le contenu
            const clone = element.cloneNode(true) as HTMLElement;
            
            // Supprimer éléments indésirables
            const removeSelectors = [
              'script', 'style', 'iframe', 'nav',
              '.ads', '.advertisement', '.social-share',
              '.comments', '.related-articles', '.newsletter',
              '[class*="share"]', '[class*="comment"]'
            ];
            
            removeSelectors.forEach(sel => {
              clone.querySelectorAll(sel).forEach(el => el.remove());
            });
            
            // Extraire le titre si présent
            const title = clone.querySelector('h1')?.textContent?.trim() || 
                         document.querySelector('h1')?.textContent?.trim() || '';
            
            return {
              title,
              html: clone.innerHTML,
              text: clone.textContent?.trim() || '',
              images: Array.from(clone.querySelectorAll('img')).map(img => ({
                src: img.src || img.dataset.src,
                alt: img.alt,
                caption: img.title
              })).filter(img => img.src)
            };
          }
        }
        
        // Fallback: prendre le body entier
        return {
          title: document.title,
          text: document.body.textContent?.trim() || '',
          html: '',
          images: []
        };
      });
      
      return content;
    } finally {
      await browser.close();
    }
  }
  
  // 4. Détection de doublons
  generateHash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }
  
  // 5. Vérifier si l'article existe déjà
  async isDuplicate(url: string, hash: string): Promise<boolean> {
    const { data } = await supabase
      .from('scraped_articles')
      .select('id')
      .or(`original_url.eq.${url},scraping_hash.eq.${hash}`)
      .single();
    
    return !!data;
  }
  
  // 6. Sauvegarder l'article scrapé
  async saveScrapedArticle(article: ScrapedArticle, source: any): Promise<string | null> {
    try {
      // Vérifier les doublons
      if (await this.isDuplicate(article.link, article.hash)) {
        console.log(`[Scraper] Duplicate article skipped: ${article.title}`);
        return null;
      }
      
      const { data, error } = await supabase
        .from('scraped_articles')
        .insert({
          source_name: source.name,
          source_url: source.url,
          original_url: article.link,
          original_title: article.title,
          original_content: article.content,
          original_excerpt: article.excerpt,
          original_image_url: article.image,
          original_publish_date: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
          scraping_hash: article.hash,
          status: 'scraped'
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('[Scraper] Error saving article:', error);
        return null;
      }
      
      console.log(`[Scraper] Article saved: ${article.title}`);
      return data.id;
    } catch (error) {
      console.error('[Scraper] Save error:', error);
      return null;
    }
  }
  
  // 7. Ajouter à la queue de traitement
  async addToQueue(articleId: string, sourceId: string, priority: number = 5): Promise<void> {
    await supabase
      .from('scraping_queue')
      .insert({
        source_id: sourceId,
        article_url: articleId,
        priority
      });
  }
}