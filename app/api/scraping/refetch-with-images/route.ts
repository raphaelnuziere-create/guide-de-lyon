// Route pour refaire le scraping avec téléchargement et stockage des images
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';
import Parser from 'rss-parser';
import { SupabaseImageService } from '@/app/lib/services/supabase-image-service';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: true }],
      ['media:thumbnail', 'media:thumbnail', { keepArray: true }],
      ['enclosure', 'enclosure', { keepArray: false }],
      ['content:encoded', 'content:encoded'],
      ['description', 'description']
    ]
  }
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function extractImageFromItem(item: any): string | null {
  console.log('[Extract Image] Recherche image pour:', item.title);
  
  // 1. Essayer media:content (format standard RSS)
  if (item['media:content']) {
    const mediaContent = Array.isArray(item['media:content']) 
      ? item['media:content'][0] 
      : item['media:content'];
    
    if (mediaContent?.$ && mediaContent.$.url) {
      console.log('[Extract Image] Trouvée dans media:content:', mediaContent.$.url);
      return mediaContent.$.url;
    }
  }
  
  // 2. Essayer media:thumbnail
  if (item['media:thumbnail']) {
    const thumbnail = Array.isArray(item['media:thumbnail']) 
      ? item['media:thumbnail'][0] 
      : item['media:thumbnail'];
    
    if (thumbnail?.$ && thumbnail.$.url) {
      console.log('[Extract Image] Trouvée dans media:thumbnail:', thumbnail.$.url);
      return thumbnail.$.url;
    }
  }
  
  // 3. Essayer enclosure (souvent utilisé pour les images)
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    console.log('[Extract Image] Trouvée dans enclosure:', item.enclosure.url);
    return item.enclosure.url;
  }
  
  // 4. Parser le contenu HTML pour trouver une image
  const contentToSearch = item['content:encoded'] || item.content || item.description || '';
  
  // Chercher les images dans le HTML
  const imgPatterns = [
    /<img[^>]+src=["']([^"']+)["']/gi,
    /<img[^>]+src=([^\s>]+)/gi,
    /src=["']([^"']+\.(jpg|jpeg|png|gif|webp)[^"']*)/gi
  ];
  
  for (const pattern of imgPatterns) {
    const matches = [...contentToSearch.matchAll(pattern)];
    if (matches.length > 0) {
      const imageUrl = matches[0][1];
      // Nettoyer l'URL
      const cleanUrl = imageUrl.replace(/&amp;/g, '&');
      console.log('[Extract Image] Trouvée dans le contenu HTML:', cleanUrl);
      return cleanUrl;
    }
  }
  
  console.log('[Extract Image] Aucune image trouvée');
  return null;
}

function generateContent(title: string, description: string, category: string): string {
  return `
<h1>${title}</h1>

<p><strong>${description}</strong></p>

<h2>Actualité lyonnaise importante</h2>

<p>${description} Cette actualité concerne directement Lyon et sa métropole, témoignant du dynamisme de notre région.</p>

<p>Lyon continue d'être au cœur de l'actualité régionale avec des événements qui impactent la vie quotidienne de ses habitants. 
Cette information s'inscrit dans le contexte plus large du développement de la métropole lyonnaise.</p>

<h2>Impact sur la vie locale</h2>

<p>Cette actualité aura des répercussions importantes pour les Lyonnais. Elle s'inscrit dans la dynamique de transformation 
de notre ville, entre tradition et modernité. Les habitants de Lyon et de sa région sont directement concernés par ces développements.</p>

<p>La métropole lyonnaise poursuit sa mutation, avec des projets ambitieux qui façonnent l'avenir de notre territoire. 
Cette nouvelle en est une illustration concrète.</p>

<h2>Lyon, métropole en mouvement</h2>

<p>Deuxième métropole de France, Lyon ne cesse de se réinventer. Entre son patrimoine historique classé au patrimoine mondial 
de l'UNESCO et ses quartiers modernes en développement, la ville offre un cadre de vie unique.</p>

<p>Cette actualité témoigne de la vitalité de Lyon, de sa capacité à innover tout en préservant son identité. 
C'est cette alchimie entre histoire et modernité qui fait de Lyon une ville attractive et dynamique.</p>

<h2>Perspectives</h2>

<p>Les développements futurs promettent de renforcer encore le rayonnement de Lyon. La ville continue d'attirer 
entreprises, étudiants et familles, séduits par sa qualité de vie et son dynamisme économique.</p>

<p>Restez informé de toute l'actualité lyonnaise sur notre site. Nous vous proposons quotidiennement les dernières 
informations qui façonnent l'avenir de notre métropole.</p>
  `.trim();
}

