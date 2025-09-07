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

      // Télécharger l'image
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.error('[ImageService] Erreur téléchargement:', response.status);
        return null;
      }

      const buffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);

      // Générer un nom unique pour l'image
      const hash = crypto.createHash('md5').update(imageUrl).digest('hex');
      const extension = this.getExtensionFromUrl(imageUrl) || 'jpg';
      const fileName = `${articleSlug}-${hash}.${extension}`;
      const filePath = `articles/${new Date().getFullYear()}/${fileName}`;

      // Uploader vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, uint8Array, {
          contentType: `image/${extension}`,
          upsert: true
        });

      if (error) {
        console.error('[ImageService] Erreur upload:', error);
        return null;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      console.log('[ImageService] Image stockée:', publicUrl);
      return publicUrl;

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

  // Image par défaut basée sur la catégorie
  getDefaultImage(category: string): string {
    const defaultImages: Record<string, string> = {
      actualite: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200',
      culture: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
      sport: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200',
      economie: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200',
      societe: 'https://images.unsplash.com/photo-1524484082325-6d68c1e2b8c0?w=1200',
      politique: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200',
      default: 'https://images.unsplash.com/photo-1524484082325-6d68c1e2b8c0?w=1200'
    };

    return defaultImages[category] || defaultImages.default;
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