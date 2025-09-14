'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TableauDeBordPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('currentUser')
    if (!userData) {
      router.push('/connexion')
    } else {
      setUser(JSON.parse(userData))
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
            <h1 className="text-2xl font-bold text-gray-900">
              {user.role === 'admin' ? '🛡️ Dashboard Admin' : '🏢 Dashboard Pro'}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {user.name} ({user.email})
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Bienvenue {user.name} !
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {user.role === 'admin' ? (
              <>
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="font-bold text-red-900 mb-2">Utilisateurs</h3>
                  <p className="text-3xl font-bold text-red-600">847</p>
                  <p className="text-sm text-red-700">+12% ce mois</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-2">Événements</h3>
                  <p className="text-3xl font-bold text-blue-600">234</p>
                  <p className="text-sm text-blue-700">15 en attente</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-bold text-green-900 mb-2">Revenus</h3>
                  <p className="text-3xl font-bold text-green-600">3450€</p>
                  <p className="text-sm text-green-700">+15% ce mois</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-2">Mes événements</h3>
                  <p className="text-3xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-blue-700">3 actifs</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-bold text-green-900 mb-2">Vues ce mois</h3>
                  <p className="text-3xl font-bold text-green-600">1,234</p>
                  <p className="text-sm text-green-700">+24% vs mois dernier</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-bold text-purple-900 mb-2">Avis clients</h3>
                  <p className="text-3xl font-bold text-purple-600">4.8⭐</p>
                  <p className="text-sm text-purple-700">45 avis</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800">
              ✅ <strong>Connexion réussie !</strong> Vous êtes connecté en tant que {user.role}.
              Cette page fonctionne sans Firebase, uniquement avec localStorage.
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">Actions rapides:</h3>
            <div className="flex gap-3 flex-wrap">
              {user.role === 'admin' ? (
                <>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Gérer utilisateurs
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Modérer événements
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Voir statistiques
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Créer événement
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Modifier profil
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                    Voir analytics
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}