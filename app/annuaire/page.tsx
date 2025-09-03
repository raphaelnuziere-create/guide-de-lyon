'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Phone, Globe, Star, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Business {
  id: string
  name: string
  category: string
  description: string
  address: string
  phone?: string
  website?: string
  rating?: number
}

export default function AnnuairePage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Données de démonstration
  const demoBusinesses: Business[] = [
    {
      id: '1',
      name: 'Restaurant Paul Bocuse',
      category: 'Restaurant',
      description: 'Restaurant gastronomique étoilé au Guide Michelin',
      address: '40 Rue de la Plage, 69660 Collonges-au-Mont-d\'Or',
      phone: '04 72 42 90 90',
      website: 'www.bocuse.fr',
      rating: 4.9
    },
    {
      id: '2',
      name: 'Les Halles de Lyon Paul Bocuse',
      category: 'Marché',
      description: 'Marché couvert avec les meilleurs produits lyonnais',
      address: '102 Cours Lafayette, 69003 Lyon',
      phone: '04 78 62 39 33',
      website: 'www.halles-de-lyon-paulbocuse.com',
      rating: 4.7
    },
    {
      id: '3',
      name: 'Musée des Confluences',
      category: 'Culture',
      description: 'Musée d\'histoire naturelle, d\'anthropologie et des civilisations',
      address: '86 Quai Perrache, 69002 Lyon',
      phone: '04 28 38 11 90',
      website: 'www.museedesconfluences.fr',
      rating: 4.6
    },
    {
      id: '4',
      name: 'Spa Lyon Plage',
      category: 'Bien-être',
      description: 'Centre de bien-être et spa urbain',
      address: '8 Quai Augagneur, 69003 Lyon',
      phone: '04 78 54 32 10',
      website: 'www.spa-lyon-plage.fr',
      rating: 4.8
    },
    {
      id: '5',
      name: 'Centre Commercial Part-Dieu',
      category: 'Shopping',
      description: 'Le plus grand centre commercial de Lyon',
      address: '17 Rue du Docteur Bouchut, 69003 Lyon',
      phone: '04 72 60 60 60',
      website: 'www.centrecommercialpartdieu.com',
      rating: 4.2
    },
    {
      id: '6',
      name: 'Bouchon Daniel et Denise',
      category: 'Restaurant',
      description: 'Cuisine lyonnaise traditionnelle dans un bouchon authentique',
      address: '156 Rue de Créqui, 69003 Lyon',
      phone: '04 78 60 66 53',
      website: 'www.danieletdenise.fr',
      rating: 4.7
    },
  ]

  useEffect(() => {
    // Simuler le chargement
    setTimeout(() => {
      setBusinesses(demoBusinesses)
      setLoading(false)
    }, 1000)
  }, [])

  const categories = ['Tous', 'Restaurant', 'Shopping', 'Culture', 'Services', 'Bien-être', 'Marché']

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          business.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === '' || selectedCategory === 'Tous' || 
                           business.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Annuaire des entreprises</h1>
          <p className="text-xl text-blue-100">Découvrez les meilleures adresses de Lyon</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une entreprise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement des entreprises...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              {filteredBusinesses.length} entreprise(s) trouvée(s)
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <div key={business.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{business.name}</h3>
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {business.category}
                        </span>
                      </div>
                      {business.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{business.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {business.description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                        <span className="line-clamp-2">{business.address}</span>
                      </div>
                      
                      {business.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                      
                      {business.website && (
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          <a 
                            href={`https://${business.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {business.website}
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                      Voir détails
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">Aucune entreprise trouvée pour cette recherche.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}