import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, plan, billingPeriod } = await request.json();

    if (!priceId || !plan) {
      return NextResponse.json(
        { error: 'Prix ID et plan requis' },
        { status: 400 }
      );
    }

    console.log('💳 [Stripe] Création session checkout:', { priceId, plan, billingPeriod });

    // Configuration de la session Stripe
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      
      // URLs de redirection
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tarifs?canceled=true`,
      
      // Métadonnées pour identifier l'abonnement
      metadata: {
        plan: plan,
        billing_period: billingPeriod || 'monthly',
        source: 'guide-lyon-v3'
      },
      
      // Configuration de l'abonnement
      subscription_data: {
        metadata: {
          plan: plan,
          billing_period: billingPeriod || 'monthly',
          created_via: 'website'
        },
        trial_period_days: plan === 'pro' ? 7 : undefined, // 7 jours d'essai pour Pro
      },
      
      // Textes personnalisés
      custom_text: {
        submit: {
          message: `Vous allez souscrire au plan ${plan.toUpperCase()}. ${
            plan === 'pro' ? 'Profitez de 7 jours d\'essai gratuit !' : ''
          }`
        }
      },
      
      // Collecte des informations client
      customer_creation: 'always',
      billing_address_collection: 'required',
      
      // Configuration de la facturation
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Abonnement Guide de Lyon - Plan ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
          metadata: {
            plan: plan,
            service: 'Guide de Lyon - Annuaire d\'entreprises'
          }
        }
      },
      
      // Autoriser les codes promo
      allow_promotion_codes: true,
      
      // Configuration des taxes (si nécessaire)
      automatic_tax: {
        enabled: true,
      }
    };

    // Créer la session
    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('✅ [Stripe] Session créée:', session.id);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error: any) {
    console.error('❌ [Stripe] Erreur création session:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la session de paiement',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}