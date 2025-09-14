// =====================================================
// TYPES POUR LE SYSTÈME D'ABONNEMENT
// =====================================================

export type PlanType = 'basic' | 'pro' | 'expert';
export type BadgeType = null | 'verified' | 'expert';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'paused';
export type EstablishmentStatus = 'pending' | 'active' | 'suspended' | 'closed';
export type EventStatus = 'draft' | 'published' | 'canceled';
export type NewsletterFrequency = 'daily' | 'weekly' | 'monthly';

// Plan d'abonnement
export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: PlanType;
  price_monthly: number;
  price_yearly: number;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  
  // Limites
  max_photos: number;
  max_events_per_month: number;
  max_description_length: number;
  
  // Visibilité événements
  events_on_homepage: boolean;
  events_in_newsletter: boolean;
  events_on_social: boolean;
  
  // Features
  has_carousel: boolean;
  has_video: boolean;
  has_pdf_menu: boolean;
  has_reservation_link: boolean;
  has_statistics: boolean;
  statistics_days: number;
  
  // Annuaire
  directory_boost: number;
  badge_type: BadgeType;
  
  features: Record<string, any>;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Établissement professionnel
export interface Establishment {
  id: string;
  user_id: string;
  
  // Infos de base
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  
  // Contact
  email?: string;
  phone?: string;
  hide_email: boolean;
  hide_phone: boolean;
  website?: string;
  
  // Localisation
  address?: string;
  postal_code?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  
  // Réseaux sociaux
  facebook_url?: string;
  instagram_url?: string;
  
  // Documents légaux
  vat_number?: string;
  siret?: string;
  
  // Horaires
  opening_hours: OpeningHours;
  
  // Features
  reservation_link?: string;
  
  // Statut
  status: EstablishmentStatus;
  verified_at?: string;
  
  // Métadonnées
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  
  created_at: string;
  updated_at: string;
  
  // Relations (optionnel, chargé via joins)
  subscription?: Subscription;
  media?: EstablishmentMedia[];
  current_plan?: SubscriptionPlan;
}

// Horaires d'ouverture
export interface OpeningHours {
  [key: string]: {
    open?: string;
    close?: string;
    closed: boolean;
  };
}

// Abonnement actif
export interface Subscription {
  id: string;
  establishment_id: string;
  plan_id: string;
  
  // Stripe
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  
  // Statut
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  
  // Dates
  trial_start?: string;
  trial_end?: string;
  current_period_start?: string;
  current_period_end?: string;
  canceled_at?: string;
  
  // Quotas
  events_used_this_month: number;
  last_quota_reset: string;
  trial_event_published: boolean;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  plan?: SubscriptionPlan;
  establishment?: Establishment;
}

// Média (photos/vidéos)
export interface EstablishmentMedia {
  id: string;
  establishment_id: string;
  type: 'cover' | 'gallery' | 'video' | 'menu_pdf';
  url: string;
  thumbnail_url?: string;
  caption?: string;
  file_size?: number;
  mime_type?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// Événement
export interface Event {
  id: string;
  establishment_id: string;
  
  // Infos de base
  title: string;
  description?: string;
  
  // Dates
  start_date: string;
  end_date: string;
  
  // Catégorie
  category?: string;
  tags?: string[];
  
  // Média
  image_url?: string;
  
  // Visibilité
  show_on_homepage: boolean;
  show_in_newsletter: boolean;
  publish_to_social: boolean;
  
  // Capacité
  max_participants?: number;
  current_participants: number;
  
  // Liens
  booking_link?: string;
  
  // Statut
  status: EventStatus;
  published_at?: string;
  
  // Tracking social
  facebook_posted: boolean;
  instagram_posted: boolean;
  social_posted_at?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  establishment?: Establishment;
}

// Statistiques
export interface EstablishmentAnalytics {
  id: string;
  establishment_id: string;
  date: string;
  
  // Métriques
  profile_views: number;
  phone_clicks: number;
  website_clicks: number;
  direction_clicks: number;
  event_views: number;
  reservation_clicks: number;
  
  // Sources
  traffic_sources: {
    direct: number;
    search: number;
    social: number;
    newsletter: number;
    other: number;
  };
  
  created_at: string;
}

// Préférences newsletter
export interface NewsletterPreferences {
  id: string;
  email: string;
  frequency: NewsletterFrequency;
  receive_events: boolean;
  receive_news: boolean;
  receive_blog: boolean;
  is_active: boolean;
  unsubscribed_at?: string;
  last_sent_at?: string;
  total_sent: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// HELPERS ET CONSTANTES
// =====================================================

export const PLAN_FEATURES = {
  basic: {
    name: 'Basic',
    price_monthly: 0,
    price_yearly: 0,
    max_photos: 1,
    max_events: 3,
    events_homepage: false,
    events_newsletter: false,
    events_social: false,
    badge: null,
    color: 'gray'
  },
  pro: {
    name: 'Pro',
    price_monthly: 19,
    price_yearly: 182.40,
    max_photos: 6,
    max_events: 3,
    events_homepage: true,
    events_newsletter: true,
    events_social: false,
    badge: 'verified' as BadgeType,
    color: 'blue'
  },
  expert: {
    name: 'Expert',
    price_monthly: 49,
    price_yearly: 470.40,
    max_photos: 10,
    max_events: 5,
    events_homepage: true,
    events_newsletter: true,
    events_social: true,
    badge: 'expert' as BadgeType,
    color: 'gold'
  }
} as const;

// Fonction helper pour vérifier les limites
export function canAddPhoto(
  currentPhotos: number,
  plan: PlanType
): boolean {
  const maxPhotos = PLAN_FEATURES[plan].max_photos;
  return currentPhotos < maxPhotos;
}

export function canCreateEvent(
  eventsThisMonth: number,
  plan: PlanType
): boolean {
  const maxEvents = PLAN_FEATURES[plan].max_events;
  return eventsThisMonth < maxEvents;
}

export function getRemainingEvents(
  eventsUsed: number,
  plan: PlanType
): number {
  const maxEvents = PLAN_FEATURES[plan].max_events;
  return Math.max(0, maxEvents - eventsUsed);
}

export function getPlanBadgeStyles(badge: BadgeType): {
  text: string;
  bgColor: string;
  icon: string;
} {
  switch (badge) {
    case 'verified':
      return {
        text: 'Professionnel Vérifié',
        bgColor: 'bg-blue-100 text-blue-800',
        icon: '✓'
      };
    case 'expert':
      return {
        text: 'Expert Vérifié',
        bgColor: 'bg-yellow-100 text-yellow-800',
        icon: '⭐'
      };
    default:
      return {
        text: '',
        bgColor: '',
        icon: ''
      };
  }
}