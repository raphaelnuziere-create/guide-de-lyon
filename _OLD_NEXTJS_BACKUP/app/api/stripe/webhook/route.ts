import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia'
});

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log('✅ [Webhook] Stripe event received:', event.type);
  } catch (error: any) {
    console.error('❌ [Webhook] Signature error:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Gérer les événements Stripe
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('💳 Checkout completed:', event.data.object.id);
      // TODO: Mettre à jour le plan dans Directus
      break;
    
    case 'customer.subscription.created':
      console.log('🔄 Subscription created:', event.data.object.id);
      break;
      
    case 'customer.subscription.updated':
      console.log('🔄 Subscription updated:', event.data.object.id);
      break;
      
    default:
      console.log(`🔔 Unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}