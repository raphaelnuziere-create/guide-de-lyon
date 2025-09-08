'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';
import { 
  Shield, 
  Zap, 
  Crown, 
  LogIn, 
  User,
  Building2,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface QuickAccount {
  email: string;
  password: string;
  plan: 'basic' | 'pro' | 'expert';
  name: string;
  color: string;
  icon: any;
  features: string[];
}

const QUICK_ACCOUNTS: QuickAccount[] = [
  {
    email: 'test.basic@guide-lyon.fr',
    password: 'TestBasic123!',
    plan: 'basic',
    name: 'Restaurant Test Basic',
    color: 'gray',
    icon: Shield,
    features: ['1 photo', 'Horaires', 'Infos de base', 'Page établissement']
  },
  {
    email: 'test.pro@guide-lyon.fr',
    password: 'TestPro123!',
    plan: 'pro',
    name: 'Boutique Test Pro',
    color: 'blue',
    icon: Zap,
    features: ['6 photos', '3 événements/mois', 'Badge vérifié', 'Statistiques', 'Réseaux sociaux']
  },
  {
    email: 'test.expert@guide-lyon.fr',
    password: 'TestExpert123!',
    plan: 'expert',
    name: 'Hôtel Test Expert',
    color: 'purple',
    icon: Crown,
    features: ['Photos illimitées', '10 événements/mois', 'Mise en avant', 'Stats avancées', 'Support prioritaire']
  }
];

// Votre compte existant
const EXISTING_ACCOUNT = {
  email: 'pro@test.com',
  password: '', // À remplir si vous connaissez le mot de passe
  plan: 'unknown',
  name: 'Restaurant Le Gourmet Pro',
  description: 'Compte existant dans votre base'
};

export default function QuickLoginPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [customLogin, setCustomLogin] = useState({ email: '', password: '' });

  useEffect(() => {
    checkCurrentSession();
  }, []);

  const checkCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
    
    if (session?.user) {
      // Chercher l'établissement
      const { data: business } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', session.user.id)
        .single();
      
      setBusinessData(business);
    }
  };

  const quickLogin = async (account: QuickAccount | typeof EXISTING_ACCOUNT) => {
    if (!account.password && account === EXISTING_ACCOUNT) {
      setMessage({ 
        type: 'error', 
        text: 'Mot de passe requis pour ce compte. Utilisez la connexion personnalisée.' 
      });
      return;
    }

    setLoading(account.email);
    setMessage(null);

    try {
      // Se déconnecter d'abord
      await supabase.auth.signOut();
      
      // Attendre un peu pour que la déconnexion soit effective
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tenter la connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (error) {
        setMessage({ type: 'error', text: `Erreur: ${error.message}` });
        
        // Si le compte n'existe pas, proposer de le créer
        if (error.message.includes('Invalid login credentials')) {
          setMessage({ 
            type: 'info', 
            text: 'Ce compte n\'existe pas. Créez-le d\'abord via le script SQL ou l\'inscription.' 
          });
        }
      } else {
        setMessage({ type: 'success', text: 'Connexion réussie! Redirection...' });
        
        // Attendre un peu pour que le message soit visible
        setTimeout(() => {
          router.push('/pro/dashboard');
        }, 1500);
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: `Exception: ${e.message}` });
    } finally {
      setLoading(null);
    }
  };

  const handleCustomLogin = async () => {
    if (!customLogin.email || !customLogin.password) {
      setMessage({ type: 'error', text: 'Email et mot de passe requis' });
      return;
    }

    setLoading('custom');
    setMessage(null);

    try {
      // Se déconnecter d'abord
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: customLogin.email,
        password: customLogin.password
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Connexion réussie!' });
        await checkCurrentSession();
        setTimeout(() => {
          router.push('/pro/dashboard');
        }, 1500);
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setBusinessData(null);
    setMessage({ type: 'info', text: 'Déconnexion réussie' });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'info', text: `${label} copié!` });
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⚡ Connexion Rapide - Tests
          </h1>
          <p className="text-gray-600">
            Interface de connexion rapide pour tester les différents plans
          </p>
        </div>

        {/* Session actuelle */}
        {currentUser && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <User className="h-5 w-5" />
                  Session active
                </h2>
                <p className="text-gray-600">
                  Connecté: <span className="font-medium">{currentUser.email}</span>
                </p>
                {businessData && (
                  <p className="text-sm text-gray-500 mt-1">
                    Établissement: {businessData.name} (Plan {businessData.plan})
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/pro/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : 
             message.type === 'error' ? <AlertCircle className="h-5 w-5" /> :
             <AlertCircle className="h-5 w-5" />}
            {message.text}
          </div>
        )}

        {/* Comptes de test rapides */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Comptes de Test Prédéfinis</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {QUICK_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              return (
                <div 
                  key={account.email}
                  className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all ${
                    loading === account.email ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`h-8 w-8 text-${account.color}-600`} />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${account.plan === 'expert' ? 'bg-purple-100 text-purple-700' :
                        account.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'}`}>
                      Plan {account.plan.charAt(0).toUpperCase() + account.plan.slice(1)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{account.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Email:</span>
                      <button
                        onClick={() => copyToClipboard(account.email, 'Email')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="h-3 w-3" />
                        <span className="font-mono text-xs">{account.email}</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Mot de passe:</span>
                      <button
                        onClick={() => copyToClipboard(account.password, 'Mot de passe')}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="h-3 w-3" />
                        <span className="font-mono text-xs">{account.password}</span>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Fonctionnalités:</p>
                    <div className="flex flex-wrap gap-1">
                      {account.features.map((feature, idx) => (
                        <span 
                          key={idx}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => quickLogin(account)}
                    disabled={loading === account.email}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      loading === account.email
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : account.plan === 'expert' 
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : account.plan === 'pro'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {loading === account.email ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Connexion...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Se connecter
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compte existant */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Votre Compte Existant</h2>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {EXISTING_ACCOUNT.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{EXISTING_ACCOUNT.description}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-mono">{EXISTING_ACCOUNT.email}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">Mot de passe</p>
                <p className="text-sm text-gray-500">À définir manuellement</p>
              </div>
            </div>

            <p className="text-sm text-amber-600 mb-4">
              ⚠️ Pour utiliser ce compte, entrez le mot de passe dans la section "Connexion personnalisée" ci-dessous
            </p>
          </div>
        </div>

        {/* Connexion personnalisée */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold mb-4">Connexion Personnalisée</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={customLogin.email}
                onChange={(e) => setCustomLogin({ ...customLogin, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pro@test.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={customLogin.password}
                onChange={(e) => setCustomLogin({ ...customLogin, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            onClick={handleCustomLogin}
            disabled={loading === 'custom'}
            className={`px-6 py-3 rounded-lg font-medium ${
              loading === 'custom'
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {loading === 'custom' ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Connexion...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Se connecter
              </span>
            )}
          </button>

          {/* Boutons rapides pour remplir */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Remplissage rapide:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCustomLogin({ email: 'pro@test.com', password: '' })}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                pro@test.com
              </button>
              {QUICK_ACCOUNTS.map(account => (
                <button
                  key={account.email}
                  onClick={() => setCustomLogin({ email: account.email, password: account.password })}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {account.plan}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="mt-8 text-center space-x-4">
          <a 
            href="/dev/auth-diagnostic"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Page de diagnostic
          </a>
          <a 
            href="/pro/inscription"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Créer un compte
          </a>
          <a 
            href="/auth/reset-password"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Mot de passe oublié
          </a>
        </div>
      </div>
    </div>
  );
}