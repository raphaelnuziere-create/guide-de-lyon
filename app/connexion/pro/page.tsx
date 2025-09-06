'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Mail, Lock, ArrowRight, AlertCircle, CheckCircle, Key } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'

export default function ProLoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await signIn(email, password)
      setSuccess('Connexion réussie ! Redirection...')
      // La redirection est gérée automatiquement par AuthContext
    } catch (error: any) {
      setError(error.message || 'Erreur de connexion')
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

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="font-medium">{success}</p>
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@monentreprise.fr"
                  disabled={loading}
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/reset-password"
                className="text-blue-600 hover:text-blue-500"
              >
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

          <div className="mt-6 pt-6 border-t border-gray-300">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Pas encore de compte professionnel ?
              </p>
              <Link 
                href="/pro" 
                className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
              >
                Découvrir nos offres Pro
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-300">
            <button
              onClick={useTestAccount}
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition"
            >
              <Key className="mr-2 h-4 w-4" />
              Utiliser le compte test marchand
            </button>
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                Email: merchant@guide-de-lyon.fr<br/>
                Mot de passe: Merchant2025!
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}