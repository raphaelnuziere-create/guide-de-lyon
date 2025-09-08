'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  User, 
  Database, 
  Shield,
  Key,
  Building2,
  LogIn,
  Settings,
  Zap,
  Crown,
  FileText,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface TestAccount {
  email: string;
  password: string;
  plan: 'basic' | 'pro' | 'expert';
  description: string;
  features: string[];
}

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
}

const TEST_ACCOUNTS: TestAccount[] = [
  {
    email: 'test.basic@guide-lyon.fr',
    password: 'TestBasic123!',
    plan: 'basic',
    description: 'Plan Basic - Fonctionnalités essentielles',
    features: ['1 photo', 'Horaires', 'Informations de base']
  },
  {
    email: 'test.pro@guide-lyon.fr',
    password: 'TestPro123!',
    plan: 'pro',
    description: 'Plan Pro - Fonctionnalités avancées',
    features: ['6 photos', '3 événements/mois', 'Badge vérifié', 'Statistiques']
  },
  {
    email: 'test.expert@guide-lyon.fr',
    password: 'TestExpert123!',
    plan: 'expert',
    description: 'Plan Expert - Toutes les fonctionnalités',
    features: ['Photos illimitées', '10 événements/mois', 'Mise en avant', 'Stats avancées']
  }
];

