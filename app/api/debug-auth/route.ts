import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, action } = body;
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email et mot de passe requis' 
      }, { status: 400 });
    }
    
    const cookieStore = await cookies();
    
    // Nettoyer les variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
    
    // Créer le client Supabase
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
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
              console.error('Cookie error:', error);
            }
          },
        },
      }
    );
    
    let result;
    
    if (action === 'signup') {
      // Test d'inscription
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://www.guide-de-lyon.fr/auth/callback',
        }
      });
    } else {
      // Test de connexion
      result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
    }
    
    if (result.error) {
      return NextResponse.json({
        success: false,
        error: result.error.message,
        errorDetails: {
          status: result.error.status,
          name: result.error.name,
          message: result.error.message,
        },
        debug: {
          supabaseUrl,
          action,
          email,
        }
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      action,
      user: result.data.user ? {
        id: result.data.user.id,
        email: result.data.user.email,
        emailConfirmed: result.data.user.email_confirmed_at,
        createdAt: result.data.user.created_at,
      } : null,
      session: result.data.session ? {
        accessToken: result.data.session.access_token ? 'présent' : 'absent',
        expiresAt: result.data.session.expires_at,
      } : null,
      message: action === 'signup' 
        ? 'Inscription réussie. Vérifiez votre email pour confirmer.' 
        : 'Connexion réussie.'
    });
    
  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de debug auth',
    usage: {
      method: 'POST',
      body: {
        email: 'user@example.com',
        password: 'password123',
        action: 'signin | signup'
      }
    },
    testUrl: 'https://www.guide-de-lyon.fr/api/debug-auth',
    note: 'Utilisez un outil comme Postman ou curl pour tester'
  });
}