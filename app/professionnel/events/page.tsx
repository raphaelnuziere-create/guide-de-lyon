'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar,
  Plus,
  Eye,
  Clock,
  MapPin,
  Tag,
  MoreVertical,
  Edit,
  Trash,
  Share2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  Home,
  FileText
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { quotaManager } from '@/lib/quotas/quota-manager'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase-client'
import { QuotaDisplay } from '@/components/quotas/quota-display'

interface Event {
  id: string
  title: string
  description: string
  category: string
  startDate: Date
  endDate?: Date
  location: string
  address: string
  price?: number
  maxAttendees?: number
  tags: string[]
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  promoted: boolean
  onHomepage: boolean
  socialMediaPush: boolean
  includedInBlog: boolean
  viewCount: number
  interestedCount: number
  createdAt: Date
}

function EventsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [showQuotas, setShowQuotas] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const created = searchParams.get('created') === 'true'

  useEffect(() => {
    if (!user) return

    // Écouter les événements du merchant
    const q = query(
      collection(firebaseDb, 'events'),
      where('merchantId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData: Event[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        eventsData.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate()
        } as Event)
      })
      setEvents(eventsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleDelete = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return

    try {
      await deleteDoc(doc(firebaseDb, 'events', eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleShare = async (event: Event) => {
    const url = `https://guide-de-lyon.fr/events/${event.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: url
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Copier dans le presse-papier
      navigator.clipboard.writeText(url)
      alert('Lien copié dans le presse-papier !')
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusBadge = (status: Event['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvé
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            En attente
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Refusé
          </span>
        )
    }
  }

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    return event.status === filter
  })

  const plan = user?.plan || 'free'
  const usage = events.filter(e => {
    const eventMonth = e.createdAt.getMonth()
    const currentMonth = new Date().getMonth()
    return eventMonth === currentMonth
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes événements</h1>
            </div>
            
            <Link
              href="/pro/events/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer un événement
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerte création */}
        {created && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <p className="text-green-700">
                  Événement créé avec succès ! Il sera visible après validation par notre équipe (24h max).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold text-gray-900">{usage}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              / {plan === 'free' ? '3' : plan === 'pro_visibility' ? '3' : '6'} événements
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">
                  {events.filter(e => e.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {events.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vues totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.reduce((acc, e) => acc + e.viewCount, 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Quotas */}
        <div className="mb-8">
          <button
            onClick={() => setShowQuotas(!showQuotas)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showQuotas ? 'Masquer' : 'Afficher'} mes quotas
          </button>
          
          {showQuotas && user && (
            <div className="mt-4">
              <QuotaDisplay
                merchantId={user.uid}
                plan={plan as any}
                onUpgrade={() => router.push('/pro/upgrade')}
              />
            </div>
          )}
        </div>

        {/* Filtres */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Tous ({events.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'approved' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Approuvés ({events.filter(e => e.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            En attente ({events.filter(e => e.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Refusés ({events.filter(e => e.status === 'rejected').length})
          </button>
        </div>

        {/* Liste des événements */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Aucun événement créé'
                : `Aucun événement ${filter === 'approved' ? 'approuvé' : filter === 'pending' ? 'en attente' : 'refusé'}`
              }
            </p>
            {filter === 'all' && (
              <Link
                href="/pro/events/create"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mt-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                Créer votre premier événement
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start">
                        {event.images[0] && (
                          <img 
                            src={event.images[0]} 
                            alt={event.title}
                            className="w-24 h-24 object-cover rounded-lg mr-4"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {event.title}
                            </h3>
                            {getStatusBadge(event.status)}
                            {event.promoted && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Mis en avant
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(event.startDate)}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.location}
                            </span>
                            {event.price ? (
                              <span className="flex items-center">
                                {event.price}€
                              </span>
                            ) : (
                              <span className="text-green-600 font-medium">
                                Gratuit
                              </span>
                            )}
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {event.viewCount} vues
                            </span>
                          </div>

                          {/* Tags */}
                          {event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {event.tags.map(tag => (
                                <span 
                                  key={tag}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Features premium */}
                          {event.status === 'approved' && (
                            <div className="flex items-center gap-3 mt-3">
                              {event.onHomepage && (
                                <span className="inline-flex items-center text-xs text-blue-600">
                                  <Home className="h-3 w-3 mr-1" />
                                  Page d'accueil
                                </span>
                              )}
                              {event.socialMediaPush && (
                                <span className="inline-flex items-center text-xs text-purple-600">
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Réseaux sociaux
                                </span>
                              )}
                              {event.includedInBlog && (
                                <span className="inline-flex items-center text-xs text-green-600">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Article blog
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {selectedEvent === event.id && (
                        <div className="absolute right-6 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                          <button
                            onClick={() => router.push(`/pro/events/${event.id}/edit`)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleShare(event)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Partager
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Upgrade */}
        {plan === 'free' && events.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-center text-white">
            <Sparkles className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Boostez la visibilité de vos événements
            </h2>
            <p className="mb-6">
              Passez Pro pour apparaître sur la page d'accueil et toucher plus de clients
            </p>
            <Link
              href="/pro/upgrade"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50"
            >
              Découvrir les plans Pro
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <EventsPageContent />
    </Suspense>
  )
}