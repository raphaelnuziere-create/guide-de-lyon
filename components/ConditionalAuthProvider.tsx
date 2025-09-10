'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/lib/auth/AuthContext'

interface ConditionalAuthProviderProps {
  children: React.ReactNode
}

export function ConditionalAuthProvider({ children }: ConditionalAuthProviderProps) {
  const pathname = usePathname()
  
  // Routes qui ont besoin de l'AuthProvider Supabase
  const needsAuth = pathname?.startsWith('/pro') || 
                   pathname?.startsWith('/auth') ||
                   pathname?.startsWith('/professionnel') ||
                   pathname?.startsWith('/espace-pro') ||
                   pathname?.startsWith('/inscription')
  
  // Routes d'administration (utilisent leur propre système auth)
  const isAdminRoute = pathname?.startsWith('/administration')
  
  if (isAdminRoute || !needsAuth) {
    // Pour les routes admin ou les pages publiques, pas d'AuthProvider Supabase
    return <>{children}</>
  }
  
  // Seulement pour les routes qui nécessitent l'auth utilisateur
  return <AuthProvider>{children}</AuthProvider>
}