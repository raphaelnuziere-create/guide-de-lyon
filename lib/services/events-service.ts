/**
 * Service de gestion des événements avec logique de plans d'abonnement
 * Implémente la logique business du système d'événements selon les plans Basic/Pro/Expert
 */

import { supabase } from '@/lib/supabase';

// Types et interfaces
export interface Event {
  id: string;
  establishment_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  address?: string;
  price?: number;
  capacity?: number;
  image_url?: string;
  visibility: 'establishment_only' | 'homepage' | 'newsletter';
  status: 'draft' | 'published' | 'cancelled' | 'archived';
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // Relations
  establishment_name?: string;
  establishment_slug?: string;
  establishment_plan?: string;
}

export interface EventQuota {
  plan: string;
  events_used: number;
  events_limit: number;
  can_create: boolean;
  remaining: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  address?: string;
  price?: number;
  capacity?: number;
  image_url?: string;
}

export class EventsService {
  
  /**
   * Vérifier les quotas d'événements pour un établissement
   */
  static async checkEventQuota(establishmentId: string, eventDate?: string): Promise<EventQuota | null> {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        return null;
      }

      const { data, error } = await supabase.rpc('check_event_quota', {
        p_establishment_id: establishmentId,
        p_event_date: eventDate || new Date().toISOString()
      });

      if (error) {
        console.error('Error checking event quota:', error);
        return null;
      }

