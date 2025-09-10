'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  Shield,
  CheckCircle,
  Euro,
  Utensils,
  Coffee,
  ShoppingBag,
  Heart,
  Music,
  Palette,
  GraduationCap,
  Briefcase,
  Home,
  Car,
  Dumbbell,
  MoreHorizontal,
  CalendarDays,
  TrendingUp
} from 'lucide-react'
import { PublicEventsService, PublicEvent } from '@/app/lib/services/publicEventsService'

// Catégories avec icônes (reprises de la page inscription pro)
const EVENT_CATEGORIES = [
  { value: 'all', label: 'Tous', icon: CalendarDays, color: 'gray' },
  { value: 'restaurant-food', label: 'Restaurant & Food', icon: Utensils, color: 'orange' },
  { value: 'bar-nightlife', label: 'Bar & Nightlife', icon: Coffee, color: 'purple' },
  { value: 'shopping-mode', label: 'Shopping & Mode', icon: ShoppingBag, color: 'pink' },
  { value: 'beaute-wellness', label: 'Beauté & Wellness', icon: Heart, color: 'red' },
  { value: 'culture-divertissement', label: 'Culture & Divertissement', icon: Music, color: 'blue' },
  { value: 'art-design', label: 'Art & Design', icon: Palette, color: 'indigo' },
  { value: 'education-formation', label: 'Éducation & Formation', icon: GraduationCap, color: 'green' },
  { value: 'services-pro', label: 'Services Pro', icon: Briefcase, color: 'slate' },
  { value: 'immobilier', label: 'Immobilier', icon: Home, color: 'amber' },
  { value: 'auto-transport', label: 'Auto & Transport', icon: Car, color: 'cyan' },
  { value: 'sport-fitness', label: 'Sport & Fitness', icon: Dumbbell, color: 'emerald' },
  { value: 'autre', label: 'Autre', icon: MoreHorizontal, color: 'gray' }
]

interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isTomorrow: boolean
  events: PublicEvent[]
}

