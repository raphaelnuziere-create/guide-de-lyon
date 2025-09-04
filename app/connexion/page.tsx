'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'admin' | 'pro'>('pro')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Vérifier si déjà connecté
    const user = localStorage.getItem('currentUser')
    if (user) {
      setIsLoggedIn(true)
      setMessage(`Connecté en tant que: ${JSON.parse(user).role}`)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation simple sans Firebase
    const accounts = {
      admin: {
        email: 'admin@guide-de-lyon.fr',
        password: 'Admin2025!',
        role: 'admin',
        name: 'Administrateur'
      },
      pro: {
        email: 'merchant@guide-de-lyon.fr', 
        password: 'Merchant2025!',
        role: 'merchant',
        name: 'Restaurant Test'
      }
    }

    let validLogin = false
    let userData = null

    // Vérifier les credentials
    if (userType === 'admin' && email === accounts.admin.email && password === accounts.admin.password) {
      validLogin = true
      userData = accounts.admin
    } else if (userType === 'pro' && email === accounts.pro.email && password === accounts.pro.password) {
      validLogin = true
      userData = accounts.pro
    }

    if (validLogin && userData) {
      // Sauvegarder dans localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData))
      localStorage.setItem('authToken', `token-${Date.now()}`)
      
      setIsLoggedIn(true)
      setMessage(`✅ Connexion réussie ! Bienvenue ${userData.name}`)
      
      // Redirection après 2 secondes
      setTimeout(() => {
        if (userType === 'admin') {
          window.location.href = '/tableau-de-bord'
        } else {
          window.location.href = '/espace-pro'
        }
      }, 2000)
    } else {
      setMessage('❌ Email ou mot de passe incorrect')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setMessage('Déconnexion réussie')
    window.location.reload()
  }

  const autoFill = () => {
    if (userType === 'admin') {
      setEmail('admin@guide-de-lyon.fr')
      setPassword('Admin2025!')
    } else {
      setEmail('merchant@guide-de-lyon.fr')
      setPassword('Merchant2025!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            🔐 Connexion
          </h1>

          {isLoggedIn ? (
            <div className="text-center">
              <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
                {message}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
              >
                Se déconnecter
              </button>
            </div>
          ) : (
            <>
              {/* Sélecteur de type */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setUserType('pro')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    userType === 'pro' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  🏢 Pro
                </button>
                <button
                  onClick={() => setUserType('admin')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    userType === 'admin' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  🛡️ Admin
                </button>
              </div>

              {/* Compte de test affiché */}
              <div className={`p-4 rounded-lg mb-6 ${
                userType === 'admin' ? 'bg-red-50' : 'bg-blue-50'
              }`}>
                <h3 className="font-bold mb-2">Compte test {userType === 'admin' ? 'Admin' : 'Pro'}:</h3>
                <p className="text-sm">
                  Email: {userType === 'admin' ? 'admin@guide-de-lyon.fr' : 'merchant@guide-de-lyon.fr'}<br/>
                  Pass: {userType === 'admin' ? 'Admin2025!' : 'Merchant2025!'}
                </p>
                <button
                  onClick={autoFill}
                  className="mt-2 text-sm underline text-blue-600 hover:text-blue-800"
                >
                  → Remplir automatiquement
                </button>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition ${
                    userType === 'admin'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Se connecter
                </button>
              </form>

              {message && (
                <div className={`mt-4 p-3 rounded-lg text-center ${
                  message.includes('✅') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </div>
              )}
            </>
          )}
        </div>

        {/* Liens utiles */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Autres pages disponibles:</p>
          <div className="flex gap-4 justify-center mt-2">
            <a href="/" className="text-blue-600 hover:underline">Accueil</a>
            <a href="/tableau-de-bord" className="text-blue-600 hover:underline">Dashboard</a>
            <a href="/espace-pro" className="text-blue-600 hover:underline">Espace Pro</a>
          </div>
        </div>
      </div>
    </div>
  )
}