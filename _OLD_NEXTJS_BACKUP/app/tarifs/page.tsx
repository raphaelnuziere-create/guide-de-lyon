'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Shield, Star } from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Gratuit',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Parfait pour commencer',
    features: [
      '1 photo de votre établissement',
      '3 événements par mois',
      'Référencement de base',
      'Profil établissement simple'
    ],
    highlights: [
      'Visibilité basique',
      'Support par email'
    ],
    badge: null,
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '19€',
    priceMonthly: 19,
    priceYearly: 182.40,
    description: 'Le plus populaire pour les PME',
    features: [
      '6 photos de votre établissement',
      '3 événements par mois',
      'Badge "Vérifié" sur votre profil',
      'Référencement prioritaire',
      'Statistiques de vue',
      'Support prioritaire'
    ],
    highlights: [
      'Visibilité renforcée',
      'Badge professionnel',
      'Analytics détaillés'
    ],
    badge: 'verified',
    popular: true
  },
  {
    id: 'expert',
    name: 'Expert',
    price: '49€',
    priceMonthly: 49,
    priceYearly: 470.40,
    description: 'Maximum de visibilité',
    features: [
      '10 photos de votre établissement',
      '5 événements par mois',
      'Badge "Expert" doré sur votre profil',
      'Référencement premium (priorité maximale)',
      'Statistiques avancées',
      'Support téléphonique dédié',
      'Promotion sur réseaux sociaux',
      'Newsletter mensuelle'
    ],
    highlights: [
      'Visibilité maximale',
      'Badge premium doré',
      'Promotion incluse'
    ],
    badge: 'expert',
    popular: false
  }
];

export default function TarifsPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'basic') {
      alert('Le plan Basic est gratuit ! Inscrivez-vous directement.');
      return;
    }

    setLoading(planId);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingPeriod
        })
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Erreur abonnement:', error);
      alert('Erreur lors de la création de l\'abonnement. Réessayez plus tard.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choisissez votre plan
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Développez votre visibilité sur Lyon avec nos solutions adaptées à vos besoins
            </p>

            <div className="inline-flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  billingPeriod === 'yearly'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annuel
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-8 transition-transform hover:scale-105 ${
                plan.popular ? 'border-2 border-blue-500' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Plus populaire
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {billingPeriod === 'monthly' 
                      ? (plan.priceMonthly === 0 ? plan.price : `${plan.priceMonthly}€`)
                      : (plan.priceYearly === 0 ? plan.price : `${plan.priceYearly}€`)}
                  </div>
                  {plan.priceMonthly > 0 && (
                    <div className="text-gray-500 text-sm">
                      {billingPeriod === 'yearly' ? 'par an' : 'par mois'}
                      <br />
                      Facturé {billingPeriod === 'yearly' ? 'annuellement' : 'mensuellement'}
                    </div>
                  )}
                </div>

                {plan.badge && (
                  <div className="mb-4">
                    <Badge variant={plan.badge as any} className="text-sm" />
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Fonctionnalités :</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.highlights && (
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Points forts :</h4>
                  <ul className="space-y-2">
                    {plan.highlights.map((item, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          plan.id === 'expert' ? 'bg-yellow-500' :
                          plan.id === 'pro' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></span>
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                loading={loading === plan.id}
                className={`w-full ${
                  plan.id === 'expert' 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                    : plan.id === 'pro'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                size="lg"
              >
                {loading === plan.id ? (
                  'Chargement...'
                ) : plan.priceMonthly === 0 ? (
                  'Commencer gratuitement'
                ) : (
                  `Choisir ${plan.name}`
                )}
              </Button>

              {plan.priceMonthly > 0 && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  Essai gratuit 14 jours • Annulation facile
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pourquoi choisir */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir Guide de Lyon ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Plateforme locale</h3>
              <p className="text-gray-600">
                Première plateforme lyonnaise dédiée aux entreprises locales
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">+300% de visibilité</h3>
              <p className="text-gray-600">
                +300% de visibilité en moyenne pour nos clients Pro et Expert
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Support dédié</h3>
              <p className="text-gray-600">
                Équipe dédiée pour vous accompagner dans votre développement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-2">
            <strong>Hébergement sécurisé</strong> • <strong>Mises à jour gratuites</strong> • <strong>Support client</strong>
          </p>
          <p className="text-sm text-gray-500">
            Questions ? Paiement sécurisé par Stripe • Annulation possible à tout moment
          </p>
        </div>
      </div>
    </div>
  );
}