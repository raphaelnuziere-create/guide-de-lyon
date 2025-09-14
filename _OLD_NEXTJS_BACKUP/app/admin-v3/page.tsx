'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building, 
  Calendar,
  TrendingUp,
  DollarSign,
  Eye,
  Star,
  Crown,
  Shield,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  businesses: {
    total: number;
    by_plan: {
      basic: number;
      pro: number;
      expert: number;
    };
    recent: any[];
  };
  events: {
    total: number;
    this_month: number;
    by_visibility: {
      homepage: number;
      newsletter: number;
      social: number;
    };
  };
  revenue: {
    monthly: number;
    yearly: number;
    growth: number;
  };
}

export default function AdminV3Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Simulation des stats - remplacer par vraie API Directus
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStats: DashboardStats = {
        businesses: {
          total: 247,
          by_plan: {
            basic: 180,
            pro: 52,
            expert: 15
          },
          recent: [
            { name: 'Restaurant Le Gourmet', plan: 'pro', date: '2025-09-14' },
            { name: 'Spa Luxe Lyon', plan: 'expert', date: '2025-09-13' },
            { name: 'Café Central', plan: 'basic', date: '2025-09-13' }
          ]
        },
        events: {
          total: 143,
          this_month: 28,
          by_visibility: {
            homepage: 67,
            newsletter: 45,
            social: 15
          }
        },
        revenue: {
          monthly: 1847,
          yearly: 22164,
          growth: 23.5
        }
      };
      
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur de chargement</p>
          <Button onClick={fetchStats}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const totalRevenue = stats.revenue.monthly;
  const avgRevenuePerBusiness = totalRevenue / (stats.businesses.by_plan.pro + stats.businesses.by_plan.expert);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin v3</h1>
              <p className="text-gray-600">Guide de Lyon - Directus Edition</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="expert">Powered by Directus</Badge>
              <Button onClick={fetchStats} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Établissements</p>
                <p className="text-3xl font-bold text-gray-900">{stats.businesses.total}</p>
                <p className="text-sm text-green-600">+12 ce mois</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Événements</p>
                <p className="text-3xl font-bold text-gray-900">{stats.events.this_month}</p>
                <p className="text-sm text-blue-600">Ce mois-ci</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus mensuels</p>
                <p className="text-3xl font-bold text-gray-900">{totalRevenue}€</p>
                <p className="text-sm text-green-600">+{stats.revenue.growth}%</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenu/Entreprise</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(avgRevenuePerBusiness)}€</p>
                <p className="text-sm text-gray-600">ARPu moyen</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Répartition des plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des plans</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="font-medium text-gray-700">Basic (0€)</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{stats.businesses.by_plan.basic}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({Math.round((stats.businesses.by_plan.basic / stats.businesses.total) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-700">Pro (19€/mois)</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-700">{stats.businesses.by_plan.pro}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({Math.round((stats.businesses.by_plan.pro / stats.businesses.total) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-700">Expert (49€/mois)</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-yellow-700">{stats.businesses.by_plan.expert}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({Math.round((stats.businesses.by_plan.expert / stats.businesses.total) * 100)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Revenus Pro :</strong> {stats.businesses.by_plan.pro * 19}€/mois • 
                <strong> Expert :</strong> {stats.businesses.by_plan.expert * 49}€/mois
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Visibilité des événements</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Homepage</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{stats.events.by_visibility.homepage}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Newsletter</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.events.by_visibility.newsletter}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Star className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Réseaux sociaux</span>
                </div>
                <span className="text-lg font-bold text-purple-600">{stats.events.by_visibility.social}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Établissements récents */}
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveaux établissements</h3>
          <div className="space-y-3">
            {stats.businesses.recent.map((business, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    business.plan === 'expert' ? 'bg-yellow-500' :
                    business.plan === 'pro' ? 'bg-blue-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium">{business.name}</span>
                  <Badge variant={
                    business.plan === 'expert' ? 'expert' :
                    business.plan === 'pro' ? 'verified' : 'basic'
                  } />
                </div>
                <span className="text-sm text-gray-500">{business.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer admin */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            <strong>Guide Lyon v3</strong> • Directus Cloud • 
            Admin: {process.env.DIRECTUS_ADMIN_EMAIL || 'admin@guide-lyon.fr'} •
            Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  );
}