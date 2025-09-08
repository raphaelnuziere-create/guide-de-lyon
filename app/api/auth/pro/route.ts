import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { action, email, password } = await request.json();

    if (action === 'signup') {
      // Créer le compte
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${request.headers.get('origin')}/auth/callback`
        }
      });

      if (authError) {
        return NextResponse.json(
          { success: false, error: authError.message },
          { status: 400 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la création du compte' },
          { status: 400 }
        );
      }

      // Créer l'établissement associé
      const { error: estError } = await supabase
        .from('establishments')
        .insert({
          owner_id: authData.user.id,
          name: 'Mon Établissement',
          email: email,
          plan: 'basic',
          is_active: true,
          address: 'À compléter',
          phone: 'À compléter'
        });

      if (estError) {
        console.error('Erreur création établissement:', estError);
        // On continue quand même, l'établissement peut être créé plus tard
      }

      return NextResponse.json({
        success: true,
        message: 'Compte créé avec succès. Vérifiez votre email.',
        needsEmailConfirmation: true
      });

    } else if (action === 'signin') {
      // Connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        redirectTo: '/pro/dashboard'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Erreur API auth/pro:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}