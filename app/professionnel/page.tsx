'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, Calendar, Eye, Star, Plus, TrendingUp, 
  Users, Clock, ArrowRight, Bell, Settings, LogOut,
  Home, MapPin, ChevronRight, Menu, X
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface MerchantStats {
  placesCount: number
  eventsCount: number
  totalViews: number
  averageRating: number
  eventsThisMonth: number
  maxEvents: number
}

export default function MerchantDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [merchant, setMerchant] = useState<any>(null)
  const [stats, setStats] = useState<MerchantStats>({
    placesCount: 0,
    eventsCount: 0,
    totalViews: 0,
    averageRating: 0,
    eventsThisMonth: 0,
    maxEvents: 0
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/connexion/pro')
        return
      }

      // Charger le profil merchant
      const { data: merchantData } = await supabase
        .from('merchants')
        .select('*')
        .eq('email', user.email)
        .single()

      if (!merchantData) {
        router.push('/inscription')
        return
      }

      setMerchant(merchantData)
      
      // Simuler des stats
      setStats({
        placesCount: 1,
        eventsCount: 3,
        totalViews: 245,
        averageRating: 4.5,
        eventsThisMonth: 2,
        maxEvents: merchantData.plan === 'free' ? 0 : merchantData.plan === 'pro_events' ? 2 : 5
      })
      
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      router.push('/connexion/pro')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/connexion/pro')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: { label: 'Gratuit', color: 'bg-gray-100 text-gray-700' },
      pro_events: { label: 'Pro Events', color: 'bg-blue-100 text-blue-700' },
      pro_boost: { label: 'Pro Boost', color: 'bg-purple-100 text-purple-700' }
    }
    return badges[plan as keyof typeof badges] || badges.free
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Guide de Lyon</h1>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              <Link href="/pro" className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <Home className="mr-3 h-5 w-5" />
                Tableau de bord
              </Link>
              <Link href="/pro/places" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <Building2 className="mr-3 h-5 w-5" />
                Établissements
              </Link>
              <Link href="/pro/events" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <Calendar className="mr-3 h-5 w-5" />
                Événements
              </Link>
              <Link href="/pro/billing" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                <Settings className="mr-3 h-5 w-5" />
                Facturation
              </Link>
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t p-4">
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Guide de Lyon Pro</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="bg-white border-b">
            <nav className="space-y-1 px-2 py-3">
              <Link href="/pro" className="bg-blue-50 text-blue-700 block px-3 py-2 rounded-md text-base font-medium">
                Tableau de bord
              </Link>
              <Link href="/pro/places" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                Établissements
              </Link>
              <Link href="/pro/events" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                Événements
              </Link>
              <Link href="/pro/billing" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                Facturation
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Déconnexion
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {/* Header */}
          <div className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Bonjour, {merchant?.company_name || 'Entrepreneur'}
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Voici un aperçu de votre activité
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlanBadge(merchant?.plan || 'free').color}`}>
                    {getPlanBadge(merchant?.plan || 'free').label}
                  </span>
                  {merchant?.plan === 'free' && (
                    <Link
                      href="/pro/billing"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Passer Pro
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Établissements */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Établissements
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.placesCount}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <Link href="/pro/places" className="text-sm text-blue-600 hover:text-blue-900 flex items-center">
                    Gérer
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Événements */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Événements ce mois
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.eventsThisMonth}/{stats.maxEvents}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <Link href="/pro/events" className="text-sm text-blue-600 hover:text-blue-900 flex items-center">
                    Créer un événement
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Vues */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Eye className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Vues totales
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.totalViews}
                          </div>
                          <span className="ml-2 text-sm font-medium text-green-600">
                            +12%
                          </span>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note moyenne */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Star className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Note moyenne
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.averageRating}
                          </div>
                          <span className="ml-1 text-sm text-gray-500">/5</span>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quota Usage */}
            {merchant?.plan !== 'free' && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Utilisation des quotas</h2>
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Événements</span>
                        <span className="text-sm text-gray-500">{stats.eventsThisMonth} / {stats.maxEvents}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(stats.eventsThisMonth / stats.maxEvents) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions rapides */}
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  href="/pro/places/new"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                >
                  <div className="flex-shrink-0">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">Ajouter un établissement</p>
                    <p className="text-sm text-gray-500">Créez votre fiche établissement</p>
                  </div>
                </Link>

                {merchant?.plan !== 'free' && (
                  <Link
                    href="/pro/events/new"
                    className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                  >
                    <div className="flex-shrink-0">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">Créer un événement</p>
                      <p className="text-sm text-gray-500">Annoncez vos événements</p>
                    </div>
                  </Link>
                )}

                <Link
                  href="/pro/analytics"
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
                >
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">Voir les statistiques</p>
                    <p className="text-sm text-gray-500">Analysez vos performances</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}