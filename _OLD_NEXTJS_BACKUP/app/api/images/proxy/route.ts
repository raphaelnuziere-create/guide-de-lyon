// Route API pour servir les images avec téléchargement à la volée
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Cache en mémoire pour éviter les téléchargements répétés
const imageCache = new Map<string, Buffer>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');
    const slug = searchParams.get('slug') || 'default';

    if (!imageUrl) {
      return new NextResponse('URL d\'image requise', { status: 400 });
    }

    // Générer une clé de cache
    const cacheKey = createHash('md5').update(imageUrl).digest('hex');

    // Vérifier le cache en mémoire
    if (imageCache.has(cacheKey)) {
      console.log('[ImageProxy] Image servie depuis le cache');
      const buffer = imageCache.get(cacheKey)!;
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    console.log('[ImageProxy] Téléchargement de:', imageUrl);

    // Télécharger l'image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Guide-de-Lyon/1.0)',
      },
    });

    if (!response.ok) {
      console.error('[ImageProxy] Erreur téléchargement:', response.status);
      // Retourner une image par défaut
      return NextResponse.redirect('https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    // Mettre en cache (limiter la taille du cache)
    if (imageCache.size < 100) {
      imageCache.set(cacheKey, buffer);
    }

    // Retourner l'image avec des headers de cache appropriés
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Image-Source': 'proxy',
      },
    });

  } catch (error) {
    console.error('[ImageProxy] Erreur:', error);
    // Rediriger vers une image par défaut en cas d'erreur
    return NextResponse.redirect('https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200');
  }
}