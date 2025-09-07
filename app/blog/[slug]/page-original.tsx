'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, Share2, Heart, MessageCircle, Tag } from 'lucide-react'
import { blogService, type BlogPost } from '@/lib/blog/blog-service'

/**
 * Version améliorée de la page détail blog
 * - Utilise le service unifié pour accéder aux données
 * - Plus de contenu hardcodé
 * - Gestion d'erreur appropriée
 */
export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Utiliser le service unifié
      const article = await blogService.getPostBySlug(slug)
      
      if (!article) {
        setError('Article non trouvé')
        setPost(null)
        return
      }
      
      setPost(article)
      
      // Récupérer les articles similaires
      if (article.category && article.id) {
        const related = await blogService.getRelatedPosts(
          article.category, 
          article.id
        )
        setRelatedPosts(related)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'article:', error)
      setError('Erreur lors du chargement de l\'article')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = post?.title || ''
    
    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        break
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement de l'article...</p>
        </div>
      </div>
    )
  }

  // État d'erreur ou article non trouvé
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Article non trouvé'}
          </h2>
          <p className="text-gray-600 mb-6">
            L'article que vous recherchez n'existe pas ou a été déplacé.
          </p>
          <div className="space-y-3">
            <Link 
              href="/blog" 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Link>
            <div>
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-700"
              >
                Aller à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <div className="relative h-96 bg-gradient-to-br from-blue-600 to-indigo-700">
        {post.featured_image && (
          <img 
            src={post.featured_image} 
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="text-white">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm">
                {post.category}
              </span>
              <span className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(post.published_at || post.created_at)}
              </span>
              <span className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {post.reading_time || 5} min de lecture
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl">
              {post.excerpt}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <article className="flex-1">
            {/* Author Info */}
            <div className="flex items-center mb-8 pb-8 border-b">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {post.author?.avatar ? (
                  <img 
                    src={post.author.avatar} 
                    alt={post.author.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">
                  {post.author?.name || post.author_name || 'Guide de Lyon'}
                </p>
                {post.author?.bio && (
                  <p className="text-sm text-gray-600">{post.author.bio}</p>
                )}
              </div>
              
              <div className="ml-auto flex gap-2">
                <button 
                  onClick={() => handleShare('facebook')}
                  className="p-2 text-gray-600 hover:text-blue-600 transition"
                  title="Partager sur Facebook"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-red-600 transition">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none
                prose-headings:text-gray-900 
                prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-blue-600 prose-a:hover:text-blue-700
                prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                prose-li:mb-2
                prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-600 font-semibold">Tags:</span>
                  {post.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-700 font-semibold mb-4">Partager cet article</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Facebook
                </button>
                <button 
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Twitter
                </button>
                <button 
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </article>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t">
            <h2 className="text-2xl font-bold mb-8">Articles similaires</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <div className="bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition">
                    {relatedPost.featured_image ? (
                      <img 
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="h-40 w-full object-cover group-hover:opacity-90 transition"
                      />
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 group-hover:opacity-90 transition"></div>
                    )}
                    <div className="p-4">
                      <p className="text-sm text-blue-600 mb-2">{relatedPost.category}</p>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Newsletter CTA */}
      <section className="bg-gray-100 py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Restons en contact</h2>
          <p className="text-gray-600 mb-8">
            Recevez nos derniers articles directement dans votre boîte mail
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-6 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}