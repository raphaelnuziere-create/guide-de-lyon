import Link from 'next/link'
import { Search, MapPin, Calendar, Star, Users, TrendingUp } from 'lucide-react'
// MIGRATION: Remplacement du composant Firebase par Supabase (7 jan 2025)
// import { UpcomingEventsSection } from '@/components/homepage/upcoming-events-section' // Firebase version (désactivée)
// import { EventsSectionSupabase as UpcomingEventsSection } from '@/components/homepage/events-section-supabase' // Version simple (désactivée)
import { CalendarEventsSection as UpcomingEventsSection } from '@/components/homepage/calendar-events-section' // Version calendrier

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Guide de Lyon
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              L'annuaire des entreprises et l'agenda des événements lyonnais
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une entreprise, un restaurant, un événement..."
                  className="w-full px-6 py-4 pr-12 rounded-full text-gray-900 placeholder-gray-500 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/annuaire"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Explorer l'annuaire
              </Link>
              <Link
                href="/evenements"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition shadow-lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Voir les événements
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-gray-600">Entreprises</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">50+</div>
              <div className="text-gray-600">Événements/mois</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">10k+</div>
              <div className="text-gray-600">Visiteurs/mois</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">4.8/5</div>
              <div className="text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Explorez par catégorie
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Restaurants', icon: '🍴', count: '150+' },
              { name: 'Shopping', icon: '🛍️', count: '80+' },
              { name: 'Culture', icon: '🎭', count: '45+' },
              { name: 'Services', icon: '💼', count: '120+' },
              { name: 'Santé', icon: '⚕️', count: '60+' },
              { name: 'Sport', icon: '⚽', count: '35+' },
              { name: 'Beauté', icon: '💅', count: '40+' },
              { name: 'Éducation', icon: '🎓', count: '25+' },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/annuaire?categorie=${category.name.toLowerCase()}`}
                className="group p-6 bg-gray-50 rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Entreprises à la une
            </h2>
            <Link href="/annuaire" className="text-blue-600 hover:text-blue-700 font-semibold">
              Voir tout →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Restaurant Paul Bocuse',
                category: 'Gastronomie',
                rating: 4.9,
                image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
              },
              {
                name: 'Spa Lyon Plage',
                category: 'Bien-être',
                rating: 4.7,
                image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
              },
              {
                name: 'Boutique Créateurs',
                category: 'Shopping',
                rating: 4.8,
                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
              },
            ].map((business) => (
              <div key={business.name} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{business.name}</h3>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm ml-1 text-gray-600">{business.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{business.category}</p>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events - Dynamic Section */}
      <UpcomingEventsSection />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vous êtes une entreprise lyonnaise ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez notre annuaire et boostez votre visibilité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <Users className="w-5 h-5 mr-2" />
              Inscription gratuite
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Voir les offres Premium
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            Restez informé
          </h2>
          <p className="text-gray-600 mb-8">
            Recevez les dernières actualités et événements de Lyon
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              S'abonner
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}