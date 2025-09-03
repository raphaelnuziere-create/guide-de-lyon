'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Building2, 
  Check, 
  X, 
  Sparkles, 
  Eye, 
  Crown,
  ArrowLeft,
  CreditCard,
  Shield,
  Calendar,
  Share2,
  FileText,
  TrendingUp,
  Home
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { quotaManager } from '@/lib/quotas/quota-manager'

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    description: 'Parfait pour démarrer',
    color: 'gray',
    icon: Building2,
    features: [
      { name: '1 établissement', included: true },
      { name: '3 événements par mois', included: true },
      { name: 'Visibles sur votre page uniquement', included: true, highlight: true },
      { name: '3 photos par événement', included: true },
      { name: 'Statistiques 7 jours', included: true },
      { name: 'Support par email', included: true },
      { name: 'Événements sur page d\'accueil', included: false },
      { name: 'Publication réseaux sociaux', included: false },
      { name: 'Article de blog SEO mensuel', included: false },
      { name: 'Support prioritaire', included: false }
    ]
  },
  {
    id: 'pro_visibility',
    name: 'Pro Visibilité',
    price: 19,
    description: 'Maximisez votre visibilité',
    color: 'blue',
    icon: Eye,
    badge: 'Populaire',
    features: [
      { name: '1 établissement', included: true },
      { name: '3 événements par mois', included: true },
      { name: 'Visibles sur la page d\'accueil', included: true, highlight: true },
      { name: '3 événements mis en avant', included: true, highlight: true },
      { name: '10 photos par événement', included: true },
      { name: 'Statistiques 30 jours', included: true },
      { name: 'Support prioritaire 24h', included: true },
      { name: 'Badge "Pro" sur vos annonces', included: true },
      { name: 'Publication réseaux sociaux', included: false },
      { name: 'Article de blog SEO mensuel', included: false }
    ]
  },
  {
    id: 'pro_boost',
    name: 'Pro Boost',
    price: 49,
    description: 'Dominez votre marché',
    color: 'purple',
    icon: Crown,
    badge: 'Maximum d\'impact',
    features: [
      { name: '1 établissement', included: true },
      { name: '6 événements par mois', included: true, highlight: true },
      { name: 'Visibles sur la page d\'accueil', included: true },
      { name: '6 événements mis en avant', included: true },
      { name: 'Publication auto Facebook/Instagram', included: true, highlight: true },
      { name: 'Article de blog SEO mensuel', included: true, highlight: true },
      { name: '50 photos par événement', included: true },
      { name: 'Statistiques 90 jours', included: true },
      { name: 'Support prioritaire 24/7', included: true },
      { name: 'Badge "Premium" + mise en avant', included: true }
    ]
  }
]

