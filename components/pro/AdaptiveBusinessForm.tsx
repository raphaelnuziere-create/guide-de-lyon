'use client'

import { useState, useEffect } from 'react'
import { 
  Utensils, Coffee, ShoppingBag, Scissors, Hotel, 
  Plus, X, Upload, Clock, Users, Star, Leaf, Wine,
  Bed, Bath, Wifi, Car, CreditCard, Gift
} from 'lucide-react'

interface BusinessFormData {
  // Base info
  category: string
  subcategory: string
  specialties: string[]
  features: string[]
  services: string[]
  amenities: string[]
  
  // Business specific
  priceRange: 'Budget' | '€€' | '€€€' | '€€€€'
  
  // Restaurant specific
  menu?: MenuSection[]
  cuisineTypes?: string[]
  dietaryOptions?: string[]
  
  // Accommodation specific  
  rooms?: Room[]
  hotelAmenities?: string[]
  
  // Retail specific
  productCategories?: string[]
  brands?: string[]
  paymentMethods?: string[]
  
  // Opening hours
  openingHours?: {
    [key: string]: string
  }
}

interface MenuSection {
  name: string
  description?: string
  items: MenuItem[]
}

interface MenuItem {
  name: string
  description?: string
  price?: number
  isVegetarian?: boolean
  isVegan?: boolean
  allergens?: string[]
}

interface Room {
  name: string
  description: string
  price: number
  capacity: number
  amenities: string[]
}

interface AdaptiveBusinessFormProps {
  category: string
  formData: BusinessFormData
  onChange: (data: BusinessFormData) => void
}

