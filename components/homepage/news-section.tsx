'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, TrendingUp, ArrowRight, Eye, Newspaper, Flame } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

interface Article {
  id: string;
  slug: string;
  rewritten_title: string;
  rewritten_excerpt: string;
  featured_image_url: string;
  category: string;
  author_name: string;
  published_at: string;
  views_count: number;
}

export function NewsSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestArticles();
  }, []);

  const fetchLatestArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('scraped_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Erreur chargement actualités:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Il y a moins d\'une heure';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffHours < 48) return 'Hier';
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      actualite: 'bg-red-500',
      culture: 'bg-purple-500',
      sport: 'bg-green-500',
      economie: 'bg-blue-500',
      societe: 'bg-yellow-500',
      politique: 'bg-gray-600'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      actualite: 'Actualité',
      culture: 'Culture',
      sport: 'Sport',
      economie: 'Économie',
      societe: 'Société',
      politique: 'Politique'
    };
    return labels[category] || 'Info';
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <Newspaper className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Actualités Lyon
              </h2>
              <p className="text-gray-600 mt-1">Les dernières nouvelles de votre ville</p>
            </div>
          </div>
          <Link
            href="/actualites"
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition group"
          >
            Toutes les actualités
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className={`bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group ${
                index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
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
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`${getCategoryColor(article.category)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                    {getCategoryLabel(article.category)}
                  </span>
                </div>

                {/* New Badge for recent articles */}
                {index === 0 && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      NOUVEAU
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(article.published_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views_count} vues
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition">
                  <Link href={`/actualites/${article.slug}`}>
                    {article.rewritten_title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {article.rewritten_excerpt}
                </p>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Par {article.author_name}
                  </span>
                  <Link
                    href={`/actualites/${article.slug}`}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                  >
                    Lire →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-lg"
          >
            <TrendingUp className="w-5 h-5" />
            Découvrir plus d'actualités
          </Link>
        </div>
      </div>
    </section>
  );
}