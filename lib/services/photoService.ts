import { directusService } from './directus';

export interface Photo {
  id: string;
  establishment_id: string;
  url: string;
  caption?: string;
  position: number;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export class PhotoService {
  
  static async uploadPhoto(
    establishmentId: string, 
    file: File,
    caption?: string,
    position?: number
  ): Promise<Photo> {
    try {
      // Validation du fichier côté client
      if (!file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        throw new Error('L\'image ne peut pas dépasser 5MB');
      }

      // Upload vers Directus
      const result = await directusService.uploadPhoto(
        establishmentId,
        file,
        caption,
        position
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Erreur lors de l\'upload');
      }

      // Convertir le format Directus vers le format Photo
      const directusPhoto = result.data;
      const photoUrl = directusService.getFileUrl(directusPhoto.image);

      return {
        id: directusPhoto.id,
        establishment_id: directusPhoto.establishment_id,
        url: photoUrl,
        caption: directusPhoto.caption || '',
        position: directusPhoto.position,
        is_main: directusPhoto.is_main,
        created_at: directusPhoto.date_created,
        updated_at: directusPhoto.date_updated
      };
    } catch (error) {
      console.error('PhotoService.uploadPhoto error:', error);
      throw error;
    }
  }

  static async getEstablishmentPhotos(establishmentId: string): Promise<Photo[]> {
    try {
      const result = await directusService.getEstablishmentPhotos(establishmentId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur chargement photos');
      }

      // Convertir le format Directus vers le format Photo
      return (result.data || []).map(directusPhoto => ({
        id: directusPhoto.id,
        establishment_id: directusPhoto.establishment_id,
        url: directusService.getFileUrl(directusPhoto.image),
        caption: directusPhoto.caption || '',
        position: directusPhoto.position,
        is_main: directusPhoto.is_main,
        created_at: directusPhoto.date_created,
        updated_at: directusPhoto.date_updated
      }));
    } catch (error) {
      console.error('PhotoService.getEstablishmentPhotos error:', error);
      throw error;
    }
  }

  static async deletePhoto(photoId: string): Promise<void> {
    try {
      const result = await directusService.deletePhoto(photoId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('PhotoService.deletePhoto error:', error);
      throw error;
    }
  }

  static async setMainPhoto(photoId: string, establishmentId: string): Promise<void> {
    try {
      const result = await directusService.setMainPhoto(photoId, establishmentId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la définition de la photo principale');
      }
    } catch (error) {
      console.error('PhotoService.setMainPhoto error:', error);
      throw error;
    }
  }

  static async updatePhotoPosition(photoId: string, newPosition: number): Promise<void> {
    try {
      // Pour l'instant, utiliser la méthode directe avec updateItem
      // TODO: Ajouter une méthode dédiée dans directusService si nécessaire
      console.warn('PhotoService.updatePhotoPosition: Méthode non encore implémentée pour Directus');
      throw new Error('Mise à jour de position non disponible temporairement');
    } catch (error) {
      console.error('PhotoService.updatePhotoPosition error:', error);
      throw error;
    }
  }
}