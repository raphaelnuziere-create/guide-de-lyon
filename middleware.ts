import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/',
  '/annuaire',
  '/etablissement',
  '/evenements',
  '/blog',
  '/contact',
  '/a-propos',
  '/mentions-legales',
  '/connexion/pro',
  '/connexion/admin',
  '/inscription',
  '/login',
  // Anciennes routes pour compatibilité temporaire
  '/professionnel/connexion',
  '/professionnel/register',
  '/administration/connexion',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip pour les assets statiques et API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => {
    if (pathname === route) return true;
    if (route !== '/' && pathname.startsWith(route + '/')) return true;
    return false;
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Pour l'instant, on laisse passer toutes les autres routes
  // La protection sera gérée côté client par AuthContext
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - api (routes API)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};