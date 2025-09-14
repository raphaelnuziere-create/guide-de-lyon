import { NextRequest, NextResponse } from 'next/server';

// Utilitaire pour nettoyer les variables d'environnement
function cleanEnvVar(value: string | undefined): string | undefined {
  return value?.replace(/\n/g, '').trim() || undefined;
}

export async function GET() {
  try {
    console.log('🔍 DEBUG DIRECTUS CONFIG');
    
    // Vérifier les variables d'environnement
    const config = {
      directusUrl: cleanEnvVar(process.env.NEXT_PUBLIC_DIRECTUS_URL_NEW) || cleanEnvVar(process.env.NEXT_PUBLIC_DIRECTUS_URL) || 'NOT_SET',
      directusUrlOld: process.env.NEXT_PUBLIC_DIRECTUS_URL || 'NOT_SET',
      directusUrlNew: process.env.NEXT_PUBLIC_DIRECTUS_URL_NEW || 'NOT_SET',
      directusUrlCleaned: cleanEnvVar(process.env.NEXT_PUBLIC_DIRECTUS_URL_NEW) || 'NOT_SET',
      useDirectus: cleanEnvVar(process.env.NEXT_PUBLIC_USE_DIRECTUS_NEW) || cleanEnvVar(process.env.NEXT_PUBLIC_USE_DIRECTUS) || 'NOT_SET',
      useDirectusOld: process.env.NEXT_PUBLIC_USE_DIRECTUS || 'NOT_SET',
      useDirectusNew: process.env.NEXT_PUBLIC_USE_DIRECTUS_NEW || 'NOT_SET',
      adminEmail: cleanEnvVar(process.env.DIRECTUS_ADMIN_EMAIL) || 'NOT_SET',
      adminPasswordSet: !!process.env.DIRECTUS_ADMIN_PASSWORD,
      nodeEnv: process.env.NODE_ENV || 'NOT_SET'
    };

    console.log('📊 Config:', config);

    // Tester connexion directe à Directus
    let directusHealth = null;
    try {
      const directusUrl = cleanEnvVar(process.env.NEXT_PUBLIC_DIRECTUS_URL_NEW) || cleanEnvVar(process.env.NEXT_PUBLIC_DIRECTUS_URL);
      if (directusUrl) {
        const response = await fetch(`${directusUrl}/server/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        directusHealth = {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text()
        };
      }
    } catch (error) {
      directusHealth = {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Tester l'import du service Directus
    let directusServiceTest = null;
    try {
      const { directusService } = await import('@/lib/services/directus');
      directusServiceTest = {
        imported: true,
        hasLoginMethod: typeof directusService.login === 'function'
      };
    } catch (error) {
      directusServiceTest = {
        error: error instanceof Error ? error.message : 'Import failed'
      };
    }

    return NextResponse.json({
      success: true,
      config,
      directusHealth,
      directusServiceTest,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erreur debug:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur inconnue',
      stack: error.stack
    }, { status: 500 });
  }
}