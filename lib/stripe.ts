// GUIDE DE LYON - CONFIGURATION STRIPE
// Générée automatiquement le 10/09/2025 23:46:50

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  priceIds: {
    pro: process.env.STRIPE_PRICE_ID_PRO!,
    boost: process.env.STRIPE_PRICE_ID_BOOST!,
  }
} as const;

export default stripe;
