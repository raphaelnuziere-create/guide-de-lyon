'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function VerificationRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger immédiatement vers le dashboard
    router.replace('/pro/dashboard');
  }, [router]);

  // Affichage pendant la redirection
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Redirection en cours...
        </h2>
        <p className="text-gray-600 mb-4">
          Vous êtes redirigé vers votre tableau de bord
        </p>
        <div className="flex items-center justify-center text-blue-600">
          <span className="mr-2">Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}