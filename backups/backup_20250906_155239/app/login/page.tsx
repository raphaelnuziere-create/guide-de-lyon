'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger automatiquement vers la page de connexion pro
    router.replace('/connexion/pro');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection en cours...</p>
        <p className="mt-2 text-sm text-gray-500">Vous allez être redirigé vers la page de connexion</p>
      </div>
    </div>
  );
}