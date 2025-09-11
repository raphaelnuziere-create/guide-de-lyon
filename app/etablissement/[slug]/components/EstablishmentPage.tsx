'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Star, MapPin, Phone, Globe, Clock, Users, Share2, 
  Heart, Camera, ChevronLeft, ChevronRight, Calendar,
  Award, Shield, Crown
} from 'lucide-react'
import type { Establishment, Review, Event } from '@/lib/services/establishment-service'
import EstablishmentHero from './EstablishmentHero'
import ContactInfo from './ContactInfo'
import ReviewsSection from './ReviewsSection'
import SimilarPlaces from './SimilarPlaces'
import RestaurantLayout from '@/components/establishment/RestaurantLayout'
import AccommodationLayout from '@/components/establishment/AccommodationLayout'
import RetailLayout from '@/components/establishment/RetailLayout'
import { EstablishmentService } from '@/lib/services/establishment-service'

interface EstablishmentPageProps {
  establishment: Establishment
  reviews: Review[]
  events: Event[]
  similarPlaces: Establishment[]
}

export default function EstablishmentPage({ 
  establishment, 
  reviews, 
  events, 
  similarPlaces 
}: EstablishmentPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  // Détermine le layout selon la catégorie
  const getSpecializedLayout = () => {
    const layoutType = EstablishmentService.getLayoutType(establishment.category)
    
    switch (layoutType) {
      case 'restaurant':
        return <RestaurantLayout establishment={establishment} />
      case 'accommodation':
        return <AccommodationLayout establishment={establishment} />
      case 'retail':
        return <RetailLayout establishment={establishment} />
      default:
        return null
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === establishment.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? establishment.images.length - 1 : prev - 1
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Accueil</Link>
            <span className="mx-2">/</span>
            <Link href="/annuaire" className="hover:text-blue-600">Annuaire</Link>
            <span className="mx-2">/</span>
            <Link 
              href={`/annuaire?categorie=${establishment.category}`} 
              className="hover:text-blue-600 capitalize"
            >
              {establishment.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{establishment.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <EstablishmentHero 
        establishment={establishment}
        onOpenGallery={() => setIsGalleryOpen(true)}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {establishment.description}
              </p>
              
              {/* Features & Services */}
              {(establishment.features.length > 0 || establishment.services.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {establishment.features.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Équipements</h3>
                      <div className="space-y-2">
                        {establishment.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {establishment.services.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
                      <div className="space-y-2">
                        {establishment.services.map((service, idx) => (
                          <div key={idx} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                            {service}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Specialized Layout */}
            {getSpecializedLayout()}

            {/* Events Section */}
            {events.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-900">Événements à venir</h2>
                </div>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(event.date).toLocaleDateString('fr-FR')} à {event.startTime}
                          </div>
                        </div>
                        {event.price && (
                          <div className="text-right">
                            <span className="text-lg font-semibold text-blue-600">
                              {event.price}€
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewsSection reviews={reviews} establishmentId={establishment.id} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <ContactInfo establishment={establishment} />
            
            {/* Similar Places */}
            {similarPlaces.length > 0 && (
              <SimilarPlaces places={similarPlaces} />
            )}
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && establishment.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              ✕
            </button>
            
            <button
              onClick={prevImage}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            
            <div className="relative max-w-4xl max-h-[80vh]">
              <Image
                src={establishment.images[currentImageIndex]}
                alt={`${establishment.name} - Image ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="object-contain max-h-[80vh]"
              />
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
              {currentImageIndex + 1} / {establishment.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}