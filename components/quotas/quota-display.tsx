'use client'

import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Sparkles,
  MapPin,
  Calendar,
  HardDrive,
  Zap
} from 'lucide-react'
import { quotaManager, QuotaUsage, PlanLimits, PlanType } from '@/lib/quotas/quota-manager'
import Link from 'next/link'

interface QuotaDisplayProps {
  merchantId: string;
  plan: PlanType;
  onUpgrade?: () => void;
}

export function QuotaDisplay({ merchantId, plan, onUpgrade }: QuotaDisplayProps) {
  const [usage, setUsage] = useState<QuotaUsage | null>(null);
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [percentages, setPercentages] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradesuggestion, setUpgradeSuggestion] = useState<any>(null);

  useEffect(() => {
    loadQuotaData();
  }, [merchantId, plan]);

  const loadQuotaData = async () => {
    try {
      const stats = await quotaManager.getUsageStats(merchantId, plan);
      setUsage(stats.usage);
      setLimits(stats.limits);
      setPercentages(stats.percentages);
      
      // Vérifier si un upgrade est suggéré
      const suggestion = quotaManager.suggestUpgrade(stats.usage, plan);
      setUpgradeSuggestion(suggestion);
    } catch (error) {
      console.error('Error loading quota data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50';
    if (percentage >= 75) return 'text-orange-600 bg-orange-50';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-orange-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Illimité' : limit.toString();
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!usage || !limits) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Alerte de suggestion d'upgrade */}
      {upgradesuggestion?.shouldUpgrade && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {upgradesuggestion.reason}
              </p>
              <div className="mt-3">
                <button
                  onClick={onUpgrade}
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  Passer au plan {upgradesuggestion.suggestedPlan === 'pro_events' ? 'Pro Events' : 'Pro Boost'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cartes de quotas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Établissements */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-600">Établissements</span>
            </div>
            {limits.maxPlaces === -1 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(percentages.places)}`}>
                {Math.round(percentages.places)}%
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                {usage.placesUsed}
              </span>
              <span className="text-sm text-gray-500">
                / {formatLimit(limits.maxPlaces)}
              </span>
            </div>
            
            {limits.maxPlaces !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressBarColor(percentages.places)}`}
                  style={{ width: `${Math.min(percentages.places, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Événements */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-600">Événements</span>
            </div>
            {limits.maxEvents === -1 ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(percentages.events)}`}>
                {Math.round(percentages.events)}%
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                {usage.eventsUsed}
              </span>
              <span className="text-sm text-gray-500">
                / {formatLimit(limits.maxEvents)} ce mois
              </span>
            </div>
            
            {limits.maxEvents !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getProgressBarColor(percentages.events)}`}
                  style={{ width: `${Math.min(percentages.events, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Stockage */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <HardDrive className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-600">Stockage</span>
            </div>
            <span className="text-xs text-gray-500">
              {limits.maxPhotosPerPlace} photos/lieu
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                {usage.storageUsed}
              </span>
              <span className="text-sm text-gray-500">MB</span>
            </div>
            
            <div className="text-xs text-gray-500">
              {plan === 'free' ? '100 MB max' : plan === 'pro_visibility' ? '500 MB max' : 'Illimité'}
            </div>
          </div>
        </div>

        {/* API */}
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-600">API</span>
            </div>
            {limits.apiAccess ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                {limits.apiAccess ? usage.apiCallsUsed : '—'}
              </span>
              <span className="text-sm text-gray-500">
                {limits.apiAccess ? (plan === 'pro_visibility' ? '/ 1000' : 'Illimité') : 'Non disponible'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fonctionnalités du plan */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Fonctionnalités de votre plan {plan === 'free' ? 'Gratuit' : plan === 'pro_visibility' ? 'Pro Visibilité' : 'Pro Boost'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center">
            {limits.prioritySupport ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <span className={limits.prioritySupport ? 'text-gray-900' : 'text-gray-400'}>
              Support prioritaire
            </span>
          </div>
          
          <div className="flex items-center">
            {limits.customDomain ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <span className={limits.customDomain ? 'text-gray-900' : 'text-gray-400'}>
              Domaine personnalisé
            </span>
          </div>
          
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-gray-900">
              Analytics {limits.analyticsRetention}j
            </span>
          </div>
          
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-gray-900">
              {limits.teamMembers} membre{limits.teamMembers > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Call to action pour upgrade */}
      {plan !== 'pro_boost' && (
        <div className="text-center">
          <Link
            href="/pro/upgrade"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Découvrir les plans supérieurs
          </Link>
        </div>
      )}
    </div>
  );
}

export function QuotaAlert({ 
  message, 
  type = 'warning' 
}: { 
  message: string; 
  type?: 'info' | 'warning' | 'error' | 'success' 
}) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700'
  };

  const icons = {
    info: AlertCircle,
    warning: AlertCircle,
    error: XCircle,
    success: CheckCircle
  };

  const Icon = icons[type];

  return (
    <div className={`p-4 border rounded-lg flex items-start ${styles[type]}`}>
      <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}