export default function AdaptiveBusinessForm({ category, formData, onChange }: AdaptiveBusinessFormProps) {
  const [activeSection, setActiveSection] = useState<string>('basic')
  
  const updateFormData = (updates: Partial<BusinessFormData>) => {
    onChange({ ...formData, ...updates })
  }

  const getBusinessType = (category: string): string => {
    if (['restaurant-food', 'bar-nightlife'].includes(category)) return 'restaurant'
    if (['hotel-hebergement'].includes(category)) return 'accommodation'
    if (['shopping-mode'].includes(category)) return 'retail'
    if (['beaute-bienetre'].includes(category)) return 'wellness'
    return 'general'
  }

  const businessType = getBusinessType(category)

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
      
      {/* Subcategory */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sous-catégorie
        </label>
        <select
          value={formData.subcategory}
          onChange={(e) => updateFormData({ subcategory: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sélectionnez...</option>
          {getSubcategories(category).map(sub => (
            <option key={sub.value} value={sub.value}>{sub.label}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gamme de prix
        </label>
        <div className="grid grid-cols-4 gap-2">
          {['Budget', '€€', '€€€', '€€€€'].map(range => (
            <button
              key={range}
              type="button"
              onClick={() => updateFormData({ priceRange: range as any })}
              className={`p-3 text-center border rounded-lg transition ${
                formData.priceRange === range
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Spécialités
        </label>
        <SpecialtiesInput
          specialties={formData.specialties || []}
          onChange={(specialties) => updateFormData({ specialties })}
          businessType={businessType}
        />
      </div>

      {/* Features & Services */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services
          </label>
          <FeaturesSelector
            selected={formData.services || []}
            options={getServiceOptions(businessType)}
            onChange={(services) => updateFormData({ services })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Équipements
          </label>
          <FeaturesSelector
            selected={formData.features || []}
            options={getFeatureOptions(businessType)}
            onChange={(features) => updateFormData({ features })}
          />
        </div>
      </div>
    </div>
  )

  const renderBusinessSpecific = () => {
    switch (businessType) {
      case 'restaurant':
        return <RestaurantForm formData={formData} onChange={updateFormData} />
      case 'accommodation':
        return <AccommodationForm formData={formData} onChange={updateFormData} />
      case 'retail':
        return <RetailForm formData={formData} onChange={updateFormData} />
      default:
        return null
    }
  }

  const renderOpeningHours = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Horaires d'ouverture</h3>
      <OpeningHoursForm
        hours={formData.openingHours || {}}
        onChange={(openingHours) => updateFormData({ openingHours })}
      />
    </div>
  )

  const sections = [
    { id: 'basic', label: 'Informations de base' },
    ...(businessType !== 'general' ? [{ id: 'specific', label: getSpecificLabel(businessType) }] : []),
    { id: 'hours', label: 'Horaires' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Section Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {sections.map(section => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 font-medium text-sm transition border-b-2 ${
              activeSection === section.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div>
        {activeSection === 'basic' && renderBasicInfo()}
        {activeSection === 'specific' && renderBusinessSpecific()}
        {activeSection === 'hours' && renderOpeningHours()}
      </div>
    </div>
  )
}

// Restaurant specific form
function RestaurantForm({ formData, onChange }: { formData: BusinessFormData, onChange: (data: Partial<BusinessFormData>) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Utensils className="h-5 w-5 mr-2" />
        Configuration Restaurant
      </h3>

      {/* Cuisine Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Types de cuisine
        </label>
        <SpecialtiesInput
          specialties={formData.cuisineTypes || []}
          onChange={(cuisineTypes) => onChange({ cuisineTypes })}
          placeholder="Française, Italienne, Asiatique..."
        />
      </div>

      {/* Dietary Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Options alimentaires
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Végétarien', 'Végan', 'Sans gluten', 'Halal', 'Casher'].map(option => (
            <label key={option} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.dietaryOptions || []).includes(option)}
                onChange={(e) => {
                  const current = formData.dietaryOptions || []
                  const updated = e.target.checked
                    ? [...current, option]
                    : current.filter(o => o !== option)
                  onChange({ dietaryOptions: updated })
                }}
                className="mr-2"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Menu Builder */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-900">Menu (optionnel)</h4>
          <button
            type="button"
            onClick={() => {
              const newSection = { name: 'Nouvelle section', items: [] }
              onChange({ menu: [...(formData.menu || []), newSection] })
            }}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une section
          </button>
        </div>
        <MenuBuilder
          menu={formData.menu || []}
          onChange={(menu) => onChange({ menu })}
        />
      </div>
    </div>
  )
}

// Accommodation specific form
function AccommodationForm({ formData, onChange }: { formData: BusinessFormData, onChange: (data: Partial<BusinessFormData>) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Hotel className="h-5 w-5 mr-2" />
        Configuration Hébergement
      </h3>

      {/* Hotel Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Équipements de l'établissement
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            'WiFi gratuit', 'Parking', 'Petit-déjeuner', 'Salle de sport', 
            'Piscine', 'Restaurant', 'Spa', 'Conciergerie', 'Bagagerie',
            'Animaux acceptés', 'Climatisation', 'Ascenseur'
          ].map(amenity => (
            <label key={amenity} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.hotelAmenities || []).includes(amenity)}
                onChange={(e) => {
                  const current = formData.hotelAmenities || []
                  const updated = e.target.checked
                    ? [...current, amenity]
                    : current.filter(a => a !== amenity)
                  onChange({ hotelAmenities: updated })
                }}
                className="mr-2"
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rooms */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-900">Types de chambres (optionnel)</h4>
          <button
            type="button"
            onClick={() => {
              const newRoom = { name: '', description: '', price: 0, capacity: 2, amenities: [] }
              onChange({ rooms: [...(formData.rooms || []), newRoom] })
            }}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter un type
          </button>
        </div>
        <RoomBuilder
          rooms={formData.rooms || []}
          onChange={(rooms) => onChange({ rooms })}
        />
      </div>
    </div>
  )
}

// Retail specific form
function RetailForm({ formData, onChange }: { formData: BusinessFormData, onChange: (data: Partial<BusinessFormData>) => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <ShoppingBag className="h-5 w-5 mr-2" />
        Configuration Commerce
      </h3>

      {/* Product Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégories de produits
        </label>
        <SpecialtiesInput
          specialties={formData.productCategories || []}
          onChange={(productCategories) => onChange({ productCategories })}
          placeholder="Mode féminine, Accessoires, Chaussures..."
        />
      </div>

      {/* Brands */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Marques (optionnel)
        </label>
        <SpecialtiesInput
          specialties={formData.brands || []}
          onChange={(brands) => onChange({ brands })}
          placeholder="Nike, Adidas, Zara..."
        />
      </div>

      {/* Payment Methods */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Moyens de paiement
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Espèces', 'Carte bancaire', 'Chèques', 'Paiement mobile', 'Paiement en ligne'].map(method => (
            <label key={method} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.paymentMethods || []).includes(method)}
                onChange={(e) => {
                  const current = formData.paymentMethods || []
                  const updated = e.target.checked
                    ? [...current, method]
                    : current.filter(m => m !== method)
                  onChange({ paymentMethods: updated })
                }}
                className="mr-2"
              />
              <span className="text-sm">{method}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper components
function SpecialtiesInput({ 
  specialties, 
  onChange, 
  placeholder = "Tapez et appuyez sur Entrée...",
  businessType
}: { 
  specialties: string[], 
  onChange: (specialties: string[]) => void,
  placeholder?: string,
  businessType?: string 
}) {
  const [inputValue, setInputValue] = useState('')

  const addSpecialty = (value: string) => {
    if (value.trim() && !specialties.includes(value.trim())) {
      onChange([...specialties, value.trim()])
      setInputValue('')
    }
  }

  const removeSpecialty = (index: number) => {
    onChange(specialties.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {specialties.map((specialty, index) => (
          <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {specialty}
            <button
              type="button"
              onClick={() => removeSpecialty(index)}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addSpecialty(inputValue)
          }
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  )
}

function FeaturesSelector({ 
  selected, 
  options, 
  onChange 
}: { 
  selected: string[], 
  options: string[], 
  onChange: (selected: string[]) => void 
}) {
  const toggleFeature = (feature: string) => {
    const updated = selected.includes(feature)
      ? selected.filter(f => f !== feature)
      : [...selected, feature]
    onChange(updated)
  }

  return (
    <div className="space-y-1 max-h-40 overflow-y-auto">
      {options.map(option => (
        <label key={option} className="flex items-center">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => toggleFeature(option)}
            className="mr-2"
          />
          <span className="text-sm">{option}</span>
        </label>
      ))}
    </div>
  )
}

function MenuBuilder({ menu, onChange }: { menu: MenuSection[], onChange: (menu: MenuSection[]) => void }) {
  if (menu.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucune section de menu ajoutée. Vous pourrez ajouter votre menu plus tard depuis votre dashboard.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {menu.map((section, sectionIndex) => (
        <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <input
              type="text"
              value={section.name}
              onChange={(e) => {
                const updated = [...menu]
                updated[sectionIndex].name = e.target.value
                onChange(updated)
              }}
              className="font-medium bg-transparent border-none p-0 focus:ring-0"
              placeholder="Nom de la section"
            />
            <button
              type="button"
              onClick={() => onChange(menu.filter((_, i) => i !== sectionIndex))}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            {section.items.length} plat{section.items.length > 1 ? 's' : ''}
          </p>
        </div>
      ))}
    </div>
  )
}

function RoomBuilder({ rooms, onChange }: { rooms: Room[], onChange: (rooms: Room[]) => void }) {
  if (rooms.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        Aucun type de chambre ajouté. Vous pourrez configurer vos chambres plus tard depuis votre dashboard.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {rooms.map((room, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 mr-4">
              <input
                type="text"
                value={room.name}
                onChange={(e) => {
                  const updated = [...rooms]
                  updated[index].name = e.target.value
                  onChange(updated)
                }}
                className="w-full font-medium bg-transparent border-none p-0 focus:ring-0"
                placeholder="Nom du type de chambre"
              />
              <div className="grid grid-cols-2 gap-2 mt-2">
                <input
                  type="number"
                  value={room.price}
                  onChange={(e) => {
                    const updated = [...rooms]
                    updated[index].price = Number(e.target.value)
                    onChange(updated)
                  }}
                  className="text-sm p-1 border border-gray-200 rounded"
                  placeholder="Prix/nuit"
                />
                <input
                  type="number"
                  value={room.capacity}
                  onChange={(e) => {
                    const updated = [...rooms]
                    updated[index].capacity = Number(e.target.value)
                    onChange(updated)
                  }}
                  className="text-sm p-1 border border-gray-200 rounded"
                  placeholder="Capacité"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange(rooms.filter((_, i) => i !== index))}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function OpeningHoursForm({ hours, onChange }: { hours: { [key: string]: string }, onChange: (hours: { [key: string]: string }) => void }) {
  const days = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]
  
  const dayNames = {
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche'
  }

  return (
    <div className="space-y-3">
      {days.map(day => (
        <div key={day} className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 w-24">
            {dayNames[day as keyof typeof dayNames]}
          </label>
          <input
            type="text"
            value={hours[day] || ''}
            onChange={(e) => onChange({ ...hours, [day]: e.target.value })}
            className="flex-1 ml-4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="09:00-18:00 ou Fermé"
          />
        </div>
      ))}
      <p className="text-xs text-gray-500 mt-2">
        Format suggéré : "09:00-12:00, 14:00-18:00" ou "Fermé"
      </p>
    </div>
  )
}

// Helper functions
function getSubcategories(category: string) {
  const subcategoryMap: { [key: string]: { value: string, label: string }[] } = {
    'restaurant-food': [
      { value: 'restaurant-traditionnel', label: 'Restaurant traditionnel' },
      { value: 'restaurant-gastronomique', label: 'Restaurant gastronomique' },
      { value: 'brasserie', label: 'Brasserie' },
      { value: 'bistrot', label: 'Bistrot' },
      { value: 'pizzeria', label: 'Pizzeria' },
      { value: 'fast-food', label: 'Fast-food' },
      { value: 'traiteur', label: 'Traiteur' }
    ],
    'hotel-hebergement': [
      { value: 'hotel', label: 'Hôtel' },
      { value: 'boutique-hotel', label: 'Boutique hotel' },
      { value: 'auberge', label: 'Auberge' },
      { value: 'chambre-hote', label: 'Chambre d\'hôte' },
      { value: 'gite', label: 'Gîte' },
      { value: 'aparthotel', label: 'Appart\'hôtel' }
    ],
    'shopping-mode': [
      { value: 'vetements-femme', label: 'Vêtements femme' },
      { value: 'vetements-homme', label: 'Vêtements homme' },
      { value: 'chaussures', label: 'Chaussures' },
      { value: 'accessoires', label: 'Accessoires' },
      { value: 'bijouterie', label: 'Bijouterie' },
      { value: 'maroquinerie', label: 'Maroquinerie' }
    ]
  }
  
  return subcategoryMap[category] || []
}

function getServiceOptions(businessType: string) {
  const serviceMap: { [key: string]: string[] } = {
    restaurant: [
      'Réservation', 'Livraison', 'Plats à emporter', 'Service traiteur',
      'Privatisation', 'Menu enfant', 'Menu groupe', 'Brunch'
    ],
    accommodation: [
      'Room service', 'Conciergerie', 'Bagagerie', 'Navette aéroport',
      'Location vélos', 'Service pressing', 'Réveil téléphonique'
    ],
    retail: [
      'Personal shopper', 'Retouches', 'Emballage cadeau', 'Click & collect',
      'Livraison', 'Paiement en plusieurs fois', 'Programme fidélité'
    ],
    general: [
      'Sur rendez-vous', 'Consultation gratuite', 'Devis gratuit', 'Urgence'
    ]
  }
  
  return serviceMap[businessType] || serviceMap.general
}

function getFeatureOptions(businessType: string) {
  const featureMap: { [key: string]: string[] } = {
    restaurant: [
      'Terrasse', 'Jardin', 'Climatisation', 'Parking', 'Accès handicapé',
      'WiFi', 'Musique live', 'Karaoké', 'Jeux'
    ],
    accommodation: [
      'WiFi gratuit', 'Parking gratuit', 'Climatisation', 'Chauffage',
      'Ascenseur', 'Coffre-fort', 'Télévision', 'Minibar'
    ],
    retail: [
      'Cabines d\'essayage', 'Climatisation', 'Musique d\'ambiance',
      'Parking', 'Accès handicapé', 'WiFi clients'
    ],
    general: [
      'Parking', 'Accès handicapé', 'WiFi', 'Climatisation', 'Salle d\'attente'
    ]
  }
  
  return featureMap[businessType] || featureMap.general
}

function getSpecificLabel(businessType: string) {
  const labelMap: { [key: string]: string } = {
    restaurant: 'Menu & Cuisine',
    accommodation: 'Chambres & Services',
    retail: 'Produits & Services',
    wellness: 'Soins & Tarifs'
  }
  
  return labelMap[businessType] || 'Détails spécifiques'
}