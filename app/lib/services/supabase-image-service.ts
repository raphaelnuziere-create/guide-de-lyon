// Service de gestion des images avec Supabase Storage
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

// Créer un client Supabase admin pour éviter les problèmes RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

export class SupabaseImageService {
  private bucketName = 'article-images';

  // Télécharger et stocker une image dans Supabase Storage
  async downloadAndStore(imageUrl: string, articleSlug: string): Promise<string | null> {
    try {
      if (!imageUrl) {
        console.log('[Supabase Image] Pas d\'URL, utilisation image par défaut');
        return this.getDefaultImage('actualite');
      }

      console.log('[Supabase Image] Téléchargement de:', imageUrl);

      // Télécharger l'image depuis l'URL
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Guide-de-Lyon/1.0; +https://www.guide-de-lyon.fr)'
        }
      });

      if (!response.ok) {
        console.error('[Supabase Image] Erreur téléchargement:', response.status);
        return this.getDefaultImage('actualite');
      }

      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        console.error('[Supabase Image] Type de contenu invalide:', contentType);
        return this.getDefaultImage('actualite');
      }

      // Obtenir les données de l'image
      const arrayBuffer = await response.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Générer un nom de fichier unique
      const hash = createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
      const extension = this.getExtensionFromContentType(contentType);
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const fileName = `${year}/${month}/${articleSlug}-${hash}.${extension}`;

      console.log('[Supabase Image] Upload vers Supabase:', fileName);

      // Vérifier si l'image existe déjà
      const { data: existingFile } = await supabaseAdmin.storage
        .from(this.bucketName)
        .list(`${year}/${month}`, {
          search: `${articleSlug}-${hash}`
        });

      if (existingFile && existingFile.length > 0) {
        console.log('[Supabase Image] Image déjà existante, utilisation du cache');
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from(this.bucketName)
          .getPublicUrl(fileName);
        return publicUrl;
      }

      // Nettoyer le content-type (enlever charset s'il y en a)
      const cleanContentType = contentType?.split(';')[0].trim() || 'image/jpeg';
      
      // Uploader vers Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .upload(fileName, buffer, {
          contentType: cleanContentType,
          cacheControl: '3600',
          upsert: true // Remplacer si existe
        });

      if (error) {
        console.error('[Supabase Image] Erreur upload:', error);
        
        // Si le bucket n'existe pas, retourner une image par défaut
        if (error.message?.includes('bucket') || error.message?.includes('not found')) {
          console.error('[Supabase Image] Le bucket n\'existe pas. Créez-le avec le script SQL fourni.');
        }
        
        return this.getDefaultImage('actualite');
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(this.bucketName)
        .getPublicUrl(fileName);

      console.log('[Supabase Image] ✅ Image stockée avec succès:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('[Supabase Image] Erreur complète:', error);
      return this.getDefaultImage('actualite');
    }
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

    const randomIndex = Math.floor(Math.random() * lyonImages.length);
    return lyonImages[randomIndex];
  }

  // Nettoyer les anciennes images
  async cleanupOldImages(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Lister tous les fichiers
      const { data: files, error } = await supabaseAdmin.storage
        .from(this.bucketName)
        .list('', {
          limit: 1000,
          offset: 0
        });

      if (error || !files) {
        console.error('[Supabase Image] Erreur listing fichiers:', error);
        return;
      }

      // Filtrer et supprimer les vieux fichiers
      const filesToDelete = files
        .filter(file => {
          if (file.created_at) {
            const fileDate = new Date(file.created_at);
            return fileDate < cutoffDate;
          }
          return false;
        })
        .map(file => file.name);

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabaseAdmin.storage
          .from(this.bucketName)
          .remove(filesToDelete);

        if (deleteError) {
          console.error('[Supabase Image] Erreur suppression:', deleteError);
        } else {
          console.log(`[Supabase Image] ${filesToDelete.length} anciennes images supprimées`);
        }
      }
    } catch (error) {
      console.error('[Supabase Image] Erreur nettoyage:', error);
    }
  }

  // Tester la connexion à Supabase Storage
  async testConnection(): Promise<boolean> {
    try {
      // Essayer de lister les buckets
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      
      if (error) {
        console.error('[Supabase Image] Erreur test connexion:', error);
        return false;
      }

      // Vérifier si notre bucket existe
      const bucketExists = data?.some(bucket => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        console.log('[Supabase Image] ⚠️ Le bucket n\'existe pas. Créez-le avec le script SQL fourni.');
        return false;
      }

      console.log('[Supabase Image] ✅ Connexion Supabase Storage OK');
      return true;
    } catch (error) {
      console.error('[Supabase Image] Erreur test:', error);
      return false;
    }
  }
}