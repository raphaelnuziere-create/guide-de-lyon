// =====================================================
// SERVICE POUR LES ÉVÉNEMENTS PUBLICS
// =====================================================

import { supabase } from '@/app/lib/supabase/client';

export interface PublicEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  location?: string;
  address?: string;
  price?: number;
  image_url?: string;
  booking_link?: string;
  max_participants?: number;
  current_participants?: number;
  
  // Infos établissement
  establishment: {
    id: string;
    name: string;
    slug: string;
    verified: boolean;
    plan: 'basic' | 'pro' | 'expert';
  };
  
  // Visibilité
  show_on_homepage: boolean;
  show_in_newsletter: boolean;
  publish_to_social: boolean;
}

export class PublicEventsService {
  /**
   * Récupère les événements à venir visibles sur la homepage
   * Seuls les événements des plans Pro et Expert sont affichés
   */
  static async getUpcomingHomepageEvents(limit: number = 6): Promise<PublicEvent[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          establishment:establishments!inner(
            id,
            name,
            slug,
            verified,
            plan,
            subscription:subscriptions!inner(
              status,
              plan:subscription_plans!inner(
                events_on_homepage
              )
            )
          )
        `)
        .eq('status', 'published')
        .eq('show_on_homepage', true)
        .gte('end_date', now)
        .lte('start_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()) // Max 30 jours
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        return [];
      }

      // Filtrer pour ne garder que les événements Pro et Expert avec homepage activé
      const filteredEvents = (data || []).filter(event => {
        const plan = event.establishment?.plan;
        const canShowOnHomepage = event.establishment?.subscription?.plan?.events_on_homepage;
        return (plan === 'pro' || plan === 'expert') && canShowOnHomepage;
      });

      // Trier avec les événements Expert en premier
      return filteredEvents.sort((a, b) => {
        // Expert events first
        if (a.establishment.plan === 'expert' && b.establishment.plan !== 'expert') return -1;
        if (a.establishment.plan !== 'expert' && b.establishment.plan === 'expert') return 1;
        
        // Then by date
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });
    } catch (error) {
      console.error('Erreur getUpcomingHomepageEvents:', error);
      return [];
    }
  }

  /**
   * Récupère tous les événements publics (pour la page événements)
   */
  static async getAllPublicEvents(params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: PublicEvent[], total: number }> {
    try {
      const now = new Date().toISOString();
      
      let query = supabase
        .from('events')
        .select(`
          *,
          establishment:establishments!inner(
            id,
            name,
            slug,
            verified,
            plan
          )
        `, { count: 'exact' })
        .eq('status', 'published')
        .gte('end_date', now);

      // Filtres optionnels
      if (params?.category) {
        query = query.eq('category', params.category);
      }
      
      if (params?.startDate) {
        query = query.gte('start_date', params.startDate);
      }
      
      if (params?.endDate) {
        query = query.lte('start_date', params.endDate);
      }

      // Tri par plan puis par date
      query = query.order('start_date', { ascending: true });

      // Pagination
      if (params?.limit) {
        query = query.limit(params.limit);
      }
      
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params?.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Erreur getAllPublicEvents:', error);
        return { events: [], total: 0 };
      }

      // Trier avec boost selon le plan
      const sortedEvents = (data || []).sort((a, b) => {
        // Vérifiés en premier
        if (a.establishment.verified && !b.establishment.verified) return -1;
        if (!a.establishment.verified && b.establishment.verified) return 1;
        
        // Expert > Pro > Basic
        const planOrder = { expert: 3, pro: 2, basic: 1 };
        const planDiff = (planOrder[b.establishment.plan] || 0) - (planOrder[a.establishment.plan] || 0);
        if (planDiff !== 0) return planDiff;
        
        // Par date
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      });

      return {
        events: sortedEvents,
        total: count || 0
      };
    } catch (error) {
      console.error('Erreur getAllPublicEvents:', error);
      return { events: [], total: 0 };
    }
  }

  /**
   * Récupère les événements pour la newsletter
   */
  static async getNewsletterEvents(limit: number = 10): Promise<PublicEvent[]> {
    try {
      const now = new Date().toISOString();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          establishment:establishments!inner(
            id,
            name,
            slug,
            verified,
            plan,
            subscription:subscriptions!inner(
              status,
              plan:subscription_plans!inner(
                events_in_newsletter
              )
            )
          )
        `)
        .eq('status', 'published')
        .eq('show_in_newsletter', true)
        .gte('start_date', now)
        .lte('start_date', nextWeek)
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Erreur getNewsletterEvents:', error);
        return [];
      }

      // Filtrer pour ne garder que Pro et Expert avec newsletter activé
      return (data || []).filter(event => {
        const plan = event.establishment?.plan;
        const canShowInNewsletter = event.establishment?.subscription?.plan?.events_in_newsletter;
        return (plan === 'pro' || plan === 'expert') && canShowInNewsletter;
      });
    } catch (error) {
      console.error('Erreur getNewsletterEvents:', error);
      return [];
    }
  }

  /**
   * Récupère un événement public par son ID
   */
  static async getEventById(eventId: string): Promise<PublicEvent | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          establishment:establishments!inner(
            id,
            name,
            slug,
            verified,
            plan,
            description,
            phone,
            email,
            website,
            address,
            city,
            postal_code
          )
        `)
        .eq('id', eventId)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Erreur getEventById:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur getEventById:', error);
      return null;
    }
  }

  /**
   * Récupère les catégories d'événements disponibles
   */
  static async getEventCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('category')
        .eq('status', 'published')
        .gte('end_date', new Date().toISOString());

      if (error) {
        console.error('Erreur getEventCategories:', error);
        return [];
      }

      // Extraire les catégories uniques
      const categories = [...new Set(data?.map(e => e.category).filter(Boolean))];
      return categories.sort();
    } catch (error) {
      console.error('Erreur getEventCategories:', error);
      return [];
    }
  }

  /**
   * Incrémente le compteur de participants intéressés
   */
  static async incrementInterestedCount(eventId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_event_interested', {
        event_id: eventId
      });

      if (error) {
        console.error('Erreur incrementInterestedCount:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur incrementInterestedCount:', error);
      return false;
    }
  }
}