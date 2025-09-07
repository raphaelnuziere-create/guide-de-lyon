'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, Tag, TrendingUp, Eye, Newspaper, Flame, BookOpen, Share2, Bookmark, Filter, Search, ChevronRight, Bell } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

interface Article {
  id: string;
  slug: string;
  rewritten_title: string;
  rewritten_excerpt: string;
  rewritten_meta_description: string;
  featured_image_url: string;
  category: string;
  keywords: string[];
  author_name: string;
  published_at: string;
  views_count: number;
}

export default function ActualitesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, sortBy]);

  const fetchArticles = async () => {
    try {
      let query = supabase
        .from('scraped_articles')
        .select('*')
        .eq('status', 'published');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (sortBy === 'recent') {
        query = query.order('published_at', { ascending: false });
      } else {
        query = query.order('views_count', { ascending: false });
      }

      query = query.limit(30);

      const { data, error } = await query;

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Erreur chargement articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'Toutes', icon: '📰', color: 'bg-gray-600' },
    { value: 'actualite', label: 'Actualité', icon: '🔥', color: 'bg-red-600' },
    { value: 'culture', label: 'Culture', icon: '🎭', color: 'bg-purple-600' },
    { value: 'sport', label: 'Sport', icon: '⚽', color: 'bg-green-600' },
    { value: 'economie', label: 'Économie', icon: '💼', color: 'bg-blue-600' },
    { value: 'societe', label: 'Société', icon: '👥', color: 'bg-yellow-600' },
    { value: 'politique', label: 'Politique', icon: '🏛️', color: 'bg-indigo-600' }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Il y a moins d\'une heure';
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffHours < 48) return 'Hier';
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredArticles = articles.filter(article => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return article.rewritten_title.toLowerCase().includes(query) ||
           article.rewritten_excerpt.toLowerCase().includes(query);
  });

  const featuredArticle = filteredArticles[0];
  const mainArticles = filteredArticles.slice(1, 7);
  const remainingArticles = filteredArticles.slice(7);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
                <Newspaper className="w-12 h-12" />
                Actualités Lyon
              </h1>
              <p className="text-xl text-red-100">
                L'information lyonnaise en temps réel
              </p>
            </div>
            <button className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/30 transition">
              <Bell className="w-5 h-5" />
              S'abonner aux alertes
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/50"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
                className="px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                <option value="recent">Plus récent</option>
                <option value="popular">Plus populaire</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? `${cat.color} text-white shadow-lg scale-105`
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium">{cat.label}</span>
                {selectedCategory === cat.value && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {filteredArticles.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">Aucun article dans cette catégorie</p>
        </div>
      ) : (
        <>
          {/* Featured Article */}
          {featuredArticle && (
            <section className="max-w-7xl mx-auto px-4 py-12">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-gray-900 to-gray-700">
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
                {featuredArticle.featured_image_url && (
                  <Image
                    src={featuredArticle.featured_image_url}
                    alt={featuredArticle.rewritten_title}
                    width={1200}
                    height={600}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1524484082325-6d68c1e2b8c0?w=1200';
                    }}
                  />
                )}
                <div className="relative z-20 p-12 md:w-2/3">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      À LA UNE
                    </span>
                    <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-sm">
                      {categories.find(c => c.value === featuredArticle.category)?.label || 'Actualité'}
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    <Link href={`/actualites/${featuredArticle.slug}`} className="hover:underline">
                      {featuredArticle.rewritten_title}
                    </Link>
                  </h2>
                  <p className="text-xl text-gray-200 mb-6 line-clamp-3">
                    {featuredArticle.rewritten_excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-gray-300">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {featuredArticle.author_name}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDate(featuredArticle.published_at)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {featuredArticle.views_count} vues
                    </span>
                  </div>
                  <Link
                    href={`/actualites/${featuredArticle.slug}`}
                    className="inline-flex items-center gap-2 mt-6 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Lire l'article
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Main Articles Grid */}
          {mainArticles.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 py-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-red-600" />
                Articles populaires
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainArticles.map((article, index) => (
                  <article
                    key={article.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                  >
                    {/* Image */}
                    <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                      {article.featured_image_url ? (
                        <Image
                          src={article.featured_image_url}
                          alt={article.rewritten_title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1524484082325-6d68c1e2b8c0?w=800';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`${categories.find(c => c.value === article.category)?.color || 'bg-gray-600'} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                          {categories.find(c => c.value === article.category)?.label || 'Actualité'}
                        </span>
                        {index === 0 && (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            TOP
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button className="bg-white/90 backdrop-blur p-2 rounded-lg hover:bg-white transition">
                          <Bookmark className="w-4 h-4 text-gray-700" />
                        </button>
                        <button className="bg-white/90 backdrop-blur p-2 rounded-lg hover:bg-white transition">
                          <Share2 className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(article.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          3 min
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition">
                        <Link href={`/actualites/${article.slug}`}>
                          {article.rewritten_title}
                        </Link>
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {article.rewritten_excerpt}
                      </p>

                      {/* Keywords */}
                      {article.keywords && article.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.keywords.slice(0, 3).map((keyword, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="text-sm text-gray-600">{article.author_name}</span>
                        </div>
                        <Link
                          href={`/actualites/${article.slug}`}
                          className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                        >
                          Lire
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Remaining Articles List */}
          {remainingArticles.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 py-8">
              <h2 className="text-2xl font-bold mb-6">Plus d'actualités</h2>
              <div className="grid gap-4">
                {remainingArticles.map(article => (
                  <article
                    key={article.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg transition p-6 flex gap-6"
                  >
                    {/* Thumbnail */}
                    {article.featured_image_url && (
                      <div className="hidden md:block relative w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={article.featured_image_url}
                          alt={article.rewritten_title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1524484082325-6d68c1e2b8c0?w=400';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`${categories.find(c => c.value === article.category)?.color || 'bg-gray-600'} text-white px-2 py-1 rounded text-xs font-bold`}>
                          {categories.find(c => c.value === article.category)?.label || 'Actualité'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(article.published_at)}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {article.views_count} vues
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-red-600 transition">
                        <Link href={`/actualites/${article.slug}`}>
                          {article.rewritten_title}
                        </Link>
                      </h3>
                      <p className="text-gray-600 line-clamp-2">
                        {article.rewritten_excerpt}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More */}
              {filteredArticles.length >= 30 && (
                <div className="text-center mt-8">
                  <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition shadow-lg">
                    Charger plus d'articles
                  </button>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Bell className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Ne manquez rien de l'actualité lyonnaise
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Recevez les dernières nouvelles directement dans votre boîte mail
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              S'abonner
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}