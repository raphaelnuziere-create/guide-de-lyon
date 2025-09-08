'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';
import { LogIn, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function TestLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Comptes pré-remplis pour test rapide
  const TEST_ACCOUNTS = [
    { email: 'pro@test.com', password: '', label: 'Restaurant Le Gourmet Pro (votre compte)' },
    { email: 'test.basic@guide-lyon.fr', password: 'TestBasic123!', label: 'Test Basic' },
    { email: 'test.pro@guide-lyon.fr', password: 'TestPro123!', label: 'Test Pro' },
    { email: 'test.expert@guide-lyon.fr', password: 'TestExpert123!', label: 'Test Expert' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Email et mot de passe requis' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Se déconnecter d'abord
      await supabase.auth.signOut();
      
      // Attendre un peu
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tenter la connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else if (data.session) {
        setMessage({ type: 'success', text: 'Connexion réussie! Redirection...' });
        
        // Vérifier l'établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('name, plan')
          .eq('owner_id', data.session.user.id)
          .single();
        
        if (establishment) {
          setMessage({ 
            type: 'success', 
            text: `Connecté! ${establishment.name} (Plan ${establishment.plan})` 
          });
        }
        
        setTimeout(() => {
          router.push('/pro/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (account: typeof TEST_ACCOUNTS[0]) => {
    setEmail(account.email);
    if (account.password) {
      setPassword(account.password);
    }
    setMessage({ type: 'info', text: account.password ? 'Compte de test rempli' : 'Entrez votre mot de passe' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🔧 Test de Connexion</h1>
          <p className="text-gray-600 mt-2">Interface simplifiée pour tester les connexions</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pro@test.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="inline h-4 w-4 mr-1" />
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-700' :
                message.type === 'error' ? 'bg-red-50 text-red-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                {message.type === 'success' ? <CheckCircle className="h-4 w-4 mt-0.5" /> :
                 message.type === 'error' ? <AlertCircle className="h-4 w-4 mt-0.5" /> :
                 <AlertCircle className="h-4 w-4 mt-0.5" />}
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Comptes de test */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-3">Remplissage rapide:</p>
            <div className="space-y-2">
              {TEST_ACCOUNTS.map((account, idx) => (
                <button
                  key={idx}
                  onClick={() => quickFill(account)}
                  className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition-colors"
                >
                  <span className="font-medium">{account.email}</span>
                  <span className="text-gray-500 block text-xs">{account.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> Pour votre compte <code>pro@test.com</code>, utilisez le mot de passe que vous avez défini. 
              Les autres comptes de test doivent d'abord être créés via le script SQL.
            </p>
          </div>
        </div>

        {/* Liens */}
        <div className="mt-6 text-center space-y-2">
          <a href="/pro/dashboard" className="block text-blue-600 hover:underline text-sm">
            → Aller directement au dashboard
          </a>
          <a href="/dev/auth-diagnostic" className="block text-blue-600 hover:underline text-sm">
            → Page de diagnostic complet
          </a>
          <a href="/pro/inscription" className="block text-blue-600 hover:underline text-sm">
            → Créer un nouveau compte
          </a>
        </div>
      </div>
    </div>
  );
}