'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Shield, LogOut } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Vérifier l'authentification admin
  useEffect(() => {
    const checkAuth = async () => {
      // Exclure la page de connexion
      if (pathname === '/administration/connexion') {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/admin/auth/login')
        const data = await response.json()

        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          router.push('/administration/connexion')
        }
      } catch (error) {
        console.error('Erreur vérification auth admin:', error)
        router.push('/administration/connexion')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  // Déconnexion admin
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/administration/connexion')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      // Rediriger quand même
      router.push('/administration/connexion')
    }
  }

  // Page de connexion - pas de layout
  if (pathname === '/administration/connexion') {
    return <>{children}</>
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg flex items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mr-3"></div>
          <span className="text-gray-600">Vérification des accès...</span>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600 mb-4">Authentification admin requise</p>
          <button
            onClick={() => router.push('/administration/connexion')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  // Authenticated - render with admin header
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header admin global */}
      <header className="bg-gray-900 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-500 mr-3" />
              <span className="text-xl font-bold">Administration</span>
              <span className="ml-3 text-sm text-gray-400">Guide de Lyon</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Session admin active
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      {children}
    </div>
  )
}