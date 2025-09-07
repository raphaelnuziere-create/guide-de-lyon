// Configuration Stripe
import Stripe from 'stripe';

// Initialiser Stripe avec la clé secrète
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Configuration des produits et prix Stripe
export const STRIPE_PRODUCTS = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
    features: [
      '✅ 3 événements par mois',
      '✅ 10 photos par établissement',
      '✅ Visibilité sur la homepage',
      '✅ Présence dans la newsletter',
      '✅ Statistiques détaillées',
      '✅ Support prioritaire',
    ]
  },
  expert: {
    monthly: process.env.STRIPE_EXPERT_MONTHLY_PRICE_ID || 'price_expert_monthly',
    yearly: process.env.STRIPE_EXPERT_YEARLY_PRICE_ID || 'price_expert_yearly',
    features: [
      '✅ 6 événements par mois',
      '✅ 20 photos par établissement',
      '✅ Visibilité maximale homepage',
      '✅ Newsletter + Réseaux sociaux',
      '✅ Badge "Vérifié"',
      '✅ Mise en avant prioritaire',
      '✅ Statistiques avancées',
      '✅ Support VIP 24/7',
      '✅ Formation marketing offerte',
    ]
  }
};

// Configuration des webhooks
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

// Métadonnées personnalisées pour les sessions
export interface StripeMetadata {
  userId: string;
  establishmentId: string;
  plan: 'pro' | 'expert';
  billingCycle: 'monthly' | 'yearly';
}