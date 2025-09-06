'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function AttenteConfirmationPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

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
        setMessage('Nouveau lien envoyé ! Vérifiez votre boîte mail et cliquez RAPIDEMENT sur le lien.');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Building2 className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Guide de Lyon</span>
          </Link>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirmation en attente
          </h1>
          <p className="text-gray-600">
            Un email de confirmation vous a été envoyé
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">
                  Important : Cliquez rapidement sur le lien !
                </p>
                <p className="text-blue-700">
                  Le lien de confirmation expire après 1 heure. 
                  Vérifiez votre boîte mail et cliquez sur le lien dès que possible.
                </p>
                <p className="text-blue-700 mt-2">
                  Vérifiez aussi vos spams si vous ne voyez pas l\'email.
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                <p className="text-sm text-green-700">{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Votre email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="contact@monentreprise.fr"
              />
            </div>

            <button
              onClick={handleResend}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Renvoyer le lien de confirmation
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Que faire ensuite ?
            </h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex">
                <span className="font-semibold mr-2">1.</span>
                Vérifiez votre boîte mail (et les spams)
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">2.</span>
                Cliquez rapidement sur le lien de confirmation
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">3.</span>
                Vous serez redirigé vers la connexion
              </li>
              <li className="flex">
                <span className="font-semibold mr-2">4.</span>
                Connectez-vous avec vos identifiants
              </li>
            </ol>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/pro/connexion" 
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}