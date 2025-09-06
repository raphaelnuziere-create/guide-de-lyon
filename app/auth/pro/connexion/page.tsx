'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase, checkEstablishment } from '@/app/lib/supabase/client';

function ConnexionProContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isConfirmed = searchParams.get('confirmed') === 'true';
  const hasError = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoading(true);
        // Vérifier si l'utilisateur a déjà un établissement
        const { hasEstablishment } = await checkEstablishment(session.user.id);
        
        if (hasEstablishment) {
          // Si établissement existe, aller au dashboard
          router.push('/pro/dashboard');
        } else {
          // Sinon, aller à la page d'inscription établissement
          router.push('/pro/inscription');
        }
        setIsLoading(false);
      }
    });

    // Vérifier si déjà connecté
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setIsLoading(true);
        // Même logique : vérifier l'établissement
        const { hasEstablishment } = await checkEstablishment(session.user.id);
        
        if (hasEstablishment) {
          router.push('/pro/dashboard');
        } else {
          router.push('/pro/inscription');
        }
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
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

        {/* Message de confirmation si email validé */}
        {isConfirmed && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-green-900">
                  Email confirmé avec succès !
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Vous pouvez maintenant vous connecter avec vos identifiants.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Message d'erreur si problème */}
        {hasError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">
                  Erreur de connexion
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {hasError === 'auth_failed' 
                    ? 'Authentification échouée. Vérifiez vos identifiants.'
                    : 'Une erreur inattendue s\'est produite. Veuillez réessayer.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de connexion */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Connexion en cours...</p>
              </div>
            </div>
          )}
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
              className: {
                container: 'w-full',
                label: 'text-gray-700 text-sm font-medium mb-2',
                button: 'w-full px-4 py-2 rounded-lg font-medium transition',
                input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email professionnel',
                  password_label: 'Mot de passe',
                  button_label: 'Se connecter',
                  loading_button_label: 'Connexion en cours...',
                  email_input_placeholder: 'contact@monentreprise.fr',
                  password_input_placeholder: 'Votre mot de passe',
                },
                forgotten_password: {
                  link_text: 'Mot de passe oublié ?',
                  email_label: 'Email',
                  button_label: 'Envoyer les instructions',
                  loading_button_label: 'Envoi...',
                },
              },
            }}
            providers={[]}
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback'}
            showLinks={false}
          />
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Pas encore de compte professionnel ?
            </p>
            <Link 
              href="/auth/pro/inscription" 
              className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Créer mon compte gratuitement
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="space-x-4 text-sm">
            <Link href="/mentions-legales" className="text-gray-500 hover:text-gray-700">
              Mentions légales
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="text-gray-500 hover:text-gray-700">
              Support
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Retour à l'accueil
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