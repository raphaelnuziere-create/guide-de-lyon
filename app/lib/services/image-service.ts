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
      if (!imageUrl) {
        console.log('[ImageService] Pas d\'image, utilisation image par défaut');
        return this.getDefaultImage(articleSlug);
      }

      console.log('[ImageService] Téléchargement image:', imageUrl);

      // Télécharger l'image depuis l'URL
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Guide-de-Lyon/1.0; +https://www.guide-de-lyon.fr)'
        }
      });
      
      if (!response.ok) {
        console.error('[ImageService] Erreur téléchargement:', response.status);
        return this.getDefaultImage(articleSlug);
      }

      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        console.error('[ImageService] Type de contenu invalide:', contentType);
        return this.getDefaultImage(articleSlug);
      }

      // Récupérer les données de l'image
      const arrayBuffer = await response.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Générer un nom unique pour l'image
      const hash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
      const extension = this.getExtensionFromUrl(imageUrl) || this.getExtensionFromContentType(contentType) || 'jpg';
      const fileName = `${articleSlug}-${hash}.${extension}`;
      const filePath = `articles/${new Date().getFullYear()}/${fileName}`;

      console.log('[ImageService] Upload vers Supabase:', filePath);

      // Uploader vers Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, buffer, {
          contentType: contentType || `image/${extension}`,
          upsert: true,
          cacheControl: '3600'
        });

      if (error) {
        console.error('[ImageService] Erreur upload Supabase:', error);
        return this.getDefaultImage(articleSlug);
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      console.log('[ImageService] Image stockée avec succès:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('[ImageService] Erreur complète:', error);
      // En cas d'erreur, utiliser une image par défaut
      return this.getDefaultImage(articleSlug);
    }
  }

  // Obtenir l'extension depuis l'URL
  private getExtensionFromUrl(url: string): string {
    const match = url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
    return match ? match[1].toLowerCase() : '';
  }

  // Obtenir l'extension depuis le content-type
  private getExtensionFromContentType(contentType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    return mimeToExt[contentType.toLowerCase()] || 'jpg';
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