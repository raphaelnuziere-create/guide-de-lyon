// Route de test pour la connexion OVH
import { NextResponse } from 'next/server';
import { UnifiedImageService } from '@/app/lib/services/image-service-unified';

export async function GET() {
  try {
    console.log('[Test OVH] Vérification de la configuration OVH');
    
    const imageService = new UnifiedImageService();
    
    // Vérifier les variables d'environnement
    const config = {
      hasAccessKey: !!process.env.OVH_S3_ACCESS_KEY,
      hasSecretKey: !!process.env.OVH_S3_SECRET_KEY,
      endpoint: process.env.OVH_S3_ENDPOINT || 'Non configuré',
      region: process.env.OVH_S3_REGION || 'Non configuré',
      bucket: process.env.OVH_S3_BUCKET || 'Non configuré',
    };
    
    // Tester la connexion si configuré
    let connectionTest = false;
    let testMessage = 'OVH non configuré';
    
    if (config.hasAccessKey && config.hasSecretKey) {
      connectionTest = await imageService.testOVHConnection();
      testMessage = connectionTest 
        ? '✅ Connexion OVH réussie !' 
        : '❌ Échec de connexion OVH';
    }
    
    // Tester le stockage d'une image si la connexion fonctionne
    let imageTest = null;
    if (connectionTest) {
      const testImageUrl = 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400';
      const storedUrl = await imageService.processImage(testImageUrl, 'test-ovh');
      imageTest = {
        success: !!storedUrl && storedUrl.includes(config.endpoint),
        originalUrl: testImageUrl,
        storedUrl: storedUrl
      };
    }
    
    return NextResponse.json({
      success: connectionTest,
      message: testMessage,
      configuration: {
        ...config,
        hasAccessKey: config.hasAccessKey ? '✅ Configuré' : '❌ Manquant',
        hasSecretKey: config.hasSecretKey ? '✅ Configuré' : '❌ Manquant',
      },
      connectionTest: connectionTest,
      imageTest: imageTest,
      instructions: !connectionTest ? 
        'Ajoutez les variables OVH dans .env.local (voir GUIDE_OVH_SETUP.md)' : 
        'OVH est configuré et fonctionne correctement !'
    });
    
  } catch (error) {
    console.error('[Test OVH] Erreur:', error);
    return NextResponse.json({
      error: 'Test échoué',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    }, { status: 500 });
  }
}