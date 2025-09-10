'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InscriptionProRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirection automatique vers la nouvelle interface d'inscription adaptative
    console.log('Redirection depuis l\'ancienne page d\'inscription vers la nouvelle');
    router.push('/pro/inscription');
  }, [router]);

  // Page de redirection simple
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Redirection vers l'inscription...</p>
      </div>
    </div>
  );
}