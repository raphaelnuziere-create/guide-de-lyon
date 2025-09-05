'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon, SparklesIcon, TrophyIcon } from '@heroicons/react/24/outline';

export default function ProLanding() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const handleSelectPlan = (plan: string) => {
    if (plan === 'basic') {
      router.push('/pro/inscription?plan=basic');
    } else {
      router.push(`/pro/inscription?plan=${plan}&billing=${billingCycle}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full mb-6 backdrop-blur">
            <SparklesIcon className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Offre limitée aux 50 premiers inscrits</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Développez votre visibilité à Lyon
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95">
            Rejoignez 127 professionnels lyonnais qui ont déjà boosté leur présence en ligne
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
              <CheckIcon className="w-5 h-5 mr-2" />
              <span>5000+ abonnés newsletter</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
              <CheckIcon className="w-5 h-5 mr-2" />
              <span>10 000 visiteurs/mois</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
              <CheckIcon className="w-5 h-5 mr-2" />
              <span>ROI moyen x3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Toggle Billing */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Choisissez votre plan de croissance</h2>
            
            <div className="inline-flex items-center bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-md transition font-medium ${
                  billingCycle === 'monthly' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-md transition font-medium ${
                  billingCycle === 'yearly' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-600'
                }`}
              >
                Annuel
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  -20%
                </span>
              </button>
            </div>
            
            {billingCycle === 'yearly' && (
              <p className="mt-3 text-sm text-green-600 font-medium">
                💰 Économisez jusqu'à 118€ par an + Bonus exclusifs
              </p>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan Basic */}
            <div 
              className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 border-2 border-gray-100"
              onMouseEnter={() => setHoveredPlan('basic')}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <p className="text-gray-600">Pour démarrer votre présence en ligne</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">0€</span>
                  <span className="text-gray-500 ml-2">/mois</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Gratuit pour toujours</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Fiche établissement complète</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">1 photo de présentation</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Horaires et contact</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">3 événements/mois sur votre page</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Présence dans l'annuaire</span>
                </li>
              </ul>

              <button
                onClick={() => handleSelectPlan('basic')}
                className={`w-full py-3 px-6 rounded-lg font-medium transition ${
                  hoveredPlan === 'basic'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Commencer gratuitement
              </button>
            </div>

            {/* Plan Pro - Most Popular */}
            <div 
              className="relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all p-8 border-2 border-blue-500 transform hover:-translate-y-1"
              onMouseEnter={() => setHoveredPlan('pro')}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  🔥 Le plus populaire
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-blue-600">Pro</h3>
                <p className="text-gray-600">Pour développer votre clientèle</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline">
                  {billingCycle === 'monthly' ? (
                    <>
                      <span className="text-4xl font-bold">19€</span>
                      <span className="text-gray-500 ml-2">/mois</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">182€</span>
                      <span className="text-gray-500 ml-2">/an</span>
                    </>
                  )}
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    Économisez 46€ par an
                  </p>
                )}
                <p className="text-sm text-purple-600 font-medium mt-2">
                  🎁 7 jours d'essai gratuit
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Tout le plan Basic +</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Galerie 6 photos en carrousel</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    <strong>3 événements/mois en page d'accueil</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    <strong>Diffusion newsletter</strong> (5000+ abonnés)
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Badge "Professionnel Vérifié" ✓</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Position prioritaire annuaire</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Statistiques détaillées (30 jours)</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Support prioritaire</span>
                </li>
              </ul>

              <button
                onClick={() => handleSelectPlan('pro')}
                className={`w-full py-3 px-6 rounded-lg font-medium transition flex items-center justify-center ${
                  hoveredPlan === 'pro'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Essayer gratuitement
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-3">
                Sans engagement • Annulez à tout moment
              </p>
            </div>

            {/* Plan Expert */}
            <div 
              className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 border-2 border-yellow-400"
              onMouseEnter={() => setHoveredPlan('expert')}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <div className="absolute -top-3 -right-3">
                <div className="bg-yellow-400 text-yellow-900 p-2 rounded-full">
                  <StarIcon className="w-6 h-6" />
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 flex items-center">
                  Expert 
                  <StarIcon className="w-5 h-5 ml-2 text-yellow-500" />
                </h3>
                <p className="text-gray-600">Pour dominer votre marché</p>
              </div>
              
              <div className="mb-8">
                <div className="flex items-baseline">
                  {billingCycle === 'monthly' ? (
                    <>
                      <span className="text-4xl font-bold">49€</span>
                      <span className="text-gray-500 ml-2">/mois</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">470€</span>
                      <span className="text-gray-500 ml-2">/an</span>
                    </>
                  )}
                </div>
                {billingCycle === 'yearly' && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 font-medium">
                      Économisez 118€ par an
                    </p>
                    <p className="text-sm text-purple-600 font-medium">
                      + 1 mois offert
                    </p>
                  </div>
                )}
                <p className="text-sm text-purple-600 font-medium mt-2">
                  🎁 7 jours d'essai gratuit
                </p>
              </div>

              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Tout le plan Pro +</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Galerie 10 photos premium</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    <strong>5 événements/mois multi-canal</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    <strong>Publication Facebook & Instagram</strong>
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Badge Expert doré ⭐</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Vidéo de présentation</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Statistiques avancées (90 jours)</span>
                </li>
              </ul>

              {billingCycle === 'yearly' && (
                <div className="bg-white/80 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    💎 BONUS ANNUEL :
                  </p>
                  <ul className="space-y-1">
                    <li className="flex items-start">
                      <TrophyIcon className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">Support dédié par téléphone</span>
                    </li>
                    <li className="flex items-start">
                      <TrophyIcon className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-gray-700">2 articles blog SEO avec liens</span>
                    </li>
                  </ul>
                </div>
              )}

              <button
                onClick={() => handleSelectPlan('expert')}
                className={`w-full py-3 px-6 rounded-lg font-medium transition flex items-center justify-center ${
                  hoveredPlan === 'expert'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                    : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                }`}
              >
                Devenir Expert
                <StarIcon className="w-5 h-5 ml-2" />
              </button>
              
              <p className="text-xs text-center text-gray-600 mt-3">
                Places limitées ce mois
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comparaison détaillée des plans
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 font-medium text-gray-700">Fonctionnalités</th>
                    <th className="text-center px-6 py-4 font-medium text-gray-700">Basic</th>
                    <th className="text-center px-6 py-4 font-medium text-blue-600">Pro</th>
                    <th className="text-center px-6 py-4 font-medium text-yellow-600">Expert ⭐</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Photos</td>
                    <td className="text-center px-6 py-4">1</td>
                    <td className="text-center px-6 py-4 font-medium">6</td>
                    <td className="text-center px-6 py-4 font-medium">10</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">Événements/mois</td>
                    <td className="text-center px-6 py-4">3 (page pro)</td>
                    <td className="text-center px-6 py-4 font-medium">3 (homepage)</td>
                    <td className="text-center px-6 py-4 font-medium">5 (multi-canal)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Newsletter</td>
                    <td className="text-center px-6 py-4">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center px-6 py-4">
                      <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center px-6 py-4">
                      <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">Réseaux sociaux</td>
                    <td className="text-center px-6 py-4">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center px-6 py-4">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center px-6 py-4">
                      <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">Statistiques</td>
                    <td className="text-center px-6 py-4">
                      <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="text-center px-6 py-4">30 jours</td>
                    <td className="text-center px-6 py-4">90 jours</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">Support</td>
                    <td className="text-center px-6 py-4">Email</td>
                    <td className="text-center px-6 py-4">Prioritaire</td>
                    <td className="text-center px-6 py-4">Dédié (annuel)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-gray-600">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-2">Comment fonctionne l'essai gratuit de 7 jours ?</h3>
              <p className="text-gray-600">
                Vous avez accès à toutes les fonctionnalités du plan choisi pendant 7 jours. 
                Aucune carte bancaire n'est requise pour commencer l'essai.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold mb-2">Que se passe-t-il si je dépasse ma limite d'événements ?</h3>
              <p className="text-gray-600">
                Vous serez notifié avant d'atteindre votre limite. 
                Vous pourrez alors upgrader votre plan pour publier plus d'événements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à développer votre activité ?
          </h2>
          <p className="text-xl mb-8 opacity-95">
            Rejoignez les professionnels lyonnais qui ont fait le bon choix
          </p>
          <button
            onClick={() => router.push('/pro/inscription?plan=pro')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition"
          >
            Commencer mon essai gratuit
            <ArrowRightIcon className="inline w-5 h-5 ml-2" />
          </button>
          
          <p className="mt-4 text-sm opacity-80">
            ✓ Sans engagement • ✓ Sans carte bancaire • ✓ 7 jours gratuits
          </p>
        </div>
      </div>
    </div>
  );
}