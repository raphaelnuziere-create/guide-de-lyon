// Service unifié de gestion des images avec support OVH
import { OVHStorageService } from './ovh-storage';
import { createHash } from 'crypto';

export class UnifiedImageService {
  private ovhService: OVHStorageService;

  constructor() {
    this.ovhService = new OVHStorageService();
  }

  // Obtenir ou stocker une image
  async processImage(imageUrl: string, articleSlug: string): Promise<string | null> {
    try {
      if (!imageUrl) {
        console.log('[UnifiedImage] Pas d\'URL, utilisation image par défaut');
        return this.getDefaultImage('actualite');
      }

      // Essayer d'abord OVH si configuré
      if (this.ovhService.isOVHConfigured()) {
        console.log('[UnifiedImage] Utilisation d\'OVH Object Storage');
        const ovhUrl = await this.ovhService.uploadImage(imageUrl, articleSlug);
        if (ovhUrl) {
          return ovhUrl;
        }
      }

      // Fallback vers le proxy si OVH n'est pas configuré ou a échoué
      console.log('[UnifiedImage] Utilisation du proxy local');
      return `/api/images/proxy?url=${encodeURIComponent(imageUrl)}&slug=${articleSlug}`;

    } catch (error) {
      console.error('[UnifiedImage] Erreur traitement image:', error);
      return this.getDefaultImage('actualite');
    }
  }

  // Test de la configuration OVH
  async testOVHConnection(): Promise<boolean> {
    return await this.ovhService.testConnection();
  }

  // Image par défaut de Lyon
  getDefaultImage(category: string): string {
    const lyonImages = [
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200', // Lyon Fourvière
      'https://images.unsplash.com/photo-1582806988429-d451912c0e1f?w=1200', // Lyon pont
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200', // Lyon vue générale
      'https://images.unsplash.com/photo-1609770231080-e321deccc34c?w=1200', // Lyon Bellecour
      'https://images.unsplash.com/photo-1563373960-57e7ce1097d0?w=1200', // Lyon architecture
      'https://images.unsplash.com/photo-1584265549884-cb8ea486a613?w=1200', // Lyon Croix-Rousse
      'https://images.unsplash.com/photo-1568792556814-51b7a62ddaef?w=1200', // Lyon nuit
      'https://images.unsplash.com/photo-1600168985025-38c73e8bc9f1?w=1200', // Lyon moderne
    ];

    const categoryImages: Record<string, string[]> = {
      actualite: [lyonImages[0], lyonImages[2], lyonImages[3]],
      culture: [lyonImages[1], lyonImages[4], lyonImages[5]],
      sport: [lyonImages[6], lyonImages[7], lyonImages[0]],
      economie: [lyonImages[3], lyonImages[6], lyonImages[4]],
      societe: [lyonImages[2], lyonImages[1], lyonImages[5]],
      politique: [lyonImages[3], lyonImages[4], lyonImages[0]],
      default: lyonImages
    };

    const images = categoryImages[category] || categoryImages.default;
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }
}