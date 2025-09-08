'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
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
  AlertCircle,
  Store,
  Loader2
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

type UserPlan = 'basic' | 'pro' | 'expert';

interface EstablishmentData {
  id: string;
  name: string;
  plan: UserPlan;
  phone?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  photos_count?: number;
  events_this_month?: number;
  views_this_month?: number;
  clicks_phone?: number;
  clicks_website?: number;
  verified?: boolean;
  status?: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [establishment, setEstablishment] = useState<EstablishmentData | null>(null);
  const [loadingEstablishment, setLoadingEstablishment] = useState(true);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Protection de route simplifiée
  useEffect(() => {
    // Attendre que le loading auth soit terminé
    if (authLoading) return;

    // Si pas d\'utilisateur après le chargement, rediriger
    if (!user) {
      console.log('[Dashboard] No user, redirecting to login');
      router.push('/auth/pro/connexion');
      return;
    }

    // Si utilisateur, charger les données establishment
    loadEstablishmentData();
  }, [user, authLoading]); // PAS de router dans les dépendances !

  const loadEstablishmentData = async () => {
    if (!user || !supabase) return;
    
    try {
      setLoadingEstablishment(true);
      console.log('[Dashboard] Loading establishment data for:', user.email);
      
      // Essayer d\'abord avec user_id
      let { data, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Si erreur de colonne, essayer avec owner_id
      if (error && error.message?.includes('column')) {
        console.log('[Dashboard] Trying with owner_id instead');
        const result = await supabase
          .from('establishments')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error && error.code !== 'PGRST116') {
        console.error('[Dashboard] Error loading establishment:', error);
        return;
      }

      if (!data) {
        console.log('[Dashboard] No establishment found, redirecting to inscription');
        router.push('/pro/inscription');
        return;
      }

      console.log('[Dashboard] Establishment loaded:', data.name);
      setEstablishment(data);
    } catch (error) {
      console.error('[Dashboard] Exception loading establishment:', error);
    } finally {
      setLoadingEstablishment(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('[Dashboard] Error logging out:', error);
    }
  };

  // Affichage pendant le chargement
  if (authLoading || loadingEstablishment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Si pas d\'utilisateur après chargement (ne devrait pas arriver grâce au useEffect)
  if (!user) {
    return null;
  }

  // Si pas d\'établissement, afficher un message
  if (!establishment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Aucun établissement trouvé</h2>
            <p className="text-gray-600 mb-6">
              Vous n\'avez pas encore créé d\'établissement. Commencez maintenant pour apparaître dans l\'annuaire.
            </p>
            <Link
              href="/pro/inscription"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer mon établissement
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const plan = establishment.plan || 'basic';
  const isPro = plan === 'pro' || plan === 'expert';
  const isExpert = plan === 'expert';

  // Limites selon les plans
  const limits = {
    basic: { photos: 1, events: 3 },
    pro: { photos: 6, events: 3 },
    expert: { photos: 20, events: 'Illimité' }
  };

  const currentLimits = limits[plan];

  // Render normal du dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  GL
                </div>
                <span className="font-bold text-xl text-gray-900">Guide de Lyon</span>
              </Link>
              <span className="ml-4 text-sm text-gray-500">Espace Pro</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec statut */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{establishment.name}</h1>
                {/* Badge du plan */}
                {isExpert ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    EXPERT
                  </span>
                ) : isPro ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    PRO
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
                    BASIC
                  </span>
                )}
                {/* Badge de statut */}
                {establishment.verified ? (
                  <span className="inline-flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="ml-1 text-sm">Vérifié</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center text-yellow-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="ml-1 text-sm">En attente de vérification</span>
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {establishment.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {establishment.phone}
                  </div>
                )}
                {establishment.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {establishment.email}
                  </div>
                )}
                {establishment.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    <a href={establishment.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      Site web
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link
                href="/pro/etablissement/edit"
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
              {!isPro && (
                <Link
                  href="/pro/upgrade"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Passer Pro
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vues ce mois</p>
                <p className="text-2xl font-bold">{establishment.views_this_month || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clics téléphone</p>
                <p className="text-2xl font-bold">{establishment.clicks_phone || 0}</p>
              </div>
              <Phone className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clics site web</p>
                <p className="text-2xl font-bold">{establishment.clicks_website || 0}</p>
              </div>
              <Globe className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Événements actifs</p>
                <p className="text-2xl font-bold">{establishment.events_this_month || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gestion du contenu */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-gray-600" />
                Gestion du contenu
              </h2>
              <div className="space-y-3">
                <Link
                  href="/pro/photos"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                  onMouseEnter={() => setHoveredSection('photos')}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <div className="flex items-center">
                    <Camera className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Photos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {establishment.photos_count || 0}/{currentLimits.photos}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
                
                <Link
                  href="/pro/evenements"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Événements</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {establishment.events_this_month || 0}/{currentLimits.events}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
                
                <Link
                  href="/pro/horaires"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Horaires</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Visibilité */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-gray-600" />
                Visibilité
              </h2>
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg ${isPro ? 'hover:bg-gray-50' : 'opacity-50'}`}>
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Page d\'accueil</span>
                  </div>
                  {isPro ? (
                    <span className="text-sm text-green-600">Actif</span>
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-lg ${isPro ? 'hover:bg-gray-50' : 'opacity-50'}`}>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Newsletter</span>
                  </div>
                  {isPro ? (
                    <span className="text-sm text-green-600">Inclus</span>
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-lg ${isExpert ? 'hover:bg-gray-50' : 'opacity-50'}`}>
                  <div className="flex items-center">
                    <Share2 className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Réseaux sociaux</span>
                  </div>
                  {isExpert ? (
                    <span className="text-sm text-green-600">Actif</span>
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Paramètres */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-600" />
                Paramètres
              </h2>
              <div className="space-y-3">
                <Link
                  href="/pro/settings"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Paramètres</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                
                <Link
                  href="/pro/horaires"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-3 text-gray-500" />
                    <span>Horaires d'ouverture</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                
                {!isPro && (
                  <Link
                    href="/pro/upgrade"
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition"
                  >
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 mr-3 text-blue-600" />
                      <span className="text-blue-900 font-medium">Passer Pro</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}