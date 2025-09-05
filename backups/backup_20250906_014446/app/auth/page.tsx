export default function AuthPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#111827'
        }}>
          🔐 Système d'Authentification
        </h1>

        <div style={{
          display: 'grid',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Admin Card */}
          <div style={{
            border: '2px solid #dc2626',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            background: '#fef2f2'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '1rem'
            }}>
              🛡️ Accès Administrateur
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Compte test:</strong><br/>
              Email: admin@guide-de-lyon.fr<br/>
              Mot de passe: Admin2025!
            </div>
            <a
              href="/login-admin"
              style={{
                display: 'inline-block',
                background: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Aller au Login Admin →
            </a>
          </div>

          {/* Pro Card */}
          <div style={{
            border: '2px solid #2563eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            background: '#eff6ff'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              marginBottom: '1rem'
            }}>
              🏢 Accès Professionnel
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Compte test:</strong><br/>
              Email: merchant@guide-de-lyon.fr<br/>
              Mot de passe: Merchant2025!
            </div>
            <a
              href="/login-pro"
              style={{
                display: 'inline-block',
                background: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Aller au Login Pro →
            </a>
          </div>
        </div>

        <div style={{
          background: '#f3f4f6',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Pages disponibles:
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <a href="/login-admin" style={{ color: '#dc2626' }}>/login-admin</a>
            <a href="/login-pro" style={{ color: '#2563eb' }}>/login-pro</a>
            <a href="/auth" style={{ color: '#10b981' }}>/auth (cette page)</a>
          </div>
        </div>
      </div>
    </div>
  )
}