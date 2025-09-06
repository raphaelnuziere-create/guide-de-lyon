import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, newPassword } = body;
    
    if (!email || !newPassword) {
      return NextResponse.json({ 
        error: 'Email et nouveau mot de passe requis' 
      }, { status: 400 });
    }
    
    // Validation mot de passe
    if (newPassword.length < 6) {
      return NextResponse.json({ 
        error: 'Le mot de passe doit faire au moins 6 caractères' 
      }, { status: 400 });
    }
    
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Service key non configurée. Impossible de réinitialiser le mot de passe.',
        solution: 'Ajoutez SUPABASE_SERVICE_ROLE_KEY dans les variables Vercel'
      }, { status: 500 });
    }
    
    // Créer client admin avec service key
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
              // Ignorer
            }
          },
        },
      }
    );
    
    // 1. Récupérer l'utilisateur
    const { data: users, error: searchError } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email.eq.${email}`,
      page: 1,
      perPage: 1
    });
    
    if (searchError || !users || users.users.length === 0) {
      // Si l'utilisateur n'existe pas, le créer
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: newPassword,
        email_confirm: true, // Confirmer directement l'email
        user_metadata: {
          user_type: 'professional'
        }
      });
      
      if (createError) {
        return NextResponse.json({ 
          error: 'Impossible de créer l\'utilisateur',
          details: createError.message
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: true,
        action: 'created',
        message: 'Nouvel utilisateur créé avec succès',
        user: {
          id: newUser.user?.id,
          email: newUser.user?.email
        },
        nextStep: 'Connectez-vous sur /auth/pro/connexion'
      });
    }
    
    const user = users.users[0];
    
    // 2. Mettre à jour le mot de passe ET confirmer l'email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { 
        password: newPassword,
        email_confirm: true,
        phone_confirm: true,
        ban_duration: 'none'
      }
    );
    
    if (updateError) {
      return NextResponse.json({ 
        error: 'Erreur mise à jour mot de passe',
        details: updateError.message
      }, { status: 400 });
    }
    
    // 3. Tenter une connexion immédiate pour vérifier
    const supabaseClient = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
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
              // Ignorer
            }
          },
        },
      }
    );
    
    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email,
      password: newPassword
    });
    
    return NextResponse.json({
      success: true,
      action: 'updated',
      message: 'Mot de passe réinitialisé avec succès',
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: true
      },
      canSignIn: !signInError,
      signInError: signInError?.message,
      nextStep: signInError 
        ? 'Attendez quelques secondes puis connectez-vous sur /auth/pro/connexion'
        : 'Vous pouvez vous connecter immédiatement sur /auth/pro/connexion'
    });
    
  } catch (error) {
    console.error('Force reset error:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de réinitialisation forcée du mot de passe',
    usage: {
      method: 'POST',
      body: {
        email: 'user@example.com',
        newPassword: 'NouveauMotDePasse123!'
      }
    },
    note: 'Force la réinitialisation ou crée l\'utilisateur si inexistant'
  });
}