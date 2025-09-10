'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/lib/auth/AuthContext'

interface ConditionalAuthProviderProps {
  children: React.ReactNode
}

export function ConditionalAuthProvider({ children }: ConditionalAuthProviderProps) {
  const pathname = usePathname()
  
  // Exclure les routes d'administration de l'AuthProvider Supabase
  const isAdminRoute = pathname?.startsWith('/administration')
  
  if (isAdminRoute) {
    // Pour les routes admin, pas d'AuthProvider Supabase
    return <>{children}</>
  }
  
  // Pour les autres routes, utiliser l'AuthProvider Supabase
  return <AuthProvider>{children}</AuthProvider>
}