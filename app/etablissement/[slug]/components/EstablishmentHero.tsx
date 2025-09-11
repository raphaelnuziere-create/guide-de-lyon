'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Star, MapPin, Phone, Globe, Share2, Heart, Camera,
  Award, Shield, Crown, TrendingUp
} from 'lucide-react'
import type { Establishment } from '@/lib/services/establishment-service'

interface EstablishmentHeroProps {
  establishment: Establishment
  onOpenGallery: () => void
}

export default function EstablishmentHero({ establishment, onOpenGallery }: EstablishmentHeroProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const getPlanBadge = () => {
    if (establishment.isPremium) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
          <Crown className="h-4 w-4 mr-1" />
          Premium
        </div>
      )
    }
    if (establishment.isVerified) {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <Shield className="h-4 w-4 mr-1" />
          Vérifié
        </div>
      )
    }
    return null
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: establishment.name,
          text: establishment.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Partage annulé')
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papiers')
    }
  }

  return (
    <div className="relative">
      {/* Hero Image */}
      <div className="relative h-96 lg:h-[500px] bg-gray-200">
        {establishment.images.length > 0 ? (
          <>
            <Image
              src={establishment.images[0]}
              alt={establishment.name}
              fill
              className="object-cover"
              priority
            />
            {establishment.images.length > 1 && (
              <button
                onClick={onOpenGallery}
                className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg flex items-center hover:bg-opacity-80 transition"
              >
                <Camera className="h-4 w-4 mr-2" />
                Voir toutes les photos ({establishment.images.length})
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Aucune photo disponible</p>
            </div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-3 rounded-full backdrop-blur-sm transition ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative -mt-24 mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                        {establishment.name}
                      </h1>
                      {getPlanBadge()}
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <span className="capitalize font-medium">{establishment.category}</span>
                      {establishment.subcategory && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{establishment.subcategory}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{establishment.address}, {establishment.city}</span>
                    </div>
                  </div>
                </div>

                {/* Rating & Stats */}
                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      {getRatingStars(establishment.rating)}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {establishment.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-600 ml-1">
                      ({establishment.reviewsCount} avis)
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{establishment.views} vues</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-lg font-semibold text-green-600">
                      {establishment.priceRange}
                    </span>
                  </div>
                </div>

                {/* Quick Description */}
                {establishment.shortDescription && (
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {establishment.shortDescription}
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 lg:mt-0 lg:ml-8 flex-shrink-0">
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                  {establishment.phone && (
                    <a
                      href={`tel:${establishment.phone}`}
                      className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </a>
                  )}
                  
                  {establishment.website && (
                    <a
                      href={establishment.website.startsWith('http') ? establishment.website : `https://${establishment.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Site Web
                    </a>
                  )}
                  
                  <button className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                    Itinéraire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}