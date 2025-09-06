'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Users, Tag, Filter, ChevronRight, Search, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  price: string
  organizer: string
  attendees: number
  maxAttendees: number
  image?: string
  featured: boolean
  promoted: boolean
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid')

  // Données mock
  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'Festival des Lumières 2025',
      description: 'Le plus grand événement lumineux de Lyon revient illuminer la ville',
      date: '2025-12-05',
      time: '18:00',
      location: 'Centre-ville de Lyon',
      category: 'Festival',
      price: 'Gratuit',
      organizer: 'Ville de Lyon',
      attendees: 3500,
      maxAttendees: 5000,
      featured: true,
      promoted: true
    },
    {
      id: '2',
      title: 'Marché de Noël - Place Carnot',
      description: 'Découvrez les produits artisanaux et les spécialités de Noël',
      date: '2025-12-15',
      time: '10:00',
      location: 'Place Carnot, Lyon 2e',
      category: 'Marché',
      price: 'Gratuit',
      organizer: 'Association des Commerçants',
      attendees: 150,
      maxAttendees: 500,
      featured: false,
      promoted: true
    },
    {
      id: '3',
      title: 'Concert Jazz au Parc',
      description: 'Soirée jazz en plein air avec des artistes locaux',
      date: '2025-09-20',
      time: '19:30',
      location: 'Parc de la Tête d\'Or',
      category: 'Concert',
      price: '15€',
      organizer: 'Jazz à Lyon',
      attendees: 280,
      maxAttendees: 400,
      featured: true,
      promoted: false
    },
    {
      id: '4',
      title: 'Salon de la Gastronomie',
      description: 'Rencontrez les meilleurs chefs et producteurs de la région',
      date: '2025-10-10',
      time: '09:00',
      location: 'Eurexpo Lyon',
      category: 'Salon',
      price: '12€',
      organizer: 'Lyon Expo',
      attendees: 1200,
      maxAttendees: 2000,
      featured: false,
      promoted: true
    },
    {
      id: '5',
      title: 'Marathon de Lyon',
      description: 'Course à pied à travers les plus beaux quartiers de Lyon',
      date: '2025-10-01',
      time: '08:00',
      location: 'Départ Place Bellecour',
      category: 'Sport',
      price: '65€',
      organizer: 'ASO',
      attendees: 8500,
      maxAttendees: 10000,
      featured: true,
      promoted: true
    },
    {
      id: '6',
      title: 'Exposition Art Contemporain',
      description: 'Découvrez les œuvres d\'artistes émergents',
      date: '2025-09-15',
      time: '14:00',
      location: 'Musée d\'Art Contemporain',
      category: 'Exposition',
      price: '8€',
      organizer: 'MAC Lyon',
      attendees: 45,
      maxAttendees: 200,
      featured: false,
      promoted: false
    }
  ]

  useEffect(() => {
    setTimeout(() => {
      setEvents(mockEvents)
      setLoading(false)
    }, 500)
  }, [])

  const categories = ['Tous', 'Festival', 'Concert', 'Exposition', 'Sport', 'Marché', 'Salon', 'Conférence']

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === 'Tous' || event.category === selectedCategory
    const matchesDate = !selectedDate || event.date >= selectedDate
    
    return matchesSearch && matchesCategory && matchesDate
  })

  const featuredEvents = filteredEvents.filter(e => e.featured)
  const regularEvents = filteredEvents.filter(e => !e.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Événements à Lyon</h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Découvrez tous les événements qui animent la ville : concerts, festivals, expositions et plus encore
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-12 rounded-full text-gray-900 placeholder-gray-500 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full hover:shadow-lg transition">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === 'Tous' ? '' : category)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                    (category === 'Tous' && !selectedCategory) || selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'calendar' : 'grid')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {viewMode === 'grid' ? 'Vue calendrier' : 'Vue grille'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <Sparkles className="w-8 h-8 text-yellow-500 mr-3" />
              Événements en vedette
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <Link
                key={event.id}
                href={`/evenement/${event.id}`}
                className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
              >
                {event.promoted && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    SPONSORISÉ
                  </div>
                )}
                
                <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400"></div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                      {event.category}
                    </span>
                    <span className="text-xs text-gray-500">{event.price}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-gray-600">
                        {event.attendees}/{event.maxAttendees}
                      </span>
                    </div>
                    <span className="text-purple-600 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center">
                      Voir détails
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Regular Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Tous les événements
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Chargement des événements...</p>
          </div>
        ) : regularEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Aucun événement trouvé</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularEvents.map(event => (
              <Link
                key={event.id}
                href={`/evenement/${event.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition group"
              >
                <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {event.category}
                    </span>
                    {event.promoted && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                        Sponsorisé
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{event.price}</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {event.attendees}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center text-gray-600">
              Vue calendrier en construction...
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Organisez votre événement à Lyon
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Touchez des milliers de Lyonnais et boostez la visibilité de votre événement
          </p>
          <Link
            href="/pro/events/create"
            className="inline-flex items-center px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Publier un événement
            <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  )
}