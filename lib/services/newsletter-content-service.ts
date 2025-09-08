import { supabase } from '@/lib/supabase';

export interface NewsArticle {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  image_url?: string;
  published_at: string;
  source?: string;
  url?: string;
  category?: string;
}

export interface BlogArticle {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  image_url?: string;
  published_at: string;
  slug?: string;
  author?: string;
  category?: string;
  read_time?: number;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  price?: string;
  event_url?: string;
  image_url?: string;
  organizer?: string;
}

/**
 * Service pour récupérer les actualités
 */
export class NewsService {
  
  /**
   * Récupère les actualités du jour
   */
  static async getDailyNews(): Promise<NewsArticle[]> {
    if (!supabase) throw new Error('Supabase not configured');

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          image_url,
          published_at,
          source,
          url,
          category
        `)
        .gte('published_at', yesterday.toISOString().split('T')[0])
        .lte('published_at', today.toISOString().split('T')[0])
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération actualités quotidiennes:', error);
      return [];
    }
  }

  /**
   * Récupère les actualités de la semaine
   */
  static async getWeeklyNews(): Promise<NewsArticle[]> {
    if (!supabase) throw new Error('Supabase not configured');

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          image_url,
          published_at,
          source,
          url,
          category
        `)
        .gte('published_at', weekAgo.toISOString().split('T')[0])
        .order('published_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération actualités hebdomadaires:', error);
      return [];
    }
  }

  /**
   * Récupère les actualités du mois
   */
  static async getMonthlyNews(): Promise<NewsArticle[]> {
    if (!supabase) throw new Error('Supabase not configured');

    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);

    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          image_url,
          published_at,
          source,
          url,
          category
        `)
        .gte('published_at', monthAgo.toISOString().split('T')[0])
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération actualités mensuelles:', error);
      return [];
    }
  }
}

/**
 * Service pour récupérer les articles de blog
 */
export class BlogService {
  
  /**
   * Récupère les derniers articles de blog
   */
  static async getRecentArticles(limit: number = 5): Promise<BlogArticle[]> {
    if (!supabase) throw new Error('Supabase not configured');

    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          image_url,
          published_at,
          slug,
          author,
          category,
          read_time
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération articles blog:', error);
      return [];
    }
  }

  /**
   * Récupère les articles de blog de la semaine
   */
  static async getWeeklyArticles(): Promise<BlogArticle[]> {
    if (!supabase) throw new Error('Supabase not configured');

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          image_url,
          published_at,
          slug,
          author,
          category,
          read_time
        `)
        .eq('status', 'published')
        .gte('published_at', weekAgo.toISOString().split('T')[0])
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération articles hebdomadaires:', error);
      return [];
    }
  }

  /**
   * Récupère les articles de blog du mois
   */
  static async getMonthlyArticles(): Promise<BlogArticle[]> {
    if (!supabase) throw new Error('Supabase not configured');

    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);

    try {
      const { data, error } = await supabase
        .from('blog_articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          image_url,
          published_at,
          slug,
          author,
          category,
          read_time
        `)
        .eq('status', 'published')
        .gte('published_at', monthAgo.toISOString().split('T')[0])
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération articles mensuels:', error);
      return [];
    }
  }
}

/**
 * Service pour récupérer les événements
 */
export class EventsService {
  
  /**
   * Récupère les événements du jour
   */
  static async getTodayEvents(): Promise<Event[]> {
    if (!supabase) throw new Error('Supabase not configured');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          location,
          start_date,
          end_date,
          start_time,
          end_time,
          category,
          price,
          event_url,
          image_url,
          organizer
        `)
        .eq('start_date', todayStr)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération événements du jour:', error);
      return [];
    }
  }

  /**
   * Récupère les événements de la semaine
   */
  static async getWeeklyEvents(): Promise<Event[]> {
    if (!supabase) throw new Error('Supabase not configured');

    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);

    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          location,
          start_date,
          end_date,
          start_time,
          end_time,
          category,
          price,
          event_url,
          image_url,
          organizer
        `)
        .gte('start_date', today.toISOString().split('T')[0])
        .lte('start_date', weekEnd.toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération événements hebdomadaires:', error);
      return [];
    }
  }

  /**
   * Récupère les événements du mois
   */
  static async getMonthlyEvents(): Promise<Event[]> {
    if (!supabase) throw new Error('Supabase not configured');

    const today = new Date();
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          location,
          start_date,
          end_date,
          start_time,
          end_time,
          category,
          price,
          event_url,
          image_url,
          organizer
        `)
        .gte('start_date', today.toISOString().split('T')[0])
        .lte('start_date', monthEnd.toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération événements mensuels:', error);
      return [];
    }
  }
}

/**
 * Service pour les bons plans et promotions
 */
export class DealsService {
  
  /**
   * Récupère les bons plans actifs
   */
  static async getActiveDeals(limit: number = 5): Promise<any[]> {
    if (!supabase) throw new Error('Supabase not configured');

    try {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          id,
          title,
          description,
          discount_percentage,
          discount_amount,
          valid_until,
          business_name,
          business_id,
          image_url,
          terms_conditions
        `)
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération bons plans:', error);
      return [];
    }
  }
}

/**
 * Utilitaires pour formater le contenu
 */
export class ContentUtils {
  
  /**
   * Tronque un texte à une longueur donnée
   */
  static truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Formate une date en français
   */
  static formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Formate une heure
   */
  static formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}h${minutes !== '00' ? minutes : ''}`;
  }

  /**
   * Génère un extrait à partir du contenu HTML
   */
  static generateExcerpt(htmlContent: string, maxLength: number = 160): string {
    // Supprimer les balises HTML
    const textContent = htmlContent.replace(/<[^>]*>/g, '');
    return this.truncateText(textContent, maxLength);
  }

  /**
   * Obtient l'URL complète d'une image
   */
  static getFullImageUrl(imagePath?: string): string | undefined {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_APP_URL}${imagePath}`;
  }
}

/**
 * Service principal pour agréger tout le contenu
 */
export class NewsletterContentService {
  
  /**
   * Récupère tout le contenu pour la newsletter quotidienne
   */
  static async getDailyContent() {
    const [events, news] = await Promise.all([
      EventsService.getTodayEvents(),
      NewsService.getDailyNews()
    ]);

    return {
      events,
      news,
      date: new Date().toISOString().split('T')[0],
      weather: await this.getWeatherData() // Optionnel
    };
  }

  /**
   * Récupère tout le contenu pour la newsletter hebdomadaire
   */
  static async getWeeklyContent() {
    const [events, news, articles] = await Promise.all([
      EventsService.getWeeklyEvents(),
      NewsService.getWeeklyNews(),
      BlogService.getWeeklyArticles()
    ]);

    return {
      events,
      news,
      articles,
      weekStart: new Date().toISOString().split('T')[0],
      weekEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  /**
   * Récupère tout le contenu pour la newsletter mensuelle
   */
  static async getMonthlyContent() {
    const [events, news, articles, deals] = await Promise.all([
      EventsService.getMonthlyEvents(),
      NewsService.getMonthlyNews(),
      BlogService.getMonthlyArticles(),
      DealsService.getActiveDeals()
    ]);

    return {
      events,
      news,
      articles,
      deals,
      monthStart: new Date().toISOString().split('T')[0],
      monthEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    };
  }

  /**
   * Récupère les données météo (optionnel)
   */
  private static async getWeatherData() {
    // TODO: Intégrer une API météo si nécessaire
    return null;
  }
}