'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Tag
} from 'lucide-react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase-client'

interface Event {
  id: string
  title: string
  description: string
  category: string
  startDate: Date
  location: string
  address: string
  price?: number
  images: string[]
  merchantName: string
  promoted: boolean
  interestedCount: number
}

export function UpcomingEventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      // Charger uniquement les événements approuvés et visibles sur la homepage
      const now = Timestamp.now()
      const eventsRef = collection(firebaseDb, 'events')
      const q = query(
        eventsRef,
        where('status', '==', 'approved'),
        where('onHomepage', '==', true),
        where('startDate', '>=', now),
        orderBy('startDate', 'asc'),
        limit(12)
      )

      const snapshot = await getDocs(q)
      const eventsData: Event[] = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        eventsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          category: data.category,
          startDate: data.startDate.toDate(),
          location: data.location,
          address: data.address,
          price: data.price,
          images: data.images || [],
          merchantName: data.merchantName,
          promoted: data.promoted,
          interestedCount: data.interestedCount || 0
        })
      })

      // Trier pour mettre les événements promus en premier
      eventsData.sort((a, b) => {
        if (a.promoted && !b.promoted) return -1
        if (!a.promoted && b.promoted) return 1
        return a.startDate.getTime() - b.startDate.getTime()
      })

      setEvents(eventsData)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Intl.DateTimeFormat('fr-FR', options).format(date)
  }

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'Gratuit'
    return `${price}€`
  }

  const categories = [
    'all',
    'Concert',
    'Soirée',
    'Gastronomie',
    'Culture',
    'Sport',
    'Workshop'
  ]

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(e => e.category === selectedCategory)

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (events.length === 0) {
    return null // Ne rien afficher s'il n'y a pas d'événements
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Événements à venir
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les meilleurs événements lyonnais sélectionnés pour vous
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'Tous' : cat}
            </button>
          ))}
        </div>

        {/* Grille d'événements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredEvents.slice(0, 6).map((event) => (
            <Link
              key={event.id}
              href={`/evenements/${event.id}`}
              className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {event.images[0] ? (
                  <img
                    src={event.images[0]}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                
                {/* Badge Promu */}
                {event.promoted && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Mis en avant
                  </div>
                )}

                {/* Prix */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                  <span className={`text-sm font-bold ${
                    event.price ? 'text-gray-900' : 'text-green-600'
                  }`}>
                    {formatPrice(event.price)}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-5">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(event.startDate)}
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {event.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-[150px]">{event.location}</span>
                  </div>
                  
                  {event.interestedCount > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-3 w-3 mr-1" />
                      {event.interestedCount}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500">
                    Organisé par <span className="font-medium">{event.merchantName}</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/evenements"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir tous les événements
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Bannière Pro */}
        {events.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Vous organisez un événement ?
                </h3>
                <p className="text-purple-100">
                  Rejoignez notre plateforme et touchez des milliers de Lyonnais
                </p>
              </div>
              <Link
                href="/auth/pro/signup"
                className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Devenir Pro
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}