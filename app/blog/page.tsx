'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowRight, Search, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  featured_image: string | null
  category: string
  tags: string[]
  author: {
    name: string
    avatar?: string
  }
  published_at: string
  reading_time: number
  status: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      
      // Vérifier si Supabase est configuré
      if (!supabase) {
        console.log('Supabase non configuré, utilisation des données de démonstration')
        loadDemoData()
        return
      }
      
      // Récupérer les articles depuis Supabase
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erreur lors de la récupération des articles:', error)
        // Utiliser des données de démonstration en cas d'erreur
        loadDemoData()
      } else if (data && data.length > 0) {
        setPosts(data)
        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(data.map(post => post.category))].filter(Boolean)
        setCategories(['all', ...uniqueCategories])
      } else {
        loadDemoData()
      }
    } catch (error) {
      console.error('Erreur:', error)
      loadDemoData()
    } finally {
      setLoading(false)
    }
  }

  const loadDemoData = () => {
    // Données de démonstration si la base est vide ou inaccessible
    const demoPosts: BlogPost[] = [
      {
        id: '1',
        slug: 'decouvrir-vieux-lyon',
        title: 'Découvrir le Vieux Lyon : Un voyage dans le temps',
        excerpt: 'Explorez les ruelles médiévales et Renaissance du Vieux Lyon, classé au patrimoine mondial de l\'UNESCO.',
        content: 'Le Vieux Lyon est l\'un des quartiers Renaissance les plus vastes d\'Europe...',
        featured_image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800',
        category: 'Tourisme',
        tags: ['patrimoine', 'histoire', 'UNESCO'],
        author: { name: 'Marie Dubois' },
        published_at: new Date().toISOString(),
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
        author: { name: 'Pierre Martin' },
        published_at: new Date(Date.now() - 86400000).toISOString(),
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
        author: { name: 'Sophie Laurent' },
        published_at: new Date(Date.now() - 172800000).toISOString(),
        reading_time: 6,
        status: 'published'
      }
    ]
    setPosts(demoPosts)
    setCategories(['all', 'Tourisme', 'Gastronomie', 'Événements', 'Culture', 'Shopping'])
  }

  // Filtrer les articles
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
      post.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog Guide de Lyon</h1>
          <p className="text-xl text-blue-100">
            Actualités, conseils et découvertes lyonnaises
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Toutes les catégories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement des articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Aucun article trouvé.</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Post (premier article) */}
            {filteredPosts.length > 0 && selectedCategory === 'all' && !searchQuery && (
              <div className="mb-12">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <div className="h-64 md:h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center mb-4">
                        <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                          {filteredPosts[0].category}
                        </span>
                        <span className="ml-4 text-gray-500 text-sm flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(filteredPosts[0].published_at)}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
                        {filteredPosts[0].title}
                      </h2>
                      
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {filteredPosts[0].excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="w-4 h-4 mr-1" />
                          {filteredPosts[0].author.name}
                          <span className="mx-2">•</span>
                          <Clock className="w-4 h-4 mr-1" />
                          {filteredPosts[0].reading_time} min
                        </div>
                        
                        <Link 
                          href={`/blog/${filteredPosts[0].slug}`}
                          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
                        >
                          Lire la suite
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(selectedCategory === 'all' && !searchQuery ? filteredPosts.slice(1) : filteredPosts).map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-xl"></div>
                  
                  <div className="p-6">
                    {/* Category & Date */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(post.published_at)}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs text-gray-500 flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        {post.author.name}
                      </div>
                      
                      <Link 
                        href={`/blog/${post.slug}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center"
                      >
                        Lire
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            {filteredPosts.length > 9 && (
              <div className="text-center mt-12">
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
                  Charger plus d'articles
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Newsletter CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ne manquez aucun article</h2>
          <p className="text-xl mb-8 text-blue-100">
            Inscrivez-vous à notre newsletter pour recevoir nos derniers articles
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}