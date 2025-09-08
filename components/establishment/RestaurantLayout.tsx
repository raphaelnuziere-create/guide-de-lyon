'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Star, Clock, Users, Utensils, Award, 
  ChefHat, Wine, Leaf, MapPin, Phone 
} from 'lucide-react'
import type { Establishment, MenuItem, MenuSection } from '@/lib/services/establishment-service'

interface RestaurantLayoutProps {
  establishment: Establishment
}

export default function RestaurantLayout({ establishment }: RestaurantLayoutProps) {
  const [selectedMenuSection, setSelectedMenuSection] = useState(0)

  const cuisineTypes = establishment.specialties || []
  const dietaryOptions = establishment.features?.filter(f => 
    ['végétarien', 'végan', 'sans gluten', 'halal', 'casher'].some(diet => 
      f.toLowerCase().includes(diet)
    )
  ) || []

  return (
    <div className="space-y-8">
      {/* Restaurant Highlights */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Cuisine Type */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <ChefHat className="h-6 w-6 text-orange-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Spécialités</h3>
          </div>
          {cuisineTypes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {cuisineTypes.map((cuisine, idx) => (
                <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {cuisine}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Cuisine traditionnelle</p>
          )}
        </div>

        {/* Ambiance */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <Users className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Ambiance</h3>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            {establishment.features?.includes('terrasse') && <div>• Terrasse disponible</div>}
            {establishment.features?.includes('groupes') && <div>• Idéal pour groupes</div>}
            {establishment.features?.includes('romantique') && <div>• Cadre romantique</div>}
            {establishment.features?.includes('familial') && <div>• Accueil familial</div>}
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <Award className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Distinctions</h3>
          </div>
          {establishment.rating >= 4.5 ? (
            <div className="space-y-1 text-sm text-gray-600">
              <div>• Excellence culinaire</div>
              <div>• Recommandé par nos experts</div>
              {establishment.isPremium && <div>• Partenaire Premium</div>}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Restaurant de qualité</p>
          )}
        </div>
      </div>

      {/* Menu Section */}
      {establishment.menu && establishment.menu.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Utensils className="h-6 w-6 text-gray-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Notre Carte</h2>
          </div>

          {/* Menu Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {establishment.menu.map((section, index) => (
              <button
                key={index}
                onClick={() => setSelectedMenuSection(index)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedMenuSection === index
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            {establishment.menu[selectedMenuSection]?.description && (
              <p className="text-gray-600 italic mb-6">
                {establishment.menu[selectedMenuSection].description}
              </p>
            )}
            
            {establishment.menu[selectedMenuSection]?.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start p-4 hover:bg-gray-50 rounded-lg transition">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    {item.isVegetarian && (
                      <span className="w-2 h-2 bg-green-500 rounded-full" title="Végétarien" />
                    )}
                    {item.isVegan && (
                      <Leaf className="w-4 h-4 text-green-600" title="Végan" />
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  )}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {item.allergens.map((allergen, idx) => (
                        <span key={idx} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {item.price && (
                  <span className="text-lg font-semibold text-gray-900 ml-4">
                    {item.price}€
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wine & Beverages */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Wine className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Cave & Boissons</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Sélection de vins de la région</div>
            <div>• Conseils sommelier</div>
            <div>• Cocktails signature</div>
            <div>• Boissons sans alcool</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Service</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• Réservation recommandée</div>
            <div>• Service à table uniquement</div>
            {establishment.features?.includes('livraison') && <div>• Livraison disponible</div>}
            {establishment.features?.includes('emporter') && <div>• Plats à emporter</div>}
          </div>
        </div>
      </div>

      {/* Dietary Information */}
      {dietaryOptions.length > 0 && (
        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Leaf className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Options alimentaires</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {option}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chef's Special Message */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <ChefHat className="h-6 w-6 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Message du Chef</h3>
        </div>
        <blockquote className="text-gray-700 italic">
          "Nous nous engageons à vous offrir une expérience culinaire authentique, 
          en utilisant des produits frais et locaux dans le respect des traditions lyonnaises."
        </blockquote>
        <footer className="mt-2 text-sm text-gray-500">— L'équipe de {establishment.name}</footer>
      </div>
    </div>
  )
}