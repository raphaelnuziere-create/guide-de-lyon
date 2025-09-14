import Link from 'next/link'
import { Search, MapPin, Calendar, Star, Users, TrendingUp, Newspaper } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Guide de Lyon v3
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              L'annuaire professionnel lyonnais nouvelle génération
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/annuaire-v3"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Explorer l'annuaire v3
              </Link>
              <Link
                href="/tarifs"
                className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-400 transition shadow-lg"
              >
                <Star className="w-5 h-5 mr-2" />
                Voir les tarifs
              </Link>
              <Link
                href="/admin-v3"
                className="inline-flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-400 transition shadow-lg"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Dashboard Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Guide Lyon v3 - Powered by Directus
            </h2>
            <p className="text-xl text-gray-600">
              Solution complète pour les entreprises lyonnaises
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Plans tarifaires</h3>
              <p className="text-gray-600">Basic (0€), Pro (19€), Expert (49€)</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Badges professionnels</h3>
              <p className="text-gray-600">Vérifié (Pro) et Expert avec priorité d'affichage</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Directus Cloud</h3>
              <p className="text-gray-600">CMS moderne avec hooks automatiques</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à développer votre visibilité ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez les entreprises qui font confiance au Guide de Lyon
          </p>
          <Link
            href="/tarifs"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg text-lg"
          >
            Voir les forfaits
          </Link>
        </div>
      </section>
    </div>
  )
}