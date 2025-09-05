'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getMyEstablishment, 
  getEventQuotaStatus,
  getEstablishmentStats 
} from '@/app/lib/supabase/subscription-client';
import { getPlanBadgeStyles, PLAN_FEATURES } from '@/app/lib/types/subscription';
import type { Establishment, Subscription, SubscriptionPlan } from '@/app/lib/types/subscription';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  PhotoIcon,
  CogIcon,
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function DashboardPro() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [establishment, setEstablishment] = useState<any>(null);
  const [eventQuota, setEventQuota] = useState({ used: 0, limit: 0, remaining: 0 });
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getMyEstablishment();
      if (!data) {
        router.push('/pro/inscription');
        return;
      }
      
      setEstablishment(data);
      
      // Charger les quotas d'événements
      const quota = await getEventQuotaStatus(data.id);
      setEventQuota(quota);
      
      // Charger les stats si le plan le permet
      if (data.subscription?.plan?.has_statistics) {
        const statsData = await getEstablishmentStats(
          data.id, 
          data.subscription.plan.statistics_days
        );
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!establishment) return null;

  const plan = establishment.subscription?.plan;
  const planSlug = plan?.slug || 'basic';
  const badgeStyles = getPlanBadgeStyles(plan?.badge_type);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec statut du plan */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">{establishment.name}</h1>
              {plan?.badge_type && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeStyles.bgColor}`}>
                  {badgeStyles.icon} {badgeStyles.text}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Plan actuel</p>
                <p className="font-semibold">{plan?.name || 'Basic'}</p>
              </div>
              
              {planSlug !== 'expert' && (
                <button
                  onClick={() => router.push('/pro/upgrade')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90"
                >
                  Améliorer mon plan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: ChartBarIcon },
              { id: 'establishment', label: 'Mon établissement', icon: BuildingOfficeIcon },
              { id: 'events', label: 'Événements', icon: CalendarIcon },
              { id: 'media', label: 'Photos/Vidéos', icon: PhotoIcon },
              plan?.has_statistics && { id: 'stats', label: 'Statistiques', icon: ChartBarIcon },
              { id: 'settings', label: 'Paramètres', icon: CogIcon },
              { id: 'billing', label: 'Facturation', icon: CreditCardIcon }
            ].filter(Boolean).map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quota événements */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold">{eventQuota.remaining}</span>
              </div>
              <h3 className="font-semibold mb-1">Événements restants</h3>
              <p className="text-sm text-gray-600">
                {eventQuota.used} / {eventQuota.limit} utilisés ce mois
              </p>
              <div className="mt-4 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(eventQuota.used / eventQuota.limit) * 100}%` }}
                />
              </div>
            </div>

            {/* Photos */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <PhotoIcon className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold">
                  {establishment.media?.filter((m: any) => m.type === 'gallery').length || 0}
                </span>
              </div>
              <h3 className="font-semibold mb-1">Photos en ligne</h3>
              <p className="text-sm text-gray-600">
                Maximum: {plan?.max_photos === -1 ? 'Illimité' : plan?.max_photos}
              </p>
            </div>

            {/* Statistiques (si disponible) */}
            {plan?.has_statistics && stats && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <EyeIcon className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold">
                    {stats.reduce((sum: number, day: any) => sum + day.profile_views, 0)}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">Vues ce mois</h3>
                <p className="text-sm text-gray-600">
                  Derniers {plan.statistics_days} jours
                </p>
              </div>
            )}

            {/* Statut de l'établissement */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Statut</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Établissement</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    establishment.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {establishment.status === 'active' ? 'Actif' : 'En attente'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Abonnement</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    establishment.subscription?.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : establishment.subscription?.status === 'trialing'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {establishment.subscription?.status === 'trialing' ? 'Essai gratuit' : establishment.subscription?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Limitations du plan */}
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h3 className="font-semibold mb-4">Fonctionnalités de votre plan {plan?.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CheckBadgeIcon className={`w-5 h-5 ${plan?.has_carousel ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={plan?.has_carousel ? '' : 'text-gray-400'}>Carrousel photos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckBadgeIcon className={`w-5 h-5 ${plan?.has_video ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={plan?.has_video ? '' : 'text-gray-400'}>Vidéo de présentation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckBadgeIcon className={`w-5 h-5 ${plan?.events_on_homepage ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={plan?.events_on_homepage ? '' : 'text-gray-400'}>Événements homepage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckBadgeIcon className={`w-5 h-5 ${plan?.events_in_newsletter ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={plan?.events_in_newsletter ? '' : 'text-gray-400'}>Newsletter</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckBadgeIcon className={`w-5 h-5 ${plan?.events_on_social ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={plan?.events_on_social ? '' : 'text-gray-400'}>Réseaux sociaux</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckBadgeIcon className={`w-5 h-5 ${plan?.has_pdf_menu ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={plan?.has_pdf_menu ? '' : 'text-gray-400'}>Menu PDF</span>
                </div>
              </div>
              
              {planSlug !== 'expert' && (
                <button
                  onClick={() => router.push('/pro/upgrade')}
                  className="mt-4 text-blue-600 text-sm font-medium hover:underline"
                >
                  Débloquer plus de fonctionnalités →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Section Établissement */}
        {activeTab === 'establishment' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Informations de l'établissement</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <p className="text-lg">{establishment.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <p className="text-lg">{establishment.category || 'Non définie'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-lg">{establishment.email || 'Non renseigné'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <p className="text-lg">{establishment.phone || 'Non renseigné'}</p>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-700">
                  {establishment.description || 'Aucune description'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {establishment.description?.length || 0} / {plan?.max_description_length} caractères
                </p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/pro/etablissement/edit')}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Modifier les informations
            </button>
          </div>
        )}

        {/* Section Événements */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Mes événements</h2>
                <button
                  onClick={() => router.push('/pro/evenements/nouveau')}
                  disabled={eventQuota.remaining === 0}
                  className={`px-4 py-2 rounded-lg ${
                    eventQuota.remaining > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Créer un événement ({eventQuota.remaining} restant{eventQuota.remaining > 1 ? 's' : ''})
                </button>
              </div>
              
              {eventQuota.remaining === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    Vous avez atteint votre limite d'événements pour ce mois.
                    {planSlug !== 'expert' && (
                      <button
                        onClick={() => router.push('/pro/upgrade')}
                        className="ml-2 text-yellow-900 font-medium underline"
                      >
                        Passer au plan supérieur
                      </button>
                    )}
                  </p>
                </div>
              )}
              
              <p className="text-gray-600">
                Gestion des événements à venir...
              </p>
            </div>
          </div>
        )}

        {/* Section Médias */}
        {activeTab === 'media' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Photos et vidéos</h2>
            <p className="text-gray-600">
              Gestion des médias à venir...
            </p>
          </div>
        )}

        {/* Section Statistiques */}
        {activeTab === 'stats' && plan?.has_statistics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Statistiques détaillées</h2>
            {stats ? (
              <div className="space-y-4">
                <p className="text-gray-600">Graphiques et analyses à venir...</p>
              </div>
            ) : (
              <p className="text-gray-600">Aucune donnée disponible</p>
            )}
          </div>
        )}

        {/* Section Paramètres */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Paramètres</h2>
            <p className="text-gray-600">
              Configuration à venir...
            </p>
          </div>
        )}

        {/* Section Facturation */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Facturation</h2>
            <p className="text-gray-600">
              Gestion de l'abonnement à venir...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}