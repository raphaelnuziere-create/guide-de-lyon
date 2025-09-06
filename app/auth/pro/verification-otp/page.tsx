'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Key, CheckCircle, AlertCircle } from 'lucide-react';

function VerificationOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Récupérer l'email et le token depuis l'URL si présents
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
    
    // Si on a les deux, vérifier automatiquement
    if (emailParam && tokenParam) {
      handleVerify(emailParam, tokenParam);
    }
  }, [searchParams]);

  const handleVerify = async (emailToVerify?: string, tokenToVerify?: string) => {
    const finalEmail = emailToVerify || email;
    const finalToken = tokenToVerify || token;
    
    if (!finalEmail || !finalToken) {
      setError('Email et code de vérification requis');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: finalEmail,
          token: finalToken,
          password: 'dummy', // Required by API structure
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(data.redirectTo || '/pro/inscription');
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white py-8 px-6 shadow-xl rounded-xl">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email confirmé !
            </h2>
            <p className="text-gray-600">
              Redirection vers votre espace pro...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Building2 className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Guide de Lyon</span>
          </Link>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Key className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Vérification manuelle
          </h1>
          <p className="mt-2 text-gray-600">
            Entrez le code reçu par email
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Astuce :</strong> Dans votre email, cherchez le lien de confirmation et copiez 
              la partie après <code className="bg-amber-100 px-1 rounded">token=</code>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="contact@monentreprise.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Code de vérification
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="pkce_abc123..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Le code commence généralement par "pkce_"
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Vérification...' : 'Vérifier mon email'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link 
              href="/auth/pro/attente-confirmation" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Retour à la page d'attente
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerificationOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <VerificationOtpContent />
    </Suspense>
  );
}