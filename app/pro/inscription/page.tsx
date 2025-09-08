'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
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

function ProInscriptionContent() {
  const router = useRouter();
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
      yearlyPrice: 0,
      icon: Shield,
      color: 'gray',
      features: [
        '1 photo',
        '3 événements/mois',
        'Page établissement uniquement',
        'Statistiques de base',
        'Support par email'
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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('[Inscription] Pas d\'utilisateur connecté, redirection vers connexion');
        router.push('/auth/pro/connexion');
        return;
      }
      
      console.log('[Inscription] Utilisateur connecté:', user.email);
      
      // Vérifier si l'établissement existe déjà
      // Essayer d'abord avec user_id (ancien schéma)
      let { data: establishment, error: estabError } = await supabase
        .from('establishments')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Si erreur avec user_id, essayer avec owner_id
      if (estabError && estabError.message?.includes('column')) {
        const result = await supabase
          .from('establishments')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle();
        establishment = result.data;
        estabError = result.error;
      }
      
      if (establishment) {
        console.log('[Inscription] Établissement existant, redirection vers dashboard');
        router.push('/pro/dashboard');
        return;
      }
      
      console.log('[Inscription] Aucun établissement, l\'utilisateur peut en créer un');
      setUser(user);
    } catch (error) {
      console.error('[Inscription] Erreur lors de la vérification:', error);
      setError('Erreur lors de la vérification de votre compte');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Récupérer l'utilisateur actuel pour être sûr
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        console.error('[Inscription] Utilisateur non connecté lors de la soumission');
        setError('Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => {
          router.push('/auth/pro/connexion');
        }, 2000);
        return;
      }
      
      console.log('[Inscription] Création établissement pour:', currentUser.email);

      // Créer le slug
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Créer l'établissement avec la bonne colonne
      const establishmentData: any = {
          user_id: currentUser.id, // Utiliser user_id qui semble être la colonne existante
          name: formData.name,
          slug: slug,
          category: formData.category,
          description: formData.description,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          address: formData.address,
          postal_code: formData.postal_code,
          city: formData.city,
          address_district: formData.postal_code === '69001' ? '1er arrondissement' :
                           formData.postal_code === '69002' ? '2ème arrondissement' :
                           formData.postal_code === '69003' ? '3ème arrondissement' :
                           formData.postal_code === '69004' ? '4ème arrondissement' :
                           formData.postal_code === '69005' ? '5ème arrondissement' :
                           formData.postal_code === '69006' ? '6ème arrondissement' :
                           formData.postal_code === '69007' ? '7ème arrondissement' :
                           formData.postal_code === '69008' ? '8ème arrondissement' :
                           formData.postal_code === '69009' ? '9ème arrondissement' : null,
          facebook_url: formData.facebook_url || null,
          instagram_url: formData.instagram_url || null,
          plan: selectedPlan,
          plan_billing_cycle: billingCycle,
          vat_number: formData.vat_number || null,
          status: 'pending',
          views_count: 0,
          verified: selectedPlan !== 'basic',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
      };
      
      // Essayer d'insérer l'établissement
      const { data, error: insertError } = await supabase
        .from('establishments')
        .insert(establishmentData)
        .select()
        .single();

      if (insertError) {
        console.error('[Inscription] Erreur insertion:', insertError);
        
        // Gérer les erreurs spécifiques
        if (insertError.message?.includes('duplicate')) {
          setError('Un établissement avec ce nom existe déjà');
        } else if (insertError.message?.includes('owner_id')) {
          setError('Erreur d\'authentification. Veuillez vous reconnecter.');
          setTimeout(() => {
            router.push('/auth/pro/connexion');
          }, 2000);
        } else {
          setError(insertError.message || 'Erreur lors de la création');
        }
        return;
      }

      if (!data) {
        console.error('[Inscription] Aucune donnée retournée');
        setError('Erreur lors de la création de l\'établissement');
        return;
      }
      
      console.log('[Inscription] Établissement créé avec succès:', data);

      setSuccess(true);
      setStep(3);
      
      // Redirection après 2 secondes
      setTimeout(() => {
        router.push('/pro/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('[Inscription] Erreur inattendue:', err);
      setError(err.message || 'Une erreur inattendue est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.name && formData.category && formData.phone && formData.address && formData.postal_code;
    }
    return true;
  };

  const currentPlan = plans[selectedPlan];
  const displayPrice = billingCycle === 'yearly' 
    ? currentPlan.yearlyPrice 
    : currentPlan.price;

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Établissement créé avec succès !
          </h2>
          <p className="text-gray-600 mb-4">
            Redirection vers votre tableau de bord...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header avec progression */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/pro/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            
            {/* Indicateur de progression */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold
                  ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="hidden sm:inline text-sm font-medium">Informations</span>
              </div>
              
              <ChevronRight className="h-4 w-4 text-gray-400" />
              
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold
                  ${step >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="hidden sm:inline text-sm font-medium">Forfait</span>
              </div>
              
              <ChevronRight className="h-4 w-4 text-gray-400" />
              
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold
                  ${step >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="hidden sm:inline text-sm font-medium">Confirmation</span>
              </div>
            </div>

            <div className="w-5"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Étape 1: Informations */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informations sur votre établissement
              </h2>

              {/* Catégorie - Grille visuelle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Catégorie d'activité *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className={`p-3 rounded-lg border-2 transition flex items-center gap-2 ${
                          formData.category === cat.value
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nom */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Restaurant Le Lyonnais"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Décrivez votre établissement..."
                />
              </div>

              {/* Contact */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="04 78 XX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="contact@monentreprise.fr"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="123 rue de la République"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="69001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              {/* Bouton suivant */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!isStepValid()}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Choix du forfait */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choisissez votre forfait
                </h2>
                <p className="text-gray-600 mb-6">
                  Sélectionnez le plan qui correspond à vos besoins
                </p>

                {/* Switch mensuel/annuel */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-gray-500'}>
                    Mensuel
                  </span>
                  <button
                    type="button"
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition"
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  <span className={billingCycle === 'yearly' ? 'font-semibold' : 'text-gray-500'}>
                    Annuel
                    <span className="ml-1 text-green-600 text-sm font-bold">-20%</span>
                  </span>
                </div>

                {/* Plans */}
                <div className="grid md:grid-cols-3 gap-6">
                  {Object.entries(plans).map(([key, plan]) => {
                    const isSelected = selectedPlan === key;
                    const Icon = plan.icon;
                    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.price;
                    
                    return (
                      <div
                        key={key}
                        onClick={() => setSelectedPlan(key as PlanType)}
                        className={`relative rounded-lg border-2 p-6 cursor-pointer transition ${
                          isSelected 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {key === 'pro' && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                              POPULAIRE
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <Icon className={`h-8 w-8 mx-auto mb-2 ${
                            isSelected ? 'text-red-600' : 'text-gray-400'
                          }`} />
                          <h3 className="text-lg font-bold">{plan.name}</h3>
                          <div className="mt-2">
                            {price === 0 ? (
                              <span className="text-3xl font-bold">Gratuit</span>
                            ) : (
                              <>
                                <span className="text-3xl font-bold">{price}€</span>
                                <span className="text-gray-500">
                                  /{billingCycle === 'yearly' ? 'an' : 'mois'}
                                </span>
                                {billingCycle === 'yearly' && key !== 'basic' && (
                                  <div className="text-sm text-green-600 font-medium mt-1">
                                    Économisez {key === 'pro' ? '46€' : '98€'}/an
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {isSelected && (
                          <div className="absolute top-4 right-4">
                            <div className="bg-red-600 text-white rounded-full p-1">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* TVA pour plans payants */}
                {selectedPlan !== 'basic' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de TVA (requis pour les plans payants)
                    </label>
                    <input
                      type="text"
                      name="vat_number"
                      value={formData.vat_number}
                      onChange={handleChange}
                      required={selectedPlan !== 'basic'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="FR XX XXX XXX XXX"
                    />
                  </div>
                )}

                {/* Boutons */}
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (selectedPlan !== 'basic' && !formData.vat_number)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Création...
                      </>
                    ) : (
                      <>
                        Créer mon établissement
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Composant principal avec Suspense
export default function ProInscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <ProInscriptionContent />
    </Suspense>
  );
}