export default function AuthDiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [testingAccount, setTestingAccount] = useState<string | null>(null);
  const [manualTest, setManualTest] = useState({ email: '', password: '' });

  useEffect(() => {
    checkCurrentAuth();
  }, []);

  const checkCurrentAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user || null);
    
    if (session?.user) {
      // Chercher l'établissement associé
      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', session.user.id)
        .single();
      
      setBusinessData(business);
    }
  };

  const runDiagnostics = async () => {
    setRunning(true);
    setDiagnostics([]);
    const results: DiagnosticResult[] = [];

    // 1. Test de connexion à Supabase
    results.push({ test: 'Connexion Supabase', status: 'pending', message: 'Test en cours...' });
    setDiagnostics([...results]);
    
    try {
      const { data, error } = await supabase.from('businesses').select('count').limit(1);
      results[results.length - 1] = {
        test: 'Connexion Supabase',
        status: error ? 'error' : 'success',
        message: error ? `Erreur: ${error.message}` : 'Connexion établie',
        details: { data, error }
      };
    } catch (e: any) {
      results[results.length - 1] = {
        test: 'Connexion Supabase',
        status: 'error',
        message: `Exception: ${e.message}`
      };
    }
    setDiagnostics([...results]);

    // 2. Test de la session actuelle
    results.push({ test: 'Session actuelle', status: 'pending', message: 'Vérification...' });
    setDiagnostics([...results]);
    
    const { data: { session } } = await supabase.auth.getSession();
    results[results.length - 1] = {
      test: 'Session actuelle',
      status: session ? 'success' : 'warning',
      message: session ? `Connecté: ${session.user.email}` : 'Aucune session active',
      details: session
    };
    setDiagnostics([...results]);

    // 3. Test de la table businesses
    results.push({ test: 'Table businesses', status: 'pending', message: 'Vérification...' });
    setDiagnostics([...results]);
    
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, email, plan')
        .limit(5);
      
      results[results.length - 1] = {
        test: 'Table businesses',
        status: error ? 'error' : 'success',
        message: error ? `Erreur: ${error.message}` : `${data?.length || 0} établissements trouvés`,
        details: data
      };
    } catch (e: any) {
      results[results.length - 1] = {
        test: 'Table businesses',
        status: 'error',
        message: `Exception: ${e.message}`
      };
    }
    setDiagnostics([...results]);

    // 4. Test de la relation user-business
    if (session) {
      results.push({ test: 'Relation User-Business', status: 'pending', message: 'Vérification...' });
      setDiagnostics([...results]);
      
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', session.user.id)
          .single();
        
        results[results.length - 1] = {
          test: 'Relation User-Business',
          status: error ? 'warning' : 'success',
          message: error ? 'Aucun établissement lié' : `Établissement: ${data.name}`,
          details: data
        };
      } catch (e: any) {
        results[results.length - 1] = {
          test: 'Relation User-Business',
          status: 'warning',
          message: 'Aucun établissement trouvé pour cet utilisateur'
        };
      }
      setDiagnostics([...results]);
    }

    // 5. Test des comptes de test existants
    results.push({ test: 'Comptes de test', status: 'pending', message: 'Recherche...' });
    setDiagnostics([...results]);
    
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('email, name, plan, owner_id')
        .in('email', TEST_ACCOUNTS.map(a => a.email));
      
      results[results.length - 1] = {
        test: 'Comptes de test',
        status: data && data.length > 0 ? 'success' : 'warning',
        message: data && data.length > 0 
          ? `${data.length}/${TEST_ACCOUNTS.length} comptes de test trouvés` 
          : 'Aucun compte de test trouvé - Exécutez le script SQL',
        details: data
      };
    } catch (e: any) {
      results[results.length - 1] = {
        test: 'Comptes de test',
        status: 'error',
        message: `Erreur: ${e.message}`
      };
    }
    setDiagnostics([...results]);

    setRunning(false);
  };

  const testLogin = async (account: TestAccount) => {
    setTestingAccount(account.email);
    
    try {
      // Se déconnecter d'abord
      await supabase.auth.signOut();
      
      // Tenter la connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (error) {
        alert(`Erreur de connexion: ${error.message}`);
      } else {
        alert(`Connexion réussie! Redirection vers le dashboard...`);
        window.location.href = '/pro/dashboard';
      }
    } catch (e: any) {
      alert(`Exception: ${e.message}`);
    } finally {
      setTestingAccount(null);
    }
  };

  const testManualLogin = async () => {
    if (!manualTest.email || !manualTest.password) {
      alert('Email et mot de passe requis');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: manualTest.email,
        password: manualTest.password
      });

      if (error) {
        alert(`Erreur: ${error.message}`);
      } else {
        alert('Connexion réussie!');
        await checkCurrentAuth();
      }
    } catch (e: any) {
      alert(`Exception: ${e.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setBusinessData(null);
    alert('Déconnexion réussie');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papier!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <RefreshCw className="h-5 w-5 text-gray-500 animate-spin" />;
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'expert': return <Crown className="h-5 w-5 text-purple-600" />;
      case 'pro': return <Zap className="h-5 w-5 text-blue-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Diagnostic d'Authentification
          </h1>
          <p className="text-gray-600">
            Outil de diagnostic et de test pour le système d'authentification
          </p>
        </div>

        {/* État actuel */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            État actuel
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Utilisateur connecté</p>
              <p className="font-medium">
                {currentUser ? currentUser.email : 'Non connecté'}
              </p>
              {currentUser && (
                <p className="text-xs text-gray-500 mt-1">
                  ID: {currentUser.id}
                </p>
              )}
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Établissement</p>
              <p className="font-medium">
                {businessData ? businessData.name : 'Aucun'}
              </p>
              {businessData && (
                <p className="text-xs text-gray-500 mt-1">
                  Plan: {businessData.plan} | ID: {businessData.id}
                </p>
              )}
            </div>
          </div>

          {currentUser && (
            <button
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Se déconnecter
            </button>
          )}
        </div>

        {/* Tests de diagnostic */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Tests de diagnostic
            </h2>
            <button
              onClick={runDiagnostics}
              disabled={running}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                running 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {running ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Tests en cours...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Lancer les tests
                </>
              )}
            </button>
          </div>

          {diagnostics.length > 0 && (
            <div className="space-y-2">
              {diagnostics.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {diagnostics.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Cliquez sur "Lancer les tests" pour démarrer le diagnostic
            </p>
          )}
        </div>

        {/* Comptes de test */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Key className="h-5 w-5" />
              Comptes de test prédéfinis
            </h2>
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-gray-600 hover:text-gray-900"
            >
              {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {TEST_ACCOUNTS.map((account) => (
              <div 
                key={account.email}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  {getPlanIcon(account.plan)}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    account.plan === 'expert' ? 'bg-purple-100 text-purple-700' :
                    account.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    Plan {account.plan.charAt(0).toUpperCase() + account.plan.slice(1)}
                  </span>
                </div>
                
                <h3 className="font-semibold mb-2">{account.description}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email:</span>
                    <button
                      onClick={() => copyToClipboard(account.email)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="h-3 w-3" />
                      <span className="text-xs">{account.email}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Mot de passe:</span>
                    <button
                      onClick={() => copyToClipboard(account.password)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="h-3 w-3" />
                      <span className="text-xs font-mono">
                        {showPasswords ? account.password : '••••••••'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
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
                  onClick={() => testLogin(account)}
                  disabled={testingAccount === account.email}
                  className={`w-full mt-4 px-3 py-2 rounded-lg font-medium text-sm ${
                    testingAccount === account.email
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {testingAccount === account.email ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Connexion...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Tester la connexion
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Test manuel */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Test de connexion manuel
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={manualTest.email}
                onChange={(e) => setManualTest({ ...manualTest, email: e.target.value })}
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
                value={manualTest.password}
                onChange={(e) => setManualTest({ ...manualTest, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button
            onClick={testManualLogin}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Tester la connexion
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Instructions d'utilisation
          </h2>
          
          <div className="space-y-3 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">1. Configuration initiale:</p>
              <ul className="ml-6 space-y-1 list-disc">
                <li>Exécutez le script SQL <code className="bg-blue-100 px-1 rounded">setup-test-accounts.sql</code> dans Supabase</li>
                <li>Créez les 3 utilisateurs de test dans Supabase Auth</li>
                <li>Remplacez les USER_ID dans le script SQL par les vrais IDs</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-1">2. Tests de diagnostic:</p>
              <ul className="ml-6 space-y-1 list-disc">
                <li>Cliquez sur "Lancer les tests" pour vérifier la configuration</li>
                <li>Vérifiez que tous les tests sont verts</li>
                <li>Si des tests échouent, vérifiez votre configuration Supabase</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-1">3. Test des connexions:</p>
              <ul className="ml-6 space-y-1 list-disc">
                <li>Utilisez les comptes de test prédéfinis</li>
                <li>Cliquez sur "Tester la connexion" pour chaque plan</li>
                <li>Vérifiez que le dashboard s'affiche correctement</li>
                <li>Testez les limitations de chaque plan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}