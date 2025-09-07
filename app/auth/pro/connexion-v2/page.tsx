'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Building2 } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

export default function ProConnexionV2Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (message: string) => {
    console.log(`[ConnexionV2] ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('[ConnexionV2] Submit déclenché');
    console.log('[ConnexionV2] Email:', email);
    
    if (!email || !password) {
      setError('Email et mot de passe requis');
      return;
    }
    
    setError('');
    setLoading(true);
    setDebugInfo([]);

    try {
      addDebug(`Tentative de connexion directe côté client pour: ${email}`);
      
      // Connexion directe avec Supabase côté client
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      addDebug(`Résultat connexion: ${signInError ? 'Erreur' : 'Succès'}`);
      
      if (signInError) {
        console.error('[ConnexionV2] Erreur:', signInError);
        addDebug(`Erreur: ${signInError.message}`);
        setError(signInError.message);
        return;
      }

      if (data.session) {
        addDebug(`Session créée avec succès pour: ${data.session.user.email}`);
        console.log('[ConnexionV2] Session créée:', data.session);
        
        // Vérifier que la session est bien stockée
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          addDebug('Session vérifiée et stockée localement');
          console.log('[ConnexionV2] Session vérifiée:', session);
          
          // Redirection après succès
          addDebug('Redirection vers dashboard...');
          setTimeout(() => {
            router.push('/pro/dashboard');
          }, 500);
        } else {
          addDebug('ERREUR: Session non persistée!');
          setError('Erreur de persistance de session');
        }
      } else {
        addDebug('Pas de session retournée');
        setError('Erreur de connexion');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Erreur de connexion';
      addDebug(`Exception: ${errorMsg}`);
      console.error('Erreur complète:', err);
      setError(errorMsg);
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
    addDebug(`Demande de reset pour: ${email}`);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'https://www.guide-de-lyon.fr/auth/reset-password',
      });

      if (error) {
        setError(error.message);
      } else {
        alert('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
      }
    } catch (err) {
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
            Connexion Pro (V2 - Direct)
          </h2>
          <p className="mt-2 text-gray-600">
            Version de test avec connexion directe côté client
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
                'Se connecter (Direct)'
              )}
            </button>

            {/* Lien mot de passe oublié */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </form>

          {/* Liens */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <Link 
              href="/auth/pro/inscription" 
              className="block w-full text-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              Créer un compte professionnel
            </Link>
            
            <Link 
              href="/auth/pro/connexion" 
              className="block text-center text-sm text-gray-600 hover:text-gray-900"
            >
              ← Retour à la connexion normale
            </Link>
          </div>

          {/* Debug info */}
          {debugInfo.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-xs font-mono text-gray-600 mb-2">Debug Info:</p>
              <div className="text-xs font-mono text-gray-500 space-y-1 max-h-32 overflow-y-auto">
                {debugInfo.map((info, i) => (
                  <div key={i}>{info}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}