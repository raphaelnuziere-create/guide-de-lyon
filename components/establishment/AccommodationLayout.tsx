'use client'

import { useState } from 'react'
import { 
  Bed, Wifi, Car, Coffee, Dumbbell, Pool, 
  Utensils, Concierge, Star, Users, Bath,
  AirVent, Tv, SafeIcon, Baby
} from 'lucide-react'
import type { Establishment, Room } from '@/lib/services/establishment-service'

interface AccommodationLayoutProps {
  establishment: Establishment
}

export default function AccommodationLayout({ establishment }: AccommodationLayoutProps) {
  const [selectedRoomType, setSelectedRoomType] = useState(0)

  const accommodationType = establishment.subcategory || 'Hébergement'
  
  const hotelAmenities = [
    { icon: Wifi, label: 'WiFi gratuit', key: 'wifi' },
    { icon: Car, label: 'Parking', key: 'parking' },
    { icon: Coffee, label: 'Petit-déjeuner', key: 'breakfast' },
    { icon: Dumbbell, label: 'Salle de sport', key: 'gym' },
    { icon: Pool, label: 'Piscine', key: 'pool' },
    { icon: Utensils, label: 'Restaurant', key: 'restaurant' },
    { icon: Concierge, label: 'Conciergerie', key: 'concierge' },
    { icon: Bath, label: 'Spa', key: 'spa' }
  ]

  const roomAmenities = [
    { icon: AirVent, label: 'Climatisation', key: 'ac' },
    { icon: Tv, label: 'TV écran plat', key: 'tv' },
    { icon: SafeIcon, label: 'Coffre-fort', key: 'safe' },
    { icon: Coffee, label: 'Minibar', key: 'minibar' },
    { icon: Bath, label: 'Salle de bain privée', key: 'bathroom' },
    { icon: Baby, label: 'Lit bébé disponible', key: 'baby' }
  ]

  const availableAmenities = hotelAmenities.filter(amenity => 
    establishment.amenities?.some(feature => 
      feature.toLowerCase().includes(amenity.key)
    )
  )

  const availableRoomAmenities = roomAmenities.filter(amenity => 
    establishment.features?.some(feature => 
      feature.toLowerCase().includes(amenity.key)
    )
  )

  return (
    <div className="space-y-8">
      {/* Hotel Type & Category */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <Bed className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Type</h3>
          </div>
          <p className="text-lg font-medium text-gray-800">{accommodationType}</p>
          <div className="flex mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(establishment.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <Users className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Capacité</h3>
          </div>
          <p className="text-sm text-gray-600">
            {establishment.rooms && establishment.rooms.length > 0 
              ? `${establishment.rooms.length} types de chambres`
              : 'Chambres disponibles'
            }
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Accueil personnalisé
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <Concierge className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Services</h3>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• Check-in: 15h00</div>
            <div>• Check-out: 11h00</div>
            <div>• Réception 24h/24</div>
          </div>
        </div>
      </div>

      {/* Hotel Amenities */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Équipements de l'hôtel</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableAmenities.map((amenity, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <amenity.icon className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm text-gray-700">{amenity.label}</span>
            </div>
          ))}
        </div>
        
        {availableAmenities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bed className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Équipements standards disponibles</p>
          </div>
        )}
      </div>

      {/* Room Types */}
      {establishment.rooms && establishment.rooms.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Types de chambres</h2>
          
          {/* Room Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {establishment.rooms.map((room, index) => (
              <button
                key={index}
                onClick={() => setSelectedRoomType(index)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedRoomType === index
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>

          {/* Selected Room Details */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {establishment.rooms[selectedRoomType].name}
              </h3>
              <p className="text-gray-600 mb-4">
                {establishment.rooms[selectedRoomType].description}
              </p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Capacité: {establishment.rooms[selectedRoomType].capacity} personnes</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-blue-600">
                    À partir de {establishment.rooms[selectedRoomType].price}€/nuit
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Équipements de la chambre</h4>
              <div className="grid grid-cols-2 gap-2">
                {establishment.rooms[selectedRoomType].amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center text-sm text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Vérifier les disponibilités
          </button>
        </div>
      )}

      {/* Room Standard Amenities */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Équipements standard des chambres</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableRoomAmenities.map((amenity, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <amenity.icon className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-sm text-gray-700">{amenity.label}</span>
            </div>
          ))}
        </div>

        {availableRoomAmenities.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Tv className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-sm text-gray-700">Télévision</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Bath className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-sm text-gray-700">Salle de bain privée</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Wifi className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-sm text-gray-700">WiFi gratuit</span>
            </div>
          </div>
        )}
      </div>

      {/* Policies */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Politiques de l'établissement</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium mb-2">Arrivée / Départ</h4>
            <ul className="space-y-1">
              <li>• Check-in: à partir de 15h00</li>
              <li>• Check-out: avant 11h00</li>
              <li>• Arrivée tardive possible (nous contacter)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Conditions</h4>
            <ul className="space-y-1">
              <li>• Animaux acceptés (supplément)</li>
              <li>• Annulation gratuite 48h avant</li>
              <li>• Paiement à l'arrivée ou en ligne</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}