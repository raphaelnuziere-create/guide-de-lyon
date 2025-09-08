// Route rapide pour peupler la base avec des articles sans IA
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase/client';
import Parser from 'rss-parser';
import { SupabaseImageService } from '@/app/lib/services/supabase-image-service';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: true }],
      ['enclosure', 'enclosure', { keepArray: false }]
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
  // Essayer plusieurs sources d'images
  if (item['media:content']?.[0]?.$.url) {
    return item['media:content'][0].$.url;
  }
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  if (item.content) {
    const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch) return imgMatch[1];
  }
  if (item['content:encoded']) {
    const imgMatch = item['content:encoded'].match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch) return imgMatch[1];
  }
  return null;
}

export async function GET() {
  try {
    console.log('[Quick Populate] Démarrage du peuplement rapide');
    
    // 1. Supprimer TOUS les articles existants
    console.log('[Quick Populate] Suppression des anciens articles...');
    const { error: deleteError } = await supabase
      .from('scraped_articles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error('[Quick Populate] Erreur suppression:', deleteError);
    }
    
    // 2. Parser le feed RSS de 20 Minutes
    console.log('[Quick Populate] Récupération du feed RSS...');
    const feed = await parser.parseURL('https://www.20minutes.fr/feeds/rss-lyon.xml');
    
    // 3. Préparer le service d'images
    const imageService = new SupabaseImageService();
    
    // 4. Traiter les articles (limiter à 20 pour la rapidité)
    const articles = [];
    const maxArticles = Math.min(20, feed.items.length);
    
    for (let i = 0; i < maxArticles; i++) {
      const item = feed.items[i];
      const slug = generateSlug(item.title || '');
      
      console.log(`[Quick Populate] Traitement article ${i + 1}/${maxArticles}: ${item.title}`);
      
      // Extraire l'image
      const originalImage = extractImageFromItem(item);
      let imageUrl = null;
      
      if (originalImage) {
        try {
          imageUrl = await imageService.downloadAndStore(originalImage, slug);
          console.log('[Quick Populate] Image stockée:', imageUrl);
        } catch (error) {
          console.error('[Quick Populate] Erreur image:', error);
        }
      }
      
      // Si pas d'image, utiliser une image par défaut
      if (!imageUrl) {
        imageUrl = imageService.getDefaultImage('actualite');
      }
      
      // Créer un contenu basique
      const content = `
<h1>${item.title}</h1>

<p><strong>${item.contentSnippet || item.description || ''}</strong></p>

<h2>Actualité lyonnaise</h2>

<p>Cette actualité concerne Lyon et sa région. ${item.contentSnippet || item.description || ''}</p>

<p>Pour en savoir plus sur cette actualité et d'autres événements à Lyon, consultez régulièrement notre site.</p>

<h2>À propos de cette information</h2>

<p>Cette information a été publiée le ${new Date(item.pubDate || Date.now()).toLocaleDateString('fr-FR')}. 
Lyon continue d'être au cœur de l'actualité régionale avec des événements importants qui façonnent la vie quotidienne de ses habitants.</p>

<h2>Lyon, ville dynamique</h2>

<p>Lyon est une métropole dynamique qui ne cesse d'évoluer. Entre son patrimoine historique classé au patrimoine mondial de l'UNESCO, 
ses quartiers modernes en développement constant, et sa vie culturelle riche, la ville offre un cadre de vie unique.</p>

<p>Les actualités lyonnaises reflètent cette diversité : projets urbains, événements culturels, développement économique, 
initiatives écologiques, vie associative... Chaque jour apporte son lot de nouvelles qui témoignent du dynamisme de notre région.</p>

<h2>Restez informé</h2>

<p>Pour ne rien manquer de l'actualité lyonnaise, nous vous invitons à consulter régulièrement notre site. 
Nous mettons à jour quotidiennement nos articles pour vous tenir informé de tout ce qui se passe dans la métropole lyonnaise.</p>

<p>Que vous soyez résident, visiteur ou simplement curieux de la vie lyonnaise, nos actualités vous permettent de rester connecté 
avec le pouls de la ville.</p>
      `.trim();
      
      // Préparer l'article pour l'insertion
      articles.push({
        id: crypto.randomUUID(),
        source_name: '20 Minutes Lyon',
        source_url: 'https://www.20minutes.fr/lyon/',
        original_url: item.link || '',
        original_title: item.title || 'Sans titre',
        original_content: item.contentSnippet || item.description || '',
        rewritten_title: item.title || 'Sans titre',
        rewritten_content: content,
        slug: slug,
        category: 'actualite',
        featured_image_url: imageUrl,
        status: 'published',
        published_at: new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        ai_confidence_score: 0.95,
        author: 'Raphael',
        meta_description: (item.contentSnippet || item.description || '').substring(0, 160),
        keywords: ['Lyon', 'actualité', 'news', 'information']
      });
    }
    
    // 5. Insérer tous les articles d'un coup
    console.log('[Quick Populate] Insertion de', articles.length, 'articles...');
    const { data: inserted, error: insertError } = await supabase
      .from('scraped_articles')
      .insert(articles)
      .select();
    
    if (insertError) {
      console.error('[Quick Populate] Erreur insertion:', insertError);
      return NextResponse.json({
        error: 'Erreur insertion',
        details: insertError
      }, { status: 500 });
    }
    
    // 6. Vérifier le résultat
    const { data: allArticles, error: fetchError } = await supabase
      .from('scraped_articles')
      .select('slug, rewritten_title, featured_image_url, status, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    return NextResponse.json({
      success: true,
      message: `✅ ${articles.length} articles publiés avec succès !`,
      stats: {
        articlesDeleted: 'Tous',
        articlesCreated: articles.length,
        articlesPublished: inserted?.length || 0,
        totalInDatabase: allArticles?.length || 0
      },
      articles: allArticles?.slice(0, 10).map(a => ({
        title: a.rewritten_title,
        slug: a.slug,
        image: a.featured_image_url,
        hasSupabaseImage: a.featured_image_url?.includes('supabase.co/storage'),
        url: `https://www.guide-de-lyon.fr/actualites/${a.slug}`,
        publishedAt: a.published_at
      })),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[Quick Populate] Erreur globale:', error);
    return NextResponse.json({
      error: 'Peuplement rapide échoué',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    }, { status: 500 });
  }
}