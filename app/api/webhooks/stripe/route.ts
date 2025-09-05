import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { emailTemplates } from '@/app/services/email';

// Fonction pour obtenir l'instance Stripe
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn('Stripe non configuré - STRIPE_SECRET_KEY manquante');
    return null;
  }
  return new Stripe(key, {
    apiVersion: '2024-12-18.acacia'
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!stripe || !endpointSecret) {
    return NextResponse.json(
      { error: 'Stripe non configuré' },
      { status: 503 }
    );
  }
  
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  
  if (!sig) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    );
  }
  
  let event: Stripe.Event;
  
  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('❌ Erreur webhook signature:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
  
  // Traiter les différents types d'événements
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Paiement réussi:', session.id);
        
        // Récupérer les détails du client
        const customerEmail = session.customer_email || session.customer_details?.email;
        
        if (customerEmail) {
          // Envoyer email de confirmation
          await emailTemplates.sendOrderConfirmation(customerEmail, {
            reference: session.id,
            amount: (session.amount_total || 0) / 100, // Convertir de centimes en euros
            plan: session.metadata?.plan || 'Standard'
          });
        }
        
        // TODO: Mettre à jour la base de données
        // await updateUserSubscription(session.customer, session.metadata);
        
        break;
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ PaymentIntent réussi:', paymentIntent.id);
        
        // TODO: Marquer la commande comme payée
        // await markOrderAsPaid(paymentIntent.id);
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Échec de paiement:', paymentIntent.id);
        
        // TODO: Notifier le client
        // await notifyPaymentFailed(paymentIntent);
        
        break;
      }
      
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('✅ Abonnement créé:', subscription.id);
        
        // TODO: Activer l'abonnement dans la base de données
        // await activateSubscription(subscription);
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Abonnement mis à jour:', subscription.id);
        
        // TODO: Mettre à jour l'abonnement
        // await updateSubscription(subscription);
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('❌ Abonnement annulé:', subscription.id);
        
        // TODO: Désactiver l'abonnement
        // await cancelSubscription(subscription);
        
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('✅ Facture payée:', invoice.id);
        
        // Envoyer la facture par email si possible
        if (invoice.customer_email) {
          // TODO: Envoyer facture
          console.log('Envoi facture à:', invoice.customer_email);
        }
        
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('❌ Échec paiement facture:', invoice.id);
        
        // Notifier le client
        if (invoice.customer_email) {
          // TODO: Envoyer notification d'échec
          console.log('Notification échec à:', invoice.customer_email);
        }
        
        break;
      }
      
      default:
        console.log(`⚠️ Event non géré: ${event.type}`);
    }
    
    // Retourner une réponse 200 pour confirmer la réception
    return NextResponse.json({ 
      received: true,
      type: event.type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Erreur traitement webhook:', error);
    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 500 }
    );
  }
}

// Route GET pour vérifier que le webhook est configuré
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook Stripe configuré',
    endpoint: '/api/webhooks/stripe',
    events: [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed'
    ],
    configured: !!process.env.STRIPE_WEBHOOK_SECRET
  });
}