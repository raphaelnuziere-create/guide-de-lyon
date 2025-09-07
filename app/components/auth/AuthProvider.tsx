'use client';

import { useEffect } from 'react';
import { setupAuthStateListener } from '@/app/lib/utils/auth-persistence';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configurer l'écoute globale des changements d'authentification
    setupAuthStateListener();
  }, []);

  return <>{children}</>;
}