import { Building2, Users, Target, Award, Heart, Globe } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">À propos de Guide de Lyon</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Votre plateforme de référence pour découvrir, explorer et vivre Lyon au quotidien
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Notre Mission</h2>
              <p className="text-gray-600 mb-4">
                Guide de Lyon est né de la volonté de créer une plateforme complète et moderne 
                pour connecter les Lyonnais et les visiteurs avec le meilleur de notre ville.
              </p>
              <p className="text-gray-600 mb-6">
                Nous croyons en la richesse du tissu économique et culturel lyonnais. Notre mission 
                est de mettre en lumière les entreprises locales, de promouvoir les événements 
                qui animent notre ville et de faciliter la vie quotidienne de chacun.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Target className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Visibilité locale</h3>
                    <p className="text-gray-600 text-sm">
                      Aider les entreprises lyonnaises à se faire connaître
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Communauté</h3>
                    <p className="text-gray-600 text-sm">
                      Créer des liens entre professionnels et habitants
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Heart className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Passion</h3>
                    <p className="text-gray-600 text-sm">
                      Partager notre amour pour Lyon et son dynamisme
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="w-32 h-32 text-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Guide de Lyon en chiffres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Entreprises référencées</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Événements par mois</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-gray-600">Visiteurs mensuels</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2025</div>
              <div className="text-gray-600">Année de création</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Nos Valeurs
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Innovation</h3>
              <p className="text-gray-600">
                Nous utilisons les dernières technologies pour offrir une expérience moderne et intuitive
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Excellence</h3>
              <p className="text-gray-600">
                Nous nous engageons à fournir un service de qualité et des informations fiables
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Proximité</h3>
              <p className="text-gray-600">
                Nous restons à l'écoute de nos utilisateurs et des besoins des entreprises locales
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Notre Équipe
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Une équipe passionnée par Lyon, dédiée à faire rayonner notre belle ville
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Raphaël N.', role: 'Fondateur & CEO', emoji: '👨‍💼' },
              { name: 'Marie L.', role: 'Responsable Marketing', emoji: '👩‍💼' },
              { name: 'Thomas B.', role: 'Développeur Principal', emoji: '👨‍💻' },
            ].map((member) => (
              <div key={member.name} className="bg-white rounded-xl p-8 text-center shadow-lg">
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Rejoignez l'aventure Guide de Lyon
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Que vous soyez une entreprise ou un particulier, découvrez comment nous pouvons vous aider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/pro/signup"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Créer un compte gratuit
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}