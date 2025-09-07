'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/app/lib/supabase/client'
import ModernArticleTemplate from '@/app/components/blog/ModernArticleTemplate'
import { BlogPost } from '@/lib/blog/blog-service'

/**
 * Page détail actualité avec le template moderne du blog
 * Utilise ModernArticleTemplate pour un affichage premium uniforme
 */
export default function ActualitePage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [article, setArticle] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState<BlogPost[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchArticle()
    }
  }, [slug])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Récupérer l'article depuis scraped_articles
      const { data, error: fetchError } = await supabase
        .from('scraped_articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
      
      if (fetchError || !data) {
        setError('Article non trouvé')
        setArticle(null)
        return
      }
      
      // Transformer en format BlogPost pour le template
      const blogPost: BlogPost = {
        id: data.id,
        title: data.rewritten_title || data.original_title,
        slug: data.slug,
        content: data.rewritten_content || data.original_content,
        excerpt: data.rewritten_excerpt || data.original_excerpt,
        category: data.category || 'actualite',
        featured_image_url: data.featured_image_url || data.original_image_url,
        author_name: data.author_name || 'Raphael',
        author_bio: data.author_bio || 'Rédacteur en chef du Guide de Lyon',
        author_avatar: '/images/raphael-avatar.jpg',
        published_at: data.published_at || data.created_at,
        reading_time: Math.ceil((data.rewritten_content || data.original_content || '').split(' ').length / 200),
        keywords: data.keywords || [],
        meta_description: data.rewritten_meta_description || data.rewritten_excerpt || '',
        is_featured: false,
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        status: 'published'
      }
      
      setArticle(blogPost)
      
      // Récupérer les articles similaires
      if (data.category) {
        const { data: related } = await supabase
          .from('scraped_articles')
          .select('*')
          .eq('status', 'published')
          .eq('category', data.category)
          .neq('id', data.id)
          .order('published_at', { ascending: false })
          .limit(4)
        
        if (related) {
          const relatedPosts: BlogPost[] = related.map(item => ({
            id: item.id,
            title: item.rewritten_title || item.original_title,
            slug: item.slug,
            content: item.rewritten_content || item.original_content,
            excerpt: item.rewritten_excerpt || item.original_excerpt,
            category: item.category || 'actualite',
            featured_image_url: item.featured_image_url || item.original_image_url,
            author_name: item.author_name || 'Raphael',
            author_bio: item.author_bio || 'Rédacteur en chef du Guide de Lyon',
            author_avatar: '/images/raphael-avatar.jpg',
            published_at: item.published_at || item.created_at,
            reading_time: Math.ceil((item.rewritten_content || item.original_content || '').split(' ').length / 200),
            keywords: item.keywords || [],
            meta_description: item.rewritten_meta_description || item.rewritten_excerpt || '',
            is_featured: false,
            view_count: 0,
            like_count: 0,
            comment_count: 0,
            status: 'published'
          }))
          
          setRelatedArticles(relatedPosts)
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'article:', error)
      setError('Erreur lors du chargement de l\'article')
    } finally {
      setLoading(false)
    }
  };

  // État de chargement avec animation moderne
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600 font-medium">Chargement de l'actualité...</p>
        </div>
      </div>
    )
  }

  // État d'erreur ou article non trouvé
  if (error || !article) {
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
              href="/actualites" 
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour aux actualités
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

  // Affichage de l'article avec le template moderne du blog
  return <ModernArticleTemplate article={article} relatedArticles={relatedArticles} />
}