// =====================================================
// CLIENT SUPABASE POUR LES ABONNEMENTS
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { 
  SubscriptionPlan, 
  Establishment, 
  Subscription,
  Event,
  EstablishmentMedia,
  PlanType,
  EstablishmentStatus
} from '@/app/lib/types/subscription';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =====================================================
// GESTION DES PLANS
// =====================================================

export async function getSubscriptionPlans() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  
  if (error) throw error;
  return data as SubscriptionPlan[];
}

export async function getPlanBySlug(slug: PlanType) {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data as SubscriptionPlan;
}

// =====================================================
// GESTION DES ÉTABLISSEMENTS
// =====================================================

export async function createEstablishment(data: {
  name: string;
  email?: string;
  phone?: string;
  vat_number: string;
  address?: string;
  description?: string;
}) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Non authentifié');

  const { data: establishment, error } = await supabase
    .from('establishments')
    .insert({
      ...data,
      user_id: user.user.id,
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) throw error;
  return establishment as Establishment;
}

export async function getMyEstablishment() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return null;

  const { data, error } = await supabase
    .from('establishments')
    .select(`
      *,
      subscription:subscriptions(
        *,
        plan:subscription_plans(*)
      ),
      media:establishment_media(*)
    `)
    .eq('user_id', user.user.id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Pas d'établissement
    throw error;
  }
  
  return data as Establishment & {
    subscription: Subscription & { plan: SubscriptionPlan };
    media: EstablishmentMedia[];
  };
}

export async function updateEstablishment(
  id: string,
  updates: Partial<Establishment>
) {
  const { data, error } = await supabase
    .from('establishments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Establishment;
}

// =====================================================
// GESTION DES ABONNEMENTS
// =====================================================

export async function createSubscription(
  establishmentId: string,
  planId: string,
  stripeData?: {
    subscription_id: string;
    customer_id: string;
  }
) {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      establishment_id: establishmentId,
      plan_id: planId,
      status: stripeData ? 'active' : 'trialing',
      stripe_subscription_id: stripeData?.subscription_id,
      stripe_customer_id: stripeData?.customer_id,
      trial_start: now.toISOString(),
      trial_end: trialEnd.toISOString(),
      current_period_start: now.toISOString(),
      current_period_end: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Subscription;
}

export async function getActiveSubscription(establishmentId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('establishment_id', establishmentId)
    .in('status', ['trialing', 'active'])
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data as Subscription & { plan: SubscriptionPlan };
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: Subscription['status']
) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status })
    .eq('id', subscriptionId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Subscription;
}

// =====================================================
// GESTION DES ÉVÉNEMENTS
// =====================================================

export async function createEvent(
  establishmentId: string,
  eventData: {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    category?: string;
    image_url?: string;
    booking_link?: string;
    max_participants?: number;
  }
) {
  // Vérifier le quota
  const canCreate = await checkEventQuota(establishmentId);
  if (!canCreate) {
    throw new Error('Quota d\'événements atteint pour ce mois');
  }

  // Récupérer le plan pour déterminer la visibilité
  const subscription = await getActiveSubscription(establishmentId);
  if (!subscription) {
    throw new Error('Aucun abonnement actif');
  }

  const visibility = {
    show_on_homepage: subscription.plan.events_on_homepage,
    show_in_newsletter: subscription.plan.events_in_newsletter,
    publish_to_social: subscription.plan.events_on_social
  };

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...eventData,
      ...visibility,
      establishment_id: establishmentId,
      status: 'published',
      published_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Si c'est un essai gratuit, marquer l'événement d'essai comme publié
  if (subscription.status === 'trialing' && !subscription.trial_event_published) {
    await supabase
      .from('subscriptions')
      .update({ trial_event_published: true })
      .eq('id', subscription.id);
  }
  
  return data as Event;
}

export async function getMyEvents(establishmentId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('establishment_id', establishmentId)
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  return data as Event[];
}

export async function updateEvent(
  eventId: string,
  updates: Partial<Event>
) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Event;
}

export async function deleteEvent(eventId: string) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);
  
  if (error) throw error;
}

// Vérifier le quota d'événements
export async function checkEventQuota(establishmentId: string) {
  const { data, error } = await supabase
    .rpc('can_create_event', { p_establishment_id: establishmentId });
  
  if (error) throw error;
  return data as boolean;
}