export default function UpgradePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const currentPlan = user?.plan || 'free'

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan) {
      return; // Déjà sur ce plan
    }

    setSelectedPlan(planId)
    setLoading(true)

    try {
      // Pour l'instant, juste mettre à jour le plan localement
      // En production, cela déclencherait Stripe
      await quotaManager.upgradePlan(user!.uid, planId as any)
      
      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Rediriger vers la page de paiement ou dashboard
      if (planId !== 'free') {
        // TODO: Intégrer Stripe checkout
        console.log('Redirect to Stripe checkout for plan:', planId)
      }
      
      router.push('/pro/dashboard')
    } catch (error) {
      console.error('Error upgrading plan:', error)
      alert('Erreur lors du changement de plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/pro/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour au dashboard
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Paiement sécurisé par Stripe</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Boostez la visibilité de vos événements
          </h1>
          <p className="text-xl text-gray-600">
            Attirez plus de clients avec vos événements : soirées spéciales, promotions, animations...
          </p>
        </div>

        {/* Plan actuel */}
        {currentPlan !== 'free' && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">
              Vous êtes actuellement sur le plan <strong>{currentPlan === 'pro_visibility' ? 'Pro Visibilité' : 'Pro Boost'}</strong>
            </p>
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isPro = plan.id === 'pro_visibility';
            const isBoost = plan.id === 'pro_boost';
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  isPro ? 'ring-2 ring-blue-500' : isBoost ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute top-0 right-0 ${
                    isPro ? 'bg-blue-500' : 'bg-purple-500'
                  } text-white px-3 py-1 text-xs font-bold rounded-bl-lg`}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Icon et nom */}
                  <div className="flex items-center justify-center mb-4">
                    <plan.icon className={`h-12 w-12 ${
                      plan.id === 'free' ? 'text-gray-400' :
                      isPro ? 'text-blue-500' :
                      'text-purple-500'
                    }`} />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-center mb-2">{plan.name}</h2>
                  <p className="text-gray-600 text-center mb-6">{plan.description}</p>

                  {/* Prix */}
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                    <span className="text-gray-600">/mois</span>
                  </div>

                  {/* Bouton */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan || loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : plan.id === 'free'
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : isPro
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                    } disabled:opacity-50`}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Traitement...
                      </span>
                    ) : isCurrentPlan ? (
                      'Plan actuel'
                    ) : plan.id === 'free' ? (
                      'Passer au gratuit'
                    ) : (
                      'Choisir ce plan'
                    )}
                  </button>

                  {/* Features */}
                  <div className="mt-8 space-y-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mt-0.5 mr-3 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        } ${feature.highlight ? 'font-semibold' : ''}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Comment ça marche */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Comment fonctionnent les événements ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1">1. Créez vos événements</h3>
              <p className="text-sm text-gray-600">
                Soirées, promos, animations... Tout ce qui attire vos clients
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold mb-1">2. Validation rapide</h3>
              <p className="text-sm text-gray-600">
                Notre équipe valide vos événements en 24h max
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Home className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-1">3. Visibilité maximale</h3>
              <p className="text-sm text-gray-600">
                Vos événements apparaissent sur la page d'accueil (plans Pro)
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Share2 className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-1">4. Réseaux sociaux</h3>
              <p className="text-sm text-gray-600">
                Publication automatique sur Facebook/Instagram (Pro Boost)
              </p>
            </div>
          </div>
        </div>

        {/* Avantages Pro Boost */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            🚀 Exclusivités Pro Boost
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start">
                <Share2 className="h-8 w-8 text-purple-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Publication automatique sur les réseaux</h3>
                  <p className="text-sm text-gray-600">
                    Vos événements sont automatiquement publiés sur Facebook et Instagram 
                    pour toucher un maximum de clients potentiels
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start">
                <FileText className="h-8 w-8 text-purple-600 mr-4 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Article de blog SEO mensuel</h3>
                  <p className="text-sm text-gray-600">
                    Un article optimisé SEO sur votre établissement publié chaque mois 
                    pour améliorer votre référencement Google
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="font-semibold mb-2">Quelle est la différence entre les plans ?</h3>
              <p className="text-gray-600">
                <strong>Gratuit</strong> : Vos événements sont visibles uniquement sur votre page établissement.<br/>
                <strong>Pro Visibilité</strong> : Vos événements apparaissent sur la page d'accueil du site.<br/>
                <strong>Pro Boost</strong> : En plus de la page d'accueil, publication automatique sur les réseaux sociaux et article SEO mensuel.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Comment sont validés les événements ?</h3>
              <p className="text-gray-600">
                Notre équipe vérifie chaque événement sous 24h pour s'assurer qu'il respecte 
                nos critères de qualité et qu'il est pertinent pour notre audience lyonnaise.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h3>
              <p className="text-gray-600">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Comment fonctionne l'article de blog SEO ?</h3>
              <p className="text-gray-600">
                Chaque mois, vous nous envoyez les informations sur votre actualité, 
                et notre équipe rédige un article optimisé SEO de 500+ mots publié 
                sur le blog du Guide de Lyon avec un lien vers votre établissement.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Des questions ? Notre équipe est là pour vous aider
          </p>
          <div className="flex items-center justify-center space-x-4">
            <a href="mailto:support@guide-de-lyon.fr" className="text-blue-600 hover:text-blue-700">
              support@guide-de-lyon.fr
            </a>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">04 78 00 00 00</span>
          </div>
        </div>
      </div>
    </div>
  )
}