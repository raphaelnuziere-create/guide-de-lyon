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
    
    // Créer le client Supabase avec service role pour contourner la confirmation email
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Client normal pour auth
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
    
    if (action === 'signup') {
      // 1. Créer le compte
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://www.guide-de-lyon.fr/auth/callback',
          data: {
            user_type: 'professional'
          }
        }
      });
      
      if (signUpError) {
        return NextResponse.json({
          success: false,
          error: signUpError.message,
        }, { status: 400 });
      }
      
      // 2. Si on a une clé service, confirmer automatiquement l'email
      if (supabaseServiceKey && signUpData.user) {
        const supabaseAdmin = createServerClient(
          supabaseUrl,
          supabaseServiceKey,
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
                  // Ignorer les erreurs de cookies
                }
              },
            },
          }
        );
        
        // Mettre à jour l'utilisateur pour confirmer l'email
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          signUpData.user.id,
          { email_confirm: true }
        );
        
        if (!updateError) {
          // 3. Connecter directement l'utilisateur
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!signInError && signInData.session) {
            return NextResponse.json({
              success: true,
              message: 'Compte créé et connecté avec succès',
              redirectTo: '/pro/inscription',
              session: true
            });
          }
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Inscription réussie. Vérifiez votre email pour confirmer.',
        needsConfirmation: true
      });
      
    } else if (action === 'signin') {
      // Connexion normale
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Si l'email n'est pas confirmé
        if (error.message.includes('Email not confirmed')) {
          return NextResponse.json({
            success: false,
            error: 'Email non confirmé. Vérifiez votre boîte mail.',
            needsConfirmation: true
          }, { status: 400 });
        }
        
        return NextResponse.json({
          success: false,
          error: error.message,
        }, { status: 400 });
      }
      
      if (data.session) {
        // Vérifier si l'utilisateur a un établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        return NextResponse.json({
          success: true,
          message: 'Connexion réussie',
          redirectTo: establishment ? '/pro/dashboard' : '/pro/inscription',
          session: true
        });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Action non reconnue'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      details: (error as Error).message
    }, { status: 500 });
  }
}