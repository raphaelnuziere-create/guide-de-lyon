'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth/AuthContext';
import { CheckCircleIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

// Types
type PlanType = 'basic' | 'pro' | 'expert';

// Créer le client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProInscriptionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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
    website: '',
    // Adresse
    address: '',
    postal_code: '',
    city: 'Lyon',
    // Réseaux sociaux
    facebook_url: '',
    instagram_url: '',
  });

  // Catégories disponibles
  const categories = [
    'Restaurant',
    'Bar',
    'Café',
    'Hôtel',
    'Boutique',
    'Musée',
    'Théâtre',
    'Cinéma',
    'Sport',
    'Santé',
    'Beauté',
    'Services',
    'Autre'
  ];

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    // Attendre un peu pour être sûr que l'auth est chargée
    const timer = setTimeout(() => {
      if (!authLoading && !user) {
        // Rediriger vers la page d'inscription si pas connecté
        router.push('/inscription');
      }
    }, 1000); // Attendre 1 seconde pour éviter les redirections trop rapides
    
    return () => clearTimeout(timer);
  }, [user, authLoading, router]);

  // Vérifier si l'utilisateur a déjà un établissement
  useEffect(() => {
    const checkExistingEstablishment = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          // L'utilisateur a déjà un établissement, rediriger vers le dashboard
          router.push('/pro/dashboard');
        }
      }
    };
    
    if (user) {
      checkExistingEstablishment();
    }
  }, [user, router]);

  // Formater les URLs
  const formatUrl = (url: string, type: 'website' | 'facebook' | 'instagram') => {
    if (!url) return '';
    
    if (type === 'website') {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    }
    
    if (type === 'facebook') {
      if (url.startsWith('http') || url.startsWith('www')) {
        return url;
      }
      return `https://facebook.com/${url}`;
    }
    
    if (type === 'instagram') {
      const cleaned = url.replace('@', '');
      if (cleaned.startsWith('http') || cleaned.startsWith('www')) {
        return cleaned;
      }
      return `https://instagram.com/${cleaned}`;
    }
    
    return url;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Navigation entre les étapes
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Soumission finale
    setLoading(true);
    
    try {
      if (!user) {
        throw new Error('Vous devez être connecté pour continuer');
      }

      console.log('✅ Utilisateur connecté:', user.id);

      // Formater les URLs
      const formattedData = {
        ...formData,
        website: formatUrl(formData.website, 'website'),
        facebook_url: formatUrl(formData.facebook_url, 'facebook'),
        instagram_url: formatUrl(formData.instagram_url, 'instagram'),
      };

      // Créer l'établissement
      console.log('📝 Création de l\'établissement...');
      const { data: establishment, error: establishmentError } = await supabase
        .from('establishments')
        .insert({
          user_id: user.id,
          name: formattedData.name,
          email: user.email,
          phone: formattedData.phone || null,
          website: formattedData.website || null,
          address: formattedData.address || null,
          postal_code: formattedData.postal_code || null,
          city: formattedData.city || 'Lyon',
          facebook_url: formattedData.facebook_url || null,
          instagram_url: formattedData.instagram_url || null,
          description: formattedData.description || null,
          category: formattedData.category,
          status: 'pending'
        })
        .select()
        .single();

      if (establishmentError) {
        console.error('Erreur création établissement:', establishmentError);
        
        // Gestion des erreurs
        if (establishmentError.message?.includes('duplicate key')) {
          throw new Error('Vous avez déjà un établissement enregistré');
        } else if (establishmentError.message?.includes('row-level security')) {
          throw new Error('Erreur de permissions. Veuillez vous reconnecter et réessayer.');
        } else {
          throw new Error('Impossible de créer l\'établissement. Veuillez réessayer.');
        }
      }

      console.log('✅ Établissement créé:', establishment.id);

      // Essayer de créer l'abonnement (optionnel)
      try {
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('slug', selectedPlan)
          .single();

        if (plan) {
          await supabase
            .from('subscriptions')
            .insert({
              establishment_id: establishment.id,
              plan_id: plan.id,
              status: selectedPlan === 'basic' ? 'active' : 'trialing',
              billing_cycle: billingCycle,
              events_used_this_month: 0
            });
          console.log('✅ Abonnement créé');
        }
      } catch (subError) {
        console.log('⚠️ Abonnement non créé (optionnel)');
      }

      // Succès !
      setSuccess(true);
      console.log('🎉 Inscription établissement terminée !');
      
      // Redirection vers le dashboard
      setTimeout(() => {
        router.push('/pro/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Si chargement auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas connecté (sera redirigé)
  if (!user) {
    return null;
  }

  // Message de succès
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Établissement créé avec succès !
            </h1>
            <p className="text-gray-600 mb-6">
              Votre établissement a été enregistré. Vous allez être redirigé vers votre tableau de bord.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-gray-500">Redirection en cours...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Référencez votre établissement
          </h1>
          <p className="mt-2 text-gray-600">
            Complétez les informations de votre établissement pour apparaître sur Guide de Lyon
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                1
              </span>
              <span className="ml-2 text-sm font-medium">Établissement</span>
            </div>
            
            <div className={`mx-4 w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                2
              </span>
              <span className="ml-2 text-sm font-medium">Contact</span>
            </div>
            
            <div className={`mx-4 w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
                step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                3
              </span>
              <span className="ml-2 text-sm font-medium">Forfait</span>
            </div>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Étape 1: Informations établissement */}
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
                    placeholder="Restaurant Le Lyonnais"
                  />
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
              <h2 className="text-2xl font-bold mb-6">Coordonnées</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="04 XX XX XX XX"
                    />
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
                  </div>
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
                    placeholder="123 Rue de la République"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="69001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Étape 3: Choix du forfait */}
          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-6">Choisissez votre forfait</h2>
              
              <div className="space-y-4">
                {/* Plan Basic */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedPlan === 'basic' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPlan('basic')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Basic (Gratuit)</h3>
                      <p className="text-sm text-gray-600">
                        Idéal pour commencer
                      </p>
                      <ul className="text-sm text-gray-600 mt-2">
                        <li>• 1 événement par mois</li>
                        <li>• 3 photos maximum</li>
                        <li>• Description 200 caractères</li>
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">0€</p>
                      <p className="text-sm text-gray-600">/mois</p>
                    </div>
                  </div>
                </div>

                {/* Plan Pro */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedPlan === 'pro' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPlan('pro')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Pro</h3>
                      <p className="text-sm text-gray-600">
                        Pour développer votre visibilité
                      </p>
                      <ul className="text-sm text-gray-600 mt-2">
                        <li>• 4 événements par mois</li>
                        <li>• 6 photos maximum</li>
                        <li>• Description 500 caractères</li>
                        <li>• Newsletter mensuelle</li>
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">19€</p>
                      <p className="text-sm text-gray-600">/mois</p>
                    </div>
                  </div>
                </div>

                {/* Plan Expert */}
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selectedPlan === 'expert' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPlan('expert')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Expert</h3>
                      <p className="text-sm text-gray-600">
                        Maximum de visibilité
                      </p>
                      <ul className="text-sm text-gray-600 mt-2">
                        <li>• Événements illimités</li>
                        <li>• 15 photos maximum</li>
                        <li>• Description 1500 caractères</li>
                        <li>• Newsletter + mise en avant</li>
                        <li>• Badge "Premium"</li>
                      </ul>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">49€</p>
                      <p className="text-sm text-gray-600">/mois</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Boutons navigation */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Retour
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`ml-auto flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 ${
                loading ? 'cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : step < 3 ? (
                <>
                  Suivant
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </>
              ) : (
                'Créer mon établissement'
              )}
            </button>
          </div>
        </form>

        {/* Note */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            En créant votre établissement, vous acceptez nos{' '}
            <a href="/mentions-legales" className="text-blue-600 hover:underline">
              conditions d'utilisation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}