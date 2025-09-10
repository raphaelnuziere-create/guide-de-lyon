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
  Crown,
  Shield,
  CheckCircle,
  Euro
} from 'lucide-react'
import { PublicEventsService, PublicEvent } from '@/app/lib/services/publicEventsService'

export function EventsSectionSupabase() {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    loadEvents()
    loadCategories()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const eventsData = await PublicEventsService.getUpcomingHomepageEvents(9)
      setEvents(eventsData)
    } catch (error) {
      console.error('Erreur chargement événements:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const cats = await PublicEventsService.getEventCategories()
      setCategories(['all', ...cats])
    } catch (error) {
      console.error('Erreur chargement catégories:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
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

  const getPlanBadge = (plan: string, verified: boolean) => {
    if (plan === 'expert') {
      return (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
          <Crown className="h-3 w-3 mr-1" />
          Expert
        </div>
      )
    }
    if (plan === 'pro' && verified) {
      return (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
          <CheckCircle className="h-3 w-3 mr-1" />
          Vérifié
        </div>
      )
    }
    return null
  }

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(e => e.category === selectedCategory)

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
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
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-red-100 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Événements à venir à Lyon
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Les meilleurs événements organisés par nos partenaires professionnels
          </p>
        </div>

        {/* Filtres par catégorie */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat === 'all' ? 'Tous' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Grille d'événements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEvents.slice(0, 6).map((event) => (
            <Link
              key={event.id}
              href={`/evenements/${event.id}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Badge Plan */}
                {getPlanBadge(event.establishment.plan, event.establishment.verified)}

                {/* Prix */}
                <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur px-3 py-1 rounded-full shadow-md">
                  <span className={`text-sm font-bold flex items-center ${
                    event.price ? 'text-gray-900' : 'text-green-600'
                  }`}>
                    {event.price ? <Euro className="h-3 w-3 mr-1" /> : null}
                    {formatPrice(event.price)}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-5">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(event.start_date)}
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                  {event.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate max-w-[150px]">{event.location || event.address || 'Lyon'}</span>
                  </div>
                  
                  {event.current_participants && event.max_participants && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-3 w-3 mr-1" />
                      {event.current_participants}/{event.max_participants}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Par <span className="font-medium text-gray-700">{event.establishment.name}</span>
                    </p>
                    {event.establishment.plan === 'expert' && (
                      <Crown className="h-4 w-4 text-purple-600" />
                    )}
                    {event.establishment.plan === 'pro' && event.establishment.verified && (
                      <Shield className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Plus d'événements si il y en a plus de 6 */}
        {filteredEvents.length > 6 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredEvents.slice(6, 9).map((event) => (
              <Link
                key={event.id}
                href={`/evenements/${event.id}`}
                className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all border border-gray-100 p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(event.start_date)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {event.establishment.name}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {formatPrice(event.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/evenements"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Voir tous les événements
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Bannière Pro */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Vous organisez des événements ?
              </h3>
              <p className="text-red-100">
                Rejoignez notre réseau de professionnels et touchez des milliers de Lyonnais
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-red-100">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Visibilité garantie
                </span>
                <span className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Statistiques détaillées
                </span>
                <span className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Mise en avant
                </span>
              </div>
            </div>
            <Link
              href="/pro/inscription"
              className="mt-6 md:mt-0 inline-flex items-center px-6 py-3 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-xl"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              Devenir Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}