'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Store,
  Utensils,
  Coffee,
  ShoppingBag,
  Scissors,
  Hotel,
  Palette,
  Briefcase,
  MoreHorizontal,
  Sparkles,
  Crown,
  Shield,
  ChevronRight,
  Star,
  Activity,
  Heart,
  Building,
  Car
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

type PlanType = 'basic' | 'pro' | 'expert';

export default function ProInscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('basic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  const [formData, setFormData] = useState({
    // Établissement
    name: '',
    category: '',
    description: '',
    // Contact
    phone: '',
    email: '',
    website: '',
    // Adresse
    address: '',
    postal_code: '',
    city: 'Lyon',
    // Réseaux sociaux
    facebook_url: '',
    instagram_url: '',
    // TVA pour plans payants
    vat_number: ''
  });

  // Nouvelles catégories simplifiées
  const categories = [
    { value: 'restaurant-food', label: 'Restaurant & Food', icon: Utensils },
    { value: 'bar-nightlife', label: 'Bar & Nightlife', icon: Coffee },
    { value: 'shopping-mode', label: 'Shopping & Mode', icon: ShoppingBag },
    { value: 'beaute-bienetre', label: 'Beauté & Bien-être', icon: Scissors },
    { value: 'hotel-hebergement', label: 'Hôtel & Hébergement', icon: Hotel },
    { value: 'culture-loisirs', label: 'Culture & Loisirs', icon: Palette },
    { value: 'sport-fitness', label: 'Sport & Fitness', icon: Activity },
    { value: 'sante-medical', label: 'Santé & Médical', icon: Heart },
    { value: 'services-pro', label: 'Services professionnels', icon: Briefcase },
    { value: 'immobilier', label: 'Immobilier', icon: Building },
    { value: 'auto-transport', label: 'Auto & Transport', icon: Car },
    { value: 'autre', label: 'Autre', icon: MoreHorizontal }
  ];

  // Plans avec les vraies caractéristiques
  const plans = {
    basic: {
      name: 'Basic',
      price: 0,
      icon: Store,
      color: 'gray',
      features: [
        '1 photo de présentation',
        '3 événements/mois (page uniquement)',
        'Horaires et contact',
        'Liens réseaux sociaux',
        'Présence dans l\'annuaire'
      ]
    },
    pro: {
      name: 'Pro',
      price: 19,
      yearlyPrice: 182, // -20%
      icon: Shield,
      color: 'blue',
      features: [
        '6 photos en carousel',
        '3 événements/mois diffusés',
        'Page d\'accueil + Newsletter',
        'Badge vérifié ✓',
        'Position prioritaire',
        'Bonus annuel : 1 article blog SEO'
      ]
    },
    expert: {
      name: 'Expert',
      price: 49,
      yearlyPrice: 490, // -20%
      icon: Crown,
      color: 'purple',
      features: [
        '10 photos en carousel',
        '6 événements/mois diffusés',
        'Tous canaux + Réseaux sociaux',
        'Badge premium ✓',
        'Position premium',
        'Bonus annuel : 2 articles blog SEO'
      ]
    }
  };

  useEffect(() => {
    checkUser();
    // Récupérer le plan depuis l'URL si présent
    const planParam = searchParams.get('plan');
    if (planParam && (planParam === 'basic' || planParam === 'pro' || planParam === 'expert')) {
      setSelectedPlan(planParam as PlanType);
    }
  }, [searchParams]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/auth/pro/connexion');
      return;
    }

    setUser(session.user);

    // Vérifier si l'utilisateur a déjà un établissement
    const { data: establishment } = await supabase
      .from('establishments')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    
    if (establishment) {
      router.push('/pro/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Navigation entre les étapes
    if (step < 3) {
      // Validation étape 1
      if (step === 1) {
        if (!formData.name || !formData.category) {
          setError('Nom et catégorie sont requis');
          return;
        }
      }
      // Validation étape 2 (plan payant = TVA requise)
      if (step === 2) {
        if (selectedPlan !== 'basic' && !formData.vat_number) {
          setError('Numéro de TVA requis pour les plans payants');
          return;
        }
      }
      setStep(step + 1);
      return;
    }
    
    // Création de l'établissement (étape 3)
    setLoading(true);
    
    try {
      const { data: establishment, error: establishmentError } = await supabase
        .from('establishments')
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          description: formData.description,
          phone: formData.phone,
          email: formData.email || user.email,
          website: formData.website,
          address: formData.address,
          postal_code: formData.postal_code,
          city: formData.city,
          facebook_url: formData.facebook_url,
          instagram_url: formData.instagram_url,
          plan: selectedPlan,
          plan_billing_cycle: billingCycle,
          vat_number: formData.vat_number,
          verified: selectedPlan !== 'basic' && formData.vat_number ? true : false
        })
        .select()
        .single();

      if (establishmentError) {
        console.error('Erreur création établissement:', establishmentError);
        setError('Erreur lors de la création de l\'établissement');
        return;
      }

      setSuccess(true);
      
      // Redirection vers le dashboard après 2 secondes
      setTimeout(() => {
        router.push('/pro/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Établissement créé avec succès !
          </h2>
          <p className="text-gray-600 mb-4">
            Redirection vers votre dashboard...
          </p>
          <div className="animate-pulse">
            <div className="h-1 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">Guide de Lyon</span>
            </Link>
            
            {/* Indicateur d'étapes */}
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-0.5 ml-2 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* Étape 1: Informations établissement */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Informations sur votre établissement</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom de l'établissement *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Restaurant Le Bouchon Lyonnais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Catégorie *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat.value})}
                        className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                          formData.category === cat.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <cat.icon className="h-6 w-6 mb-1" />
                        <span className="text-sm">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Décrivez votre établissement en quelques mots..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="04 78 12 34 56"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email professionnel
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="contact@monentreprise.fr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="123 Rue de la République"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      placeholder="69001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      value={formData.city}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  Suivant
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Choix du forfait */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-2">Choisissez votre forfait</h2>
              <p className="text-gray-600 mb-8">
                Sélectionnez le plan qui correspond le mieux à vos besoins
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Toggle Mensuel/Annuel */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-md transition ${
                      billingCycle === 'monthly' 
                        ? 'bg-white shadow-sm' 
                        : 'text-gray-600'
                    }`}
                  >
                    Mensuel
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-2 rounded-md transition ${
                      billingCycle === 'yearly' 
                        ? 'bg-white shadow-sm' 
                        : 'text-gray-600'
                    }`}
                  >
                    Annuel
                    <span className="ml-2 text-xs text-green-600 font-semibold">-20%</span>
                  </button>
                </div>
              </div>

              {/* Plans */}
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(plans).map(([key, plan]) => {
                  const isSelected = selectedPlan === key;
                  const isPro = key === 'pro';
                  const isExpert = key === 'expert';
                  
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedPlan(key as PlanType)}
                      className={`relative rounded-2xl p-6 cursor-pointer transition-all ${
                        isSelected 
                          ? isExpert 
                            ? 'border-2 border-purple-500 shadow-xl transform scale-105'
                            : isPro
                            ? 'border-2 border-blue-500 shadow-xl transform scale-105'
                            : 'border-2 border-gray-400 shadow-xl transform scale-105'
                          : 'border-2 border-gray-200 hover:shadow-lg'
                      }`}
                    >
                      {/* Badge populaire */}
                      {isPro && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                            Le plus populaire
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <plan.icon className={`h-12 w-12 mx-auto mb-3 ${
                          isExpert ? 'text-purple-600' :
                          isPro ? 'text-blue-600' :
                          'text-gray-600'
                        }`} />
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                      </div>

                      <div className="text-center mb-6">
                        {key === 'basic' ? (
                          <div>
                            <span className="text-3xl font-bold">0€</span>
                            <span className="text-gray-500">/mois</span>
                          </div>
                        ) : (
                          <div>
                            {billingCycle === 'monthly' ? (
                              <>
                                <span className="text-3xl font-bold">{plan.price}€</span>
                                <span className="text-gray-500">/mois</span>
                              </>
                            ) : (
                              <>
                                <span className="text-3xl font-bold">{plan.yearlyPrice}€</span>
                                <span className="text-gray-500">/an</span>
                                <div className="text-sm text-green-600 mt-1">
                                  Économisez {plan.price * 12 - plan.yearlyPrice}€
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {isSelected && (
                        <div className={`absolute inset-0 rounded-2xl pointer-events-none ${
                          isExpert ? 'bg-purple-500' :
                          isPro ? 'bg-blue-500' :
                          'bg-gray-400'
                        } opacity-5`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* TVA pour plans payants */}
              {selectedPlan !== 'basic' && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <label className="block text-sm font-medium mb-2">
                    Numéro de TVA intracommunautaire *
                  </label>
                  <input
                    type="text"
                    required={selectedPlan !== 'basic'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.vat_number}
                    onChange={(e) => setFormData({...formData, vat_number: e.target.value})}
                    placeholder="FR12345678901"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Requis pour la vérification et l'obtention du badge ✓
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  Suivant
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 3: Récapitulatif */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Récapitulatif</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Établissement</h3>
                  <p>{formData.name}</p>
                  <p className="text-sm text-gray-600">
                    {categories.find(c => c.value === formData.category)?.label}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Forfait sélectionné</h3>
                  <p className="font-medium text-lg">
                    Plan {plans[selectedPlan].name}
                    {selectedPlan !== 'basic' && (
                      <span className="ml-2 text-sm text-gray-600">
                        ({billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'})
                      </span>
                    )}
                  </p>
                  {selectedPlan === 'basic' ? (
                    <p className="text-green-600">Gratuit</p>
                  ) : (
                    <p className="text-blue-600">
                      {billingCycle === 'monthly' 
                        ? `${plans[selectedPlan].price}€/mois`
                        : `${plans[selectedPlan].yearlyPrice}€/an`
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Créer mon établissement
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}