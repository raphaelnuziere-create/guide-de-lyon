'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, Zap, Crown, Shield, TrendingUp, Calendar, Camera, Bell, Users, BarChart, Mail } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

interface PlanFeature {
  text: string;
  basic: boolean;
  pro: boolean;
  expert: boolean;
}

const PLANS = {
  basic: {
    name: 'Basic',
    price: 0,
    color: 'gray',
    icon: Shield,
    description: 'Pour commencer votre présence en ligne'
  },
  pro: {
    name: 'Pro',
    price: 29,
    color: 'blue',
    icon: Zap,
    description: 'Pour développer votre visibilité',
    popular: true
  },
  expert: {
    name: 'Expert',
    price: 79,
    color: 'purple',
    icon: Crown,
    description: 'Pour maximiser votre impact'
  }
};

const FEATURES: PlanFeature[] = [
  { text: 'Page établissement dédiée', basic: true, pro: true, expert: true },
  { text: 'Informations de base (adresse, téléphone)', basic: true, pro: true, expert: true },
  { text: 'Horaires d\'ouverture', basic: true, pro: true, expert: true },
  { text: '1 photo principale', basic: true, pro: true, expert: true },
  { text: 'Lien vers site web', basic: true, pro: true, expert: true },
  
  { text: 'Galerie photos (jusqu\'à 6)', basic: false, pro: true, expert: true },
  { text: 'Description détaillée', basic: false, pro: true, expert: true },
  { text: '3 événements par mois', basic: false, pro: true, expert: true },
  { text: 'Événements visibles sur la page d\'accueil', basic: false, pro: true, expert: true },
  { text: 'Réseaux sociaux', basic: false, pro: true, expert: true },
  { text: 'Badge "Établissement vérifié"', basic: false, pro: true, expert: true },
  { text: 'Statistiques de base', basic: false, pro: true, expert: true },
  
  { text: 'Galerie photos illimitée', basic: false, pro: false, expert: true },
  { text: '10 événements par mois', basic: false, pro: false, expert: true },
  { text: 'Événements en newsletter', basic: false, pro: false, expert: true },
  { text: 'Partage sur réseaux sociaux auto', basic: false, pro: false, expert: true },
  { text: 'Mise en avant prioritaire', basic: false, pro: false, expert: true },
  { text: 'Statistiques avancées', basic: false, pro: false, expert: true },
  { text: 'Support prioritaire', basic: false, pro: false, expert: true },
  { text: 'Accès API', basic: false, pro: false, expert: true }
];

export default function UpgradePage() {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<'basic' | 'pro' | 'expert'>('basic');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/pro/connexion');
        return;
      }

      const { data: business } = await supabase
        .from('businesses')
        .select('plan, name')
        .eq('owner_id', session.user.id)
        .single();

      if (business) {
        setCurrentPlan(business.plan as 'basic' | 'pro' | 'expert');
        setBusinessName(business.name);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: 'basic' | 'pro' | 'expert') => {
    if (plan === currentPlan) return;
    
    setUpgrading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Mettre à jour le plan
      const { error } = await supabase
        .from('businesses')
        .update({ 
          plan,
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', session.user.id);

      if (error) throw error;

      // Rediriger vers Stripe pour le paiement si plan payant
      if (plan !== 'basic') {
        // TODO: Intégrer Stripe
        alert(`Redirection vers le paiement pour le plan ${PLANS[plan].name} (${PLANS[plan].price}€/mois)`);
      }

      setCurrentPlan(plan);
      
      // Message de succès et redirection
      setTimeout(() => {
        router.push('/pro/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur upgrade:', error);
      alert('Erreur lors de la mise à jour du plan');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/pro/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Choisissez votre plan</h1>
            <p className="text-xl text-gray-600 mt-4">
              Développez votre présence sur le Guide de Lyon
            </p>
            {businessName && (
              <p className="text-sm text-gray-500 mt-2">
                Pour: <span className="font-medium">{businessName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {Object.entries(PLANS).map(([key, plan]) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === key;
            const isPlanLower = key === 'basic' || (key === 'pro' && currentPlan === 'expert');
            
            return (
              <div 
                key={key}
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? 'border-2 border-blue-500 shadow-xl scale-105' 
                    : 'border border-gray-200 shadow-lg'
                } ${isCurrentPlan ? 'bg-gradient-to-b from-gray-50 to-white' : 'bg-white'}`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Plus populaire
                  </span>
                )}
                
                {isCurrentPlan && (
                  <span className="absolute -top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Plan actuel
                  </span>
                )}

                <div className="text-center mb-6">
                  <Icon className={`h-12 w-12 mx-auto mb-4 text-${plan.color}-600`} />
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                    <span className="text-gray-600">/mois</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {FEATURES.filter(f => f[key as keyof typeof f] === true).slice(0, 8).map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(key as 'basic' | 'pro' | 'expert')}
                  disabled={isCurrentPlan || isPlanLower || upgrading}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    isCurrentPlan 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isPlanLower
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrentPlan 
                    ? 'Plan actuel' 
                    : isPlanLower
                    ? 'Downgrade non disponible'
                    : `Passer au plan ${plan.name}`
                  }
                </button>
              </div>
            );
          })}
        </div>

        {/* Tableau comparatif détaillé */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comparaison détaillée</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Fonctionnalités</th>
                  <th className="text-center py-4 px-4">Basic</th>
                  <th className="text-center py-4 px-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Pro</span>
                  </th>
                  <th className="text-center py-4 px-4">Expert</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-4 px-4 text-gray-700">{feature.text}</td>
                    <td className="text-center py-4 px-4">
                      {feature.basic ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {feature.pro ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-4">
                      {feature.expert ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Des questions? Contactez notre équipe au{' '}
            <a href="tel:0478000000" className="text-blue-600 hover:underline">04 78 00 00 00</a>
            {' '}ou par{' '}
            <a href="mailto:pro@guide-de-lyon.fr" className="text-blue-600 hover:underline">email</a>
          </p>
        </div>
      </div>
    </div>
  );
}