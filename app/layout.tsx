import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { Home, MapPin, Calendar, Menu } from 'lucide-react'
import { AuthProvider } from '@/lib/auth/AuthContext'

export const metadata: Metadata = {
  title: 'Guide de Lyon - Annuaire des entreprises et événements',
  description: 'Découvrez les meilleures entreprises de Lyon et ne manquez aucun événement local',
  keywords: 'Lyon, annuaire, entreprises, restaurants, événements, agenda, commerces',
  openGraph: {
    title: 'Guide de Lyon',
    description: 'L\'annuaire complet des entreprises et événements lyonnais',
    url: 'https://www.guide-de-lyon.fr',
    siteName: 'Guide de Lyon',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  GL
                </div>
                <span className="font-bold text-xl text-gray-900">Guide de Lyon</span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="flex items-center text-gray-700 hover:text-blue-600 transition">
                  <Home className="w-4 h-4 mr-1" />
                  Accueil
                </Link>
                <Link href="/annuaire" className="flex items-center text-gray-700 hover:text-blue-600 transition">
                  <MapPin className="w-4 h-4 mr-1" />
                  Annuaire
                </Link>
                <Link href="/evenements" className="flex items-center text-gray-700 hover:text-blue-600 transition">
                  <Calendar className="w-4 h-4 mr-1" />
                  Événements
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition">
                  Contact
                </Link>
                <div className="flex items-center space-x-2">
                  <Link
                    href="/connexion/pro"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/inscription"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Inscription Pro
                  </Link>
                </div>
              </div>
              
              <button className="md:hidden p-2">
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* About */}
              <div>
                <h3 className="font-bold text-lg mb-4">À propos</h3>
                <p className="text-gray-400 text-sm">
                  Guide de Lyon est l&apos;annuaire de référence pour découvrir les entreprises et événements lyonnais.
                </p>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="font-bold text-lg mb-4">Liens rapides</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/annuaire" className="hover:text-white transition">Annuaire</Link></li>
                  <li><Link href="/evenements" className="hover:text-white transition">Événements</Link></li>
                  <li><Link href="/inscription" className="hover:text-white transition">Inscription Pro</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                </ul>
              </div>
              
              {/* Categories */}
              <div>
                <h3 className="font-bold text-lg mb-4">Catégories</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li><Link href="/annuaire?categorie=restaurants" className="hover:text-white transition">Restaurants</Link></li>
                  <li><Link href="/annuaire?categorie=shopping" className="hover:text-white transition">Shopping</Link></li>
                  <li><Link href="/annuaire?categorie=culture" className="hover:text-white transition">Culture</Link></li>
                  <li><Link href="/annuaire?categorie=services" className="hover:text-white transition">Services</Link></li>
                </ul>
              </div>
              
              {/* Contact */}
              <div>
                <h3 className="font-bold text-lg mb-4">Contact</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>contact@guide-de-lyon.fr</li>
                  <li>04 78 00 00 00</li>
                  <li>Lyon, France</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2024 Guide de Lyon. Tous droits réservés.</p>
              <div className="mt-2 space-x-4">
                <Link href="/mentions-legales" className="hover:text-white transition">Mentions légales</Link>
                <Link href="/politique-confidentialite" className="hover:text-white transition">Politique de confidentialité</Link>
                <Link href="/cgv" className="hover:text-white transition">CGV</Link>
              </div>
            </div>
          </div>
        </footer>
        </AuthProvider>
      </body>
    </html>
  )
}