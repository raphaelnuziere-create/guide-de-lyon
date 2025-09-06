'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2 } from 'lucide-react';

// Client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthProPage() {
  const router = useRouter();

  useEffect(() => {
    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Vérifier si l'utilisateur a déjà un établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (establishment) {
          // Si établissement existe, aller au dashboard
          router.push('/pro/dashboard');
        } else {
          // Sinon, aller à la page d'inscription établissement
          router.push('/pro/inscription');
        }
      }
    });

    // Vérifier si déjà connecté
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Même logique : vérifier l'établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (establishment) {
          router.push('/pro/dashboard');
        } else {
          router.push('/pro/inscription');
        }
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
          <h1 className="text-3xl font-bold text-gray-900">
            Espace Professionnel
          </h1>
          <p className="mt-2 text-gray-600">
            Connectez-vous ou créez votre compte professionnel
          </p>
        </div>

        {/* Message marketing */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg mb-6">
          <h2 className="text-lg font-bold mb-1">🚀 Référencez votre entreprise GRATUITEMENT !</h2>
          <p className="text-sm opacity-95">
            Rejoignez des centaines de professionnels lyonnais et augmentez votre visibilité
          </p>
        </div>

        {/* Supabase Auth UI */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <Auth
            supabaseClient={supabase}
            view="sign_up"
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
                  loading_button_label: 'Connexion...',
                  link_text: "Pas encore de compte ? Inscrivez-vous",
                },
                sign_up: {
                  email_label: 'Email professionnel',
                  password_label: 'Mot de passe',
                  button_label: "S'inscrire",
                  loading_button_label: 'Inscription...',
                  link_text: 'Déjà un compte ? Connectez-vous',
                  email_input_placeholder: 'votre@email.com',
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
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            En vous inscrivant, vous acceptez nos{' '}
            <Link href="/mentions-legales" className="text-blue-600 hover:underline">
              conditions d'utilisation
            </Link>
          </p>
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