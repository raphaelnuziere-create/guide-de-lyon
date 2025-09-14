import { createDirectus, rest, authentication, readItems, createItem, updateItem, deleteItem } from '@directus/sdk';

// Configuration Directus - Guide Lyon v3
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

if (!directusUrl) {
  throw new Error('NEXT_PUBLIC_DIRECTUS_URL must be defined');
}

// Client Directus global
export const directus = createDirectus(directusUrl)
  .with(rest())
  .with(authentication());

// Types pour Guide Lyon v3
export interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: 'restaurant' | 'bar' | 'cafe' | 'boutique' | 'services' | 'culture' | 'loisirs';
  plan: 'basic' | 'pro' | 'expert';
  badge_type?: 'verified' | 'expert' | null;
  display_priority: number;
  photos_quota: number;
  events_quota: number;
  events_used_this_month: number;
  address?: string;
  postal_code?: string;
  city: string;
  phone?: string;
  website?: string;
  email?: string;
  owner_email: string;
  owner_name?: string;
  views_count: number;
  gallery?: any[];
  opening_hours?: any;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_expires_at?: string;
  status: 'pending' | 'active' | 'suspended' | 'archived';
  date_created: string;
  date_updated: string;
}

export interface Event {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  event_date: string;
  end_date?: string;
  location?: string;
  price?: number;
  visible_homepage: boolean;
  visible_newsletter: boolean;
  visible_social: boolean;
  status: 'draft' | 'published' | 'canceled';
  date_created: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  author: string;
  status: 'draft' | 'published';
  published_at?: string;
  views_count: number;
  date_created: string;
  date_updated: string;
}

// Configuration des plans - Source de vérité
export const PLANS = {
  basic: {
    name: 'Basic',
    price_monthly: 0,
    price_yearly: 0,
    photos_quota: 1,
    events_quota: 3,
    visible_homepage: false,
    visible_newsletter: false,
    visible_social: false,
    badge_type: null,
    display_priority: 3,
    color: 'gray'
  },
  pro: {
    name: 'Pro', 
    price_monthly: 19,
    price_yearly: 182.40,
    photos_quota: 6,
    events_quota: 3,
    visible_homepage: true,
    visible_newsletter: true,
    visible_social: false,
    badge_type: 'verified',
    display_priority: 2,
    color: 'blue'
  },
  expert: {
    name: 'Expert',
    price_monthly: 49,
    price_yearly: 470.40,
    photos_quota: 10,
    events_quota: 5,
    visible_homepage: true,
    visible_newsletter: true,
    visible_social: true,
    badge_type: 'expert',
    display_priority: 1,
    color: 'gold'
  }
} as const;

// Helpers
export const getPlanConfig = (plan: keyof typeof PLANS) => PLANS[plan];

export const canUserPerformAction = (
  userPlan: keyof typeof PLANS, 
  action: 'upload_photo' | 'create_event' | 'homepage_visibility',
  currentCount?: number
) => {
  const config = getPlanConfig(userPlan);
  
  switch (action) {
    case 'upload_photo':
      return (currentCount || 0) < config.photos_quota;
    case 'create_event':
      return (currentCount || 0) < config.events_quota;
    case 'homepage_visibility':
      return config.visible_homepage;
    default:
      return false;
  }
};

// Service API simplifié
export class DirectusAPI {
  // Businesses
  static async getBusinesses(filters?: any) {
    return await directus.request(
      readItems('businesses', {
        filter: { status: { _eq: 'active' }, ...filters },
        sort: ['display_priority', '-date_created']
      })
    );
  }

  static async getBusinessBySlug(slug: string) {
    const results = await directus.request(
      readItems('businesses', {
        filter: { slug: { _eq: slug }, status: { _eq: 'active' } },
        limit: 1
      })
    );
    return results[0] || null;
  }

  // Events
  static async getEvents(filters?: any) {
    return await directus.request(
      readItems('events', {
        filter: { status: { _eq: 'published' }, ...filters },
        sort: ['-event_date']
      })
    );
  }

  // Articles
  static async getArticles(filters?: any) {
    return await directus.request(
      readItems('articles', {
        filter: { status: { _eq: 'published' }, ...filters },
        sort: ['-published_at']
      })
    );
  }
}

export default directus;
