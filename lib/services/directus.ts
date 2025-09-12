import { createDirectus, rest, authentication, readItems, createItem, updateItem, deleteItem, uploadFiles } from '@directus/sdk';

// Types pour Directus
export interface DirectusEstablishment {
  id: string;
  status: 'published' | 'draft' | 'archived';
  name: string;
  slug: string;
  description?: string;
  address: string;
  postal_code: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  category: 'restaurant' | 'bar' | 'cafe' | 'boutique' | 'services' | 'culture' | 'loisirs';
  price_range?: 'economique' | 'modere' | 'eleve' | 'tres_eleve';
  rating?: number;
  latitude?: number;
  longitude?: number;
  opening_hours?: Record<string, any>;
  plan: 'basic' | 'pro' | 'expert';
  verified: boolean;
  professional_user_id: string;
  date_created: string;
  date_updated: string;
}

export interface DirectusEstablishmentPhoto {
  id: string;
  establishment_id: string;
  image: string; // UUID du fichier Directus
  caption?: string;
  position: number;
  is_main: boolean;
  date_created: string;
  date_updated: string;
}

export interface DirectusEvent {
  id: string;
  status: 'published' | 'draft' | 'archived';
  establishment_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  price?: number;
  max_participants?: number;
  category?: 'concert' | 'exposition' | 'conference' | 'degustation' | 'atelier' | 'soiree' | 'festival' | 'autre';
  date_created: string;
  date_updated: string;
}

export interface DirectusProfessionalUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  vat_number?: string;
  status: 'active' | 'inactive' | 'pending';
  date_created: string;
  date_updated: string;
}

// Collection schema pour Directus SDK
interface DirectusSchema {
  establishments: DirectusEstablishment;
  establishment_photos: DirectusEstablishmentPhoto;
  events: DirectusEvent;
  professional_users: DirectusProfessionalUser;
}

class DirectusService {
  private client;
  private isAuthenticated = false;

