'use client';

import Link from 'next/link';
import { 
  UserPlus, 
  LogIn, 
  Building2, 
  CheckCircle,
  ArrowRight,
  Store,
  Users,
  Star
} from 'lucide-react';

export default function ProAuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Building2 className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Espace Professionnel
          </h1>
          <p className="text-lg text-gray-600">
            Guide de Lyon - Plateforme dédiée aux professionnels
          </p>
        </div>

        {/* Deux cartes côte à côte */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Carte Nouveau Professionnel */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-red-200 transition">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                <UserPlus className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center mb-4">
              Nouveau sur Guide de Lyon ?
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Créez votre compte professionnel</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Référencez votre établissement</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Profitez d\'une visibilité gratuite</span>
              </div>
            </div>

            <Link
              href="/auth/pro/inscription"
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 font-medium"
            >
              Créer mon compte
              <ArrowRight className="h-5 w-5" />
            </Link>

            <p className="text-xs text-gray-500 text-center mt-4">
              Étape 1 : Création du compte professionnel
            </p>
          </div>

          {/* Carte Déjà Client */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-transparent hover:border-blue-200 transition">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <LogIn className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-center mb-4">
              Déjà inscrit ?
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Store className="h-5 w-5 text-blue-500 mt-0.5" />
                <span className="text-sm text-gray-600">Gérez votre établissement</span>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                <span className="text-sm text-gray-600">Suivez vos statistiques</span>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-blue-500 mt-0.5" />
                <span className="text-sm text-gray-600">Développez votre activité</span>
              </div>
            </div>

            <Link
              href="/auth/pro/connexion"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
            >
              Se connecter
              <ArrowRight className="h-5 w-5" />
            </Link>

            <p className="text-xs text-gray-500 text-center mt-4">
              Accédez à votre tableau de bord
            </p>
          </div>
        </div>

        {/* Info supplémentaire */}
        <div className="mt-8 bg-white/50 backdrop-blur rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2 text-center">
            Processus d\'inscription en 2 étapes
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 text-red-600 font-bold rounded-full h-8 w-8 flex items-center justify-center">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Créez votre compte</p>
                <p className="text-sm text-gray-600">Email et mot de passe</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-red-100 text-red-600 font-bold rounded-full h-8 w-8 flex items-center justify-center">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Créez votre établissement</p>
                <p className="text-sm text-gray-600">Informations et forfait</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Besoin d\'aide ? Contactez-nous à{' '}
          <a href="mailto:pro@guide-de-lyon.fr" className="text-red-600 hover:underline">
            pro@guide-de-lyon.fr
          </a>
        </p>
      </div>
    </div>
  );
}