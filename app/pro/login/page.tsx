'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Mail, Lock, ArrowRight, Chrome, Key } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Tentative de connexion avec:', email)
      await signIn(email, password)
      console.log('Connexion réussie, redirection...')
      router.push('/pro/dashboard')
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      setError(error.message || 'Erreur de connexion')
      setLoading(false)
    }
  }
  
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('Tentative de connexion Google...')
      await signInWithGoogle()
      console.log('Connexion Google réussie')
      router.push('/pro/dashboard')
    } catch (error: any) {
      console.error('Erreur connexion Google:', error)
      setError(error.message || 'Erreur lors de la connexion avec Google')
      setLoading(false)
    }
  }

  const useTestAccount = () => {
    setEmail('merchant@guide-de-lyon.fr')
    setPassword('Merchant2025!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Building2 className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Guide de Lyon</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Espace Professionnel
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour gérer votre établissement
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email professionnel
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@monentreprise.fr"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <Link href="/pro/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Connexion avec Google
          </button>

          {/* Test Account Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={useTestAccount}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <Key className="mr-2 h-4 w-4" />
              Utiliser le compte test merchant
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Nouveau sur Guide de Lyon ?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/pro/register"
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Créer un compte professionnel
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          En vous connectant, vous acceptez nos{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-500">
            Conditions d'utilisation
          </Link>{' '}
          et notre{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
            Politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  )
}