'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Lock, Mail, AlertCircle, RefreshCw } from 'lucide-react';

function ConnexionProContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);
  
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    
    if (errorParam === 'access_denied' && errorCode === 'otp_expired') {
      setError('Le lien de confirmation a expiré. Cliquez rapidement sur le lien dans votre email.');
      setShowResendLink(true);
    } else if (errorParam) {
      setError('Erreur de connexion. Veuillez réessayer.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signin',
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(data.redirectTo);
      } else {
        setError(data.error);
        // Si invalid credentials, proposer reset
        if (data.error.includes('Invalid login credentials')) {
          setShowReset(true);
        }
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          email,
          password: 'dummy',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setError('');
        setShowReset(false);
        alert('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Veuillez entrer votre email pour renvoyer le lien');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend',
          email,
          password: 'dummy',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setError('');
        setShowResendLink(false);
        alert('Nouveau lien envoyé ! Cliquez RAPIDEMENT sur le lien dans votre email (valide 1h).');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi du lien');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Building2 className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Guide de Lyon</span>
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Connexion Espace Pro
          </h1>
          <p className="mt-2 text-gray-600">
            Accédez à votre tableau de bord professionnel
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="mt-2 text-sm text-blue-600 hover:underline block"
                      >
                        → Réinitialiser mon mot de passe
                      </button>
                    )}
                    {showResendLink && (
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Renvoyer un nouveau lien de confirmation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Email professionnel
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@monentreprise.fr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Pas encore de compte professionnel ?
            </p>
            <Link 
              href="/auth/pro/inscription" 
              className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionProPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <ConnexionProContent />
    </Suspense>
  );
}