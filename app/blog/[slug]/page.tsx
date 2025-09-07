'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { blogService, type BlogPost } from '@/lib/blog/blog-service'
import ModernArticleTemplate from '@/app/components/blog/ModernArticleTemplate'

/**
 * Page détail article avec nouveau design moderne
 * Utilise le template ModernArticleTemplate pour un affichage premium
 */
export default function BlogPostPage() {
  const params = useParams()
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
          article.id,
          4 // Récupérer 4 articles similaires
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

  // État de chargement avec animation moderne
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Chargement de l'article...</p>
        </div>
      </div>
    )
  }

  // État d'erreur ou article non trouvé
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Article introuvable
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Désolé, l'article que vous recherchez n'existe pas ou a été déplacé.
          </p>
          <div className="space-y-4">
            <Link 
              href="/blog" 
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour au blog
            </Link>
            <div>
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Aller à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Affichage de l'article avec le nouveau template moderne
  return <ModernArticleTemplate article={post} relatedArticles={relatedPosts} />
}