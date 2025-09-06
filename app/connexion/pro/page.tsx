'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProLoginRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Rediriger vers la vraie page de connexion Supabase
    router.replace('/auth/pro/connexion');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection vers la page de connexion...</p>
      </div>
    </div>
  );
}