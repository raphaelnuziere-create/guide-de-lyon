// Service de gestion des images pour le scraping
import { supabase } from '@/app/lib/supabase/client';
import crypto from 'crypto';

export class ImageService {
  private bucketName = 'articles-images';

  constructor() {
    this.ensureBucketExists();
  }

  // Créer le bucket s'il n'existe pas
  private async ensureBucketExists() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets?.find(b => b.name === this.bucketName)) {
        await supabase.storage.createBucket(this.bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });
        console.log('[ImageService] Bucket créé:', this.bucketName);
      }
    } catch (error) {
      console.error('[ImageService] Erreur création bucket:', error);
    }
  }

  // Télécharger et stocker une image depuis une URL
  async downloadAndStore(imageUrl: string, articleSlug: string): Promise<string | null> {
    try {
      if (!imageUrl) return null;

      console.log('[ImageService] Téléchargement image:', imageUrl);

      // Pour l'instant, on utilise directement les images par défaut
      // car le téléchargement côté serveur nécessite une configuration spéciale
      // et les images RSS sont souvent protégées par CORS ou hotlinking
      
      // Utiliser une image par défaut de qualité selon la catégorie
      // Les images seront hébergées sur Unsplash qui est fiable et rapide
      return this.getDefaultImage(articleSlug);

    } catch (error) {
      console.error('[ImageService] Erreur:', error);
      // Retourner une image par défaut si erreur
      return this.getDefaultImage(articleSlug);
    }
  }

  // Obtenir l'extension depuis l'URL
  private getExtensionFromUrl(url: string): string {
    const match = url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
    return match ? match[1].toLowerCase() : 'jpg';
  }

  // Image par défaut basée sur la catégorie avec images de Lyon
  getDefaultImage(category: string): string {
    // Images de Lyon sur Unsplash pour chaque catégorie
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
    
    const defaultImages: Record<string, string[]> = {
      actualite: [
        'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200',
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
        'https://images.unsplash.com/photo-1609770231080-e321deccc34c?w=1200',
      ],
      culture: [
        'https://images.unsplash.com/photo-1582806988429-d451912c0e1f?w=1200',
        'https://images.unsplash.com/photo-1563373960-57e7ce1097d0?w=1200',
        'https://images.unsplash.com/photo-1584265549884-cb8ea486a613?w=1200',
      ],
      sport: [
        'https://images.unsplash.com/photo-1600168985025-38c73e8bc9f1?w=1200',
        'https://images.unsplash.com/photo-1568792556814-51b7a62ddaef?w=1200',
        'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200',
      ],
      economie: [
        'https://images.unsplash.com/photo-1609770231080-e321deccc34c?w=1200',
        'https://images.unsplash.com/photo-1600168985025-38c73e8bc9f1?w=1200',
        'https://images.unsplash.com/photo-1563373960-57e7ce1097d0?w=1200',
      ],
      societe: [
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
        'https://images.unsplash.com/photo-1582806988429-d451912c0e1f?w=1200',
        'https://images.unsplash.com/photo-1584265549884-cb8ea486a613?w=1200',
      ],
      politique: [
        'https://images.unsplash.com/photo-1609770231080-e321deccc34c?w=1200',
        'https://images.unsplash.com/photo-1563373960-57e7ce1097d0?w=1200',
        'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200',
      ],
      default: lyonImages
    };

    // Sélectionner une image aléatoire dans la catégorie
    const categoryImages = defaultImages[category] || defaultImages.default;
    const randomIndex = Math.floor(Math.random() * categoryImages.length);
    return categoryImages[randomIndex];
  }

  // Optimiser une image (redimensionner, compresser)
  async optimizeImage(imageUrl: string, width: number = 1200): Promise<string> {
    // Si c'est déjà une URL Unsplash, on peut utiliser leurs paramètres
    if (imageUrl.includes('unsplash.com')) {
      return imageUrl.replace(/w=\d+/, `w=${width}`);
    }
    
    // Pour les autres images, retourner l'URL telle quelle pour l'instant
    // TODO: Implémenter une vraie optimisation avec Sharp ou un service externe
    return imageUrl;
  }

  // Nettoyer les anciennes images non utilisées
  async cleanupUnusedImages(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data: files } = await supabase.storage
        .from(this.bucketName)
        .list('articles', {
          limit: 1000
        });

      if (!files) return;

      // Filtrer les fichiers anciens
      const oldFiles = files.filter(file => {
        const fileDate = new Date(file.created_at);
        return fileDate < cutoffDate;
      });

      // Supprimer les fichiers anciens
      if (oldFiles.length > 0) {
        const filePaths = oldFiles.map(f => `articles/${f.name}`);
        await supabase.storage
          .from(this.bucketName)
          .remove(filePaths);
        
        console.log(`[ImageService] ${oldFiles.length} anciennes images supprimées`);
      }
    } catch (error) {
      console.error('[ImageService] Erreur nettoyage:', error);
    }
  }
}