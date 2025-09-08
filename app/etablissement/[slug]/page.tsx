'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { 
  MapPin, Phone, Globe, Clock, Star, Heart, Share2, 
  ChevronRight, Calendar, Users, Camera, MessageCircle, 
  ThumbsUp, Eye, CheckCircle, AlertTriangle, Navigation
} from 'lucide-react'

import { EstablishmentService, type Establishment, type Review, type Event } from '@/lib/services/establishment-service'
import RestaurantLayout from '@/components/establishment/RestaurantLayout'
import AccommodationLayout from '@/components/establishment/AccommodationLayout'
import RetailLayout from '@/components/establishment/RetailLayout'

export default function DynamicEstablishmentPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [similarEstablishments, setSimilarEstablishments] = useState<Establishment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const loadEstablishmentData = async () => {
      setLoading(true)
      
      try {
        // Récupérer l'établissement
        const establishmentData = await EstablishmentService.getBySlug(slug)
        
        if (!establishmentData) {
          // Si pas trouvé, utiliser le fallback ou rediriger
          setEstablishment(EstablishmentService.getFallbackEstablishment(slug))
        } else {
          setEstablishment(establishmentData)
          
          // Charger les données associées
          const [reviewsData, eventsData, similarData] = await Promise.all([
            EstablishmentService.getReviews(establishmentData.id),
            EstablishmentService.getEvents(establishmentData.id),
            EstablishmentService.getSimilar(establishmentData.id, establishmentData.category, 3)
          ])
          
          setReviews(reviewsData)
          setEvents(eventsData)
          setSimilarEstablishments(similarData)
        }
      } catch (error) {
        console.error('Error loading establishment:', error)
        setEstablishment(EstablishmentService.getFallbackEstablishment(slug))
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadEstablishmentData()
    }
  }, [slug])

  const getCurrentDayHours = () => {
    if (!establishment?.openingHours) return 'Horaires non disponibles'
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = days[new Date().getDay()]
    const todayHours = establishment.openingHours[today as keyof typeof establishment.openingHours]
    
    return todayHours || 'Fermé'
  }

  const formatDayName = (day: string) => {
    const dayNames: { [key: string]: string } = {
      monday: 'Lundi',
      tuesday: 'Mardi', 
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    }
    return dayNames[day] || day
  }

  const getSpecializedLayout = (establishment: Establishment) => {
    const layoutType = EstablishmentService.getLayoutType(establishment.category)
    
    switch (layoutType) {
      case 'restaurant':
        return <RestaurantLayout establishment={establishment} />
      case 'accommodation':
        return <AccommodationLayout establishment={establishment} />
      case 'retail':
        return <RetailLayout establishment={establishment} />
      default:
        return <DefaultEstablishmentLayout establishment={establishment} />
    }
  }

  if (loading) {
    return <EstablishmentPageSkeleton />
  }

  if (!establishment) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Dynamic Images */}
      <div className="relative h-96 bg-gray-900">
        <div className="absolute inset-0">
          {establishment.images.length > 0 ? (
            <Image
              src={establishment.images[selectedImage]}
              alt={establishment.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg opacity-75">Photos à venir</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Gallery Navigation */}
        {establishment.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {establishment.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-2 h-2 rounded-full transition ${
                  selectedImage === index ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
          <button className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition">
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition">
            <Navigation className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {establishment.isVerified && (
            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Vérifié
            </div>
          )}
          {establishment.isPremium && (
            <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Premium
            </div>
          )}
          {establishment.isClosed && (
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Fermé
            </div>
          )}
        </div>
      </div>

      {/* Main Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                  {establishment.category}
                </span>
                {establishment.subcategory && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                    {establishment.subcategory}
                  </span>
                )}
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                  {establishment.priceRange}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{establishment.name}</h1>
              
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(establishment.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-semibold text-gray-900">{establishment.rating.toFixed(1)}</span>
                  <span className="ml-1 text-gray-500">({establishment.reviewsCount} avis)</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  {establishment.views} vues
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {establishment.shortDescription || establishment.description}
              </p>
            </div>

            {/* Contact Info Card */}
            <div className="lg:w-80 w-full bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informations pratiques</h3>
              
              <div className="space-y-3">
                {establishment.address && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-900">{establishment.address}</p>
                      <p className="text-sm text-gray-600">{establishment.postalCode} {establishment.city}</p>
                    </div>
                  </div>
                )}

                {establishment.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <a href={`tel:${establishment.phone}`} className="text-sm text-blue-600 hover:underline">
                      {establishment.phone}
                    </a>
                  </div>
                )}

                {establishment.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <a 
                      href={establishment.website.startsWith('http') ? establishment.website : `https://${establishment.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {establishment.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {establishment.openingHours && (
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Aujourd'hui</p>
                      <p className="text-sm text-gray-600">{getCurrentDayHours()}</p>
                    </div>
                  </div>
                )}
              </div>

              <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                {EstablishmentService.getLayoutType(establishment.category) === 'restaurant' ? 'Réserver' : 'Contacter'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Tabs Navigation */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble' },
              { id: 'details', label: 'Détails' },
              ...(reviews.length > 0 ? [{ id: 'reviews', label: `Avis (${reviews.length})` }] : []),
              ...(events.length > 0 ? [{ id: 'events', label: `Événements (${events.length})` }] : []),
              { id: 'photos', label: 'Photos' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos de {establishment.name}</h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                <p>{establishment.description}</p>
              </div>
              
              {establishment.features && establishment.features.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Services et équipements</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {establishment.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opening Hours */}
              {establishment.openingHours && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Horaires d'ouverture</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(establishment.openingHours).map(([day, hours]) => {
                      const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()]
                      return (
                        <div key={day} className={`flex justify-between text-sm ${day === today ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
                          <span>{formatDayName(day)}</span>
                          <span>{hours || 'Fermé'}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Specialized Details Tab */}
          {activeTab === 'details' && getSpecializedLayout(establishment)}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && reviews.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Écrire un avis
                </button>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.authorName}</h4>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.title && (
                      <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                    )}
                    <p className="text-gray-600 mb-4">{review.comment}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Utile ({review.helpful})
                      </button>
                      <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Répondre
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && events.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Événements à venir</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(event.date).toLocaleDateString('fr-FR')} à {event.startTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    {event.price && (
                      <p className="text-sm text-gray-500 mb-4">Prix: {event.price}€</p>
                    )}
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      En savoir plus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Galerie photos</h2>
              
              {establishment.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {establishment.images.map((image, index) => (
                    <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${establishment.name} - Photo ${index + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover hover:scale-105 transition cursor-pointer"
                        onClick={() => setSelectedImage(index)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune photo disponible pour le moment</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Similar Establishments */}
        {similarEstablishments.length > 0 && (
          <div className="py-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Établissements similaires</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {similarEstablishments.map((similar) => (
                <Link 
                  href={`/etablissement/${similar.slug}`} 
                  key={similar.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="h-48 bg-gray-200 relative">
                    {similar.images[0] ? (
                      <Image
                        src={similar.images[0]}
                        alt={similar.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{similar.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{similar.shortDescription || similar.category}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">{similar.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-gray-500">{similar.priceRange}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant de layout par défaut pour les catégories non spécialisées
function DefaultEstablishmentLayout({ establishment }: { establishment: Establishment }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations détaillées</h2>
        
        {establishment.specialties && establishment.specialties.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Spécialités</h3>
            <div className="flex flex-wrap gap-2">
              {establishment.specialties.map((specialty, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {establishment.services && establishment.services.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Services proposés</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {establishment.services.map((service, index) => (
                <div key={index} className="flex items-center text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  <span className="text-sm">{service}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant de chargement
function EstablishmentPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-96 bg-gray-300 animate-pulse"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}