  constructor() {
    this.client = createDirectus<DirectusSchema>(process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055')
      .with(rest())
      .with(authentication());
  }

  // Authentification
  async login(email: string, password: string) {
    try {
      await this.client.login({
        email,
        password
      });
      this.isAuthenticated = true;
      return { success: true };
    } catch (error: any) {
      console.error('Erreur login Directus:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de connexion' 
      };
    }
  }

  async logout() {
    try {
      await this.client.logout();
      this.isAuthenticated = false;
      return { success: true };
    } catch (error: any) {
      console.error('Erreur logout Directus:', error);
      return { success: false, error: error.message };
    }
  }

  async refresh() {
    try {
      await this.client.refresh();
      this.isAuthenticated = true;
      return { success: true };
    } catch (error: any) {
      console.error('Erreur refresh Directus:', error);
      this.isAuthenticated = false;
      return { success: false, error: error.message };
    }
  }

  // Establishments
  async getEstablishments(filters?: any) {
    try {
      const establishments = await this.client.request(
        readItems('establishments', {
          filter: {
            status: { _eq: 'published' },
            ...filters
          },
          sort: ['name']
        })
      );
      return { success: true, data: establishments };
    } catch (error: any) {
      console.error('Erreur récupération établissements:', error);
      return { success: false, error: error.message };
    }
  }

  async getEstablishmentBySlug(slug: string) {
    try {
      const establishments = await this.client.request(
        readItems('establishments', {
          filter: {
            slug: { _eq: slug },
            status: { _eq: 'published' }
          },
          limit: 1
        })
      );
      
      if (establishments.length === 0) {
        return { success: false, error: 'Établissement non trouvé' };
      }
      
      return { success: true, data: establishments[0] };
    } catch (error: any) {
      console.error('Erreur récupération établissement:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserEstablishments(userId: string) {
    try {
      const establishments = await this.client.request(
        readItems('establishments', {
          filter: {
            professional_user_id: { _eq: userId }
          },
          sort: ['name']
        })
      );
      return { success: true, data: establishments };
    } catch (error: any) {
      console.error('Erreur récupération établissements utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  async createEstablishment(data: Partial<DirectusEstablishment>) {
    try {
      const establishment = await this.client.request(
        createItem('establishments', data)
      );
      return { success: true, data: establishment };
    } catch (error: any) {
      console.error('Erreur création établissement:', error);
      return { success: false, error: error.message };
    }
  }

  async updateEstablishment(id: string, data: Partial<DirectusEstablishment>) {
    try {
      const establishment = await this.client.request(
        updateItem('establishments', id, data)
      );
      return { success: true, data: establishment };
    } catch (error: any) {
      console.error('Erreur mise à jour établissement:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteEstablishment(id: string) {
    try {
      await this.client.request(deleteItem('establishments', id));
      return { success: true };
    } catch (error: any) {
      console.error('Erreur suppression établissement:', error);
      return { success: false, error: error.message };
    }
  }

  // Photos
  async getEstablishmentPhotos(establishmentId: string) {
    try {
      const photos = await this.client.request(
        readItems('establishment_photos', {
          filter: {
            establishment_id: { _eq: establishmentId }
          },
          sort: ['position']
        })
      );
      return { success: true, data: photos };
    } catch (error: any) {
      console.error('Erreur récupération photos:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadPhoto(establishmentId: string, file: File, caption?: string, position?: number) {
    try {
      // 1. Upload du fichier vers Directus
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResult = await this.client.request(uploadFiles(formData));
      
      if (!uploadResult || uploadResult.length === 0) {
        throw new Error('Échec de l\'upload du fichier');
      }

      const fileId = uploadResult[0].id;

      // 2. Créer l'entrée photo
      const photo = await this.client.request(
        createItem('establishment_photos', {
          establishment_id: establishmentId,
          image: fileId,
          caption: caption || '',
          position: position || 0,
          is_main: false
        })
      );

      return { success: true, data: photo };
    } catch (error: any) {
      console.error('Erreur upload photo:', error);
      return { success: false, error: error.message };
    }
  }

  async setMainPhoto(photoId: string, establishmentId: string) {
    try {
      // Retirer le flag main de toutes les photos de l'établissement
      const allPhotos = await this.client.request(
        readItems('establishment_photos', {
          filter: {
            establishment_id: { _eq: establishmentId }
          }
        })
      );

      // Mise à jour en lot
      for (const photo of allPhotos) {
        await this.client.request(
          updateItem('establishment_photos', photo.id, {
            is_main: photo.id === photoId
          })
        );
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erreur définition photo principale:', error);
      return { success: false, error: error.message };
    }
  }

  async deletePhoto(photoId: string) {
    try {
      await this.client.request(deleteItem('establishment_photos', photoId));
      return { success: true };
    } catch (error: any) {
      console.error('Erreur suppression photo:', error);
      return { success: false, error: error.message };
    }
  }

  // Events
  async getEstablishmentEvents(establishmentId: string) {
    try {
      const events = await this.client.request(
        readItems('events', {
          filter: {
            establishment_id: { _eq: establishmentId },
            status: { _eq: 'published' }
          },
          sort: ['start_date']
        })
      );
      return { success: true, data: events };
    } catch (error: any) {
      console.error('Erreur récupération événements:', error);
      return { success: false, error: error.message };
    }
  }

  async createEvent(data: Partial<DirectusEvent>) {
    try {
      const event = await this.client.request(
        createItem('events', data)
      );
      return { success: true, data: event };
    } catch (error: any) {
      console.error('Erreur création événement:', error);
      return { success: false, error: error.message };
    }
  }

  async updateEvent(id: string, data: Partial<DirectusEvent>) {
    try {
      const event = await this.client.request(
        updateItem('events', id, data)
      );
      return { success: true, data: event };
    } catch (error: any) {
      console.error('Erreur mise à jour événement:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteEvent(id: string) {
    try {
      await this.client.request(deleteItem('events', id));
      return { success: true };
    } catch (error: any) {
      console.error('Erreur suppression événement:', error);
      return { success: false, error: error.message };
    }
  }

  // Professional Users
  async getProfessionalUser(userId: string) {
    try {
      const user = await this.client.request(
        readItems('professional_users', {
          filter: {
            id: { _eq: userId }
          },
          limit: 1
        })
      );
      
      if (user.length === 0) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
      
      return { success: true, data: user[0] };
    } catch (error: any) {
      console.error('Erreur récupération utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  async createProfessionalUser(data: Partial<DirectusProfessionalUser>) {
    try {
      const user = await this.client.request(
        createItem('professional_users', data)
      );
      return { success: true, data: user };
    } catch (error: any) {
      console.error('Erreur création utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProfessionalUser(id: string, data: Partial<DirectusProfessionalUser>) {
    try {
      const user = await this.client.request(
        updateItem('professional_users', id, data)
      );
      return { success: true, data: user };
    } catch (error: any) {
      console.error('Erreur mise à jour utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  // Utilitaires
  getFileUrl(fileId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
    return `${baseUrl}/assets/${fileId}`;
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }
}

// Instance singleton
export const directusService = new DirectusService();
export default directusService;