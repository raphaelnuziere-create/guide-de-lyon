// Service de stockage d'images avec téléchargement et cache local
import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { supabase } from '@/app/lib/supabase/client';

export class ImageStorageService {
  private storageDir = path.join(process.cwd(), 'public', 'images', 'articles');
  
  constructor() {
    this.ensureStorageDir();
  }

  // Créer le répertoire de stockage s'il n'existe pas
  private async ensureStorageDir() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error('[ImageStorage] Erreur création répertoire:', error);
    }
  }

  // Télécharger et stocker une image
  async downloadAndStore(imageUrl: string, articleSlug: string): Promise<string | null> {
    try {
      if (!imageUrl) {
        console.log('[ImageStorage] Pas d\'URL d\'image fournie');
        return this.getDefaultImage('actualite');
      }

      console.log('[ImageStorage] Téléchargement de:', imageUrl);

      // Générer un nom de fichier unique basé sur l'URL
      const urlHash = createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
      const extension = this.getExtensionFromUrl(imageUrl) || 'jpg';
      const fileName = `${articleSlug}-${urlHash}.${extension}`;
      const filePath = path.join(this.storageDir, fileName);
      const publicPath = `/images/articles/${fileName}`;

      // Vérifier si l'image existe déjà
      try {
        await fs.access(filePath);
        console.log('[ImageStorage] Image déjà en cache:', publicPath);
        
        // Sauvegarder l'URL dans la base de données
        await this.saveImageUrl(articleSlug, publicPath, imageUrl);
        return publicPath;
      } catch {
        // L'image n'existe pas, on continue
      }

      // Télécharger l'image
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Guide-de-Lyon/1.0; +https://www.guide-de-lyon.fr)'
        }
      });

      if (!response.ok) {
        console.error('[ImageStorage] Erreur téléchargement:', response.status);
        return this.getDefaultImage('actualite');
      }

      // Vérifier le content-type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        console.error('[ImageStorage] Type de contenu invalide:', contentType);
        return this.getDefaultImage('actualite');
      }

      // Obtenir le buffer de l'image
      const buffer = Buffer.from(await response.arrayBuffer());

      // Sauvegarder l'image localement
      await fs.writeFile(filePath, buffer);
      console.log('[ImageStorage] Image sauvegardée:', publicPath);

      // Sauvegarder l'URL dans la base de données
      await this.saveImageUrl(articleSlug, publicPath, imageUrl);

      return publicPath;

    } catch (error) {
      console.error('[ImageStorage] Erreur complète:', error);
      return this.getDefaultImage('actualite');
    }
  }

  // Sauvegarder l'URL de l'image dans la base de données
  private async saveImageUrl(slug: string, localPath: string, originalUrl: string) {
    try {
      await supabase
        .from('article_images')
        .upsert({
          article_slug: slug,
          local_path: localPath,
          original_url: originalUrl,
          downloaded_at: new Date().toISOString()
        }, {
          onConflict: 'article_slug'
        });
    } catch (error) {
      console.error('[ImageStorage] Erreur sauvegarde BDD:', error);
    }
  }

  // Obtenir l'extension depuis l'URL
  private getExtensionFromUrl(url: string): string {
    const match = url.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i);
    return match ? match[1].toLowerCase() : '';
  }

  // Image par défaut basée sur la catégorie
  getDefaultImage(category: string): string {
    const lyonImages = [
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200',
      'https://images.unsplash.com/photo-1582806988429-d451912c0e1f?w=1200',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
      'https://images.unsplash.com/photo-1609770231080-e321deccc34c?w=1200',
      'https://images.unsplash.com/photo-1563373960-57e7ce1097d0?w=1200',
      'https://images.unsplash.com/photo-1584265549884-cb8ea486a613?w=1200',
      'https://images.unsplash.com/photo-1568792556814-51b7a62ddaef?w=1200',
      'https://images.unsplash.com/photo-1600168985025-38c73e8bc9f1?w=1200',
    ];

    const randomIndex = Math.floor(Math.random() * lyonImages.length);
    return lyonImages[randomIndex];
  }

  // Nettoyer les vieilles images non utilisées
  async cleanupOldImages(daysOld: number = 30): Promise<void> {
    try {
      const files = await fs.readdir(this.storageDir);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.storageDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log('[ImageStorage] Image supprimée:', file);
        }
      }
    } catch (error) {
      console.error('[ImageStorage] Erreur nettoyage:', error);
    }
  }
}