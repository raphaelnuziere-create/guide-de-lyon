import { supabase } from '@/app/lib/supabase/client';

export interface EstablishmentData {
  id: string;
  name: string;
  plan: 'basic' | 'pro' | 'expert';
  plan_expires_at?: string;
  plan_billing_cycle?: 'monthly' | 'yearly';
  phone?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  photos_count: number;
  events_this_month: number;
  views_this_month: number;
  clicks_phone: number;
  clicks_website: number;
  verified: boolean;
  vat_number?: string;
  blog_articles_remaining: number;
}

export interface PlanLimits {
  max_photos: number;
  max_events: number;
  can_show_homepage: boolean;
  can_show_newsletter: boolean;
  can_show_social: boolean;
}

export class EstablishmentService {
  /**
   * Récupérer les données complètes de l'établissement
   */
  static async getEstablishment(userId: string): Promise<EstablishmentData | null> {
    try {
      const { data, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching establishment:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getEstablishment:', error);
      return null;
    }
  }

  /**
   * Récupérer les limites du plan
   */
  static async getPlanLimits(plan: string): Promise<PlanLimits> {
    try {
      const { data, error } = await supabase
        .rpc('get_plan_limits', { p_plan: plan });

      if (error) {
        console.error('Error fetching plan limits:', error);
        // Retourner les limites par défaut
        return this.getDefaultLimits('basic');
      }

      return data[0] || this.getDefaultLimits(plan);
    } catch (error) {
      console.error('Error in getPlanLimits:', error);
      return this.getDefaultLimits(plan);
    }
  }

  /**
   * Limites par défaut (fallback)
   */
  static getDefaultLimits(plan: string): PlanLimits {
    switch (plan) {
      case 'expert':
        return {
          max_photos: 10,
          max_events: 6,
          can_show_homepage: true,
          can_show_newsletter: true,
          can_show_social: true
        };
      case 'pro':
        return {
          max_photos: 6,
          max_events: 3,
          can_show_homepage: true,
          can_show_newsletter: true,
          can_show_social: false
        };
      default:
        return {
          max_photos: 1,
          max_events: 3,
          can_show_homepage: false,
          can_show_newsletter: false,
          can_show_social: false
        };
    }
  }

  /**
   * Mettre à jour les informations de l'établissement
   */
  static async updateEstablishment(
    establishmentId: string,
    updates: Partial<EstablishmentData>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('establishments')
        .update(updates)
        .eq('id', establishmentId);

      if (error) {
        console.error('Error updating establishment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateEstablishment:', error);
      return false;
    }
  }

  /**
   * Incrémenter une statistique
   */
  static async incrementStat(
    establishmentId: string,
    stat: 'views_this_month' | 'clicks_phone' | 'clicks_website'
  ): Promise<void> {
    try {
      await supabase.rpc('increment', {
        table_name: 'establishments',
        row_id: establishmentId,
        column_name: stat,
        increment_value: 1
      });
    } catch (error) {
      console.error('Error incrementing stat:', error);
    }
  }

  /**
   * Vérifier si une action est autorisée selon le plan
   */
  static async canPerformAction(
    establishmentId: string,
    action: 'add_photo' | 'add_event' | 'show_homepage' | 'show_newsletter' | 'show_social'
  ): Promise<boolean> {
    try {
      const { data: establishment } = await supabase
        .from('establishments')
        .select('plan, photos_count, events_this_month')
        .eq('id', establishmentId)
        .single();

      if (!establishment) return false;

      const limits = await this.getPlanLimits(establishment.plan);

      switch (action) {
        case 'add_photo':
          return establishment.photos_count < limits.max_photos;
        case 'add_event':
          return establishment.events_this_month < limits.max_events;
        case 'show_homepage':
          return limits.can_show_homepage;
        case 'show_newsletter':
          return limits.can_show_newsletter;
        case 'show_social':
          return limits.can_show_social;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking action permission:', error);
      return false;
    }
  }

  /**
   * Obtenir le nombre d'événements restants ce mois
   */
  static getEventsRemaining(establishment: EstablishmentData): number {
    const limits = this.getDefaultLimits(establishment.plan);
    return Math.max(0, limits.max_events - establishment.events_this_month);
  }

  /**
   * Obtenir le nombre de photos restantes
   */
  static getPhotosRemaining(establishment: EstablishmentData): number {
    const limits = this.getDefaultLimits(establishment.plan);
    return Math.max(0, limits.max_photos - establishment.photos_count);
  }
}