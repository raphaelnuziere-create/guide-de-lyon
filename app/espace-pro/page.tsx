'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EspaceProPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const userData = localStorage.getItem('currentUser')
    if (!userData) {
      router.push('/connexion')
    } else {
      const parsedUser = JSON.parse(userData)
      // Vérifier que c'est bien un compte pro/merchant
      if (parsedUser.role !== 'merchant') {
        router.push('/tableau-de-bord')
      } else {
        setUser(parsedUser)
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    router.push('/connexion')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                🏢 Espace Pro
              </h1>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {user.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Mes événements
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Mon établissement
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Success message */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 flex items-center">
            <span className="text-2xl mr-2">✅</span>
            <strong>Authentification réussie !</strong> Vous êtes connecté à votre espace professionnel sans Firebase.
          </p>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Vues ce mois</p>
                    <p className="text-2xl font-bold">1,234</p>
                    <p className="text-sm text-green-600">+12% vs mois dernier</p>
                  </div>
                  <span className="text-3xl">👁️</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Événements actifs</p>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-gray-500">Sur 12 publiés</p>
                  </div>
                  <span className="text-3xl">📅</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avis clients</p>
                    <p className="text-2xl font-bold">4.8⭐</p>
                    <p className="text-sm text-gray-500">45 avis</p>
                  </div>
                  <span className="text-3xl">⭐</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taux d'engagement</p>
                    <p className="text-2xl font-bold">24%</p>
                    <p className="text-sm text-green-600">+3% ce mois</p>
                  </div>
                  <span className="text-3xl">📊</span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50">
                  <span className="text-2xl">➕</span>
                  <p className="mt-2 font-medium">Créer un événement</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50">
                  <span className="text-2xl">📝</span>
                  <p className="mt-2 font-medium">Modifier mon profil</p>
                </button>
                <Link 
                  href="/professionnel/upgrade"
                  className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50"
                >
                  <span className="text-2xl">🚀</span>
                  <p className="mt-2 font-medium">Passer Pro</p>
                </Link>
              </div>
            </div>

            {/* Événements récents */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Événements récents</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🍷</span>
                    <div>
                      <h3 className="font-medium">Soirée dégustation de vins</h3>
                      <p className="text-sm text-gray-600">25 janvier 2025 • 19h00</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Actif</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <h3 className="font-medium">Concert jazz live</h3>
                      <p className="text-sm text-gray-600">30 janvier 2025 • 20h30</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Actif</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">🥘</span>
                    <div>
                      <h3 className="font-medium">Menu spécial Saint-Valentin</h3>
                      <p className="text-sm text-gray-600">14 février 2025 • Toute la journée</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">Programmé</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Mes événements</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                ➕ Créer un événement
              </button>
            </div>
            <p className="text-gray-600">Liste de vos événements passés et à venir...</p>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Statistiques détaillées</h2>
            <p className="text-gray-600">Analyse approfondie de vos performances...</p>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Mon établissement</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input 
                  type="text" 
                  value={user.name}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  value={user.email}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Plan actuel</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded">Plan Gratuit</span>
                  <Link href="/professionnel/upgrade" className="text-blue-600 hover:underline">
                    Passer Pro →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}