export function CalendarEventsSection() {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    loadEvents()
  }, [currentMonth])

  const loadEvents = async () => {
    try {
      setLoading(true)
      // Charger les événements du mois en cours + mois suivant
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0)
      
      const { events: eventsData } = await PublicEventsService.getAllPublicEvents({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 100
      })
      
      setEvents(eventsData)
    } catch (error) {
      console.error('Erreur chargement événements:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(date)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'Gratuit'
    return `${price}€`
  }

  const getCategoryIcon = (category: string) => {
    const cat = EVENT_CATEGORIES.find(c => c.value === category)
    return cat ? cat.icon : CalendarDays
  }

  const getCategoryColor = (category: string) => {
    const cat = EVENT_CATEGORIES.find(c => c.value === category)
    return cat ? cat.color : 'gray'
  }

  const getPlanBadge = (plan: string, verified: boolean) => {
    if (plan === 'expert') {
      return <Crown className="h-3 w-3 text-purple-600" />
    }
    if (plan === 'pro' && verified) {
      return <Shield className="h-3 w-3 text-blue-600" />
    }
    return null
  }

  // Générer les jours du calendrier
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days: CalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      date.setHours(0, 0, 0, 0)
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start_date)
        return eventDate.toDateString() === date.toDateString() &&
          (selectedCategory === 'all' || event.category === selectedCategory)
      })
      
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        isTomorrow: date.getTime() === tomorrow.getTime(),
        events: dayEvents
      })
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()
  const todayEvents = calendarDays.find(d => d.isToday)?.events || []
  const tomorrowEvents = calendarDays.find(d => d.isTomorrow)?.events || []

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(newMonth.getMonth() + direction)
      return newMonth
    })
  }

  const monthYear = currentMonth.toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  })

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-8 gap-4">
              {[...Array(40)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
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
            Agenda des événements Lyon
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez tous les événements organisés par nos partenaires professionnels
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {EVENT_CATEGORIES.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.value
                      ? `bg-${cat.color}-600 text-white shadow-lg`
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                  style={selectedCategory === cat.value ? {
                    backgroundColor: `var(--color-${cat.color}-600)`,
                    color: 'white'
                  } : {}}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Colonne Aujourd'hui/Demain */}
          <div className="lg:col-span-1 space-y-6">
            {/* Aujourd'hui */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
                <h3 className="font-bold text-lg">Aujourd'hui</h3>
                <p className="text-sm text-red-100">{formatDate(new Date())}</p>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {todayEvents.length > 0 ? (
                  todayEvents.map(event => (
                    <Link
                      key={event.id}
                      href={`/evenements/${event.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                          {event.title}
                        </h4>
                        {getPlanBadge(event.establishment.plan, event.establishment.verified)}
                      </div>
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(event.start_date)}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{event.location || event.address || 'Lyon'}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-green-600">
                          {formatPrice(event.price)}
                        </span>
                        {getCategoryIcon(event.category) && (
                          <div className={`text-${getCategoryColor(event.category)}-600`}>
                            {(() => {
                              const Icon = getCategoryIcon(event.category)
                              return <Icon className="h-3 w-3" />
                            })()}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucun événement aujourd'hui
                  </p>
                )}
              </div>
            </div>

            {/* Demain */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <h3 className="font-bold text-lg">Demain</h3>
                <p className="text-sm text-blue-100">
                  {formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000))}
                </p>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {tomorrowEvents.length > 0 ? (
                  tomorrowEvents.map(event => (
                    <Link
                      key={event.id}
                      href={`/evenements/${event.id}`}
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                          {event.title}
                        </h4>
                        {getPlanBadge(event.establishment.plan, event.establishment.verified)}
                      </div>
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(event.start_date)}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{event.location || event.address || 'Lyon'}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-green-600">
                          {formatPrice(event.price)}
                        </span>
                        {getCategoryIcon(event.category) && (
                          <div className={`text-${getCategoryColor(event.category)}-600`}>
                            {(() => {
                              const Icon = getCategoryIcon(event.category)
                              return <Icon className="h-3 w-3" />
                            })()}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucun événement demain
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Calendrier mensuel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Navigation du mois */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h3 className="text-xl font-bold capitalize">{monthYear}</h3>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Jours de la semaine */}
              <div className="grid grid-cols-7 bg-gray-50 border-b">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border-r border-b ${
                      !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                    } ${day.isToday ? 'bg-red-50' : ''} ${
                      day.isTomorrow ? 'bg-blue-50' : ''
                    } hover:bg-gray-50 transition cursor-pointer`}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                      } ${day.isToday ? 'text-red-600 font-bold' : ''} ${
                        day.isTomorrow ? 'text-blue-600 font-bold' : ''
                      }`}>
                        {day.day}
                      </span>
                      {day.events.length > 0 && (
                        <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full">
                          {day.events.length}
                        </span>
                      )}
                    </div>
                    
                    {/* Aperçu des événements */}
                    <div className="space-y-1">
                      {day.events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className="text-xs p-1 bg-gray-100 rounded truncate hover:bg-gray-200"
                          title={event.title}
                        >
                          <div className="flex items-center gap-1">
                            {event.establishment.plan === 'expert' && (
                              <Crown className="h-2.5 w-2.5 text-purple-600 flex-shrink-0" />
                            )}
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {day.events.length > 2 && (
                        <div className="text-xs text-gray-500 pl-1">
                          +{day.events.length - 2} autre{day.events.length > 3 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Légende */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                <span className="text-gray-600">Aujourd'hui</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
                <span className="text-gray-600">Demain</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">Expert</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Pro Vérifié</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal détails événement (si date sélectionnée) */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedDate(null)}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">
                    Événements du {formatDate(selectedDate)}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {calendarDays
                    .find(d => d.date.toDateString() === selectedDate.toDateString())
                    ?.events.map(event => (
                      <Link
                        key={event.id}
                        href={`/evenements/${event.id}`}
                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-lg text-gray-900">
                            {event.title}
                          </h4>
                          {getPlanBadge(event.establishment.plan, event.establishment.verified)}
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(event.start_date)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location || event.address}
                          </div>
                          <div className="flex items-center font-medium text-green-600">
                            {formatPrice(event.price)}
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-500">
                          Organisé par <span className="font-medium">{event.establishment.name}</span>
                        </div>
                      </Link>
                    )) || (
                    <p className="text-gray-500 text-center py-8">
                      Aucun événement ce jour
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
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