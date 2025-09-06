'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  TrendingUp, 
  Calendar, 
  Users, 
  Star, 
  MessageSquare,
  Camera,
  Settings,
  BarChart3,
  Eye,
  MousePointer,
  Heart,
  Share2,
  Bell,
  CreditCard,
  Sparkles,
  Lock,
  ChevronRight,
  Plus,
  Edit,
  Image as ImageIcon,
  FileText,
  Megaphone,
  Crown,
  Zap,
  CheckIcon
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

type UserPlan = 'basic' | 'pro' | 'premium';

interface DashboardStats {
  views: number;
  clicks: number;
  favorites: number;
  shares: number;
  rating: number;
  reviews: number;
}

export default function DashboardPro() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [establishment, setEstablishment] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<UserPlan>('basic');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    views: 1247,
    clicks: 89,
    favorites: 34,
    shares: 12,
    rating: 4.5,
    reviews: 23
  });

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

    // Récupérer l'établissement
    const { data: establishmentData } = await supabase
      .from('establishments')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!establishmentData) {
      router.push('/pro/inscription');
      return;
    }

    setEstablishment(establishmentData);
    // Pour l'instant, on simule le plan (à récupérer depuis la DB)
    setUserPlan(establishmentData.plan || 'basic');
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  const isPro = userPlan === 'pro' || userPlan === 'premium';
  const isPremium = userPlan === 'premium';

  return (
    <div className="min-h-screen bg-gray-50">
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
              <span className="text-gray-600 font-medium">Espace Pro</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Badge Plan */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPremium ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                isPro ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {isPremium && <Crown className="inline h-3 w-3 mr-1" />}
                {userPlan === 'basic' ? 'Plan Basic' : userPlan === 'pro' ? 'Plan Pro' : 'Plan Premium'}
              </div>

              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              <Link 
                href="/pro/settings"
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Bienvenue, {establishment?.name || 'Votre établissement'} !
              </h1>
              <p className="text-blue-100">
                Votre dashboard pour gérer votre présence sur Guide de Lyon
              </p>
            </div>
            <div className="hidden md:block">
              <Sparkles className="h-16 w-16 text-white/30" />
            </div>
          </div>

          {!isPro && (
            <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
              <p className="text-sm mb-2">
                <Zap className="inline h-4 w-4 mr-1" />
                Débloquez plus de fonctionnalités avec le Plan Pro
              </p>
              <Link 
                href="/pro/upgrade"
                className="inline-flex items-center text-white font-medium hover:underline"
              >
                Découvrir les avantages <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <Eye className="h-8 w-8 text-blue-500" />
              <span className="text-xs text-green-600 font-medium">+12%</span>
            </div>
            <p className="text-2xl font-bold">{stats.views.toLocaleString()}</p>
            <p className="text-gray-600 text-sm">Vues ce mois</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <MousePointer className="h-8 w-8 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+8%</span>
            </div>
            <p className="text-2xl font-bold">{stats.clicks}</p>
            <p className="text-gray-600 text-sm">Clics sur contact</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-xs text-green-600 font-medium">+5</span>
            </div>
            <p className="text-2xl font-bold">{stats.favorites}</p>
            <p className="text-gray-600 text-sm">Favoris</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <Star className="h-8 w-8 text-yellow-500" />
              <span className="text-xs text-gray-500">{stats.reviews} avis</span>
            </div>
            <p className="text-2xl font-bold">{stats.rating}</p>
            <p className="text-gray-600 text-sm">Note moyenne</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Actions rapides
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  href="/pro/etablissement/edit"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <Edit className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium">Modifier ma fiche</p>
                    <p className="text-sm text-gray-500">Infos, horaires, contact</p>
                  </div>
                </Link>

                <Link 
                  href="/pro/photos"
                  className={`flex items-center p-4 rounded-lg transition ${
                    isPro ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={(e) => !isPro && e.preventDefault()}
                >
                  <ImageIcon className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium">Gérer mes photos</p>
                    <p className="text-sm text-gray-500">
                      {isPro ? 'Galerie illimitée' : '1 photo (Pro: illimité)'}
                    </p>
                  </div>
                  {!isPro && <Lock className="h-4 w-4 text-gray-400 ml-auto" />}
                </Link>

                <Link 
                  href="/pro/events"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <Calendar className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium">Mes événements</p>
                    <p className="text-sm text-gray-500">
                      {isPro ? 'Illimités' : '3/mois'}
                    </p>
                  </div>
                </Link>

                <Link 
                  href="/pro/blog"
                  className={`flex items-center p-4 rounded-lg transition ${
                    isPro ? 'bg-gray-50 hover:bg-gray-100' : 'bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={(e) => !isPro && e.preventDefault()}
                >
                  <FileText className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium">Articles blog</p>
                    <p className="text-sm text-gray-500">
                      {isPro ? 'Créer des articles' : 'Pro uniquement'}
                    </p>
                  </div>
                  {!isPro && <Lock className="h-4 w-4 text-gray-400 ml-auto" />}
                </Link>
              </div>
            </div>

            {/* Premium Features */}
            {isPro && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Crown className="h-5 w-5 mr-2 text-purple-600" />
                  Outils Pro
                </h2>
                
                <div className="space-y-3">
                  <Link 
                    href="/pro/newsletter"
                    className={`flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition ${
                      !isPremium && 'opacity-75'
                    }`}
                  >
                    <div className="flex items-center">
                      <Megaphone className="h-5 w-5 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium">Newsletter</p>
                        <p className="text-sm text-gray-500">
                          {isPremium ? 'Envoyez vos actualités' : 'Premium uniquement'}
                        </p>
                      </div>
                    </div>
                    {isPremium ? (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </Link>

                  <Link 
                    href="/pro/analytics"
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium">Analytics avancés</p>
                        <p className="text-sm text-gray-500">Statistiques détaillées</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>

                  <Link 
                    href="/pro/reviews"
                    className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium">Gestion des avis</p>
                        <p className="text-sm text-gray-500">Répondre aux clients</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">Nouvel avis 5 étoiles de <span className="font-medium">Marie D.</span></p>
                    <p className="text-xs text-gray-500">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">23 nouvelles vues sur votre fiche</p>
                    <p className="text-xs text-gray-500">Aujourd'hui</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">Votre événement "Soirée Jazz" commence dans 3 jours</p>
                    <p className="text-xs text-gray-500">Rappel</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Upgrade Card */}
            {!isPremium && (
              <div className={`rounded-xl p-6 text-white shadow-lg ${
                isPro 
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
                  : 'bg-gradient-to-br from-blue-600 to-purple-600'
              }`}>
                <h3 className="text-lg font-semibold mb-2">
                  {isPro ? 'Passez au Premium' : 'Passez au Pro'}
                </h3>
                <p className="text-sm mb-4 opacity-90">
                  {isPro 
                    ? 'Accédez à la newsletter et à tous les outils marketing'
                    : 'Débloquez les photos illimitées, articles blog et plus'
                  }
                </p>
                <ul className="space-y-2 mb-4">
                  {isPro ? (
                    <>
                      <li className="text-sm flex items-center">
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Newsletter 5000+ abonnés
                      </li>
                      <li className="text-sm flex items-center">
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Bannière publicitaire
                      </li>
                      <li className="text-sm flex items-center">
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Support prioritaire
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="text-sm flex items-center">
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Photos illimitées
                      </li>
                      <li className="text-sm flex items-center">
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Articles blog SEO
                      </li>
                      <li className="text-sm flex items-center">
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Analytics avancés
                      </li>
                    </>
                  )}
                </ul>
                <Link 
                  href="/pro/upgrade"
                  className="block w-full bg-white text-blue-600 py-2 px-4 rounded-lg text-center font-medium hover:bg-gray-50 transition"
                >
                  Upgrader maintenant
                </Link>
              </div>
            )}

            {/* Support Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Besoin d'aide ?</h3>
              <div className="space-y-3">
                <Link 
                  href="/pro/guide"
                  className="flex items-center text-gray-700 hover:text-blue-600"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Guide d'utilisation
                </Link>
                <Link 
                  href="/pro/faq"
                  className="flex items-center text-gray-700 hover:text-blue-600"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  FAQ
                </Link>
                <Link 
                  href="/contact"
                  className="flex items-center text-gray-700 hover:text-blue-600"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Contacter le support
                </Link>
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
                Astuce du jour
              </h3>
              <p className="text-sm text-gray-700">
                Les fiches avec au moins 5 photos ont <span className="font-medium">3x plus de clics</span>. 
                {!isPro && ' Passez au Pro pour ajouter plus de photos !'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}