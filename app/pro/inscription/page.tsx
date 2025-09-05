'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEstablishment, createSubscription, getPlanBySlug } from '@/app/lib/supabase/subscription-client';
import { PLAN_FEATURES, type PlanType } from '@/app/lib/types/subscription';
import { CheckIcon } from '@heroicons/react/24/solid';

export default function InscriptionPro() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('basic');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      // Créer l'établissement
      const establishment = await createEstablishment({
        name: formData.name,
        vat_number: formData.vat_number,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        description: formData.description
      });

      // Créer l'abonnement
      const plan = await getPlanBySlug(selectedPlan);
      await createSubscription(establishment.id, plan.id);

      // Si plan payant, rediriger vers Stripe
      if (selectedPlan !== 'basic') {
        router.push(`/pro/checkout?establishment=${establishment.id}&plan=${selectedPlan}&cycle=${billingCycle}`);
      } else {
        router.push('/pro/dashboard');
      }
    } catch (error) {
      console.error('Erreur inscription:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 h-2 bg-${step >= 1 ? 'blue-600' : 'gray-200'} rounded-l`} />
            <div className={`flex-1 h-2 bg-${step >= 2 ? 'blue-600' : 'gray-200'}`} />
            <div className={`flex-1 h-2 bg-${step >= 3 ? 'blue-600' : 'gray-200'} rounded-r`} />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Informations</span>
            <span>Contact</span>
            <span>Forfait</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
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

                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({...formData, facebook_url: e.target.value})}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
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

              <div className="grid grid-cols-3 gap-6">
                {/* Plan Basic */}
                <div 
                  className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                    selectedPlan === 'basic' 
                      ? 'border-gray-600 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan('basic')}
                >
                  <h3 className="text-xl font-bold mb-2">Basic</h3>
                  <p className="text-3xl font-bold mb-4">
                    0€
                    <span className="text-sm font-normal text-gray-500">/mois</span>
                  </p>
                  
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
                  className={`border-2 rounded-lg p-6 cursor-pointer transition relative ${
                    selectedPlan === 'pro' 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan('pro')}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                    Populaire
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <p className="text-3xl font-bold mb-4">
                    {billingCycle === 'monthly' ? '19' : '15.20'}€
                    <span className="text-sm font-normal text-gray-500">/mois</span>
                  </p>
                  
                  <p className="text-xs text-green-600 font-semibold mb-4">
                    7 jours d'essai gratuit
                  </p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Tout le plan Basic</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>6 photos en carrousel</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>3 événements homepage + newsletter</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Badge "Professionnel Vérifié"</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Statistiques 30 jours</span>
                    </li>
                  </ul>
                </div>

                {/* Plan Expert */}
                <div 
                  className={`border-2 rounded-lg p-6 cursor-pointer transition ${
                    selectedPlan === 'expert' 
                      ? 'border-yellow-600 bg-yellow-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan('expert')}
                >
                  <h3 className="text-xl font-bold mb-2">
                    Expert ⭐
                  </h3>
                  <p className="text-3xl font-bold mb-4">
                    {billingCycle === 'monthly' ? '49' : '39.20'}€
                    <span className="text-sm font-normal text-gray-500">/mois</span>
                  </p>
                  
                  <p className="text-xs text-green-600 font-semibold mb-4">
                    7 jours d'essai gratuit
                  </p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Tout le plan Pro</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>10 photos en carrousel</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>5 événements + réseaux sociaux</span>
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
                      <span>Menu PDF + Réservation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
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