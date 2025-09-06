import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email requis' 
      }, { status: 400 });
    }
    
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ 
        error: 'Service key non configurée' 
      }, { status: 500 });
    }
    
    // Utiliser la clé service pour avoir les droits admin
    const supabase = createServerClient(
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
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers({
      filter: `email.eq.${email}`,
      page: 1,
      perPage: 1
    });
    
    if (searchError) {
      return NextResponse.json({ 
        error: 'Erreur recherche utilisateur',
        details: searchError.message
      }, { status: 400 });
    }
    
    if (!users || users.users.length === 0) {
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }
    
    const user = users.users[0];
    
    // 2. Mettre à jour pour confirmer l'email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true,
        phone_confirm: true,
        ban_duration: 'none'
      }
    );
    
    if (updateError) {
      return NextResponse.json({ 
        error: 'Erreur mise à jour utilisateur',
        details: updateError.message
      }, { status: 400 });
    }
    
    // 3. Générer un lien de réinitialisation de mot de passe
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://www.guide-de-lyon.fr/auth/reset-password'
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Utilisateur réinitialisé',
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: true,
        createdAt: user.created_at,
      },
      resetLink: resetData?.properties?.action_link || null,
      instructions: [
        '1. Email confirmé automatiquement',
        '2. Utilisez le resetLink pour changer le mot de passe si nécessaire',
        '3. Ou connectez-vous avec votre mot de passe actuel'
      ]
    });
    
  } catch (error) {
    console.error('Reset user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de réinitialisation utilisateur',
    usage: {
      method: 'POST',
      body: {
        email: 'user@example.com'
      }
    },
    note: 'Confirme l\'email et génère un lien de reset si nécessaire'
  });
}