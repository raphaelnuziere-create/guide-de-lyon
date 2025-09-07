'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, Share2, Heart, MessageCircle, Tag } from 'lucide-react'
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
    bio?: string
  }
  published_at: string
  reading_time: number
  status: string
  meta_title?: string
  meta_description?: string
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      
      // Vérifier si Supabase est configuré
      if (!supabase) {
        console.log('Supabase non configuré, utilisation des données de démonstration')
        loadDemoPost()
        return
      }
      
      // Récupérer l'article depuis Supabase
      const { data, error } = await supabase
        .from('original_blog_posts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        console.error('Article non trouvé:', error)
        loadDemoPost()
      } else {
        // Adapter les données si nécessaire
        const postWithSlug = {
          ...data,
          slug: data.slug || slug,
          author: data.author || { name: data.author_name || 'Guide de Lyon' },
          tags: data.tags || []
        }
        setPost(postWithSlug)
        fetchRelatedPosts(postWithSlug.category, postWithSlug.id)
      }
    } catch (error) {
      console.error('Erreur:', error)
      loadDemoPost()
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedPosts = async (category: string, currentId: string) => {
    try {
      if (!supabase) return
      
      const { data } = await supabase
        .from('original_blog_posts')
        .select('*')
        .eq('category', category)
        .neq('id', currentId)
        .limit(3)

      if (data && data.length > 0) {
        setRelatedPosts(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des articles liés:', error)
    }
  }

  const loadDemoPost = () => {
    // Article de démonstration si non trouvé
    const demoPost: any = {
      id: '1',
      slug: slug,
      title: 'Découvrir le Vieux Lyon : Un voyage dans le temps',
      excerpt: 'Explorez les ruelles médiévales et Renaissance du Vieux Lyon, classé au patrimoine mondial de l\'UNESCO.',
      content: `
        <h2>Un quartier chargé d'histoire</h2>
        <p>Le Vieux Lyon est l'un des quartiers Renaissance les plus vastes d'Europe. Classé au patrimoine mondial de l'UNESCO depuis 1998, il s'étend sur 30 hectares au pied de la colline de Fourvière.</p>
        
        <h3>Les traboules, passages secrets de Lyon</h3>
        <p>Les traboules sont des passages piétons à travers des cours d'immeuble qui permettent de passer d'une rue à une autre. Le Vieux Lyon en compte environ 40 ouvertes au public. Ces passages étaient utilisés par les canuts (ouvriers de la soie) pour transporter leurs marchandises à l'abri des intempéries.</p>
        
        <h3>Les incontournables du quartier</h3>
        <ul>
          <li><strong>La Cathédrale Saint-Jean</strong> : Joyau de l'architecture gothique</li>
          <li><strong>Le Musée Gadagne</strong> : Histoire de Lyon et marionnettes du monde</li>
          <li><strong>La Tour Rose</strong> : Symbole de la Renaissance lyonnaise</li>
          <li><strong>La Place du Change</strong> : Ancienne bourse de Lyon</li>
        </ul>
        
        <h3>Où manger dans le Vieux Lyon ?</h3>
        <p>Le quartier regorge de bouchons lyonnais traditionnels où vous pourrez déguster les spécialités locales : quenelles, tablier de sapeur, cervelle de canut... Voici nos recommandations :</p>
        <ul>
          <li>Aux Lyonnais : Bouchon traditionnel tenu par Alain Ducasse</li>
          <li>Daniel et Denise : Champion du monde du pâté croûte</li>
          <li>Le Bouchon des Filles : Version moderne du bouchon</li>
        </ul>
        
        <h3>Conseils pratiques</h3>
        <p>Le Vieux Lyon se visite idéalement à pied. Prévoyez une demi-journée pour flâner dans les ruelles et découvrir les traboules. Le quartier est accessible par le métro D (station Vieux Lyon) ou par le funiculaire qui monte à Fourvière.</p>
        
        <p>N'hésitez pas à pousser les portes : de nombreuses cours intérieures cachent des trésors architecturaux. Les visites guidées sont recommandées pour ne rien manquer de l'histoire fascinante du quartier.</p>
      `,
      featured_image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200',
      category: 'Tourisme',
      tags: ['patrimoine', 'histoire', 'UNESCO', 'architecture', 'Renaissance'],
      author_name: 'Marie Dubois',
      author: { 
        name: 'Marie Dubois',
        bio: 'Guide touristique passionnée par l\'histoire de Lyon'
      },
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      reading_time: 5
    }
    setPost(demoPost)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }

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

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h2>
          <Link href="/blog" className="text-blue-600 hover:text-blue-700">
            Retour au blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <div className="relative h-96 bg-gradient-to-br from-blue-600 to-indigo-700">
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
                {formatDate((post as any).created_at || (post as any).published_at || new Date().toISOString())}
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
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">{(post as any).author_name || post.author?.name || 'Auteur'}</p>
                {(post.author?.bio) && (
                  <p className="text-sm text-gray-600">{post.author.bio}</p>
                )}
              </div>
              
              <div className="ml-auto flex gap-2">
                <button className="p-2 text-gray-600 hover:text-blue-600 transition">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:text-red-600 transition">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none"
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
                      href={`/blog?tag=${tag}`}
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
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Facebook
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                  Twitter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
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
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 group-hover:opacity-90 transition"></div>
                    <div className="p-4">
                      <p className="text-sm text-blue-600 mb-2">{relatedPost.category}</p>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                        {relatedPost.title}
                      </h3>
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