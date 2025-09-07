'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, Tag, TrendingUp, Eye } from 'lucide-react';
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

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      let query = supabase
        .from('scraped_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

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
    { value: 'all', label: 'Toutes', icon: '📰' },
    { value: 'actualite', label: 'Actualité', icon: '🔥' },
    { value: 'culture', label: 'Culture', icon: '🎭' },
    { value: 'sport', label: 'Sport', icon: '⚽' },
    { value: 'economie', label: 'Économie', icon: '💼' },
    { value: 'societe', label: 'Société', icon: '👥' },
    { value: 'politique', label: 'Politique', icon: '🏛️' }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Actualités Lyon
          </h1>
          <p className="text-xl text-blue-100">
            Toute l'actualité lyonnaise en temps réel
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun article dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <article
                key={article.id}
                className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
                  index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                }`}
              >
                {/* Image */}
                {article.featured_image_url && (
                  <div className={`relative ${index === 0 ? 'h-80' : 'h-48'} bg-gray-200`}>
                    <Image
                      src={article.featured_image_url}
                      alt={article.rewritten_title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1524484082325-6d68c1e2b8c0?w=800';
                      }}
                    />
                    {index === 0 && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        À LA UNE
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Category & Date */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {categories.find(c => c.value === article.category)?.label || 'Actualité'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(article.published_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className={`font-bold text-gray-900 mb-3 hover:text-blue-600 transition ${
                    index === 0 ? 'text-2xl' : 'text-xl'
                  }`}>
                    <Link href={`/actualites/${article.slug}`}>
                      {article.rewritten_title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.rewritten_excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{article.author_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views_count}
                      </span>
                      {article.keywords && article.keywords.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {article.keywords.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Load More */}
        {articles.length >= 20 && (
          <div className="text-center mt-8">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Charger plus d'articles
            </button>
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ne manquez rien de l'actualité lyonnaise
          </h2>
          <p className="text-xl text-blue-100 mb-6">
            Recevez les dernières nouvelles directement dans votre boîte mail
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              S'abonner
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}