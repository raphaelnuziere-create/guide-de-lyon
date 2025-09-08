// Service simplifié pour télécharger et stocker les images directement via URL
import crypto from 'crypto';

export class ImageServiceDirect {
  
  // Télécharger une image et retourner l'URL directe
  async downloadAndGetUrl(imageUrl: string): Promise<string | null> {
    try {
      if (!imageUrl) {
        console.log('[ImageServiceDirect] Pas d\'image, utilisation image par défaut');
        return this.getDefaultImage('actualite');
      }

      console.log('[ImageServiceDirect] Vérification image:', imageUrl);

      // Vérifier que l'image est accessible
      const response = await fetch(imageUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Guide-de-Lyon/1.0)'
        }
      });
      
      if (!response.ok) {
        console.error('[ImageServiceDirect] Image inaccessible:', response.status);
        return this.getDefaultImage('actualite');
      }

      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        console.error('[ImageServiceDirect] Type de contenu invalide:', contentType);
        return this.getDefaultImage('actualite');
      }

      console.log('[ImageServiceDirect] Image valide, utilisation directe de l\'URL');
      
      // Pour l'instant, on retourne directement l'URL de la source
      // Plus tard on pourra implémenter un proxy ou un CDN
      return imageUrl;

    } catch (error) {
      console.error('[ImageServiceDirect] Erreur:', error);
      return this.getDefaultImage('actualite');
    }
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
}