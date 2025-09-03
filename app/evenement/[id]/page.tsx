'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, MapPin, Clock, Users, Euro, Share2, Heart,
  ChevronLeft, ChevronRight, Tag, User, Globe, Phone,
  AlertCircle, CheckCircle, Sparkles
} from 'lucide-react'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [registered, setRegistered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  // Mock data - en production, charger depuis Firebase
  const event = {
    id: params.id,
    title: 'Festival des Lumières 2025',
    description: `Le Festival des Lumières est de retour pour illuminer Lyon ! 
    Pendant 4 soirées exceptionnelles, la ville se transforme en un immense terrain de jeu pour les artistes lumière du monde entier.
    
    Découvrez des installations monumentales, des projections innovantes et des parcours lumineux qui vous emmèneront à travers les plus beaux quartiers de Lyon.
    
    Cette année, le festival met l'accent sur l'innovation et le développement durable avec des Suvres utilisant des technologies LED basse consommation.`,
    date: '2025-12-05',
    endDate: '2025-12-08',
    time: '18:00 - 23:00',
    location: 'Centre-ville de Lyon',
    address: 'Place Bellecour et alentours, 69002 Lyon',
    category: 'Festival',
    price: 'Gratuit',
    organizer: 'Ville de Lyon',
    organizerEmail: 'contact@fetedeslumieres.lyon.fr',
    organizerPhone: '+33 4 72 10 30 30',
    website: 'www.fetedeslumieres.lyon.fr',
    attendees: 3500,
    maxAttendees: 5000,
    featured: true,
    promoted: true,
    status: 'upcoming',
    tags: ['Culture', 'Famille', 'Gratuit', 'Extérieur'],
    program: [
      { time: '18:00', activity: 'Ouverture du festival' },
      { time: '18:30', activity: 'Illumination de la Cathédrale Saint-Jean' },
      { time: '19:00', activity: 'Spectacle Place des Terreaux' },
      { time: '20:00', activity: 'Parcours lumineux Presqu\'île' },
      { time: '21:30', activity: 'Grand show Place Bellecour' }
    ],
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819'
    ]
  }

  const handleRegister = () => {
    setRegistered(true)
    // TODO: Implémenter l'inscription réelle
  }

  const calculateDaysLeft = () => {
    const eventDate = new Date(event.date)
    const today = new Date()
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const daysLeft = calculateDaysLeft()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition"
          >
            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition">
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* Category badge */}
        <div className="absolute bottom-4 left-4">
          <span className="px-4 py-2 bg-white/90 backdrop-blur rounded-full text-purple-600 font-semibold">
            {event.category}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Header */}
                <div className="mb-6">
                  {event.promoted && (
                    <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full mb-4">
                      <Sparkles className="w-4 h-4 mr-1" />
                      ÉVÉNEMENT SPONSORISÉ
                    </div>
                  )}
                  
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {daysLeft > 0 && daysLeft <= 7 && (
                    <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Plus que {daysLeft} jour{daysLeft > 1 ? 's' : ''}!
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos de cet événement</h2>
                  <div className="prose prose-gray max-w-none">
                    {event.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-600 mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Program */}
                {event.program && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Programme</h2>
                    <div className="space-y-3">
                      {event.program.map((item, index) => (
                        <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                          <span className="text-purple-600 font-semibold">{item.time}</span>
                          <span className="text-gray-700">{item.activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Organizer */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Organisateur</h2>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">{event.organizer}</h3>
                    <div className="space-y-2 text-sm">
                      {event.organizerEmail && (
                        <div className="flex items-center text-gray-600">
                          <Globe className="w-4 h-4 mr-2" />
                          <a href={`mailto:${event.organizerEmail}`} className="text-blue-600 hover:underline">
                            {event.organizerEmail}
                          </a>
                        </div>
                      )}
                      {event.organizerPhone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <a href={`tel:${event.organizerPhone}`} className="text-blue-600 hover:underline">
                            {event.organizerPhone}
                          </a>
                        </div>
                      )}
                      {event.website && (
                        <div className="flex items-center text-gray-600">
                          <Globe className="w-4 h-4 mr-2" />
                          <a href={`https://${event.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {event.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div>
                <div className="sticky top-4">
                  {/* Registration Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-5 h-5 mr-3 text-purple-600" />
                        <div>
                          <p className="font-semibold">
                            {new Date(event.date).toLocaleDateString('fr-FR', { 
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          {event.endDate && (
                            <p className="text-sm text-gray-600">
                              jusqu'au {new Date(event.endDate).toLocaleDateString('fr-FR', { 
                                day: 'numeric',
                                month: 'long'
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <Clock className="w-5 h-5 mr-3 text-purple-600" />
                        <span>{event.time}</span>
                      </div>

                      <div className="flex items-start text-gray-700">
                        <MapPin className="w-5 h-5 mr-3 mt-0.5 text-purple-600" />
                        <div>
                          <p className="font-semibold">{event.location}</p>
                          <p className="text-sm text-gray-600">{event.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <Euro className="w-5 h-5 mr-3 text-purple-600" />
                        <span className="font-semibold text-lg">{event.price}</span>
                      </div>
                    </div>

                    {/* Attendees progress */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Participants</span>
                        <span className="font-semibold text-gray-900">
                          {event.attendees}/{event.maxAttendees}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                          style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                        />
                      </div>
                      {event.attendees >= event.maxAttendees * 0.8 && (
                        <p className="text-xs text-orange-600 mt-2">
                          ¡ Plus que {event.maxAttendees - event.attendees} places disponibles!
                        </p>
                      )}
                    </div>

                    {/* Register button */}
                    {registered ? (
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-semibold">Inscription confirmée!</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Un email de confirmation vous a été envoyé
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleRegister}
                        disabled={event.attendees >= event.maxAttendees}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                          event.attendees >= event.maxAttendees
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                        }`}
                      >
                        {event.attendees >= event.maxAttendees ? 'Complet' : 'S\'inscrire gratuitement'}
                      </button>
                    )}
                  </div>

                  {/* Share section */}
                  <div className="bg-white rounded-lg p-4 border">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Partager l'événement</p>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 px-3 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                        Facebook
                      </button>
                      <button className="flex-1 py-2 px-3 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition">
                        X
                      </button>
                      <button className="flex-1 py-2 px-3 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition">
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Events */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Événements similaires</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Link 
                key={i}
                href={`/evenement/${i + 1}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400"></div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Événement Example {i}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      15 décembre 2025
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Lyon {i + 1}e
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}