      return data as EventQuota;
    } catch (error) {
      console.error('Exception in checkEventQuota:', error);
      return null;
    }
  }

  /**
   * Créer un nouvel événement
   */
  static async createEvent(establishmentId: string, eventData: CreateEventData): Promise<Event | null> {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        return null;
      }

      // D'abord vérifier les quotas
      const quota = await this.checkEventQuota(establishmentId, eventData.start_date);
      if (!quota?.can_create) {
        throw new Error(`Limite d'événements atteinte. Plan ${quota?.plan}: ${quota?.events_used}/${quota?.events_limit} événements utilisés ce mois.`);
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          establishment_id: establishmentId,
          ...eventData,
          status: 'published'
        })
        .select(`
          *,
          establishments!inner(name, slug, plan)
        `)
        .single();

      if (error) {
        console.error('Error creating event:', error);
        throw error;
      }

      return this.formatEvent(data);
    } catch (error) {
      console.error('Exception in createEvent:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un événement
   */
  static async updateEvent(eventId: string, eventData: Partial<CreateEventData>): Promise<Event | null> {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        return null;
      }

      const { data, error } = await supabase
        .from('events')
        .update({
          ...eventData,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select(`
          *,
          establishments!inner(name, slug, plan)
        `)
        .single();

      if (error) {
        console.error('Error updating event:', error);
        throw error;
      }

      return this.formatEvent(data);
    } catch (error) {
      console.error('Exception in updateEvent:', error);
      throw error;
    }
  }

  /**
   * Supprimer un événement
   */
  static async deleteEvent(eventId: string): Promise<boolean> {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        return false;
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception in deleteEvent:', error);
      return false;
    }
  }

  /**
   * Récupérer les événements d'un établissement
   */
  static async getEstablishmentEvents(establishmentId: string, includeAll = false): Promise<Event[]> {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        return [];
      }

      let query = supabase
        .from('events')
        .select(`
          *,
          establishments!inner(name, slug, plan)
        `)
        .eq('establishment_id', establishmentId);

      if (!includeAll) {
        query = query.eq('status', 'published');
      }

      query = query.order('start_date', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching establishment events:', error);
        return [];
      }

      return data?.map(this.formatEvent) || [];
    } catch (error) {
      console.error('Exception in getEstablishmentEvents:', error);
      return [];
    }
  }

  /**
   * Récupérer les événements par visibilité (homepage, newsletter, etc.)
   */
  static async getEventsByVisibility(
    visibility: 'homepage' | 'newsletter' | 'establishment_only' = 'homepage',
    limit = 10,
    offset = 0
  ): Promise<Event[]> {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        return [];
      }

      const { data, error } = await supabase.rpc('get_events_by_visibility', {
        p_visibility: visibility,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Error fetching events by visibility:', error);
        return [];
      }

      return data?.map((item: any) => ({
        id: item.id,
        establishment_id: item.establishment_id,
        title: item.title,
        description: item.description,
        start_date: item.start_date,
        end_date: item.end_date,
        start_time: item.start_time,
        end_time: item.end_time,
        location: item.location,
        address: item.address,
        price: item.price,
        capacity: item.capacity,
        image_url: item.image_url,
        visibility: visibility,
        status: 'published' as const,
        created_at: '',
        updated_at: '',
        establishment_name: item.establishment_name,
        establishment_slug: item.establishment_slug,
        establishment_plan: item.establishment_plan
      })) || [];
    } catch (error) {
      console.error('Exception in getEventsByVisibility:', error);
      return [];
    }
  }

  /**
   * Récupérer les événements pour la homepage (Pro + Expert)
   */
  static async getHomepageEvents(limit = 6): Promise<Event[]> {
    return this.getEventsByVisibility('homepage', limit);
  }

  /**
   * Récupérer les événements pour la newsletter (Expert uniquement)
   */
  static async getNewsletterEvents(limit = 10): Promise<Event[]> {
    return this.getEventsByVisibility('newsletter', limit);
  }

  /**
   * Rechercher des événements
   */
  static async searchEvents(
    query: string,
    filters: {
      category?: string;
      dateFrom?: string;
      dateTo?: string;
      priceMax?: number;
    } = {}
  ): Promise<Event[]> {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        return [];
      }

      let dbQuery = supabase
        .from('events')
        .select(`
          *,
          establishments!inner(name, slug, plan, category)
        `)
        .eq('status', 'published')
        .gte('start_date', new Date().toISOString());

      // Filtre par texte (titre ou description)
      if (query.trim()) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Filtre par catégorie d'établissement
      if (filters.category) {
        dbQuery = dbQuery.eq('establishments.category', filters.category);
      }

      // Filtre par date
      if (filters.dateFrom) {
        dbQuery = dbQuery.gte('start_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        dbQuery = dbQuery.lte('start_date', filters.dateTo);
      }

      // Filtre par prix max
      if (filters.priceMax) {
        dbQuery = dbQuery.lte('price', filters.priceMax);
      }

      dbQuery = dbQuery.order('start_date', { ascending: true }).limit(20);

      const { data, error } = await dbQuery;

      if (error) {
        console.error('Error searching events:', error);
        return [];
      }

      return data?.map(this.formatEvent) || [];
    } catch (error) {
      console.error('Exception in searchEvents:', error);
      return [];
    }
  }

  /**
   * Formater un événement depuis la base de données
   */
  private static formatEvent(data: any): Event {
    return {
      id: data.id,
      establishment_id: data.establishment_id,
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      address: data.address,
      price: data.price,
      capacity: data.capacity,
      image_url: data.image_url,
      visibility: data.visibility,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      published_at: data.published_at,
      establishment_name: data.establishments?.name,
      establishment_slug: data.establishments?.slug,
      establishment_plan: data.establishments?.plan
    };
  }

  /**
   * Obtenir les limites d'événements selon le plan
   */
  static getEventLimitsByPlan(plan: string): { maxEventsPerMonth: number; visibility: string } {
    switch (plan) {
      case 'basic':
        return { maxEventsPerMonth: 3, visibility: 'establishment_only' };
      case 'pro':
        return { maxEventsPerMonth: 3, visibility: 'homepage' };
      case 'expert':
        return { maxEventsPerMonth: 6, visibility: 'newsletter' };
      default:
        return { maxEventsPerMonth: 3, visibility: 'establishment_only' };
    }
  }

  /**
   * Formater une date pour l'affichage
   */
  static formatEventDate(dateString: string, locale = 'fr-FR'): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formater une heure pour l'affichage
   */
  static formatEventTime(timeString?: string): string {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    return `${hours}h${minutes !== '00' ? minutes : ''}`;
  }
}