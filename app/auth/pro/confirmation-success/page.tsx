'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function ConfirmationSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Redirection automatique après 5 secondes
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/auth/pro/connexion');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8 text-center">
          {/* Icône de succès */}
          <div className="mx-auto flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Message principal */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Email confirmé avec succès !
          </h1>
          
          <p className="text-gray-600 mb-6">
            Votre adresse email a été vérifiée. Vous pouvez maintenant vous connecter à votre espace professionnel.
          </p>

          {/* Message important */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Important :</strong> Pour des raisons de sécurité, vous devez vous connecter avec vos identifiants pour accéder à votre compte.
            </p>
          </div>

          {/* Bouton de connexion */}
          <Link
            href="/auth/pro/connexion"
            className="w-full inline-flex justify-center items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mb-4"
          >
            Se connecter maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>

          {/* Redirection automatique */}
          <p className="text-sm text-gray-500">
            Redirection automatique dans {countdown} secondes...
          </p>
        </div>

        {/* Aide */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Problème de connexion ?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contactez le support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}