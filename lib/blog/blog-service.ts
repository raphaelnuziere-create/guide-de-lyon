/**
 * Service unifié pour la gestion des articles de blog
 * 
 * Ce service centralise l'accès aux données blog et résout le problème
 * des tables multiples (blog_posts vs original_blog_posts)
 */

import { supabase } from '@/lib/supabase';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url?: string | null;
  image_alt?: string | null;
  featured_image?: string | null;
  category: string;
  tags: string[] | null;
  author_name?: string;
  author?: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  created_at: string;
  published_at?: string;
  reading_time?: number;
  status?: string;
  published?: boolean;
  meta_title?: string;
  meta_description?: string;
}

class BlogService {
  /**
   * Table principale à utiliser
   * Peut être changée facilement ici sans toucher aux composants
   */
  private primaryTable = 'blog_posts'; // Utiliser blog_posts en production
  private fallbackTable = 'original_blog_posts';

  /**
   * Récupère tous les articles publiés
   */
  async getAllPosts(limit = 50): Promise<BlogPost[]> {
    try {
      if (!supabase) {
        console.warn('Supabase non configuré, utilisation des données de démonstration');
        return this.getDemoPosts();
      }

      // Essayer d'abord la table principale avec timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const queryPromise = supabase
        .from(this.primaryTable)
        .select('*')
        .eq('published', true) // Activer le filtre pour la production
        .order('created_at', { ascending: false })
        .limit(limit);
      
      let data, error;
      try {
        const result = await Promise.race([queryPromise, timeoutPromise]) as any;
        data = result.data;
        error = result.error;
      } catch (timeoutError) {
        console.log('Timeout sur la requête principale');
        error = timeoutError;
      }

      // Si erreur ou pas de données, essayer la table de fallback
      if (error || !data || data.length === 0) {
        console.log(`Fallback vers ${this.fallbackTable}`);
        const fallbackResult = await supabase
          .from(this.fallbackTable)
          .select('*')
          .or('published.eq.true,status.eq.published')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (fallbackResult.data && fallbackResult.data.length > 0) {
          data = fallbackResult.data;
          error = null;
        }
      }

      if (error) {
        console.error('Erreur récupération articles:', error);
        // En production, toujours retourner des articles de démo plutôt que rien
        return this.getDemoPosts();
      }

      if (!data || data.length === 0) {
        console.log('Aucun article trouvé, utilisation des données de démo');
        return this.getDemoPosts();
      }

      // Normaliser les données
      return this.normalizePosts(data);
    } catch (error) {
      console.error('Erreur dans getAllPosts:', error);
      return this.getDemoPosts();
    }
  }

  /**
   * Récupère un article par son slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      if (!supabase) {
        console.warn('Supabase non configuré, utilisation des données de démonstration');
        return this.getDemoPost(slug);
      }

      // Essayer d'abord la table principale
      let { data, error } = await supabase
        .from(this.primaryTable)
        .select('*')
        .eq('slug', slug)
        .single();

      // Si pas trouvé, essayer la table de fallback
      if (error || !data) {
        console.log(`Article non trouvé dans ${this.primaryTable}, essai avec ${this.fallbackTable}`);
        const fallbackResult = await supabase
          .from(this.fallbackTable)
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (fallbackResult.data) {
          data = fallbackResult.data;
          error = null;
        }
      }

      if (error || !data) {
        console.error(`Article non trouvé: ${slug}`);
        return null; // Ne PAS retourner un article de démo!
      }

      // Normaliser les données
      return this.normalizePost(data);
    } catch (error) {
      console.error('Erreur dans getPostBySlug:', error);
      return null;
    }
  }

  /**
   * Récupère les articles similaires
   */
  async getRelatedPosts(category: string, currentId: string, limit = 3): Promise<BlogPost[]> {
    try {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from(this.primaryTable)
        .select('*')
        .eq('category', category)
        .neq('id', currentId)
        .or('published.eq.true,status.eq.published')
        .limit(limit);

      if (error || !data) {
        // Essayer avec la table de fallback
        const fallbackResult = await supabase
          .from(this.fallbackTable)
          .select('*')
          .eq('category', category)
          .neq('id', currentId)
          .or('published.eq.true,status.eq.published')
          .limit(limit);
        
        if (fallbackResult.data) {
          return this.normalizePosts(fallbackResult.data);
        }
        return [];
      }

      return this.normalizePosts(data);
    } catch (error) {
      console.error('Erreur dans getRelatedPosts:', error);
      return [];
    }
  }

  /**
   * Recherche d'articles
   */
  async searchPosts(query: string): Promise<BlogPost[]> {
    try {
      if (!supabase || !query) return [];

      const { data, error } = await supabase
        .from(this.primaryTable)
        .select('*')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .or('published.eq.true,status.eq.published')
        .limit(20);

      if (error || !data) return [];
      return this.normalizePosts(data);
    } catch (error) {
      console.error('Erreur dans searchPosts:', error);
      return [];
    }
  }

