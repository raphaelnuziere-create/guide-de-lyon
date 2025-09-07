'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowRight, Search, Tag } from 'lucide-react'
import { blogService, type BlogPost } from '@/lib/blog/blog-service'
import LoadingWithTimeout from '@/app/components/LoadingWithTimeout'

/**
 * Version améliorée de la page liste blog
 * - Utilise le service unifié pour accéder aux données
 * - Gestion cohérente des données
 */
export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<string[]>(['all'])

  useEffect(() => {
    fetchPosts()
    fetchCategories()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      
      // Ajouter un timeout à la requête
      const fetchPromise = blogService.getAllPosts()
      const timeoutPromise = new Promise<BlogPost[]>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      )
      
      const articles = await Promise.race([fetchPromise, timeoutPromise])
      setPosts(articles)
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error)
      setPosts([])
      // Si c'est un timeout, on force quand même l'arrêt du loading
      if (error instanceof Error && error.message === 'Timeout') {
        console.log('[Blog] Timeout détecté, arrêt du chargement')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const cats = await blogService.getCategories()
      setCategories(cats)
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
    }
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
          <LoadingWithTimeout 
            timeout={10000}
            message="Chargement des articles..."
            onTimeout={() => {
              console.log('[Blog] Timeout du chargement')
              setLoading(false)
              setPosts([])
            }}
          />
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
                      {filteredPosts[0].featured_image ? (
                        <img 
                          src={filteredPosts[0].featured_image} 
                          alt={filteredPosts[0].title}
                          className="h-64 md:h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-64 md:h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                      )}
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center mb-4">
                        <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                          {filteredPosts[0].category}
                        </span>
                        <span className="ml-4 text-gray-500 text-sm flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(filteredPosts[0].published_at || filteredPosts[0].created_at)}
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
                          {filteredPosts[0].author?.name || filteredPosts[0].author_name || 'Guide de Lyon'}
                          <span className="mx-2">•</span>
                          <Clock className="w-4 h-4 mr-1" />
                          {filteredPosts[0].reading_time || 5} min
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
                <article key={post.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                  {/* Image */}
                  {post.featured_image ? (
                    <img 
                      src={post.featured_image} 
                      alt={post.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  )}
                  
                  <div className="p-6">
                    {/* Category & Date */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(post.published_at || post.created_at)}
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
                    {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
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
                        {post.author?.name || post.author_name || 'Guide de Lyon'}
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
                <button 
                  onClick={() => {
                    // À implémenter : charger plus d'articles
                    console.log('Charger plus d\'articles')
                  }}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
                >
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
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              // À implémenter : inscription newsletter
              console.log('Inscription newsletter')
            }}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 placeholder-gray-500"
              required
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