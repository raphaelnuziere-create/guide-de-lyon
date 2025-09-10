import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/admin/auth/logout
 * Déconnexion admin - supprime la session
 */
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });

    // Supprimer le cookie de session
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immédiatement
      path: '/' // Même path que lors de la création
    });

    console.log('✅ Déconnexion admin réussie');

    return response;

  } catch (error) {
    console.error('Erreur déconnexion admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' }, 
      { status: 500 }
    );
  }
}