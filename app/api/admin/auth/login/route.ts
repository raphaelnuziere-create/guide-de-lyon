import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials, createAdminSession, isAdminConfigured } from '@/lib/auth/admin-auth';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/auth/login
 * Authentification admin avec identifiants en dur
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier que les identifiants admin sont configurés
    if (!isAdminConfigured()) {
      console.error('❌ Variables ADMIN_EMAIL et ADMIN_PASSWORD non configurées dans .env.local');
      return NextResponse.json(
        { 
          error: 'Configuration admin manquante',
          details: 'Ajoutez ADMIN_EMAIL et ADMIN_PASSWORD dans votre fichier .env.local'
        }, 
        { status: 500 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' }, 
        { status: 400 }
      );
    }

    // Valider les identifiants
    const isValid = validateAdminCredentials(email, password);

    if (!isValid) {
      console.log(`❌ Tentative de connexion admin échouée: ${email}`);
      
      // Ajouter un délai pour ralentir les attaques par force brute
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { error: 'Identifiants incorrects' }, 
        { status: 401 }
      );
    }

    // Créer la session admin
    const sessionToken = createAdminSession(email);
    
    // Créer la réponse avec le cookie sécurisé
    const response = NextResponse.json({
      success: true,
      message: 'Connexion admin réussie',
      admin: {
        email: email.trim().toLowerCase(),
        role: 'admin',
        loginAt: new Date().toISOString()
      }
    });

    // Définir le cookie de session sécurisé
    const cookieStore = cookies();
    response.cookies.set('admin-session', sessionToken, {
      httpOnly: true,       // Sécurisé côté serveur uniquement
      secure: process.env.NODE_ENV === 'production', // HTTPS en prod
      sameSite: 'lax',      // Protection CSRF
      maxAge: 24 * 60 * 60, // 24h en secondes
      path: '/administration' // Limiter aux routes admin
    });

    console.log(`✅ Connexion admin réussie: ${email}`);

    return response;

  } catch (error) {
    console.error('Erreur connexion admin:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth/login
 * Vérifier l'état de la session admin
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin-session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ authenticated: false });
    }

    // TODO: Vérifier la validité du token
    return NextResponse.json({ 
      authenticated: true,
      message: 'Session admin active'
    });

  } catch (error) {
    console.error('Erreur vérification session admin:', error);
    return NextResponse.json({ authenticated: false });
  }
}