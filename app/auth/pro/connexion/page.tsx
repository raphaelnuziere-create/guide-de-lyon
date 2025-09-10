'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Building2, RefreshCw } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';
import { clearAuthCache } from '@/app/lib/utils/cache-control';
import { setupAuthStateListener, getSessionWithRetry } from '@/app/lib/utils/auth-persistence';

export default function ProConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Vérifier et nettoyer le cache si problème détecté
  useEffect(() => {
    // Configurer l'écoute des changements d'auth
    setupAuthStateListener();
    
    const checkSession = async () => {
      // Utiliser la fonction avec retry pour plus de robustesse
      const session = await getSessionWithRetry();
      if (session) {
        router.push('/pro/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleClearCache = () => {
    clearAuthCache();
    setCacheCleared(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email et mot de passe requis');
      return;
    }
    
    setError('');
    setLoading(true);
    setShowReset(false);

    try {
      // Connexion directe avec Supabase côté client
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (signInError) {
        setError(signInError.message);
        
        // Si erreur de credentials, proposer reset
        if (signInError.message.toLowerCase().includes('invalid') || 
            signInError.message.toLowerCase().includes('credentials')) {
          setShowReset(true);
        }
        return;
      }

      if (data.session) {
        // Redirection après succès
        router.push('/pro/dashboard');
      } else {
        setError('Erreur de connexion');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError('Veuillez entrer votre email pour réinitialiser le mot de passe');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://www.guide-de-lyon.fr/auth/reset-password',
      });

      if (error) {
        setError(error.message);
      } else {
        setShowReset(false);
        alert('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
      }
    } catch (err: any) {
      setError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Building2 className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">
            Connexion Professionnelle
          </h2>
          <p className="mt-2 text-gray-600">
            Accédez à votre espace pro Guide de Lyon
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Affichage des erreurs */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                    {showReset && (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Réinitialiser mon mot de passe
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email professionnel
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="votre@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-50"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>

            {/* Liens utiles */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Mot de passe oublié ?
              </button>
              
              <button
                type="button"
                onClick={handleClearCache}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                title="Si vous avez des problèmes de connexion"
              >
                <RefreshCw className="w-3 h-3" />
                Problème de connexion ?
              </button>
            </div>
            
            {cacheCleared && (
              <div className="mt-3 p-2 bg-green-50 text-green-700 text-sm rounded-lg text-center">
                Cache nettoyé, rechargement...
              </div>
            )}
          </form>

          {/* Lien inscription */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Pas encore de compte ?
            </p>
            <Link 
              href="/auth/pro/signup" 
              className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              Créer un compte professionnel
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}