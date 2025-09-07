// Service pour gérer les sessions de paiement Stripe
import { getStripe, STRIPE_PRODUCTS, StripeMetadata } from './config';
import { supabase } from '@/app/lib/supabase/client';

export interface CreateCheckoutSessionParams {
  userId: string;
  establishmentId: string;
  plan: 'pro' | 'expert';
  billingCycle: 'monthly' | 'yearly';
  email: string;
  vatNumber?: string;
  successUrl: string;
  cancelUrl: string;
}

export class StripeCheckoutService {
  /**
   * Crée une session de checkout Stripe
   */
  static async createCheckoutSession(params: CreateCheckoutSessionParams) {
    try {
      const stripe = getStripe();
      if (!stripe) {
        throw new Error('Stripe not configured');
      }

      const {
        userId,
        establishmentId,
        plan,
        billingCycle,
        email,
        vatNumber,
        successUrl,
        cancelUrl
      } = params;

      // Obtenir le prix selon le plan et le cycle
      const priceId = STRIPE_PRODUCTS[plan][billingCycle];

      // Créer la session Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          establishmentId,
          plan,
          billingCycle,
        } as StripeMetadata,
        subscription_data: {
          metadata: {
            userId,
            establishmentId,
            plan,
            billingCycle,
          },
          trial_period_days: 14, // 14 jours d'essai gratuit
        },
        // Collecter l'adresse de facturation et la TVA
        billing_address_collection: 'required',
        tax_id_collection: {
          enabled: true,
        },
        // URLs de redirection
        success_url: successUrl,
        cancel_url: cancelUrl,
        // Options supplémentaires
        allow_promotion_codes: true,
        locale: 'fr',
      });

      // Sauvegarder la session dans la base de données
      await this.saveCheckoutSession(session.id, params);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('[StripeCheckout] Error creating session:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde la session dans Supabase pour tracking
   */
  private static async saveCheckoutSession(
    sessionId: string, 
    params: CreateCheckoutSessionParams
  ) {
    try {
      const { error } = await supabase
        .from('stripe_sessions')
        .insert({
          session_id: sessionId,
          user_id: params.userId,
          establishment_id: params.establishmentId,
          plan: params.plan,
          billing_cycle: params.billingCycle,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('[StripeCheckout] Error saving session:', error);
      }
    } catch (error) {
      console.error('[StripeCheckout] Error:', error);
    }
  }

  /**
   * Vérifie le statut d'une session
   */
  static async getSessionStatus(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      return {
        status: session.payment_status,
        customerEmail: session.customer_email,
        subscriptionId: session.subscription,
        amountTotal: session.amount_total,
        currency: session.currency,
      };
    } catch (error) {
      console.error('[StripeCheckout] Error retrieving session:', error);
      throw error;
    }
  }

  /**
   * Annule un abonnement
   */
  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      return {
        canceled: true,
        cancelAt: subscription.cancel_at,
        currentPeriodEnd: subscription.current_period_end,
      };
    } catch (error) {
      console.error('[StripeCheckout] Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Réactive un abonnement annulé
   */
  static async reactivateSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          cancel_at_period_end: false,
        }
      );

      return {
        reactivated: true,
        status: subscription.status,
      };
    } catch (error) {
      console.error('[StripeCheckout] Error reactivating subscription:', error);
      throw error;
    }
  }

  /**
   * Change le plan d'abonnement
   */
  static async changePlan(
    subscriptionId: string,
    newPlan: 'pro' | 'expert',
    billingCycle: 'monthly' | 'yearly'
  ) {
    try {
      // Récupérer l'abonnement actuel
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Obtenir le nouveau prix
      const newPriceId = STRIPE_PRODUCTS[newPlan][billingCycle];
      
      // Mettre à jour l'abonnement
      const updatedSubscription = await stripe.subscriptions.update(
        subscriptionId,
        {
          items: [
            {
              id: subscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: 'create_prorations',
        }
      );

      return {
        updated: true,
        newPlan,
        billingCycle,
        nextInvoiceAmount: updatedSubscription.items.data[0].price.unit_amount,
      };
    } catch (error) {
      console.error('[StripeCheckout] Error changing plan:', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique de facturation
   */
  static async getBillingHistory(customerId: string) {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 12,
      });

      return invoices.data.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        date: new Date(invoice.created * 1000),
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: invoice.status,
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url,
      }));
    } catch (error) {
      console.error('[StripeCheckout] Error getting billing history:', error);
      throw error;
    }
  }

  /**
   * Crée un portail client pour gérer l'abonnement
   */
  static async createCustomerPortal(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('[StripeCheckout] Error creating portal session:', error);
      throw error;
    }
  }
}