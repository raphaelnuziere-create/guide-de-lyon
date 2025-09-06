'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Calendar, 
  Camera,
  Settings,
  Eye,
  Clock,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Bell,
  Sparkles,
  Lock,
  ChevronRight,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  TrendingUp,
  Share2,
  FileText,
  Shield,
  Crown,
  Zap,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';
import { EstablishmentService, EstablishmentData, PlanLimits } from '@/app/lib/services/establishmentService';

type UserPlan = 'basic' | 'pro' | 'expert';

export default function DashboardPro() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [establishment, setEstablishment] = useState<EstablishmentData | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/auth/pro/connexion');
      return;
    }

    setUser(session.user);

    // Récupérer les vraies données de l'établissement
    const establishmentData = await EstablishmentService.getEstablishment(session.user.id);

    if (!establishmentData) {
      router.push('/pro/etablissement/creation');
      return;
    }

    setEstablishment(establishmentData);

    // Récupérer les limites du plan
    const limits = await EstablishmentService.getPlanLimits(establishmentData.plan);
    setPlanLimits(limits);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  const plan = establishment?.plan || 'basic';
  const isPro = plan === 'pro' || plan === 'expert';
  const isExpert = plan === 'expert';

  // Limites selon les plans
  const limits = {
    basic: { photos: 1, events: 3 },
    pro: { photos: 6, events: 3 },
    expert: { photos: 10, events: 6 }
  };

  const currentLimits = limits[plan];
  const eventsRemaining = currentLimits.events - (establishment?.events_this_month || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold">Guide de Lyon</span>
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 font-medium">Dashboard Pro</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Badge Plan avec design amélioré */}
              <div className={`px-4 py-2 rounded-full font-medium flex items-center space-x-2 ${
                isExpert ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' :
                isPro ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' :
                'bg-gray-100 text-gray-700 border border-gray-300'
              }`}>
                {isExpert && <Crown className="h-4 w-4" />}
                {isPro && !isExpert && <Shield className="h-4 w-4" />}
                <span>Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
                {establishment?.verified && (
                  <CheckCircle className="h-4 w-4 ml-1" />
                )}
              </div>

              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
                {isPro && <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>}
              </button>

              <Link href="/pro/settings" className="p-2 text-gray-600 hover:text-gray-900">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Bienvenue avec gradient */}
        <div className={`rounded-2xl p-8 text-white mb-8 relative overflow-hidden ${
          isExpert ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600' :
          isPro ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
          'bg-gradient-to-r from-gray-700 to-gray-900'
        }`}>
          <div className="absolute top-0 right-0 opacity-10">
            <Building2 className="h-64 w-64" />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Bonjour, {establishment?.name} !
            </h1>
            <p className="text-white/90 mb-6">
              {isExpert ? 'Profitez de tous les outils Expert pour maximiser votre visibilité' :
               isPro ? 'Vos outils Pro sont actifs. Développez votre présence en ligne !' :
               'Commencez à développer votre présence sur Guide de Lyon'}
            </p>

            {!isPro && (
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 inline-block">
                <p className="text-sm mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Passez au Plan Pro pour débloquer plus de fonctionnalités
                </p>
                <Link 
                  href="/pro/upgrade"
                  className="inline-flex items-center text-white font-medium hover:underline"
                >
                  Voir les avantages <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Grid principal */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Informations de base */}
          <div className="space-y-6">
            {/* Carte Info établissement */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Informations de base
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Téléphone</span>
                  </div>
                  <span className="text-sm font-medium">
                    {establishment?.phone || 'Non renseigné'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Email</span>
                  </div>
                  <span className="text-sm font-medium">
                    {establishment?.email || 'Non renseigné'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Horaires</span>
                  </div>
                  <Link href="/pro/horaires" className="text-sm text-blue-600 hover:underline">
                    Modifier
                  </Link>
                </div>
              </div>

              <Link 
                href="/pro/etablissement/edit"
                className="mt-4 w-full flex items-center justify-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier les informations
              </Link>
            </div>

            {/* Carte Réseaux sociaux */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Share2 className="h-5 w-5 mr-2 text-blue-600" />
                Liens & Réseaux
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Site web</span>
                  </div>
                  {establishment?.website ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-300" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Facebook className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm">Facebook</span>
                  </div>
                  {establishment?.facebook ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-300" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Instagram className="h-4 w-4 text-pink-600 mr-2" />
                    <span className="text-sm">Instagram</span>
                  </div>
                  {establishment?.instagram ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-300" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne centrale - Fonctionnalités principales */}
          <div className="space-y-6">
            {/* Carte Photos */}
            <div 
              className="bg-white rounded-xl shadow-sm p-6 relative"
              onMouseEnter={() => setHoveredSection('photos')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-green-600" />
                  Photos
                </div>
                <span className="text-sm font-normal text-gray-500">
                  {establishment?.photos_count}/{currentLimits.photos}
                </span>
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Photos utilisées</span>
                    <span className="text-sm text-gray-600">
                      {establishment?.photos_count} sur {currentLimits.photos}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(establishment?.photos_count || 0) / currentLimits.photos * 100}%` }}
                    />
                  </div>
                </div>

                {plan === 'basic' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <Lock className="inline h-3 w-3 mr-1" />
                      Plan Pro : 6 photos | Plan Expert : 10 photos
                    </p>
                  </div>
                )}

                <Link 
                  href="/pro/photos"
                  className="w-full flex items-center justify-center py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Gérer mes photos
                </Link>
              </div>
            </div>

            {/* Carte Événements */}
            <div 
              className="bg-white rounded-xl shadow-sm p-6 relative"
              onMouseEnter={() => setHoveredSection('events')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Événements
                </div>
                <span className="text-sm font-normal text-gray-500">
                  {eventsRemaining} restants
                </span>
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Ce mois-ci</span>
                    <span className="text-sm text-gray-600">
                      {establishment?.events_this_month}/{currentLimits.events}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        eventsRemaining > 0 ? 'bg-purple-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(establishment?.events_this_month || 0) / currentLimits.events * 100}%` }}
                    />
                  </div>
                </div>

                {/* Diffusion des événements */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Diffusion :</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      Page entreprise
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Building2 className="h-3 w-3 mr-1" />
                      Page d'accueil
                    </span>
                    {isPro ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      Newsletter
                    </span>
                    {isPro ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Share2 className="h-3 w-3 mr-1" />
                      Réseaux sociaux
                    </span>
                    {isExpert ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <Link 
                  href="/pro/events"
                  className="w-full flex items-center justify-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un événement
                </Link>
              </div>
            </div>
          </div>

          {/* Colonne droite - Upgrade et stats */}
          <div className="space-y-6">
            {/* Carte Upgrade contextuelle */}
            {!isExpert && (
              <div className={`rounded-xl p-6 text-white shadow-lg ${
                isPro 
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600'
              }`}>
                <div className="flex items-center mb-3">
                  <Sparkles className="h-6 w-6 mr-2" />
                  <h3 className="text-lg font-semibold">
                    {isPro ? 'Passez Expert' : 'Passez Pro'}
                  </h3>
                </div>
                
                <p className="text-sm mb-4 opacity-90">
                  {isPro 
                    ? 'Maximisez votre visibilité avec 6 événements/mois et diffusion sur les réseaux sociaux'
                    : 'Multipliez par 6 vos photos et diffusez vos événements dans la newsletter'
                  }
                </p>

                <ul className="space-y-2 mb-4">
                  {isPro ? (
                    <>
                      <li className="text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>6 événements/mois (vs 3)</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>10 photos (vs 6)</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Diffusion réseaux sociaux</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>2 articles blog/an</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>6 photos (vs 1)</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Événements dans newsletter</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Badge vérifié</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Position prioritaire</span>
                      </li>
                    </>
                  )}
                </ul>

                <Link 
                  href="/pro/upgrade"
                  className="block w-full bg-white text-blue-600 py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-50 transition"
                >
                  Découvrir {isPro ? 'Expert' : 'Pro'}
                </Link>
              </div>
            )}

            {/* Carte Statistiques */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Statistiques du mois
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Vues</span>
                  </div>
                  <span className="text-lg font-semibold">247</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Clics téléphone</span>
                  </div>
                  <span className="text-lg font-semibold">18</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">Visites site web</span>
                  </div>
                  <span className="text-lg font-semibold">34</span>
                </div>

                <hr className="my-3" />

                {!isPro && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 flex items-start">
                      <Lock className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      Analytics détaillés disponibles avec le Plan Pro
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Articles blog (bonus annuel) */}
            {isPro && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <h2 className="text-lg font-semibold mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-orange-600" />
                  Articles Blog SEO
                </h2>
                
                <p className="text-sm text-gray-700 mb-3">
                  Bonus abonnement annuel
                </p>
                
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    {isExpert ? '2 articles' : '1 article'} optimisé(s) SEO avec lien vers votre site
                  </p>
                </div>
                
                {plan === 'basic' && (
                  <p className="text-xs text-orange-600 mt-2">
                    Disponible avec l'abonnement annuel Pro ou Expert
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Alerte TVA pour les plans payants */}
        {isPro && !establishment?.verified && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Vérification TVA requise
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Pour activer votre badge vérifié, veuillez fournir votre numéro de TVA.
                </p>
                <Link 
                  href="/pro/verification"
                  className="inline-flex items-center text-yellow-900 font-medium hover:underline"
                >
                  Compléter la vérification <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}