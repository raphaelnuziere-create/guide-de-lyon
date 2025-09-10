'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { 
  Users, Calendar, Building2, TrendingUp, 
  RefreshCw, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { AdminStatsService, AdminStats } from '@/lib/services/adminStatsService'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadStats = async () => {
    try {
      const data = await AdminStatsService.getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error('Erreur chargement stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-100">
      {/* Navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12 items-center">
            <Link href="/administration/dashboard" className="text-white font-medium">
              Dashboard
            </Link>
            <Link href="/administration/events" className="text-gray-300 hover:text-white">
              Événements
            </Link>
            <Link href="/administration/newsletters" className="text-gray-300 hover:text-white">
              Newsletters
            </Link>
            <Link href="/administration/emails" className="text-gray-300 hover:text-white">
              Emails
            </Link>
            <Link href="/administration/scraping" className="text-gray-300 hover:text-white">
              Scraping
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Administration</h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble Guide de Lyon</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">Chargement...</span>
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {AdminStatsService.formatNumber(stats.totalUsers)}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-blue-500" />
                </div>
                <div className="flex items-center mt-2">
                  {stats.usersGrowth >= 0 ? <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" /> : <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />}
                  <span className={`text-sm ${AdminStatsService.formatGrowth(stats.usersGrowth).color}`}>
                    {AdminStatsService.formatGrowth(stats.usersGrowth).formatted}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Établissements</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {AdminStatsService.formatNumber(stats.totalEstablishments)}
                    </p>
                  </div>
                  <Building2 className="h-12 w-12 text-purple-500" />
                </div>
                <div className="flex items-center mt-2">
                  {stats.establishmentsGrowth >= 0 ? <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" /> : <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />}
                  <span className={`text-sm ${AdminStatsService.formatGrowth(stats.establishmentsGrowth).color}`}>
                    {AdminStatsService.formatGrowth(stats.establishmentsGrowth).formatted}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Événements</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {AdminStatsService.formatNumber(stats.totalEvents)}
                    </p>
                  </div>
                  <Calendar className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-sm text-orange-600 mt-2">{stats.pendingEvents} en attente</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenus estimés</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {AdminStatsService.formatCurrency(stats.estimatedMonthlyRevenue)}
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 mt-2">{stats.conversionRate}% conversion</p>
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des plans</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.planDistribution.basic}</p>
                  <p className="text-sm text-gray-600">Gratuit</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.planDistribution.pro}</p>
                  <p className="text-sm text-blue-600">Pro</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.planDistribution.expert}</p>
                  <p className="text-sm text-purple-600">Expert</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Erreur de chargement des statistiques</p>
            <button onClick={loadStats} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
              Réessayer
            </button>
          </div>
        )}

      </main>
    </div>
  )
}