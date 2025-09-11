'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin } from 'lucide-react'
import type { Establishment } from '@/lib/services/establishment-service'

interface SimilarPlacesProps {
  places: Establishment[]
}

export default function SimilarPlaces({ places }: SimilarPlacesProps) {
  if (places.length === 0) return null

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="font-bold text-lg text-gray-900 mb-6">Établissements similaires</h3>
      
      <div className="space-y-4">
        {places.map((place) => (
          <Link 
            key={place.id}
            href={`/etablissement/${place.slug}`}
            className="block group"
          >
            <div className="flex space-x-4 p-3 rounded-lg hover:bg-gray-50 transition">
              {/* Image */}
              <div className="relative w-16 h-16 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                {place.images.length > 0 ? (
                  <Image
                    src={place.images[0]}
                    alt={place.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <span className="text-gray-600 text-lg font-bold">
                      {place.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                  {place.name}
                </h4>
                
                <div className="flex items-center mt-1 mb-2">
                  <div className="flex items-center mr-2">
                    {getRatingStars(place.rating)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {place.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({place.reviewsCount})
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{place.city}</span>
                  <span className="mx-2">•</span>
                  <span className="text-green-600 font-medium">
                    {place.priceRange}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <Link 
          href="/annuaire"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Voir plus d'établissements →
        </Link>
      </div>
    </div>
  )
}