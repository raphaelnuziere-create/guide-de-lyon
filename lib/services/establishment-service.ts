/**
 * Service pour récupérer et gérer les données d'établissements
 * Connecté à Supabase pour des données réelles et dynamiques
 */

import { supabase } from '@/lib/supabase';

export interface Establishment {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  description: string;
  shortDescription?: string;
  
  // Contact & Location
  address: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  
  // Business Info
  rating: number;
  reviewsCount: number;
  priceRange: 'Budget' | '€€' | '€€€' | '€€€€';
  
  // Hours (JSON object)
  openingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  
  // Media
  images: string[];
  logo?: string;
  coverImage?: string;
  
  // Features & Services
  features: string[];
  services: string[];
  amenities: string[];
  
  // Specialized content based on category
  menu?: MenuSection[];
  rooms?: Room[]; // For hotels
  treatments?: Treatment[]; // For spas
  specialties?: string[]; // For various categories
  
  // Business status
  isVerified: boolean;
  isPremium: boolean;
  isClosed?: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface MenuSection {
  name: string;
  description?: string;
  items: MenuItem[];
}

export interface MenuItem {
  name: string;
  description?: string;
  price?: number;
  image?: string;
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
}

export interface Room {
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
}

export interface Treatment {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

export interface Review {
  id: string;
  establishmentId: string;
  authorName: string;
  rating: number;
  title?: string;
  comment: string;
  date: string;
  helpful: number;
  images?: string[];
}

export interface Event {
  id: string;
  establishmentId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime?: string;
  price?: number;
  capacity?: number;
  image?: string;
  category: string;
}

export class EstablishmentService {
  
  /**
   * Récupère un établissement par son slug
   */
  static async getBySlug(slug: string): Promise<Establishment | null> {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        return null;
      }

      const { data, error } = await supabase
        .from('establishments')
        .select(`
          *,
          establishment_media (
            url,
            type,
            display_order,
            is_active
          )
        `)
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching establishment:', error);
        return null;
      }

      if (!data) return null;

      // Incrémenter le compteur de vues
      await this.incrementViews(data.id);

