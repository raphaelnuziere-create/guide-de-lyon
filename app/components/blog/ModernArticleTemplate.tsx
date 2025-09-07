'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Clock, Calendar, User, Tag, Share2, BookOpen, ChevronRight, MapPin, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ArticleTemplateProps {
  article: {
    id: string
    title: string
    excerpt: string
    content: string
    featured_image?: string | null
    image_url?: string | null
    author_name?: string
    created_at: string
    published_at?: string
    reading_time?: number
    category: string
    tags?: string[] | null
    slug: string
  }
  relatedArticles?: any[]
}

export default function ModernArticleTemplate({ article, relatedArticles = [] }: ArticleTemplateProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [tableOfContents, setTableOfContents] = useState<{ id: string; text: string; level: number }[]>([])
  
  const publishedDate = new Date(article.published_at || article.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const wordCount = article.content?.split(' ').length || 0
  const readingTime = article.reading_time || Math.ceil(wordCount / 200)
  const featuredImage = article.featured_image || article.image_url || 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200&h=600&fit=crop'
  
  useEffect(() => {
    // Extraire la table des matières du contenu
    const headings = extractHeadings(article.content)
    setTableOfContents(headings)
  }, [article.content])
  
  return (
    <article className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section avec image immersive */}
      <div className="relative h-[70vh] min-h-[500px] w-full">
        <Image
          src={featuredImage}
          alt={article.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Contenu Hero */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
          <div className="max-w-5xl mx-auto">
            {/* Catégorie Badge */}
            <Link 
              href={`/blog?category=${encodeURIComponent(article.category)}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 
                       text-white rounded-full text-sm font-semibold mb-6 transition-colors"
            >
              <Tag size={14} className="mr-2" />
              {article.category}
            </Link>
            
            {/* Titre */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {article.title}
            </h1>
            
            {/* Excerpt */}
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl leading-relaxed">
              {article.excerpt}
            </p>
          </div>
        </div>
      </div>
      
      {/* Barre de métadonnées sticky */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="font-medium">{article.author_name || 'Guide de Lyon'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <time>{publishedDate}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{readingTime} min</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{wordCount.toLocaleString('fr-FR')} mots</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-all ${
                  isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
              <button 
                onClick={() => navigator.share({ title: article.title, url: window.location.href })}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal avec sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar gauche - Table des matières */}
          {tableOfContents.length > 0 && (
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-32">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Dans cet article
                  </h2>
                  <nav className="space-y-2">
                    {tableOfContents.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block py-2 px-3 rounded-lg text-sm transition-all hover:bg-white/80 ${
                          heading.level === 2 ? 'font-medium text-gray-800' : 'text-gray-600 pl-6'
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
                
                {/* Newsletter CTA */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Newsletter Lyon Insider</h3>
                  <p className="text-sm text-blue-100 mb-4">
                    Recevez nos meilleurs conseils chaque semaine
                  </p>
                  <button className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Je m'inscris
                  </button>
                </div>
              </div>
            </aside>
          )}
          
          {/* Contenu de l'article */}
          <main className={tableOfContents.length > 0 ? 'lg:col-span-9' : 'lg:col-span-12 max-w-4xl mx-auto'}>
            <div 
              className="prose prose-lg prose-gray max-w-none
                       prose-headings:font-bold prose-headings:text-gray-800
                       prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b-2 prose-h2:border-blue-100
                       prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-gray-700
                       prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                       prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                       prose-strong:text-gray-800 prose-strong:font-semibold
                       prose-ul:my-6 prose-ul:space-y-2 prose-li:text-gray-700
                       prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50
                       prose-blockquote:rounded-r-lg prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic
                       prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8"
              dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            />
            
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Sujets abordés</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 
                               text-blue-800 rounded-full text-sm font-medium 
                               hover:from-blue-200 hover:to-indigo-200 transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Articles similaires */}
            {relatedArticles.length > 0 && (
              <div className="mt-16">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">Articles similaires</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedArticles.slice(0, 4).map((related) => (
                    <Link
                      key={related.id}
                      href={`/blog/${related.slug}`}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all overflow-hidden"
                    >
                      <div className="relative h-48">
                        <Image
                          src={related.featured_image || related.image_url || featuredImage}
                          alt={related.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 text-xs font-semibold rounded-full">
                          {related.category}
                        </span>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {related.excerpt}
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                          Lire l'article
                          <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Call-to-action final */}
            <div className="mt-16 p-8 md:p-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl text-white text-center">
              <h3 className="text-3xl font-bold mb-4">Découvrez Lyon comme un local</h3>
              <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
                Rejoignez notre communauté de passionnés et recevez nos meilleurs conseils, 
                adresses secrètes et actualités lyonnaises
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/blog"
                  className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  Explorer tous nos guides
                </Link>
                <button className="px-8 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-400 transition-colors">
                  S'inscrire à la newsletter
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </article>
  )
}

// Fonctions utilitaires
function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const regex = /#{2,3}\s+(.+)/g
  let match
  
  while ((match = regex.exec(content)) !== null) {
    const level = match[0].split('#').length - 1
    const text = match[1].trim()
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    headings.push({ id, text, level })
  }
  
  return headings
}

function formatContent(content: string): string {
  if (!content) return ''
  
  // Convertir le markdown en HTML basique
  let formatted = content
  
  // Headers avec IDs pour navigation
  formatted = formatted.replace(/### (.+)/g, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return `<h3 id="${id}">${text}</h3>`
  })
  
  formatted = formatted.replace(/## (.+)/g, (_, text) => {
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return `<h2 id="${id}">${text}</h2>`
  })
  
  // Paragraphes
  formatted = formatted.replace(/\n\n/g, '</p><p>')
  formatted = `<p>${formatted}</p>`
  
  // Listes
  formatted = formatted.replace(/\n- (.+)/g, '<li>$1</li>')
  formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // Gras et italique
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>')
  
  // Liens
  formatted = formatted.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
  
  return formatted
}