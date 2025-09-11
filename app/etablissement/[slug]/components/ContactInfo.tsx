'use client'

import { 
  MapPin, Phone, Globe, Clock, Mail, 
  Navigation, Calendar, AlertCircle 
} from 'lucide-react'
import type { Establishment } from '@/lib/services/establishment-service'

interface ContactInfoProps {
  establishment: Establishment
}

export default function ContactInfo({ establishment }: ContactInfoProps) {
  const formatOpeningHours = () => {
    if (!establishment.openingHours) return null

    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames: Record<string, string> = {
      monday: 'Lundi',
      tuesday: 'Mardi', 
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    }

    return daysOrder.map(day => ({
      day: dayNames[day],
      hours: establishment.openingHours?.[day as keyof typeof establishment.openingHours] || 'Fermé'
    }))
  }

  const getCurrentStatus = () => {
    if (!establishment.openingHours) return null

    const now = new Date()
    const currentDay = now.toLocaleDateString('en', { weekday: 'lowercase' }) as keyof typeof establishment.openingHours
    const currentTime = now.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })
    const todayHours = establishment.openingHours[currentDay]

    if (!todayHours || todayHours === 'Fermé') {
      return { isOpen: false, text: 'Fermé aujourd\'hui' }
    }

    // Parse des heures (format: "09:00 - 18:00")
    const hoursMatch = todayHours.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/)
    if (!hoursMatch) {
      return { isOpen: true, text: todayHours }
    }

    const [, openHour, openMin, closeHour, closeMin] = hoursMatch
    const openTime = `${openHour}:${openMin}`
    const closeTime = `${closeHour}:${closeMin}`

    const isCurrentlyOpen = currentTime >= openTime && currentTime <= closeTime

    return {
      isOpen: isCurrentlyOpen,
      text: isCurrentlyOpen ? `Ouvert jusqu'à ${closeTime}` : `Fermé • Ouvre à ${openTime}`
    }
  }

  const status = getCurrentStatus()
  const openingHours = formatOpeningHours()

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
      <h3 className="font-bold text-lg text-gray-900 mb-6">Informations pratiques</h3>
      
      <div className="space-y-4">
        {/* Status */}
        {status && (
          <div className="flex items-center p-3 rounded-lg bg-gray-50">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              status.isOpen ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className={`font-medium ${
              status.isOpen ? 'text-green-700' : 'text-red-700'
            }`}>
              {status.text}
            </span>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-gray-900 font-medium">Adresse</div>
            <div className="text-gray-600 text-sm">
              {establishment.address}
              <br />
              {establishment.postalCode} {establishment.city}
            </div>
            <button className="mt-2 flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
              <Navigation className="h-4 w-4 mr-1" />
              Voir l'itinéraire
            </button>
          </div>
        </div>

        {/* Phone */}
        {establishment.phone && (
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-gray-900 font-medium">Téléphone</div>
              <a 
                href={`tel:${establishment.phone}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {establishment.phone}
              </a>
            </div>
          </div>
        )}

        {/* Email */}
        {establishment.email && (
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-gray-900 font-medium">Email</div>
              <a 
                href={`mailto:${establishment.email}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {establishment.email}
              </a>
            </div>
          </div>
        )}

        {/* Website */}
        {establishment.website && (
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-gray-900 font-medium">Site web</div>
              <a 
                href={establishment.website.startsWith('http') ? establishment.website : `https://${establishment.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {establishment.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Opening Hours */}
      {openingHours && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <h4 className="font-medium text-gray-900">Horaires d'ouverture</h4>
          </div>
          
          <div className="space-y-2">
            {openingHours.map(({ day, hours }) => (
              <div key={day} className="flex justify-between text-sm">
                <span className="text-gray-600">{day}</span>
                <span className={`font-medium ${
                  hours === 'Fermé' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium">
          Réserver une table
        </button>
        
        <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition font-medium">
          Signaler une erreur
        </button>
      </div>

      {/* Warning */}
      {establishment.isClosed && (
        <div className="mt-4 flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-red-800">Établissement fermé</div>
            <div className="text-red-700">
              Cet établissement pourrait être temporairement ou définitivement fermé.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}