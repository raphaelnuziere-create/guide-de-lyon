// Page actualités - Guide de Lyon (Server Component)
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, User, Tag, Eye, Newspaper } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

interface Article {
  id: string;
  slug: string;
  rewritten_title: string;
  rewritten_content?: string;
  featured_image_url: string;
  category: string;
  published_at: string;
  status: string;
}

async function getArticles() {
  try {
    const { data, error } = await supabase
      .from('scraped_articles')
      .select('id, slug, rewritten_title, rewritten_content, featured_image_url, category, published_at, status')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Erreur chargement articles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) return "À l'instant";
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffHours < 48) return "Hier";
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getCategoryColor(category: string) {
  const colors: Record<string, string> = {
    actualite: 'bg-red-600',
    culture: 'bg-purple-600',
    sport: 'bg-green-600',
    economie: 'bg-blue-600',
    societe: 'bg-yellow-600',
    politique: 'bg-indigo-600'
  };
  return colors[category?.toLowerCase()] || 'bg-gray-600';
}

function getExcerpt(content: string | undefined, title: string) {
  if (!content) {
    return `Découvrez cette actualité lyonnaise : ${title}`;
  }
  // Retirer les balises HTML et limiter à 150 caractères
  const text = content.replace(/<[^>]*>/g, '').substring(0, 150);
  return text + (text.length >= 150 ? '...' : '');
}

export default async function ActualitesPage() {
  const articles = await getArticles();

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Actualités de Lyon</h1>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucun article disponible pour le moment.</p>
            <p className="text-gray-500 mt-2">Revenez bientôt pour découvrir les dernières actualités lyonnaises.</p>
          </div>
        </div>
      </div>
    );
  }

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-5xl font-bold mb-4">Actualités de Lyon</h1>
          <p className="text-xl text-blue-100">
            Toute l'actualité lyonnaise en temps réel
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article à la une */}
        {featuredArticle && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-3xl mr-2">🔥</span>
              À la une
            </h2>
            <Link href={`/actualites/${featuredArticle.slug}`}>
              <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <div className="relative h-64 md:h-full">
                      <Image
                        src={featuredArticle.featured_image_url || '/images/lyon-default.jpg'}
                        alt={featuredArticle.rewritten_title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className={`absolute top-4 left-4 ${getCategoryColor(featuredArticle.category)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                        {featuredArticle.category || 'Actualité'}
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 p-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {featuredArticle.rewritten_title}
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      {getExcerpt(featuredArticle.rewritten_content, featuredArticle.rewritten_title)}
                    </p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(featuredArticle.published_at)}</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          </div>
        )}

        {/* Autres articles */}
        {otherArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dernières actualités</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherArticles.map((article) => (
                <Link key={article.id} href={`/actualites/${article.slug}`}>
                  <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="relative h-48">
                      <Image
                        src={article.featured_image_url || '/images/lyon-default.jpg'}
                        alt={article.rewritten_title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className={`absolute top-3 left-3 ${getCategoryColor(article.category)} text-white px-2 py-1 rounded-full text-xs font-semibold`}>
                        {article.category || 'Actualité'}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {article.rewritten_title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {getExcerpt(article.rewritten_content, article.rewritten_title)}
                      </p>
                      <div className="flex items-center text-gray-500 text-xs">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}