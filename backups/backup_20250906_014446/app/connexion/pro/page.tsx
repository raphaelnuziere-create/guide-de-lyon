'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ProLoginPage() {
  const router = useRouter()
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
      console.log('🔐 Tentative de connexion Supabase pour:', email)
      
      // Connexion avec Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      })

      if (signInError) {
        console.error('❌ Erreur Supabase:', signInError)
        
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Veuillez confirmer votre email avant de vous connecter')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      if (data.user) {
        console.log('✅ Connexion réussie pour:', data.user.email)
        setSuccess('Connexion réussie ! Redirection...')
        
        // Vérifier si l'utilisateur a un établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id, name, status')
          .eq('user_id', data.user.id)
          .single()

        if (establishment) {
          console.log('🏢 Établissement trouvé:', establishment.name)
          router.push('/pro/dashboard')
        } else {
          console.log('📝 Pas d\'établissement, redirection vers inscription')
          router.push('/pro/inscription')
        }
      }
    } catch (error: any) {
      console.error('❌ Erreur inattendue:', error)
      setError(error.message || 'Erreur de connexion')
      setLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Veuillez entrer votre email d\'abord')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError('Erreur lors de l\'envoi du mail')
      } else {
        setSuccess('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.')
      }
    } catch (err: any) {
      setError('Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  // Fonction de test de connexion à Supabase
  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('subscription_plans').select('name')
      if (error) {
        console.error('❌ Erreur connexion Supabase:', error)
        setError(`Erreur DB: ${error.message}`)
      } else {
        console.log('✅ Connexion Supabase OK, plans:', data)
        setSuccess(`Connexion OK ! ${data.length} plans trouvés`)
      }
    } catch (err: any) {
      console.error('❌ Erreur test:', err)
      setError(`Erreur: ${err.message}`)
    }
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
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-blue-600 hover:text-blue-500"
                disabled={loading}
              >
                Mot de passe oublié ?
              </button>
              <button
                type="button"
                onClick={testSupabaseConnection}
                className="text-gray-500 hover:text-gray-700"
              >
                Tester DB
              </button>
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

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Retour à l'accueil
            </Link>
          </div>

          {/* Info de debug en développement */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
              <p className="font-mono">Mode: Supabase Auth</p>
              <p className="font-mono">URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}