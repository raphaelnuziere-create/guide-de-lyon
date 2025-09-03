import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/pro/login',
  '/pro/register',
  '/admin/login',
  '/api/public',
  '/api/homepage',
  '/blog',
  '/about',
  '/contact',
  '/a-propos',
  '/mentions-legales',
  '/annuaire',
  '/etablissement',
  '/evenements',
  '/evenement',
  '/restaurants',
  '/hotels',
  '/bars',
  '/culture',
  '/tourisme',
  '/shopping',
  '/transports',
  '/tarifs',
  '/inscription'
];

// Routes réservées aux merchants
const merchantRoutes = [
  '/pro/dashboard',
  '/pro/places',
  '/pro/events',
  '/pro/analytics',
  '/pro/billing',
  '/pro/settings',
  '/pro/upgrade',
  '/api/merchant'
];

// Routes réservées aux admins
const adminRoutes = [
  '/admin',
  '/api/admin'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log pour debug en production
  console.log('[Middleware] Processing:', pathname);

  // Skip pour les assets statiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // fichiers avec extension
  ) {
    console.log('[Middleware] Skipping static asset:', pathname);
    return NextResponse.next();
  }

  // Vérifier si la route est publique
  // Amélioration: vérifier exactement les routes pour éviter les conflits
  const isPublicRoute = publicRoutes.some(route => {
    // Vérifier la correspondance exacte
    if (pathname === route) return true;
    // Vérifier si c'est une sous-route (avec un / à la fin)
    if (route !== '/' && pathname.startsWith(route + '/')) return true;
    // Pour la racine, ne pas matcher les sous-routes
    if (route === '/' && pathname === '/') return true;
    return false;
  });

  if (isPublicRoute) {
    console.log('[Middleware] Public route, allowing access:', pathname);
    return NextResponse.next();
  }

  // Récupérer le token depuis les cookies
  const token = request.cookies.get('auth-token')?.value;
  console.log('[Middleware] Token present:', !!token);

  if (!token) {
    // Éviter la redirection si on est déjà sur une page de login
    if (pathname === '/pro/login' || pathname === '/admin/login' || pathname === '/login') {
      console.log('[Middleware] Already on login page, allowing access:', pathname);
      return NextResponse.next();
    }
    
    // Rediriger vers login si pas de token
    if (pathname.startsWith('/pro')) {
      return NextResponse.redirect(new URL('/pro/login', request.url));
    }
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Vérifier le token avec Firebase Admin SDK (à implémenter côté serveur)
    // Pour l'instant, on fait confiance au token client-side
    
    // TODO: Appeler une API route pour vérifier le token et le rôle
    // const verifyResponse = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   }
    // });
    
    // if (!verifyResponse.ok) {
    //   throw new Error('Invalid token');
    // }
    
    // const userData = await verifyResponse.json();

    // Pour l'instant, on laisse passer si token présent
    // En production, il faudra vérifier le rôle pour les routes merchant/admin
    
    return NextResponse.next();
  } catch (error) {
    // Token invalide, rediriger vers login
    const response = NextResponse.redirect(
      new URL(pathname.startsWith('/pro') ? '/pro/login' : '/login', request.url)
    );
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - api/public (routes API publiques)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!api/public|_next/static|_next/image|favicon.ico|public).*)',
  ],
};