export async function getEventQuotaStatus(establishmentId: string) {
  const subscription = await getActiveSubscription(establishmentId);
  if (!subscription) return { used: 0, limit: 0, remaining: 0 };

  return {
    used: subscription.events_used_this_month,
    limit: subscription.plan.max_events_per_month,
    remaining: Math.max(0, subscription.plan.max_events_per_month - subscription.events_used_this_month)
  };
}

// =====================================================
// GESTION DES MÉDIAS
// =====================================================

export async function uploadMedia(
  establishmentId: string,
  file: File,
  type: EstablishmentMedia['type']
) {
  // Vérifier le quota de photos
  const subscription = await getActiveSubscription(establishmentId);
  if (!subscription) throw new Error('Aucun abonnement actif');

  if (type === 'gallery') {
    const { count } = await supabase
      .from('establishment_media')
      .select('*', { count: 'exact', head: true })
      .eq('establishment_id', establishmentId)
      .eq('type', 'gallery');
    
    if (count && count >= subscription.plan.max_photos) {
      throw new Error('Limite de photos atteinte pour votre plan');
    }
  }

  // Upload vers Supabase Storage
  const fileName = `${establishmentId}/${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('establishment-media')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;

  // Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('establishment-media')
    .getPublicUrl(fileName);

  // Sauvegarder en DB
  const { data, error } = await supabase
    .from('establishment_media')
    .insert({
      establishment_id: establishmentId,
      type,
      url: publicUrl,
      file_size: file.size,
      mime_type: file.type
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as EstablishmentMedia;
}

export async function getEstablishmentMedia(establishmentId: string) {
  const { data, error } = await supabase
    .from('establishment_media')
    .select('*')
    .eq('establishment_id', establishmentId)
    .eq('is_active', true)
    .order('display_order');
  
  if (error) throw error;
  return data as EstablishmentMedia[];
}

export async function deleteMedia(mediaId: string) {
  const { error } = await supabase
    .from('establishment_media')
    .update({ is_active: false })
    .eq('id', mediaId);
  
  if (error) throw error;
}

// =====================================================
// GESTION DES STATISTIQUES
// =====================================================

export async function getEstablishmentStats(
  establishmentId: string,
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('establishment_analytics')
    .select('*')
    .eq('establishment_id', establishmentId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function trackProfileView(establishmentId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // Utiliser upsert pour incrémenter ou créer
  const { error } = await supabase.rpc('increment_analytics', {
    p_establishment_id: establishmentId,
    p_date: today,
    p_field: 'profile_views'
  });
  
  if (error) console.error('Error tracking view:', error);
}

// =====================================================
// RECHERCHE ET ANNUAIRE
// =====================================================

export async function searchEstablishments(params: {
  category?: string;
  city?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('establishments')
    .select(`
      *,
      subscription:subscriptions!inner(
        plan:subscription_plans!inner(*)
      ),
      media:establishment_media(*)
    `, { count: 'exact' })
    .eq('status', 'active');

  if (params.category) {
    query = query.eq('category', params.category);
  }
  
  if (params.city) {
    query = query.eq('city', params.city);
  }
  
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  // Tri par boost du plan (Expert > Pro > Basic)
  query = query.order('subscription.plan.directory_boost', { ascending: false });
  query = query.order('created_at', { ascending: false });

  if (params.limit) {
    query = query.limit(params.limit);
  }
  
  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return {
    establishments: data as any[],
    total: count || 0
  };
}

export async function getPublicEstablishment(slug: string) {
  const { data, error } = await supabase
    .from('establishments')
    .select(`
      *,
      subscription:subscriptions(
        plan:subscription_plans(*)
      ),
      media:establishment_media(*),
      events:events(*)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single();
  
  if (error) throw error;
  
  // Tracker la vue
  if (data) {
    await trackProfileView(data.id);
  }
  
  return data;
}

// =====================================================
// ÉVÉNEMENTS PUBLICS
// =====================================================

export async function getUpcomingEvents(params: {
  limit?: number;
  category?: string;
  homepage_only?: boolean;
}) {
  const now = new Date().toISOString();
  
  let query = supabase
    .from('events')
    .select(`
      *,
      establishment:establishments!inner(
        name,
        slug,
        category,
        subscription:subscriptions!inner(
          plan:subscription_plans!inner(*)
        )
      )
    `)
    .eq('status', 'published')
    .gte('end_date', now)
    .order('start_date', { ascending: true });

  if (params.homepage_only) {
    query = query.eq('show_on_homepage', true);
  }
  
  if (params.category) {
    query = query.eq('category', params.category);
  }
  
  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data as any[];
}