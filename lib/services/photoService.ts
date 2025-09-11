import { supabase } from '@/app/lib/supabase/client';

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

      // Récupérer le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session d\'authentification non trouvée');
      }

      // Utiliser l'API route pour contourner le problème RLS
      const formData = new FormData();
      formData.append('file', file);
      formData.append('establishmentId', establishmentId);
      formData.append('caption', caption || '');
      formData.append('position', position?.toString() || '0');

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'upload');
      }

      return result.photo;
    } catch (error) {
      console.error('PhotoService.uploadPhoto error:', error);
      throw error;
    }
  }

  static async getEstablishmentPhotos(establishmentId: string): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('establishment_photos')
      .select('*')
      .eq('establishment_id', establishmentId)
      .order('position', { ascending: true });

    if (error) {
      throw new Error(`Erreur chargement photos: ${error.message}`);
    }

    return data || [];
  }

  static async deletePhoto(photoId: string): Promise<void> {
    // Récupérer l'URL pour supprimer du storage
    const { data: photo, error: fetchError } = await supabase
      .from('establishment_photos')
      .select('url')
      .eq('id', photoId)
      .single();

    if (fetchError) {
      throw new Error(`Photo introuvable: ${fetchError.message}`);
    }

    // Extraire le path du storage depuis l'URL
    const url = photo.url;
    const path = url.split('/').slice(-2).join('/'); // establishment_id/filename

    // Supprimer du storage
    const { error: storageError } = await supabase.storage
      .from('establishment-photos')
      .remove([path]);

    if (storageError) {
      console.warn('Erreur suppression storage:', storageError);
    }

    // Supprimer de la base
    const { error: dbError } = await supabase
      .from('establishment_photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      throw new Error(`Erreur suppression: ${dbError.message}`);
    }
  }

  static async setMainPhoto(photoId: string, establishmentId: string): Promise<void> {
    // D'abord retirer le flag main de toutes les photos
    await supabase
      .from('establishment_photos')
      .update({ is_main: false })
      .eq('establishment_id', establishmentId);

    // Puis mettre celle-ci en main
    const { error } = await supabase
      .from('establishment_photos')
      .update({ is_main: true })
      .eq('id', photoId);

    if (error) {
      throw new Error(`Erreur photo principale: ${error.message}`);
    }
  }

  static async updatePhotoPosition(photoId: string, newPosition: number): Promise<void> {
    const { error } = await supabase
      .from('establishment_photos')
      .update({ position: newPosition })
      .eq('id', photoId);

    if (error) {
      throw new Error(`Erreur position: ${error.message}`);
    }
  }
}