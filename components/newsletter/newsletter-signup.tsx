'use client';

import { useState } from 'react';
import { Mail, Check, Clock, Calendar, CalendarDays, Zap, Newspaper, Users } from 'lucide-react';

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'modal';
  showTitle?: boolean;
  defaultFrequency?: 'daily' | 'weekly' | 'monthly';
  source?: string;
}

type Frequency = 'daily' | 'weekly' | 'monthly';

const frequencies = [
  {
    id: 'daily' as Frequency,
    name: 'Quotidienne',
    description: 'Événements du jour + actualités fraîches',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    features: [
      'Événements du jour',
      'Actualités de la veille',
      'Bons plans flash',
      'Météo Lyon'
    ]
  },
  {
    id: 'weekly' as Frequency,
    name: 'Hebdomadaire',
    description: 'Le récap parfait chaque dimanche',
    icon: Calendar,
    color: 'from-blue-500 to-indigo-600',
    popular: true,
    features: [
      'Événements de la semaine',
      'Actualités importantes',
      'Articles de blog',
      'Sélection restaurants'
    ]
  },
  {
    id: 'monthly' as Frequency,
    name: 'Mensuelle',
    description: 'Dossier spécial + agenda du mois',
    icon: CalendarDays,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Dossier thématique',
      'Agenda complet du mois',
      'Nouveautés Lyon',
      'Guide sorties'
    ]
  }
];

export function NewsletterSignup({ 
  variant = 'default', 
  showTitle = true,
  defaultFrequency = 'weekly',
  source = 'website'
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState<Frequency>(defaultFrequency);
  const [contentPrefs, setContentPrefs] = useState({
    events: true,
    news: true,
    articles: true,
    deals: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'frequency' | 'details' | 'preferences'>('frequency');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          frequency: selectedFrequency,
          contentPreferences: contentPrefs,
          source,
          utmSource: new URLSearchParams(window.location.search).get('utm_source'),
          utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center p-8 bg-green-50 border border-green-200 rounded-xl">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">
          Inscription réussie ! 🎉
        </h3>
        <p className="text-green-700 mb-4">
          Vérifiez votre email pour confirmer votre inscription à la newsletter {frequencies.find(f => f.id === selectedFrequency)?.name.toLowerCase()}.
        </p>
        <p className="text-sm text-green-600">
          Premier envoi prévu : {selectedFrequency === 'daily' ? 'demain matin' : selectedFrequency === 'weekly' ? 'dimanche prochain' : 'le mois prochain'}
        </p>
      </div>
    );
  }

  const containerClass = variant === 'compact' 
    ? 'max-w-md mx-auto p-6' 
    : variant === 'modal' 
    ? 'p-6' 
    : 'max-w-4xl mx-auto p-8';

  return (
    <div className={`${containerClass} bg-white rounded-xl border border-gray-200 shadow-lg`}>
      {showTitle && (
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Newsletter Guide de Lyon
          </h2>
          <p className="text-gray-600">
            Restez informé des meilleurs événements et actualités lyonnaises
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>12K+ abonnés</span>
            </div>
            <div className="flex items-center">
              <Newspaper className="w-4 h-4 mr-1" />
              <span>Contenus exclusifs</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Étape 1: Choix de la fréquence */}
        {step === 'frequency' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              À quelle fréquence souhaitez-vous recevoir nos actualités ?
            </h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              {frequencies.map((freq) => {
                const IconComponent = freq.icon;
                const isSelected = selectedFrequency === freq.id;
                
                return (
                  <div
                    key={freq.id}
                    onClick={() => setSelectedFrequency(freq.id)}
                    className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {freq.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Populaire
                        </span>
                      </div>
                    )}
                    
                    <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-br ${freq.color} rounded-full flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                      {freq.name}
                    </h4>
                    <p className="text-sm text-gray-600 text-center mb-4">
                      {freq.description}
                    </p>
                    
                    <ul className="space-y-1">
                      {freq.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep('details')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Étape 2: Détails personnels */}
        {step === 'details' && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => setStep('frequency')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Retour
              </button>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Newsletter {frequencies.find(f => f.id === selectedFrequency)?.name}
                </h3>
              </div>
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom (optionnel)
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('preferences')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Personnaliser le contenu
              </button>
              <button
                type="submit"
                disabled={!email || isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
              </button>
            </div>
          </div>
        )}

        {/* Étape 3: Préférences de contenu */}
        {step === 'preferences' && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Retour
              </button>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Personnalisez votre newsletter
                </h3>
                <p className="text-sm text-gray-600">
                  Choisissez les types de contenu qui vous intéressent
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'events', label: 'Événements', desc: 'Concerts, expos, festivités...' },
                { key: 'news', label: 'Actualités', desc: 'Infos locales et nouveautés' },
                { key: 'articles', label: 'Articles de blog', desc: 'Guides et découvertes' },
                { key: 'deals', label: 'Bons plans', desc: 'Offres et promotions' }
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={contentPrefs[item.key as keyof typeof contentPrefs]}
                    onChange={(e) => setContentPrefs(prev => ({
                      ...prev,
                      [item.key]: e.target.checked
                    }))}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-600">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={!email || isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Inscription...' : 'Finaliser l\'inscription'}
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          En vous inscrivant, vous acceptez de recevoir nos emails. 
          <br />
          Vous pouvez vous désabonner à tout moment via le lien en bas de nos emails.
        </p>
      </div>
    </div>
  );
}