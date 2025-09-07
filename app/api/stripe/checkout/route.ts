// API Route pour créer une session de checkout Stripe
import { NextRequest, NextResponse } from 'next/server';
import { StripeCheckoutService } from '@/app/lib/stripe/checkout';
import { createClient } from '@supabase/supabase-js';

// Fonction pour obtenir le client Supabase
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('[Stripe Checkout] Supabase configuration missing');
    return null;
  }
  
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données de la requête
    const body = await request.json();
    const {
      userId,
      establishmentId,
      plan,
      billingCycle,
      email,
      vatNumber
    } = body;

    // Validation des données
    if (!userId || !establishmentId || !plan || !billingCycle || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Vérifier que le plan est valide
    if (!['pro', 'expert'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Créer les URLs de redirection
    const baseUrl = request.headers.get('origin') || 'https://www.guide-de-lyon.fr';
    const successUrl = `${baseUrl}/pro/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pro/dashboard?payment=cancelled`;

    // Créer la session Stripe
    const session = await StripeCheckoutService.createCheckoutSession({
      userId,
      establishmentId,
      plan,
      billingCycle,
      email,
      vatNumber,
      successUrl,
      cancelUrl
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url
    });

  } catch (error: any) {
    console.error('[API Stripe Checkout] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET pour vérifier le statut d'une session
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const status = await StripeCheckoutService.getSessionStatus(sessionId);

    return NextResponse.json(status);

  } catch (error: any) {
    console.error('[API Stripe Status] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}