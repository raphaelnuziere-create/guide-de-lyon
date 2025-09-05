'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Settings, 
  LogOut,
  Plus,
  Package,
  CreditCard,
  Users,
  Eye,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { firebaseDb } from '@/lib/firebase-client'
import { doc, getDoc } from 'firebase/firestore'
import { QuotaDisplay } from '@/components/quotas/quota-display'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [merchant, setMerchant] = useState<any>(null)
  const [stats, setStats] = useState({
    places: 0,
    events: 0,
    totalViews: 0,
    monthlyViews: 0
  })

  const { user, signOut } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/connexion/pro')
      return
    }
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    try {
      if (!user) return

      // Charger les infos du merchant depuis Firebase
      const merchantDoc = await getDoc(doc(firebaseDb, 'merchant_settings', user.uid))
      const merchantData = merchantDoc.data()
      
      setMerchant({
        id: user.uid,
        email: user.email,
        company_name: merchantData?.companyName || user.displayName,
        plan: user.plan || 'free',
        ...merchantData
      })

      // Charger les stats (simulées pour l'instant)
      setStats({
        places: 0,
        events: 0,
        totalViews: 0,
        monthlyViews: 0
      })
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: { label: 'Gratuit', color: 'bg-gray-100 text-gray-600' },
      pro_events: { label: 'Pro Events', color: 'bg-blue-100 text-blue-600' },
      pro_boost: { label: 'Pro Boost', color: 'bg-purple-100 text-purple-600' }
    }
    const badge = badges[plan as keyof typeof badges] || badges.free
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/pro/dashboard" className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Guide de Lyon Pro</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/pro/settings"
                className="text-gray-500 hover:text-gray-700"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenue, {merchant?.company_name || 'Professionnel'}
              </h1>
              <p className="text-gray-600 mt-1">
                Gérez votre présence sur le Guide de Lyon
              </p>
            </div>
            <div className="text-right">
              {getPlanBadge(merchant?.plan || 'free')}
              {merchant?.plan === 'free' && (
                <Link
                  href="/pro/upgrade"
                  className="ml-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Passer Pro
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Établissements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.places}</p>
              </div>
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Événements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.events}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vues totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold text-gray-900">+{stats.monthlyViews}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <Link
                href="/pro/places/new"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Ajouter un établissement
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              
              <Link
                href="/pro/events/new"
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    Créer un événement
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Plan & Quotas */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mon forfait</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Événements ce mois</span>
                  <span className="text-sm font-medium text-gray-900">
                    0 / {merchant?.plan === 'pro_boost' ? 'Illimité' : merchant?.plan === 'pro_events' ? '10' : '1'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              
              {merchant?.plan !== 'pro_boost' && (
                <Link
                  href="/pro/upgrade"
                  className="inline-flex items-center justify-center w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Augmenter mes quotas
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation rapide */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestion</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/pro/places"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Mes établissements</span>
            </Link>
            
            <Link
              href="/pro/events"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Calendar className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Mes événements</span>
            </Link>
            
            <Link
              href="/pro/analytics"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Statistiques</span>
            </Link>
            
            <Link
              href="/pro/billing"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Facturation</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}