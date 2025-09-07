'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, User, Eye, Calendar, Tag, Share2, Bookmark, ArrowLeft, Newspaper, Heart, MessageCircle, ThumbsUp } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

interface Article {
  id: string;
  slug: string;
  rewritten_title: string;
  rewritten_content: string;
  rewritten_excerpt: string;
  rewritten_meta_description: string;
  featured_image_url: string;
  image_alt_text: string;
  category: string;
  keywords: string[];
  author_name: string;
  author_bio: string;
  published_at: string;
  views_count: number;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchArticle(params.slug as string);
    }
  }, [params.slug]);

  const fetchArticle = async (slug: string) => {
    try {
      // Fetch main article
      const { data: articleData, error: articleError } = await supabase
        .from('scraped_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (articleError) throw articleError;
      
      if (articleData) {
        setArticle(articleData);
        
        // Update views count
        await supabase
          .from('scraped_articles')
          .update({ views_count: (articleData.views_count || 0) + 1 })
          .eq('id', articleData.id);

        // Fetch related articles
        const { data: relatedData } = await supabase
          .from('scraped_articles')
          .select('*')
          .eq('status', 'published')
          .eq('category', articleData.category)
          .neq('id', articleData.id)
          .order('published_at', { ascending: false })
          .limit(4);

        if (relatedData) {
          setRelatedArticles(relatedData);
        }
      }
    } catch (error) {
      console.error('Erreur chargement article:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      actualite: 'bg-red-600',
      culture: 'bg-purple-600',
      sport: 'bg-green-600',
      economie: 'bg-blue-600',
      societe: 'bg-yellow-600',
      politique: 'bg-indigo-600'
    };
    return colors[category] || 'bg-gray-600';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Newspaper className="w-20 h-20 text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Article non trouvé</h1>
        <p className="text-gray-600 mb-6">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link
          href="/actualites"
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux actualités
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Image */}
      <div className="relative h-[60vh] bg-gradient-to-br from-gray-900 to-gray-700">
        {article.featured_image_url && (
          <Image
            src={article.featured_image_url}
            alt={article.image_alt_text || article.rewritten_title}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1524484082325-6d68c1e2b8c0?w=1600';
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Breadcrumb */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            href="/actualites"
            className="flex items-center gap-2 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg hover:bg-white/30 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>

        {/* Article Header */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className={`${getCategoryColor(article.category)} text-white px-4 py-2 rounded-full text-sm font-bold`}>
                {getCategoryLabel(article.category)}
              </span>
              <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-sm">
                <Eye className="w-4 h-4 inline mr-1" />
                {article.views_count} vues
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {article.rewritten_title}
            </h1>
            <p className="text-xl text-gray-200 mb-6">
              {article.rewritten_excerpt}
            </p>
            <div className="flex items-center gap-6 text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{article.author_name}</p>
                  <p className="text-sm">{article.author_bio}</p>
                </div>
              </div>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(article.published_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between py-6 border-b mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span>{liked ? 'J\'aime' : 'J\'aime'}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
              <MessageCircle className="w-5 h-5" />
              <span>Commenter</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-2 rounded-lg transition ${
                bookmarked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.rewritten_content }}
          />
        </article>

        {/* Keywords */}
        {article.keywords && article.keywords.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">Mots-clés</h3>
            <div className="flex flex-wrap gap-2">
              {article.keywords.map((keyword, index) => (
                <Link
                  key={index}
                  href={`/actualites?q=${encodeURIComponent(keyword)}`}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition"
                >
                  #{keyword}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Box */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{article.author_name}</h3>
              <p className="text-gray-600 mb-3">{article.author_bio}</p>
              <Link
                href="/actualites"
                className="text-red-600 hover:text-red-700 font-semibold text-sm"
              >
                Voir tous ses articles →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Articles similaires</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArticles.map(related => (
                <article
                  key={related.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition overflow-hidden"
                >
                  {related.featured_image_url && (
                    <div className="relative h-40 bg-gray-200">
                      <Image
                        src={related.featured_image_url}
                        alt={related.rewritten_title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1524484082325-6d68c1e2b8c0?w=400';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <span className={`inline-block ${getCategoryColor(related.category)} text-white px-2 py-1 rounded text-xs font-bold mb-2`}>
                      {getCategoryLabel(related.category)}
                    </span>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-red-600 transition">
                      <Link href={`/actualites/${related.slug}`}>
                        {related.rewritten_title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {related.rewritten_excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-red-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Restez informé de l'actualité lyonnaise
          </h2>
          <p className="text-xl text-red-100 mb-6">
            Inscrivez-vous à notre newsletter pour ne rien manquer
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button
              type="submit"
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              S'abonner
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}