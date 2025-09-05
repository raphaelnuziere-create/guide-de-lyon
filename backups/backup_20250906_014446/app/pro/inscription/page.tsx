'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { PLAN_FEATURES, type PlanType } from '@/app/lib/types/subscription';
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function InscriptionProContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('basic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  // Pré-sélection du plan depuis l'URL
  useEffect(() => {
    const plan = searchParams.get('plan');
    const billing = searchParams.get('billing');
    
    if (plan && ['basic', 'pro', 'expert'].includes(plan)) {
      setSelectedPlan(plan as PlanType);
      // Si c'est un plan gratuit, on passe directement à l'étape 1
      if (plan === 'basic') {
        setStep(1);
      }
    }
    
    if (billing && ['monthly', 'yearly'].includes(billing)) {
      setBillingCycle(billing as 'monthly' | 'yearly');
    }
  }, [searchParams]);
  
  const [formData, setFormData] = useState({
    // Infos entreprise
    name: '',
    vat_number: '',
    siret: '',
    
    // Contact
    email: '',
    phone: '',
    website: '',
    
    // Adresse
    address: '',
    postal_code: '',
    
    // Réseaux sociaux
    facebook_url: '',
    instagram_url: '',
    
    // Description
    description: '',
    category: ''
  });

  const categories = [
    'Restaurant',
    'Hôtel',
    'Bar',
    'Commerce',
    'Culture',
    'Loisirs',
    'Beauté',
    'Santé',
    'Services',
    'Autre'
  ];

  // Fonction pour formater les URLs
  const formatUrl = (url: string, type: 'website' | 'facebook' | 'instagram') => {
    if (!url) return '';
    
    // Retirer les espaces
    url = url.trim();
    
    // Si c'est déjà une URL complète, la retourner
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Pour les réseaux sociaux, accepter juste le username
    if (type === 'facebook') {
      if (url.includes('facebook.com')) {
        return `https://${url}`;
      }
      return `https://facebook.com/${url}`;
    }
    
    if (type === 'instagram') {
      if (url.includes('instagram.com')) {
        return `https://${url}`;
      }
      return `https://instagram.com/${url.replace('@', '')}`;
    }
    
    // Pour les sites web, ajouter https:// si nécessaire
    if (type === 'website') {
      return `https://${url}`;
    }
    
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    
    try {
      // Vérifier l'authentification
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Créer un compte utilisateur d'abord
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email || `${Date.now()}@pro.guidedelyon.fr`,
          password: Math.random().toString(36).slice(-12),
        });
        
        if (authError) {
          console.error('Erreur création compte:', authError);
          throw new Error('Erreur lors de la création du compte');
        }
        
        if (!authData.user) {
          throw new Error('Impossible de créer le compte utilisateur');
        }
      }

      // Récupérer l'utilisateur actuel
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('Vous devez être connecté');
      }

      // Formater les URLs
      const formattedData = {
        ...formData,
        website: formatUrl(formData.website, 'website'),
        facebook_url: formatUrl(formData.facebook_url, 'facebook'),
        instagram_url: formatUrl(formData.instagram_url, 'instagram'),
      };

      // Créer l'établissement
      const { data: establishment, error: establishmentError } = await supabase
        .from('establishments')
        .insert({
          user_id: currentUser.id,
          name: formattedData.name,
          vat_number: formattedData.vat_number,
          siret: formattedData.siret,
          email: formattedData.email,
          phone: formattedData.phone,
          website: formattedData.website,
          address: formattedData.address,
          postal_code: formattedData.postal_code,
          facebook_url: formattedData.facebook_url,
          instagram_url: formattedData.instagram_url,
          description: formattedData.description,
          category: formattedData.category,
          status: 'pending'
        })
        .select()
        .single();

      if (establishmentError) {
        console.error('Erreur création établissement:', establishmentError);
        throw new Error('Erreur lors de la création de l\'établissement');
      }

      // Récupérer le plan sélectionné
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('slug', selectedPlan)
        .single();

      if (planError) {
        console.error('Erreur récupération plan:', planError);
        throw new Error('Plan non trouvé');
      }

      // Créer l'abonnement
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          establishment_id: establishment.id,
          plan_id: plan.id,
          status: selectedPlan === 'basic' ? 'active' : 'trialing',
          billing_cycle: billingCycle,
          trial_start: new Date().toISOString(),
          trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select();

      if (subscriptionError) {
        console.error('Erreur création abonnement:', subscriptionError);
        throw new Error('Erreur lors de la création de l\'abonnement');
      }

      // Redirection selon le plan
      if (selectedPlan === 'basic') {
        router.push('/pro/dashboard');
      } else {
        // TODO: Intégrer Stripe pour les plans payants
        router.push('/pro/dashboard');
      }
      
    } catch (err: any) {
      console.error('Erreur complète:', err);
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir le prix à afficher
  const getPriceDisplay = (plan: PlanType) => {
    if (plan === 'basic') return { monthly: '0€', yearly: '0€', save: '' };
    
    const prices = {
      pro: { monthly: 19, yearly: 182.40 },
      expert: { monthly: 49, yearly: 470.40 }
    };
    
    const p = prices[plan as keyof typeof prices];
    const yearlyMonthly = (p.yearly / 12).toFixed(2);
    const savings = ((p.monthly * 12) - p.yearly).toFixed(0);
    
    return {
      monthly: `${p.monthly}€`,
      yearly: `${p.yearly}€`,
      yearlyMonthly: `${yearlyMonthly}€/mois`,
      save: `Économisez ${savings}€`
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 h-2 ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'} rounded-l`} />
            <div className={`flex-1 h-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'} mx-1`} />
            <div className={`flex-1 h-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'} rounded-r`} />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Informations</span>
            <span>Contact</span>
            <span>Forfait</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Étape 1: Informations entreprise */}
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Informations de votre établissement</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nom de l'établissement *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Numéro de TVA *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vat_number}
                      onChange={(e) => setFormData({...formData, vat_number: e.target.value})}
                      placeholder="FR12345678901"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      SIRET
                    </label>
                    <input
                      type="text"
                      value={formData.siret}
                      onChange={(e) => setFormData({...formData, siret: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    maxLength={selectedPlan === 'basic' ? 200 : selectedPlan === 'pro' ? 500 : 1500}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Présentez votre établissement..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length} / {selectedPlan === 'basic' ? 200 : selectedPlan === 'pro' ? 500 : 1500} caractères
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Étape 2: Contact et adresse */}
          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Informations de contact</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email professionnel
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Site web
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="www.monsite.fr"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Entrez simplement www.monsite.fr</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                      placeholder="votrepagefacebook"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Juste le nom de la page</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                      placeholder="@votrecompte"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Avec ou sans @</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Étape 3: Choix du forfait */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Choisissez votre forfait</h2>
              
              {/* Toggle mensuel/annuel */}
              <div className="flex justify-center mb-8">
                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
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
                    Annuel (-20%)
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                {/* Plan Basic */}
                <div 
                  className={`border-2 rounded-lg p-4 md:p-6 cursor-pointer transition ${
                    selectedPlan === 'basic' 
                      ? 'border-gray-600 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan('basic')}
                >
                  <h3 className="text-xl font-bold mb-2">Basic</h3>
                  <div className="mb-4">
                    <p className="text-3xl font-bold">0€</p>
                    <p className="text-sm text-gray-500">Gratuit pour toujours</p>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Fiche entreprise complète</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>1 photo de couverture</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>3 événements/mois (page pro)</span>
                    </li>
                  </ul>
                </div>

                {/* Plan Pro */}
                <div 
                  className={`border-2 rounded-lg p-4 md:p-6 cursor-pointer transition relative ${
                    selectedPlan === 'pro' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan('pro')}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                    🔥 Le plus populaire
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-blue-600">Pro</h3>
                  <div className="mb-4">
                    {billingCycle === 'monthly' ? (
                      <>
                        <p className="text-3xl font-bold">19€</p>
                        <p className="text-sm text-gray-500">par mois</p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-bold">182€</p>
                        <p className="text-sm text-gray-500">par an</p>
                        <p className="text-xs text-green-600 font-semibold">Économisez 46€</p>
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-green-600 font-semibold mb-4">
                    7 jours d'essai gratuit
                  </p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="font-medium">Tout le plan Basic +</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Galerie 6 photos en carrousel</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span><strong>3 événements/mois en page d'accueil</strong></span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span><strong>Diffusion newsletter</strong> (5000+ abonnés)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Badge "Professionnel Vérifié" ✓</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Position prioritaire annuaire</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Statistiques détaillées (30 jours)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Support prioritaire</span>
                    </li>
                  </ul>
                </div>

                {/* Plan Expert */}
                <div 
                  className={`border-2 rounded-lg p-4 md:p-6 cursor-pointer transition ${
                    selectedPlan === 'expert' 
                      ? 'border-yellow-600 bg-yellow-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan('expert')}
                >
                  <h3 className="text-xl font-bold mb-2">
                    Expert ⭐
                  </h3>
                  <div className="mb-4">
                    {billingCycle === 'monthly' ? (
                      <>
                        <p className="text-3xl font-bold">49€</p>
                        <p className="text-sm text-gray-500">par mois</p>
                      </>
                    ) : (
                      <>
                        <p className="text-3xl font-bold">470€</p>
                        <p className="text-sm text-gray-500">par an</p>
                        <p className="text-xs text-green-600 font-semibold">Économisez 118€</p>
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-green-600 font-semibold mb-4">
                    7 jours d'essai gratuit
                  </p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="font-medium">Tout le plan Pro +</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Galerie 10 photos premium</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span><strong>5 événements/mois multi-canal</strong></span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span><strong>Publication Facebook & Instagram</strong></span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Badge Expert doré ⭐</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Vidéo de présentation</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Statistiques avancées (90 jours)</span>
                    </li>
                  </ul>
                  
                  {billingCycle === 'yearly' && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                      <p className="text-xs font-medium text-yellow-900 mb-1">💎 BONUS ANNUEL :</p>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Support dédié par téléphone</li>
                        <li>• 2 articles blog SEO avec liens</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Plan pré-sélectionné */}
          {selectedPlan !== 'basic' && step === 1 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Plan sélectionné :</strong> {selectedPlan === 'pro' ? 'Pro' : 'Expert ⭐'} 
                {billingCycle === 'yearly' ? ' (Annuel)' : ' (Mensuel)'}
              </p>
              <button
                type="button"
                onClick={() => router.push('/pro')}
                className="text-sm text-blue-600 underline mt-1"
              >
                Changer de plan
              </button>
            </div>
          )}

          {/* Boutons navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Retour
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 ${
                step === 1 ? 'ml-auto' : ''
              }`}
            >
              {loading ? 'Chargement...' : step < 3 ? 'Continuer' : 'Créer mon compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InscriptionPro() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <InscriptionProContent />
    </Suspense>
  );
}