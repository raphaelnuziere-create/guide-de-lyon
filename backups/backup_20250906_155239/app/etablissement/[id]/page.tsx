'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  MapPin, Phone, Globe, Clock, Star, Heart, Share2, 
  ChevronRight, Calendar, Users, Wifi, Car, CreditCard,
  Coffee, Baby, Info, Camera, MessageCircle, ThumbsUp
} from 'lucide-react'

interface Review {
  id: string
  author: string
  rating: number
  date: string
  comment: string
  helpful: number
}

interface Event {
  id: string
  title: string
  date: string
  time: string
  description: string
}

export default function EstablishmentPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageGallery, setImageGallery] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState(0)

  // Données mock pour la démo
  const establishment = {
    id: params.id,
    name: 'Restaurant Paul Bocuse',
    category: 'Restaurant Gastronomique',
    rating: 4.9,
    reviewsCount: 234,
    priceRange: '€€€€',
    description: 'Le restaurant Paul Bocuse, anciennement l\'Auberge du Pont de Collonges, est un restaurant gastronomique français situé à Collonges-au-Mont-d\'Or. Créé en 1965 par le chef Paul Bocuse, il a obtenu trois étoiles au Guide Michelin sans discontinuer depuis 1965.',
    address: '40 Rue de la Plage',
    city: '69660 Collonges-au-Mont-d\'Or',
    phone: '+33 4 72 42 90 90',
    website: 'www.bocuse.fr',
    email: 'contact@bocuse.fr',
    hours: {
      monday: 'Fermé',
      tuesday: '12:00-14:00, 19:30-21:30',
      wednesday: '12:00-14:00, 19:30-21:30',
      thursday: '12:00-14:00, 19:30-21:30',
      friday: '12:00-14:00, 19:30-21:30',
      saturday: '12:00-14:00, 19:30-21:30',
      sunday: '12:00-14:00'
    },
    features: [
      { icon: Wifi, label: 'WiFi gratuit' },
      { icon: Car, label: 'Parking' },
      { icon: CreditCard, label: 'Cartes acceptées' },
      { icon: Users, label: 'Groupes bienvenus' },
      { icon: Baby, label: 'Chaises hautes' },
      { icon: Coffee, label: 'Terrasse' }
    ],
    images: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'
    ],
    menu: {
      starters: [
        { name: 'Soupe aux truffes noires V.G.E.', price: '98€', description: 'Création 1975 pour l\'Élysée' },
        { name: 'Foie gras de canard', price: '85€', description: 'Compotée de fruits de saison' }
      ],
      mains: [
        { name: 'Loup en croûte feuilletée', price: '145€', description: 'Sauce Choron' },
        { name: 'Volaille de Bresse en vessie', price: '180€', description: 'Truffe du Périgord' }
      ],
      desserts: [
        { name: 'Soufflé aux fruits de la passion', price: '32€', description: 'Sorbet mangue' },
        { name: 'Tarte aux pralines roses', price: '28€', description: 'Glace vanille Bourbon' }
      ]
    }
  }

  const reviews: Review[] = [
    {
      id: '1',
      author: 'Sophie Martin',
      rating: 5,
      date: '2024-08-15',
      comment: 'Une expérience gastronomique inoubliable ! Le service est impeccable et les plats sont des œuvres d\'art. Un moment magique.',
      helpful: 23
    },
    {
      id: '2',
      author: 'Jean Dupont',
      rating: 5,
      date: '2024-07-28',
      comment: 'Sublime ! Chaque plat est une découverte, les saveurs sont exceptionnelles. Le cadre est magnifique et l\'équipe aux petits soins.',
      helpful: 18
    },
    {
      id: '3',
      author: 'Marie Lambert',
      rating: 4,
      date: '2024-06-10',
      comment: 'Très belle expérience, cuisine raffinée et service attentionné. Le prix est élevé mais la qualité est au rendez-vous.',
      helpful: 12
    }
  ]

  const upcomingEvents: Event[] = [
    {
      id: '1',
      title: 'Soirée dégustation vins du Rhône',
      date: '2024-09-15',
      time: '19:00',
      description: 'Découvrez notre sélection de vins en accord avec un menu spécial'
    },
    {
      id: '2',
      title: 'Cours de cuisine avec le Chef',
      date: '2024-09-22',
      time: '14:00',
      description: 'Apprenez les secrets de la cuisine lyonnaise traditionnelle'
    }
  ]

  const getDayOfWeek = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[new Date().getDay()]
  }

  const currentDay = getDayOfWeek()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image Gallery */}
      <div className="relative h-96 bg-gray-900">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
        </div>
        
        {/* Gallery Navigation */}
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
            <Camera className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                  {establishment.category}
                </span>
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
                  <span className="ml-2 font-semibold text-gray-900">{establishment.rating}</span>
                  <span className="ml-1 text-gray-500">({establishment.reviewsCount} avis)</span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{establishment.description}</p>
            </div>

            <div className="lg:w-80 w-full bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Informations pratiques</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-900">{establishment.address}</p>
                    <p className="text-sm text-gray-600">{establishment.city}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <a href={`tel:${establishment.phone}`} className="text-sm text-blue-600 hover:underline">
                    {establishment.phone}
                  </a>
                </div>

                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  <a href={`https://${establishment.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    {establishment.website}
                  </a>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Aujourd'hui</p>
                    <p className="text-sm text-gray-600">
                      {establishment.hours[currentDay as keyof typeof establishment.hours]}
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Réserver une table
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {['overview', 'menu', 'reviews', 'events', 'photos'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm capitalize transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'overview' && 'Vue d\'ensemble'}
                {tab === 'menu' && 'Menu'}
                {tab === 'reviews' && 'Avis'}
                {tab === 'events' && 'Événements'}
                {tab === 'photos' && 'Photos'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {establishment.description}
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Services et équipements</h3>
                <div className="grid grid-cols-2 gap-3">
                  {establishment.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-600">
                      <feature.icon className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-sm">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Horaires d'ouverture</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {Object.entries(establishment.hours).map(([day, hours]) => (
                    <div key={day} className={`flex justify-between text-sm ${day === currentDay ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
                      <span className="capitalize">{day === 'monday' ? 'Lundi' : day === 'tuesday' ? 'Mardi' : day === 'wednesday' ? 'Mercredi' : day === 'thursday' ? 'Jeudi' : day === 'friday' ? 'Vendredi' : day === 'saturday' ? 'Samedi' : 'Dimanche'}</span>
                      <span>{hours}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-blue-600" />
                    Bon à savoir
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Réservation fortement recommandée</li>
                    <li>• Tenue correcte exigée</li>
                    <li>• Menu enfant disponible</li>
                    <li>• Accès PMR</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre Menu</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Entrées</h3>
                  <div className="space-y-4">
                    {establishment.menu.starters.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-4 bg-white rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Plats</h3>
                  <div className="space-y-4">
                    {establishment.menu.mains.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-4 bg-white rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Desserts</h3>
                  <div className="space-y-4">
                    {establishment.menu.desserts.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-4 bg-white rounded-lg border border-gray-200">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Avis clients</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Écrire un avis
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{establishment.rating}</div>
                  <div className="flex justify-center mb-2">
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
                  </div>
                  <p className="text-gray-600">{establishment.reviewsCount} avis</p>
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.author}</h4>
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
                          <span className="ml-2 text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
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
          {activeTab === 'events' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Événements à venir</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{event.date} à {event.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      S'inscrire
                    </button>
                  </div>
                ))}
              </div>

              {upcomingEvents.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun événement prévu pour le moment</p>
                </div>
              )}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Galerie photos</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {establishment.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                  </div>
                ))}
                {/* Add more placeholder images */}
                {[...Array(6)].map((_, index) => (
                  <div key={`placeholder-${index}`} className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-300" />
                  </div>
                ))}
              </div>

              <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Ajouter des photos
              </button>
            </div>
          )}
        </div>

        {/* Related Establishments */}
        <div className="py-8 border-t">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Établissements similaires</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Link href={`/etablissement/${i}`} key={i} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Restaurant Example {i}</h3>
                  <p className="text-sm text-gray-600 mb-3">Cuisine française traditionnelle</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm text-gray-600">4.5</span>
                    </div>
                    <span className="text-sm text-gray-500">€€€</span>
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