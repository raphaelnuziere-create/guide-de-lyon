// Intégration API Pexels pour Guide de Lyon
class PexelsIntegration {
    constructor() {
        this.apiKey = 'HcXv6WMPNfXFZbX3Wpq9OXbgGBRFRuihwynLyxSp8fg9DB0tqd0qoeHd'; // À remplacer par votre clé API
        this.baseURL = 'https://api.pexels.com/v1/search';
        this.cache = new Map();
        this.sectors = {
            'shopping': ['shopping mall lyon', 'boutique shopping', 'retail store'],
            'restaurant': ['restaurant lyon', 'dining food', 'french cuisine'],
            'culture': ['museum art lyon', 'theater culture', 'art gallery'],
            'bars': ['bar cafe lyon', 'nightlife drinks', 'wine tasting'],
            'fitness': ['gym fitness lyon', 'sports training', 'yoga wellness'],
            'sante': ['medical healthcare', 'clinic hospital', 'health wellness'],
            'immobilier': ['real estate lyon', 'apartment building', 'home property'],
            'auto': ['car automotive lyon', 'garage repair', 'automobile'],
            'beaute': ['beauty salon lyon', 'cosmetics spa', 'hairdresser'],
            'education': ['school education lyon', 'university learning', 'training'],
            'services': ['business services', 'professional office', 'consultation'],
            'loisirs': ['entertainment leisure', 'recreation fun', 'activities lyon']
        };
        this.fallbackImages = {
            'shopping': 'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg',
            'restaurant': 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg',
            'culture': 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg',
            'bars': 'https://images.pexels.com/photos/1267696/pexels-photo-1267696.jpeg',
            'fitness': 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg',
            'sante': 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg',
            'immobilier': 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
            'auto': 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg',
            'beaute': 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg',
            'education': 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg',
            'services': 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg',
            'loisirs': 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg'
        };
    }

    async fetchImage(sector, size = 'medium') {
        const cacheKey = `${sector}_${size}`;
        
        // Vérifier le cache
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const searchTerms = this.sectors[sector] || [sector];
            const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
            
            const response = await fetch(`${this.baseURL}?query=${encodeURIComponent(randomTerm)}&per_page=10&orientation=landscape`, {
                headers: {
                    'Authorization': this.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.photos && data.photos.length > 0) {
                const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
                const imageUrl = this.getImageSrc(photo, size);
                
                // Mettre en cache
                this.cache.set(cacheKey, imageUrl);
                return imageUrl;
            } else {
                // Fallback si pas de résultats
                return this.fallbackImages[sector] || this.fallbackImages.services;
            }
        } catch (error) {
            console.error('Erreur Pexels API:', error);
            return this.fallbackImages[sector] || this.fallbackImages.services;
        }
    }

    getImageSrc(photo, size) {
        switch (size) {
            case 'small':
                return photo.src.small;
            case 'medium':
                return photo.src.medium;
            case 'large':
                return photo.src.large;
            case 'original':
                return photo.src.original;
            default:
                return photo.src.medium;
        }
    }

    async loadSectorImages() {
        const imagePromises = Object.keys(this.sectors).map(async (sector) => {
            const imageUrl = await this.fetchImage(sector, 'medium');
            return { sector, imageUrl };
        });

        const results = await Promise.all(imagePromises);
        
        // Appliquer les images aux éléments du DOM
        results.forEach(({ sector, imageUrl }) => {
            const sectorCard = document.querySelector(`[data-sector="${sector}"]`);
            if (sectorCard) {
                const img = sectorCard.querySelector('.sector-image');
                if (img) {
                    img.src = imageUrl;
                    img.alt = `${sector} à Lyon`;
                }
                
                // Ou en arrière-plan
                const bgElement = sectorCard.querySelector('.sector-bg');
                if (bgElement) {
                    bgElement.style.backgroundImage = `url(${imageUrl})`;
                }
            }
        });

        return results;
    }

    async loadHeroImage() {
        try {
            const heroQueries = [
                'lyon france architecture',
                'lyon city france',
                'french city buildings',
                'lyon skyline'
            ];
            
            const randomQuery = heroQueries[Math.floor(Math.random() * heroQueries.length)];
            
            const response = await fetch(`${this.baseURL}?query=${encodeURIComponent(randomQuery)}&per_page=10&orientation=landscape`, {
                headers: {
                    'Authorization': this.apiKey
                }
            });

            const data = await response.json();
            
            if (data.photos && data.photos.length > 0) {
                const photo = data.photos[0]; // Prendre la première photo
                const imageUrl = photo.src.large;
                
                // Appliquer à l'élément hero
                const heroSection = document.querySelector('.hero-section');
                if (heroSection) {
                    heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${imageUrl})`;
                }
                
                return imageUrl;
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'image hero:', error);
            // Utiliser une image de fallback
            const fallbackHero = 'https://images.pexels.com/photos/8430275/pexels-photo-8430275.jpeg';
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${fallbackHero})`;
            }
            return fallbackHero;
        }
    }

    async loadNewsImages() {
        const newsItems = document.querySelectorAll('.news-item');
        
        for (let item of newsItems) {
            try {
                const sector = item.dataset.sector || 'general';
                const imageUrl = await this.fetchImage(sector, 'medium');
                
                const img = item.querySelector('.news-image img');
                if (img) {
                    img.src = imageUrl;
                    img.alt = `Actualité ${sector}`;
                }
            } catch (error) {
                console.error('Erreur chargement image actualité:', error);
            }
        }
    }

    // Préchargement optimisé avec lazy loading
    async preloadImages() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    }

    // Optimisation WebP
    supportsWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => resolve(webP.height === 2);
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    async optimizeImageFormat(url) {
        const supportsWebP = await this.supportsWebP();
        if (supportsWebP) {
            // Convertir l'URL pour demander le format WebP si l'API le supporte
            return url; // Pexels ne supporte pas la conversion WebP via paramètre, garder l'URL originale
        }
        return url;
    }
}

// Initialisation globale
window.pexelsIntegration = new PexelsIntegration();

// Auto-load au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const pexels = window.pexelsIntegration;
    
    // Charger les images avec un délai pour éviter trop de requêtes simultanées
    setTimeout(() => pexels.loadHeroImage(), 100);
    setTimeout(() => pexels.loadSectorImages(), 500);
    setTimeout(() => pexels.loadNewsImages(), 1000);
    setTimeout(() => pexels.preloadImages(), 1500);
});