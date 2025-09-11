import Link from 'next/link'
import { Building2, Search, ArrowLeft, MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Building2 className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Établissement non trouvé
          </h1>
          <p className="text-gray-600 mb-8">
            Désolé, cet établissement n&apos;existe pas ou n&apos;est plus disponible dans notre annuaire.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/annuaire"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Search className="h-4 w-4 mr-2" />
            Découvrir nos établissements
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l&apos;accueil
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Vous êtes propriétaire ?</h3>
          <p className="text-blue-700 text-sm mb-3">
            Ajoutez votre établissement à notre annuaire gratuitement
          </p>
          <Link
            href="/auth/pro/signup"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            <MapPin className="h-4 w-4 mr-1" />
            Inscription professionnelle
          </Link>
        </div>
      </div>
    </div>
  )
}