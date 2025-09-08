'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';

export default function ConnexionTestPage() {
  const router = useRouter();
  const [email, setEmail] = useState('pro@test.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUser(session.user);
      setMessage(`Déjà connecté: ${session.user.email}`);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Email et mot de passe requis');
      return;
    }

    setLoading(true);
    setMessage('Connexion en cours...');

    try {
      // Déconnexion d'abord
      await supabase.auth.signOut();
      
      // Connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        setMessage(`Erreur: ${error.message}`);
      } else if (data.session) {
        setMessage('Connexion réussie! Vérification établissement...');
        
        // Vérifier l'établissement
        const { data: establishment, error: estError } = await supabase
          .from('establishments')
          .select('name, plan')
          .eq('owner_id', data.session.user.id)
          .single();
        
        if (establishment) {
          setMessage(`✅ Connecté! ${establishment.name} (Plan ${establishment.plan}). Redirection...`);
          setTimeout(() => router.push('/pro/dashboard'), 2000);
        } else if (estError) {
          setMessage(`⚠️ Connecté mais pas d'établissement trouvé. Erreur: ${estError.message}`);
        } else {
          setMessage('⚠️ Connecté mais pas d'établissement lié à ce compte');
        }
      }
    } catch (err: any) {
      setMessage(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setMessage('Déconnecté');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>🔧 Test de Connexion Simple</h1>
      
      {currentUser && (
        <div style={{ background: '#e0f7fa', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          <p>Session active: {currentUser.email}</p>
          <button onClick={handleLogout} style={{ marginTop: '10px' }}>
            Se déconnecter
          </button>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Mot de passe:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </label>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          background: loading ? '#ccc' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          background: message.includes('✅') ? '#c8e6c9' : 
                      message.includes('⚠️') ? '#ffe0b2' : 
                      message.includes('Erreur') ? '#ffcdd2' : '#e1f5fe',
          borderRadius: '4px',
          whiteSpace: 'pre-line'
        }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Email par défaut: <strong>pro@test.com</strong></li>
          <li>Entrez votre mot de passe</li>
          <li>Cliquez sur "Se connecter"</li>
        </ol>
        
        <h3 style={{ marginTop: '20px' }}>Diagnostic SQL:</h3>
        <pre style={{ background: '#333', color: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`-- Vérifier votre compte
SELECT id, email FROM auth.users 
WHERE email = 'pro@test.com';

-- Vérifier l'établissement
SELECT * FROM establishments 
WHERE email = 'pro@test.com';

-- Lier si nécessaire
UPDATE establishments 
SET owner_id = 'USER_ID_ICI'
WHERE email = 'pro@test.com';`}
        </pre>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a href="/pro/dashboard" style={{ marginRight: '15px' }}>→ Dashboard</a>
        <a href="/auth/pro/connexion">→ Connexion officielle</a>
      </div>
    </div>
  );
}