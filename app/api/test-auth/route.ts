import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  
  // Test de configuration
  const config = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    currentUrl: process.env.NEXT_PUBLIC_APP_URL || 'non défini',
    nodeEnv: process.env.NODE_ENV,
  };

  // Créer le client Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // En production, les cookies peuvent être read-only
          }
        },
      },
    }
  );

  // Test de connexion
  let authStatus = 'non connecté';
  let userEmail = null;
  let sessionInfo = null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      authStatus = 'connecté';
      userEmail = session.user.email;
      sessionInfo = {
        expiresAt: new Date(session.expires_at! * 1000).toISOString(),
        provider: session.user.app_metadata.provider,
        emailConfirmed: session.user.email_confirmed_at ? 'oui' : 'non',
      };
    }
  } catch (error) {
    authStatus = 'erreur: ' + (error as Error).message;
  }

  // Test de la base de données
  let dbStatus = 'non testé';
  try {
    const { error } = await supabase.from('establishments').select('count').limit(1);
    dbStatus = error ? `erreur: ${error.message}` : 'connecté';
  } catch (error) {
    dbStatus = 'erreur: ' + (error as Error).message;
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    config,
    auth: {
      status: authStatus,
      email: userEmail,
      session: sessionInfo,
    },
    database: {
      status: dbStatus,
    },
    callbackUrl: `${config.currentUrl}/auth/callback`,
    help: {
      message: 'Vérifiez que callbackUrl est bien dans les Redirect URLs de Supabase Dashboard',
      dashboard: 'https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/url-configuration',
    }
  }, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}