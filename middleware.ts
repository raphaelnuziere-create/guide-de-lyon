import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Middleware temporairement désactivé pour corriger les erreurs Edge Runtime
  // Toutes les routes sont autorisées pour le moment
  return NextResponse.next();
}

export const config = {
  matcher: [],
};