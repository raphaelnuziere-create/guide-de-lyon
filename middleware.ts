import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
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
  // Anciennes routes pour compatibilité temporaire
  '/professionnel/connexion',
  '/professionnel/register',
  '/administration/connexion',
];

// Routes protégées par rôle
const merchantRoutes = [
  '/professionnel/dashboard',
  '/professionnel/places',
  '/professionnel/events',
  '/professionnel/settings',
  '/professionnel/upgrade',
];

const adminRoutes = [
  '/administration/dashboard',
  '/administration/users',
  '/administration/places',
  '/administration/reports',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { pathname } = req.nextUrl;

  // Skip pour les assets statiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // fichiers avec extension
  ) {
    return res;
  }

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => {
    if (pathname === route) return true;
    if (route !== '/' && pathname.startsWith(route + '/')) return true;
    return false;
  });

  // Si route publique, autoriser l'accès
  if (isPublicRoute) {
    return res;
  }

  // Récupérer la session
  const { data: { session } } = await supabase.auth.getSession();

  // Si pas de session, rediriger vers la connexion
  if (!session) {
    if (pathname.startsWith('/professionnel')) {
      return NextResponse.redirect(new URL('/connexion/pro', req.url));
    }
    if (pathname.startsWith('/administration')) {
      return NextResponse.redirect(new URL('/connexion/admin', req.url));
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Vérifier les permissions pour les routes protégées
  if (merchantRoutes.some(route => pathname.startsWith(route))) {
    // Récupérer le rôle depuis la base de données
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'merchant' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    // Récupérer le rôle depuis la base de données
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
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