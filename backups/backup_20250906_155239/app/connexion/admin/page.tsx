'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Mail, Lock, ArrowRight, Key } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'

export default function AdminLoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
      // La redirection est gérée automatiquement par AuthContext
    } catch (error: any) {
      setError(error.message || 'Erreur de connexion')
      setLoading(false)
    }
  }

  const useTestAccount = () => {
    setEmail('admin@guide-de-lyon.fr')
    setPassword('Admin2025!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Administration</h2>
          <p className="mt-2 text-sm text-gray-400">Espace réservé aux administrateurs</p>
        </div>

        <div className="bg-gray-800 py-8 px-6 shadow-xl rounded-xl border border-gray-700">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-600 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email administrateur
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="admin@guide-de-lyon.fr"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition"
            >
              {loading ? 'Connexion...' : 'Connexion sécurisée'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={useTestAccount}
              className="w-full flex items-center justify-center px-4 py-2 bg-green-800 text-green-300 rounded-lg text-sm hover:bg-green-700 transition"
            >
              <Key className="mr-2 h-4 w-4" />
              Utiliser le compte test admin
            </button>
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Email: admin@guide-de-lyon.fr<br/>
                Mot de passe: Admin2025!
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/connexion/pro" className="text-sm text-gray-400 hover:text-gray-300">
              ← Espace professionnel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}