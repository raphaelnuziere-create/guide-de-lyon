// Route de test pour Supabase Storage
import { NextResponse } from 'next/server';
import { SupabaseImageService } from '@/app/lib/services/supabase-image-service';
import { NewsScraperService } from '@/app/lib/scraping/scraper';

export async function GET() {
  try {
    console.log('[Test Supabase Storage] Démarrage du test');
    
    const imageService = new SupabaseImageService();
    
    // Tester la connexion
    const isConnected = await imageService.testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: '❌ Bucket non configuré',
        instructions: 'Exécutez le script SQL dans Supabase Dashboard : supabase/storage/create-bucket.sql',
        steps: [
          '1. Allez sur https://app.supabase.com',
          '2. Sélectionnez votre projet',
          '3. Allez dans SQL Editor',
          '4. Copiez-collez le contenu de supabase/storage/create-bucket.sql',
          '5. Cliquez sur Run',
          '6. Revenez tester ici'
        ]
      });
    }
    
    // Tester le téléchargement d'une image
    console.log('[Test Supabase Storage] Test de téléchargement d\'image');
    
    const scraper = new NewsScraperService();
    const articles = await scraper.scrapeRSS('https://www.20minutes.fr/feeds/rss-lyon.xml');
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        error: 'Aucun article trouvé pour tester'
      });
    }
    
    // Prendre le premier article avec une image
    const articleWithImage = articles.find(a => a.image);
    
    if (!articleWithImage || !articleWithImage.image) {
      return NextResponse.json({
        error: 'Aucun article avec image trouvé'
      });
    }
    
    // Télécharger et stocker l'image
    const storedUrl = await imageService.downloadAndStore(
      articleWithImage.image,
      'test-supabase-' + Date.now()
    );
    
    return NextResponse.json({
      success: true,
      message: '✅ Supabase Storage fonctionne !',
      test: {
        connectionOK: isConnected,
        article: articleWithImage.title,
        originalImage: articleWithImage.image,
        storedImage: storedUrl,
        isStoredInSupabase: storedUrl?.includes('supabase'),
      },
      note: 'Les images sont maintenant stockées dans Supabase Storage'
    });
    
  } catch (error) {
    console.error('[Test Supabase Storage] Erreur:', error);
    return NextResponse.json({
      error: 'Test échoué',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    }, { status: 500 });
  }
}