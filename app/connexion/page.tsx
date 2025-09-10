// GUIDE DE LYON - PAGE CONNEXION
// Générée automatiquement le 10/09/2025 23:46:50

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Connexion - Guide de Lyon',
  description: 'Connectez-vous à votre compte Guide de Lyon'
};

export default function ConnexionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
        </div>
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-center text-gray-600">
            Page de connexion en cours de reconstruction...
          </p>
          <div className="mt-4 text-center">
            <Link href="/pro/inscription" className="text-blue-600 hover:text-blue-500">
              Créer un compte professionnel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
