'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, CheckCircle, Users, TrendingUp } from 'lucide-react';
import { supabase, checkEstablishment } from '@/app/lib/supabase/client';

export default function InscriptionProPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // NE PAS rediriger automatiquement après inscription
    // L'utilisateur doit d'abord confirmer son email
    
    // Vérifier si déjà connecté (utilisateur existant)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setIsLoading(true);
        // Si déjà connecté, vérifier l'établissement
        const { hasEstablishment } = await checkEstablishment(session.user.id);
        
        if (hasEstablishment) {
          // A déjà un établissement, aller au dashboard
          router.push('/pro/dashboard');
        } else {
          // Pas d'établissement, aller créer un établissement
          router.push('/pro/inscription');
        }
        setIsLoading(false);
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full flex gap-8">
        {/* Section gauche - Marketing */}
        <div className="hidden lg:flex flex-col justify-center flex-1 text-gray-800">
          <h2 className="text-3xl font-bold mb-6">
            Rejoignez la communauté des professionnels lyonnais
          </h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-semibold">100% GRATUIT</h3>
                <p className="text-sm text-gray-600">Référencez votre établissement sans frais cachés</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="h-6 w-6 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold">Visibilité maximale</h3>
                <p className="text-sm text-gray-600">Touchez des milliers de visiteurs chaque mois</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-6 w-6 text-purple-500 mt-0.5" />
              <div>
                <h3 className="font-semibold">Développez votre activité</h3>
                <p className="text-sm text-gray-600">Publiez vos événements et actualités</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur p-4 rounded-lg">
            <p className="text-sm text-gray-700 italic">
              "Depuis que nous sommes sur Guide de Lyon, nous avons doublé notre clientèle touristique !"
            </p>
            <p className="text-xs text-gray-500 mt-2">- Restaurant Le Bouchon Lyonnais</p>
          </div>
        </div>

        {/* Section droite - Formulaire */}
        <div className="flex-1 max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center space-x-2 mb-4">
              <Building2 className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Guide de Lyon</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Créez votre compte professionnel
            </h1>
            <p className="mt-2 text-gray-600">
              Commencez à référencer votre établissement
            </p>
          </div>

          {/* Formulaire d'inscription */}
          <div className="bg-white py-8 px-6 shadow-xl rounded-xl relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Création du compte...</p>
                </div>
              </div>
            )}
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
                  sign_up: {
                    email_label: 'Email professionnel',
                    password_label: 'Mot de passe (min. 6 caractères)',
                    button_label: "Créer mon compte",
                    loading_button_label: 'Création du compte...',
                    email_input_placeholder: 'contact@monentreprise.fr',
                    password_input_placeholder: 'Choisissez un mot de passe sécurisé',
                  },
                },
              }}
              providers={[]}
              redirectTo={'https://www.guide-de-lyon.fr/auth/callback'}
              showLinks={false}
            />
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link href="/auth/pro/connexion" className="text-blue-600 hover:underline font-medium">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              En créant votre compte, vous acceptez nos{' '}
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
    </div>
  );
}