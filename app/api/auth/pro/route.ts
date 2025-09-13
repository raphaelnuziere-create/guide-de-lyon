import { NextRequest, NextResponse } from 'next/server';
import { directusService } from '@/lib/services/directus';

export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json();

    if (action === 'signup') {
      // Rediriger vers la page d'inscription - Plus de signup via API
      // Car nous utilisons maintenant Directus pour la création des comptes
      return NextResponse.json({
        success: false,
        error: 'Veuillez utiliser le formulaire d\'inscription sur /auth/pro/signup',
        redirectTo: '/auth/pro/signup'
      }, { status: 400 });

    } else if (action === 'signin') {
      // Connexion via Directus
      const result = await directusService.login(email, password);
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'Erreur de connexion' },
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