  /**
   * Récupère les catégories uniques
   */
  async getCategories(): Promise<string[]> {
    try {
      if (!supabase) return ['Tourisme', 'Gastronomie', 'Événements', 'Culture', 'Shopping'];

      const { data, error } = await supabase
        .from(this.primaryTable)
        .select('category')
        .or('published.eq.true,status.eq.published')
        .not('category', 'is', null);

      if (error || !data) {
        // Essayer avec la table de fallback
        const fallbackResult = await supabase
          .from(this.fallbackTable)
          .select('category')
          .or('published.eq.true,status.eq.published')
          .not('category', 'is', null);
        
        if (fallbackResult.data) {
          const categories = [...new Set(fallbackResult.data.map(item => item.category))].filter(Boolean);
          return ['all', ...categories];
        }
        return ['all', 'Tourisme', 'Gastronomie', 'Événements', 'Culture', 'Shopping'];
      }

      const categories = [...new Set(data.map(item => item.category))].filter(Boolean);
      return ['all', ...categories];
    } catch (error) {
      console.error('Erreur dans getCategories:', error);
      return ['all', 'Tourisme', 'Gastronomie', 'Événements', 'Culture', 'Shopping'];
    }
  }

  /**
   * Normalise un article pour avoir une structure cohérente
   */
  private normalizePost(post: any): BlogPost {
    return {
      ...post,
      slug: post.slug || this.generateSlug(post.title),
      author: post.author || { 
        name: post.author_name || 'Guide de Lyon',
        avatar: post.author_avatar,
        bio: post.author_bio
      },
      tags: this.normalizeTags(post.tags),
      featured_image: post.featured_image || post.image_url,
      published_at: post.created_at,
      reading_time: post.reading_time || this.calculateReadingTime(post.content),
      status: post.status || (post.published ? 'published' : 'draft')
    };
  }

  /**
   * Normalise plusieurs articles
   */
  private normalizePosts(posts: any[]): BlogPost[] {
    return posts.map(post => this.normalizePost(post));
  }

  /**
   * Normalise les tags
   */
  private normalizeTags(tags: any): string[] | null {
    if (!tags) return null;
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return tags.split(',').map(t => t.trim());
      }
    }
    return null;
  }

  /**
   * Génère un slug à partir du titre
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[àáäâ]/g, 'a')
      .replace(/[èéëê]/g, 'e')
      .replace(/[ìíïî]/g, 'i')
      .replace(/[òóöô]/g, 'o')
      .replace(/[ùúüû]/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Calcule le temps de lecture
   */
  private calculateReadingTime(content: string): number {
    if (!content) return 5;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }

  /**
   * Articles de démonstration (fallback)
   */
  private getDemoPosts(): BlogPost[] {
    return [
      {
        id: '1',
        slug: 'decouvrir-vieux-lyon',
        title: 'Découvrir le Vieux Lyon : Un voyage dans le temps',
        excerpt: 'Explorez les ruelles médiévales et Renaissance du Vieux Lyon, classé au patrimoine mondial de l\'UNESCO.',
        content: 'Le Vieux Lyon est l\'un des quartiers Renaissance les plus vastes d\'Europe...',
        featured_image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800',
        category: 'Tourisme',
        tags: ['patrimoine', 'histoire', 'UNESCO'],
        author_name: 'Marie Dubois',
        author: { name: 'Marie Dubois' },
        created_at: new Date().toISOString(),
        reading_time: 5,
        status: 'published'
      },
      {
        id: '2',
        slug: 'meilleurs-bouchons-lyonnais',
        title: 'Les 10 meilleurs bouchons lyonnais authentiques',
        excerpt: 'Guide complet des bouchons traditionnels où déguster la vraie cuisine lyonnaise.',
        content: 'La gastronomie lyonnaise est mondialement reconnue...',
        featured_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        category: 'Gastronomie',
        tags: ['restaurants', 'cuisine', 'tradition'],
        author_name: 'Pierre Martin',
        author: { name: 'Pierre Martin' },
        created_at: new Date(Date.now() - 86400000).toISOString(),
        reading_time: 8,
        status: 'published'
      },
      {
        id: '3',
        slug: 'fete-des-lumieres-2024',
        title: 'Fête des Lumières 2024 : Programme et nouveautés',
        excerpt: 'Tout ce qu\'il faut savoir sur l\'édition 2024 de la Fête des Lumières de Lyon.',
        content: 'La Fête des Lumières illumine Lyon chaque décembre...',
        featured_image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800',
        category: 'Événements',
        tags: ['festival', 'lumières', 'décembre'],
        author_name: 'Sophie Laurent',
        author: { name: 'Sophie Laurent' },
        created_at: new Date(Date.now() - 172800000).toISOString(),
        reading_time: 6,
        status: 'published'
      }
    ];
  }

  /**
   * Article de démonstration unique
   */
  private getDemoPost(slug: string): BlogPost | null {
    const posts = this.getDemoPosts();
    return posts.find(p => p.slug === slug) || null;
  }
}

// Export d'une instance unique (singleton)
export const blogService = new BlogService();