import Link from 'next/link'
import { Calendar, MapPin, Clock, Users, ChevronLeft } from 'lucide-react'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Page simplifiee pour eviter les erreurs d'encodage
  const resolvedParams = await params;
  const event = {
    id: resolvedParams.id,
    title: 'Festival des Lumieres 2025',
    description: 'Le plus grand evenement lumineux de Lyon revient illuminer la ville pendant 4 soirees exceptionnelles.',
    date: '2025-12-05',
    time: '18:00 - 23:00',
    location: 'Centre-ville de Lyon',
    address: 'Place Bellecour, 69002 Lyon',
    category: 'Festival',
    price: 'Gratuit',
    organizer: 'Ville de Lyon',
    attendees: 3500,
    maxAttendees: 5000
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/evenements" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour aux evenements
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-purple-100">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {new Date(event.date).toLocaleDateString('fr-FR')}
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              {event.time}
            </div>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {event.location}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">A propos</h2>
              <p className="text-gray-600 mb-6">{event.description}</p>
              
              <h3 className="text-xl font-semibold mb-3">Details</h3>
              <ul className="space-y-2 text-gray-600">
                <li><strong>Date:</strong> {new Date(event.date).toLocaleDateString('fr-FR')}</li>
                <li><strong>Horaires:</strong> {event.time}</li>
                <li><strong>Lieu:</strong> {event.address}</li>
                <li><strong>Organisateur:</strong> {event.organizer}</li>
                <li><strong>Prix:</strong> {event.price}</li>
              </ul>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Inscription</h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Participants</span>
                  <span>{event.attendees}/{event.maxAttendees}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                  />
                </div>
              </div>

              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                S'inscrire gratuitement
              </button>
              
              <p className="text-sm text-gray-500 mt-4 text-center">
                Plus que {event.maxAttendees - event.attendees} places disponibles
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Partager</h3>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Facebook
                </button>
                <button className="flex-1 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
                  X
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Evenements similaires</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Link 
                key={i}
                href={`/evenement/${i + 1}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-t-lg"></div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Evenement {i}</h3>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      15 decembre 2025
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Lyon
                    </div>
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