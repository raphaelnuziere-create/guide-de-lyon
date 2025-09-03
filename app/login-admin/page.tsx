'use client'

import { useState } from 'react'

export default function LoginAdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (email === 'admin@guide-de-lyon.fr' && password === 'Admin2025!') {
      setMessage('✅ Connexion réussie ! Bienvenue Admin.')
      localStorage.setItem('user', 'admin')
    } else {
      setMessage('❌ Email ou mot de passe incorrect')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to right, #1f2937, #111827)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
          🛡️ Admin Login
        </h1>
        
        <div style={{
          background: '#10b981',
          color: 'white',
          padding: '1rem',
          borderRadius: '0.375rem',
          marginBottom: '1.5rem'
        }}>
          <strong>Compte Test Admin:</strong><br/>
          Email: admin@guide-de-lyon.fr<br/>
          Mot de passe: Admin2025!
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem'
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              background: '#dc2626',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Se connecter
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            background: message.includes('✅') ? '#dcfce7' : '#fee2e2',
            color: message.includes('✅') ? '#166534' : '#991b1b'
          }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="/login-pro" style={{ color: '#2563eb', textDecoration: 'none' }}>
            → Aller au login Pro
          </a>
        </div>
      </div>
    </div>
  )
}