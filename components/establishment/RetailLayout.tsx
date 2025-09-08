'use client'

import { 
  ShoppingBag, CreditCard, Clock, Gift, 
  Truck, RefreshCw, Star, Tag, Heart,
  Package, Shirt, Watch, Gem, Book
} from 'lucide-react'
import type { Establishment } from '@/lib/services/establishment-service'

interface RetailLayoutProps {
  establishment: Establishment
}

export default function RetailLayout({ establishment }: RetailLayoutProps) {
  const shopType = establishment.subcategory || 'Commerce'
  
  const productCategories = establishment.specialties || [
    'Mode & Accessoires',
    'Articles de qualité',
    'Sélection unique'
  ]

  const shopServices = [
    { icon: CreditCard, label: 'Paiement carte', key: 'card' },
    { icon: Gift, label: 'Emballage cadeau', key: 'gift' },
    { icon: Truck, label: 'Livraison', key: 'delivery' },
    { icon: RefreshCw, label: 'Échange/Retour', key: 'return' },
    { icon: Package, label: 'Click & Collect', key: 'collect' },
  ]

  const availableServices = shopServices.filter(service => 
    establishment.services?.some(feature => 
      feature.toLowerCase().includes(service.key)
    )
  )

  const getShopIcon = (category: string) => {
    const categoryLower = category.toLowerCase()
    if (categoryLower.includes('mode') || categoryLower.includes('vêtement')) return Shirt
    if (categoryLower.includes('bijou') || categoryLower.includes('joaillerie')) return Gem
    if (categoryLower.includes('livre') || categoryLower.includes('librairie')) return Book
    if (categoryLower.includes('montre') || categoryLower.includes('horlogerie')) return Watch
    return ShoppingBag
  }

  return (
    <div className="space-y-8">
      {/* Shop Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <ShoppingBag className="h-6 w-6 text-pink-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Type de commerce</h3>
          </div>
          <p className="text-lg font-medium text-gray-800">{shopType}</p>
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

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <Tag className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Gamme de prix</h3>
          </div>
          <p className="text-lg font-medium text-gray-800">{establishment.priceRange}</p>
          <p className="text-sm text-gray-600 mt-1">
            {establishment.priceRange === '€' && 'Prix abordables'}
            {establishment.priceRange === '€€' && 'Prix modérés'}
            {establishment.priceRange === '€€€' && 'Gamme premium'}
            {establishment.priceRange === '€€€€' && 'Luxe'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
          <div className="flex items-center mb-3">
            <Heart className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Spécialité</h3>
          </div>
          <p className="text-sm text-gray-600">
            {establishment.isVerified ? 'Commerce certifié' : 'Commerce local'}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Sélection soignée
          </p>
        </div>
      </div>

      {/* Product Categories */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nos produits</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productCategories.map((category, index) => {
            const CategoryIcon = getShopIcon(category)
            return (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg hover:shadow-md transition">
                <div className="flex items-center mb-3">
                  <CategoryIcon className="h-6 w-6 text-gray-600 mr-2" />
                  <h3 className="font-semibold text-gray-900">{category}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Découvrez notre sélection de qualité
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Services disponibles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableServices.map((service, index) => (
            <div key={index} className="flex items-center p-4 bg-blue-50 rounded-lg">
              <service.icon className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm text-gray-700">{service.label}</span>
            </div>
          ))}
        </div>

        {availableServices.length === 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-sm text-gray-700">Paiement carte</span>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Gift className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-sm text-gray-700">Conseils personnalisés</span>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <RefreshCw className="h-5 w-5 text-gray-600 mr-3" />
              <span className="text-sm text-gray-700">Service après-vente</span>
            </div>
          </div>
        )}
      </div>

      {/* Featured Products or Brands */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Marques & Sélection</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Nos marques partenaires</h3>
            <p className="text-gray-600 mb-4">
              Nous travaillons avec les meilleures marques pour vous offrir 
              une sélection de qualité à Lyon.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Marques reconnues</li>
              <li>• Produits authentiques</li>
              <li>• Garantie fabricant</li>
              <li>• Conseil d'expert</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Nouveautés & Tendances</h3>
            <p className="text-gray-600 mb-4">
              Découvrez régulièrement nos nouveautés et les dernières tendances.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Collections saisonnières</li>
              <li>• Éditions limitées</li>
              <li>• Créateurs locaux</li>
              <li>• Exclusivités boutique</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Customer Benefits */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Gift className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Avantages clients</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <div>• Programme de fidélité</div>
            <div>• Offres privilège</div>
            <div>• Ventes privées</div>
            <div>• Newsletter exclusive</div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Facilités</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <div>• Paiement en plusieurs fois</div>
            <div>• Réservation par téléphone</div>
            <div>• Service personnalisé</div>
            <div>• Conseils d'experts</div>
          </div>
        </div>
      </div>

      {/* Store Policies */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Informations pratiques</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <h4 className="font-medium mb-2">Moyens de paiement</h4>
            <ul className="space-y-1">
              <li>• Espèces</li>
              <li>• Carte bancaire (Visa, Mastercard)</li>
              <li>• Chèques</li>
              <li>• Paiement mobile</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Services</h4>
            <ul className="space-y-1">
              <li>• Échange sous 15 jours</li>
              <li>• Retour avec ticket</li>
              <li>• Emballage cadeau gratuit</li>
              <li>• Conseils personnalisés</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}