// Service de réécriture d'articles avec OpenAI
import OpenAI from 'openai';
import { supabase } from '@/app/lib/supabase/client';

interface RewrittenArticle {
  title: string;
  metaDescription: string;
  content: string;
  excerpt: string;
  keywords: string[];
  category: string;
  confidence: number;
  tokensUsed?: number;
}

export class ArticleRewriterService {
  private openai: OpenAI | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  // Template de réécriture optimisé SEO pour Lyon
  async rewriteArticle(originalArticle: any): Promise<RewrittenArticle | null> {
    if (!this.openai) {
      console.error('[Rewriter] OpenAI not configured');
      return null;
    }

    const prompt = `
    Tu es un journaliste professionnel. Réécris cet article avec un ton NEUTRE et FACTUEL :
    
    ARTICLE ORIGINAL :
    Titre : ${originalArticle.original_title}
    Contenu : ${originalArticle.original_content?.substring(0, 3000)}
    Date : ${originalArticle.original_publish_date}
    
    RÈGLES STRICTES DE RÉÉCRITURE :
    
    1. TON JOURNALISTIQUE NEUTRE :
       - Style factuel et professionnel
       - Éviter les formulations promotionnelles
       - Pas de redondance sur "Lyon" ou "lyonnais"
       - Mentionner la localisation UNIQUEMENT quand c'est nécessaire
    
    2. STRUCTURE DE L'ARTICLE :
       - Longueur : 600-1000 mots
       - Introduction directe (2-3 phrases)
       - 3-4 sections avec titres H2 informatifs
       - Paragraphes courts et clairs
       - Conclusion factuelle
    
    3. CONTENU :
       - Garder TOUS les faits importants
       - Reformuler complètement (pas de copier-coller)
       - Ajouter du contexte SEULEMENT si pertinent
       - Éviter les digressions inutiles
    
    4. LOCALISATION SOBRE :
       - Mentionner Lyon/arrondissement UNE FOIS dans l'intro si nécessaire
       - Utiliser ensuite "la ville", "le secteur", "la zone" etc.
       - PAS de références touristiques sauf si le sujet le demande
       - Éviter les clichés sur Lyon (capitale de la gastronomie, etc.)
    
    5. ADAPTATION AU SUJET :
       - Faits divers/crimes : ton sobre, focus sur les faits
       - Culture/événements : informatif sans être promotionnel  
       - Économie/urbanisme : données et impacts concrets
       - Transport : informations pratiques prioritaires
    
    6. CE QU'IL NE FAUT PAS FAIRE :
       - Répéter "Lyon" dans chaque paragraphe
       - Ajouter des références locales forcées
       - Faire de la promotion touristique
       - Utiliser un ton trop léger sur des sujets sérieux
       - Inventer des détails non présents dans l'original
    
    9. FORMAT HTML RICHE :
       - Utilise <h2> pour les sous-titres
       - <p> pour chaque paragraphe
       - <strong> pour les points importants
       - <em> pour les nuances
       - <blockquote> pour les citations fictives
    
    10. NE JAMAIS :
        - Mentionner ou citer les sources originales
        - Dire "selon nos sources" ou équivalent
        - Utiliser un ton trop familier
        - Faire des articles trop courts (MINIMUM 1200 mots)
    
    FORMAT DE RÉPONSE OBLIGATOIRE (JSON) :
    {
      "title": "Nouveau titre accrocheur et SEO (max 60 caractères)",
      "metaDescription": "Description SEO engageante (max 155 caractères)",
      "content": "Article complet en HTML avec balises <h2>, <p>, <strong>, <em>",
      "excerpt": "Résumé percutant en 2-3 phrases",
      "keywords": ["lyon", "mot-clé-2", "mot-clé-3", "mot-clé-4", "mot-clé-5"],
      "category": "actualite|culture|sport|economie|societe|politique",
      "confidence": 0.85
    }
    
    RÈGLES ABSOLUES :
    - Vérifier la cohérence et l'exactitude des informations
    - Ne pas inventer de faits
    - Maintenir un ton neutre et professionnel
    - NE JAMAIS citer ou mentionner les sources (pas de "selon nos sources")
    - Présenter les informations comme des faits rapportés par notre rédaction
    - Ajouter de la valeur avec du contexte local pertinent
    `;

    try {
      console.log('[Rewriter] Rewriting article:', originalArticle.original_title);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: "Tu es un journaliste local expert de Lyon. Tu réécris des articles pour le Guide de Lyon en respectant l'éthique journalistique."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Validation de la réponse
      if (!result.title || !result.content || !result.excerpt) {
        throw new Error('Invalid response format from OpenAI');
      }

      // Enrichir le contenu HTML
      result.content = this.enrichHTMLContent(result.content);
      
      // Ajouter les tokens utilisés pour tracking des coûts
      result.tokensUsed = completion.usage?.total_tokens;
      
      console.log(`[Rewriter] Article rewritten successfully. Confidence: ${result.confidence}`);
      
      return result;
    } catch (error) {
      console.error('[Rewriter] OpenAI rewriting failed:', error);
      return null;
    }
  }