      return this.formatEstablishment(data);
    } catch (error) {
      console.error('Exception in getBySlug:', error);
      return null;
    }
  }

  /**
   * Récupère les établissements similaires
   */
  static async getSimilar(establishmentId: string, category: string, limit = 3): Promise<Establishment[]> {
    try {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('establishments')
        .select(`
          *,
          establishment_media (
            url,
            type,
            display_order,
            is_active
          )
        `)
        .eq('category', category)
        .neq('id', establishmentId)
        .eq('status', 'active')
        .limit(limit);

      if (error) {
        console.error('Error fetching similar establishments:', error);
        return [];
      }

      return data?.map(this.formatEstablishment) || [];
    } catch (error) {
      console.error('Exception in getSimilar:', error);
      return [];
    }
  }

  /**
   * Récupère les avis d'un établissement
   */
  static async getReviews(establishmentId: string, limit = 10): Promise<Review[]> {
    try {
      if (!supabase) return [];

      // Table reviews pas encore créée, retourner un tableau vide pour l'instant
      return [];

      // TODO: Réactiver quand la table reviews sera créée
      /*
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('establishment_id', establishmentId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }

      return data?.map(review => ({
        id: review.id,
        establishmentId: review.establishment_id,
        authorName: review.author_name,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        date: review.created_at,
        helpful: review.helpful_count || 0,
        images: review.images || []
      })) || [];
      */
    } catch (error) {
      console.error('Exception in getReviews:', error);
      return [];
    }
  }

  /**
   * Récupère les événements d'un établissement
   */
  static async getEvents(establishmentId: string): Promise<Event[]> {
    try {
      if (!supabase) return [];

      // Table events pas encore créée, retourner un tableau vide pour l'instant
      return [];

      // TODO: Réactiver quand la table events sera créée
      /*
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('establishment_id', establishmentId)
        .gte('event_date', new Date().toISOString())
        .eq('status', 'approved')
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return data?.map(event => ({
        id: event.id,
        establishmentId: event.establishment_id,
        title: event.title,
        description: event.description,
        date: event.event_date,
        startTime: event.start_time,
        endTime: event.end_time,
        price: event.price,
        capacity: event.capacity,
        image: event.image_url,
        category: event.category
      })) || [];
      */
    } catch (error) {
      console.error('Exception in getEvents:', error);
      return [];
    }
  }

  /**
   * Incrémente le compteur de vues
   */
  private static async incrementViews(establishmentId: string): Promise<void> {
    try {
      if (!supabase) return;

      await supabase.rpc('increment_establishment_views', {
        establishment_id: establishmentId
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  /**
   * Formate les données de l'établissement
   */
  private static formatEstablishment(data: any): Establishment {
    // Extraire les images depuis establishment_media
    let images: string[] = [];
    if (data.establishment_media && Array.isArray(data.establishment_media)) {
      images = data.establishment_media
        .filter((media: any) => media.type === 'image' && media.is_active)
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((media: any) => media.url);
    }
    
    // Fallback vers les anciennes images si pas de establishment_media
    if (images.length === 0 && data.images) {
      images = data.images;
    }
    
    // Fallback vers metadata.main_image si disponible
    if (images.length === 0 && data.metadata?.main_image) {
      images = [data.metadata.main_image];
    }

    // Convertir les horaires d'ouverture du format array vers l'objet attendu
    let openingHours = data.opening_hours || data.metadata?.opening_hours;
    if (Array.isArray(openingHours)) {
      const hoursObj: Record<string, string> = {};
      const dayMap: Record<string, string> = {
        'lundi': 'monday', 'mardi': 'tuesday', 'mercredi': 'wednesday',
        'jeudi': 'thursday', 'vendredi': 'friday', 'samedi': 'saturday', 'dimanche': 'sunday'
      };
      
      openingHours.forEach((hourStr: string) => {
        const [dayFr, hours] = hourStr.split(': ');
        const dayEn = dayMap[dayFr.toLowerCase()];
        if (dayEn) {
          hoursObj[dayEn] = hours === 'Fermé' ? '' : hours;
        }
      });
      openingHours = hoursObj;
    }

    // Extraire l'adresse complète
    const fullAddress = data.address || data.metadata?.address || '';
    const addressParts = fullAddress.split(', ');
    const address = addressParts.length > 2 ? addressParts.slice(0, -2).join(', ') : fullAddress;
    const postalCodeCity = addressParts.length > 1 ? addressParts[addressParts.length - 2] : '';
    const [postalCode, ...cityParts] = postalCodeCity.split(' ');
    const city = cityParts.join(' ') || 'Lyon';
    
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      category: data.category,
      subcategory: data.subcategory || data.metadata?.subcategory,
      description: data.description || data.metadata?.description || '',
      shortDescription: data.short_description || data.metadata?.short_description,
      
      address: address,
      city: city,
      postalCode: postalCode || data.postal_code || data.metadata?.postal_code || '69000',
      latitude: data.latitude || data.metadata?.latitude,
      longitude: data.longitude || data.metadata?.longitude,
      phone: data.phone || data.metadata?.phone,
      email: data.email || data.metadata?.email,
      website: data.website || data.metadata?.website,
      
      rating: data.rating || data.metadata?.rating || 4.5,
      reviewsCount: data.reviews_count || data.metadata?.reviews_count || 0,
      priceRange: data.price_range || data.metadata?.price_range || '€€',
      
      openingHours: openingHours,
      
      images: images,
      logo: data.logo || data.metadata?.logo,
      coverImage: data.cover_image || images[0],
      
      features: data.features || data.metadata?.features || [],
      services: data.services || data.metadata?.services || [],
      amenities: data.amenities || data.metadata?.amenities || [],
      
      menu: data.menu || data.metadata?.menu,
      rooms: data.rooms || data.metadata?.rooms,
      treatments: data.treatments || data.metadata?.treatments,
      specialties: data.specialties || data.metadata?.specialties,
      
      isVerified: data.is_verified || data.metadata?.is_verified || false,
      isPremium: data.metadata?.plan === 'expert' || data.metadata?.plan === 'pro' || false,
      isClosed: data.is_closed || false,
      
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      views: data.views || 0
    };
  }

  /**
   * Récupère le layout recommandé selon la catégorie
   */
  static getLayoutType(category: string): string {
    const layoutMap: { [key: string]: string } = {
      'restaurant': 'restaurant',
      'cafe': 'restaurant',
      'bar': 'restaurant',
      'hotel': 'accommodation',
      'guesthouse': 'accommodation',
      'spa': 'wellness',
      'salon': 'wellness',
      'fitness': 'wellness',
      'shop': 'retail',
      'boutique': 'retail',
      'museum': 'cultural',
      'theater': 'cultural',
      'gallery': 'cultural',
      'nightclub': 'entertainment',
      'cinema': 'entertainment',
      'service': 'professional'
    };

    return layoutMap[category.toLowerCase()] || 'general';
  }

  /**
   * Données de fallback pour les établissements non trouvés
   */
  static getFallbackEstablishment(slug: string): Establishment {
    return {
      id: 'fallback',
      name: 'Établissement non trouvé',
      slug,
      category: 'Non défini',
      description: 'Cet établissement n\'a pas encore été référencé dans notre base de données.',
      
      address: 'Lyon, France',
      city: 'Lyon',
      postalCode: '69000',
      
      rating: 0,
      reviewsCount: 0,
      priceRange: '€€',
      
      images: [],
      features: [],
      services: [],
      amenities: [],
      
      isVerified: false,
      isPremium: false,
      isClosed: false,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };
  }
}