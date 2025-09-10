'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleEmailConfirmation();
  }, []);

  const handleEmailConfirmation = async () => {
    try {
      // Supabase gère automatiquement la confirmation via l'URL
      // On vérifie juste si l'utilisateur est connecté après la confirmation
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        setStatus('success');
        setMessage('Votre email a été confirmé avec succès !');
        
        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          router.push('/professionnel/dashboard');
        }, 3000);
      } else {
        // Si pas de session, vérifier dans l'URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          setStatus('success');
          setMessage('Email confirmé ! Redirection en cours...');
          setTimeout(() => {
            router.push('/professionnel/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Lien de confirmation invalide ou expiré');
        }
      }
    } catch (error: any) {
      console.error('Erreur confirmation:', error);
      setStatus('error');
      setMessage(error.message || 'Une erreur est survenue lors de la confirmation');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Confirmation en cours...
              </h2>
              <p className="text-gray-600">
                Veuillez patienter pendant que nous confirmons votre email
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email confirmé !
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <Link
                href="/professionnel/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Accéder au tableau de bord
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Erreur de confirmation
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Link
                  href="/pro/inscription"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Créer un nouveau compte
                </Link>
                <Link
                  href="/auth/pro/connexion"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center"
                >
                  Se connecter
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}