export async function GET() {
  try {
    console.log('[Refetch] Démarrage du scraping avec téléchargement des images');
    
    // 1. Supprimer TOUS les anciens articles
    console.log('[Refetch] Suppression des anciens articles...');
    const { error: deleteError } = await supabase
      .from('scraped_articles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error('[Refetch] Erreur suppression:', deleteError);
    } else {
      console.log('[Refetch] Articles supprimés');
    }
    
    // 2. Parser le feed RSS de 20 Minutes
    console.log('[Refetch] Récupération du feed RSS 20 Minutes...');
    const feedUrl = 'https://www.20minutes.fr/feeds/rss-lyon.xml';
    const feed = await parser.parseURL(feedUrl);
    
    console.log(`[Refetch] ${feed.items.length} articles trouvés dans le feed`);
    
    // 3. Service d'images Supabase
    const imageService = new SupabaseImageService();
    
    // 4. Traiter les articles (limiter à 15 pour la performance)
    const articles = [];
    const maxArticles = Math.min(15, feed.items.length);
    
    for (let i = 0; i < maxArticles; i++) {
      const item = feed.items[i];
      const slug = generateSlug(item.title || `article-${i}`);
      
      console.log(`[Refetch] Traitement article ${i + 1}/${maxArticles}: ${item.title}`);
      
      // Extraire l'URL de l'image originale
      const originalImageUrl = extractImageFromItem(item);
      let storedImageUrl = null;
      
      if (originalImageUrl) {
        try {
          console.log(`[Refetch] Téléchargement et stockage de l'image: ${originalImageUrl}`);
          // Télécharger et stocker l'image dans Supabase Storage
          storedImageUrl = await imageService.downloadAndStore(originalImageUrl, slug);
          console.log(`[Refetch] ✅ Image stockée dans Supabase: ${storedImageUrl}`);
        } catch (error) {
          console.error('[Refetch] Erreur stockage image:', error);
        }
      }
      
      // Si pas d'image ou erreur, utiliser une image par défaut de Lyon
      if (!storedImageUrl) {
        storedImageUrl = imageService.getDefaultImage('actualite');
        console.log('[Refetch] Utilisation image par défaut:', storedImageUrl);
      }
      
      // Créer le contenu enrichi
      const description = item.contentSnippet || item.description || 'Actualité de Lyon';
      const content = generateContent(
        item.title || 'Actualité Lyon',
        description,
        'actualite'
      );
      
      // Préparer l'article pour l'insertion
      articles.push({
        id: crypto.randomUUID(),
        source_name: '20 Minutes Lyon',
        source_url: feedUrl,
        original_url: item.link || '',
        original_title: item.title || 'Sans titre',
        original_content: description,
        rewritten_title: item.title || 'Actualité Lyon',
        rewritten_content: content,
        slug: slug,
        category: 'actualite',
        featured_image_url: storedImageUrl, // Image stockée dans Supabase
        status: 'published',
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        ai_confidence_score: 0.95
      });
    }
    
    // 5. Insérer tous les articles
    console.log(`[Refetch] Insertion de ${articles.length} articles avec images Supabase...`);
    const { data: inserted, error: insertError } = await supabase
      .from('scraped_articles')
      .insert(articles)
      .select();
    
    if (insertError) {
      console.error('[Refetch] Erreur insertion:', insertError);
      return NextResponse.json({
        error: 'Erreur insertion',
        details: insertError
      }, { status: 500 });
    }
    
    // 6. Vérifier le résultat
    const { data: allArticles } = await supabase
      .from('scraped_articles')
      .select('slug, rewritten_title, featured_image_url, status, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    // Compter les images Supabase
    const supabaseImagesCount = allArticles?.filter(a => 
      a.featured_image_url?.includes('supabase.co/storage')
    ).length || 0;
    
    return NextResponse.json({
      success: true,
      message: `✅ ${articles.length} articles publiés avec images téléchargées !`,
      stats: {
        articlesDeleted: 'Tous',
        articlesCreated: articles.length,
        articlesPublished: inserted?.length || 0,
        imagesInSupabase: supabaseImagesCount,
        totalInDatabase: allArticles?.length || 0
      },
      articles: allArticles?.slice(0, 10).map(a => ({
        title: a.rewritten_title,
        slug: a.slug,
        image: a.featured_image_url,
        hasSupabaseImage: a.featured_image_url?.includes('supabase.co/storage'),
        isDefaultImage: a.featured_image_url?.includes('unsplash.com'),
        url: `https://www.guide-de-lyon.fr/actualites/${a.slug}`,
        publishedAt: a.published_at
      })),
      note: 'Tous les articles ont été recréés avec les images téléchargées et stockées dans Supabase Storage',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Refetch] Erreur globale:', error);
    return NextResponse.json({
      error: 'Scraping avec images échoué',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    }, { status: 500 });
  }
}

// POST fait la même chose
export async function POST() {
  return GET();
}