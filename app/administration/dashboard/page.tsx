'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, Users, Calendar, Building2, TrendingUp, 
  Settings, LogOut, Eye, CheckCircle, XCircle, Clock 
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  useEffect(() => {
    // Rediriger si pas admin
    if (!user) {
      router.push('/admin/login')
    }
  }, [user])

  const handleLogout = async () => {
    await signOut()
    router.push('/admin/login')
  }

  const stats = {
    totalUsers: 847,
    totalMerchants: 156,
    pendingEvents: 12,
    activeEvents: 234,
    monthlyRevenue: 3450,
    growthRate: 15.3
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-500 mr-3" />
              <span className="text-xl font-bold">Administration</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12 items-center">
            <Link href="/admin/dashboard" className="text-white font-medium">
              Dashboard
            </Link>
            <Link href="/admin/events" className="text-gray-300 hover:text-white">
              Événements
            </Link>
            <Link href="/admin/users" className="text-gray-300 hover:text-white">
              Utilisateurs
            </Link>
            <Link href="/admin/merchants" className="text-gray-300 hover:text-white">
              Merchants
            </Link>
            <Link href="/admin/settings" className="text-gray-300 hover:text-white">
              Paramètres
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500" />
            </div>
            <p className="text-sm text-green-600 mt-2">+12% ce mois</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Merchants</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMerchants}</p>
              </div>
              <Building2 className="h-12 w-12 text-purple-500" />
            </div>
            <p className="text-sm text-green-600 mt-2">+8% ce mois</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Événements actifs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeEvents}</p>
              </div>
              <Calendar className="h-12 w-12 text-green-500" />
            </div>
            <p className="text-sm text-orange-600 mt-2">{stats.pendingEvents} en attente</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus (mois)</p>
                <p className="text-3xl font-bold text-gray-900">{stats.monthlyRevenue}€</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-500" />
            </div>
            <p className="text-sm text-green-600 mt-2">+{stats.growthRate}%</p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Événements en attente
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Festival Événement {i}</p>
                    <p className="text-sm text-gray-600">Restaurant Paul Bocuse</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-green-600 hover:bg-green-100 rounded">
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-100 rounded">
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Link 
              href="/admin/events" 
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tous les événements →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Nouveaux merchants
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Restaurant {i}</p>
                    <p className="text-sm text-gray-600">Plan Pro Visibilité</p>
                  </div>
                  <button className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <Link 
              href="/admin/merchants" 
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              Gérer les merchants →
            </Link>
          </div>
        </div>

        {/* Activit� r�cente */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h2>
          <div className="space-y-3">
            {[
              { action: 'Nouvel événement créé', user: 'Restaurant Bocuse', time: 'Il y a 5 min', icon: Calendar },
              { action: 'Nouveau merchant inscrit', user: 'Bouchon Lyonnais', time: 'Il y a 15 min', icon: Building2 },
              { action: 'Événement approuvé', user: 'Admin', time: 'Il y a 1 heure', icon: CheckCircle },
              { action: 'Paiement reçu', user: 'Restaurant Test', time: 'Il y a 2 heures', icon: TrendingUp }
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <activity.icon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}