  // Enrichir le HTML avec des éléments SEO
  private enrichHTMLContent(content: string): string {
    // Ajouter des liens internes vers d'autres pages du site
    const internalLinks = [
      { text: 'Lyon', url: '/lyon' },
      { text: 'actualités', url: '/actualites' },
      { text: 'événements', url: '/evenements' },
      { text: 'culture lyonnaise', url: '/culture' }
    ];

    let enrichedContent = content;
    
    // Ajouter quelques liens internes (max 2-3 par article)
    let linksAdded = 0;
    for (const link of internalLinks) {
      if (linksAdded >= 2) break;
      const regex = new RegExp(`\\b${link.text}\\b`, 'i');
      if (enrichedContent.match(regex)) {
        enrichedContent = enrichedContent.replace(
          regex,
          `<a href="${link.url}" title="${link.text}">${link.text}</a>`
        );
        linksAdded++;
      }
    }

    return enrichedContent;
  }

  // Mots-clés locaux pour Lyon
  private getLocalKeywords(): string {
    const keywords = [
      'Rhône', 'Auvergne-Rhône-Alpes', 'Grand Lyon', 'Métropole de Lyon',
      'Presqu\'île', 'Croix-Rousse', 'Vieux Lyon', 'Part-Dieu', 'Confluence',
      'Bellecour', 'Fourvière', 'Gerland', 'Villeurbanne'
    ];
    return keywords[Math.floor(Math.random() * keywords.length)];
  }

  // Générer des variations de titre pour A/B testing
  async generateTitleVariations(title: string): Promise<string[]> {
    if (!this.openai) return [title];

    const prompt = `
    Génère 3 variations accrocheuses de ce titre pour un article sur Lyon :
    "${title}"
    
    Règles :
    - Maximum 60 caractères
    - Inclure "Lyon" si pertinent
    - Varier les styles : informatif, question, chiffre
    
    Format JSON :
    {
      "variations": [
        "Variation 1",
        "Variation 2",
        "Variation 3"
      ]
    }
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 200,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return result.variations || [title];
    } catch (error) {
      console.error('[Rewriter] Title variations failed:', error);
      return [title];
    }
  }

  // Sauvegarder l'article réécrit
  async saveRewrittenArticle(articleId: string, rewritten: RewrittenArticle): Promise<boolean> {
    try {
      const slug = this.generateSlug(rewritten.title);
      
      const { error } = await supabase
        .from('scraped_articles')
        .update({
          rewritten_title: rewritten.title,
          rewritten_content: rewritten.content,
          rewritten_excerpt: rewritten.excerpt,
          rewritten_meta_description: rewritten.metaDescription,
          keywords: rewritten.keywords,
          category: rewritten.category,
          slug: slug,
          ai_confidence_score: rewritten.confidence,
          openai_tokens_used: rewritten.tokensUsed,
          status: rewritten.confidence > 0.8 ? 'rewritten' : 'rejected',
          rewritten_at: new Date().toISOString(),
          author_name: 'Raphael',
          author_bio: 'Rédacteur en chef du Guide de Lyon'
        })
        .eq('id', articleId);

      if (error) {
        console.error('[Rewriter] Error saving rewritten article:', error);
        return false;
      }

      console.log(`[Rewriter] Article saved with slug: ${slug}`);
      return true;
    } catch (error) {
      console.error('[Rewriter] Save error:', error);
      return false;
    }
  }

  // Générer un slug SEO-friendly
  private generateSlug(title: string): string {
    const date = new Date().toISOString().split('T')[0];
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
    
    return `${slug}-lyon-${date}`;
  }

  // Générer du texte alternatif pour les images
  async generateImageAltText(imageUrl: string, context: string): Promise<string> {
    // Pour l'instant, générer un alt text basé sur le contexte
    const baseAlt = context.substring(0, 100);
    return `${baseAlt} - Actualité Lyon - Guide de Lyon`;
  }

  // Vérifier la qualité du contenu réécrit
  validateRewrittenContent(rewritten: RewrittenArticle): boolean {
    // Vérifications de base
    if (!rewritten.title || rewritten.title.length > 60) return false;
    if (!rewritten.metaDescription || rewritten.metaDescription.length > 160) return false;
    if (!rewritten.content || rewritten.content.length < 1000) return false;
    if (!rewritten.excerpt || rewritten.excerpt.length < 50) return false;
    if (!rewritten.keywords || rewritten.keywords.length < 3) return false;
    
    // Vérifier que le contenu contient des mots-clés importants
    const contentLower = rewritten.content.toLowerCase();
    const hasLyon = contentLower.includes('lyon');
    const hasLocalContext = ['rhône', 'métropole', 'lyonnais'].some(word => 
      contentLower.includes(word)
    );
    
    return hasLyon || hasLocalContext;
  }
}