'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase/client';

export default function CreerComptePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      setMessage('❌ Email et mot de passe requis');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('❌ Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setMessage('❌ Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    setLoading(true);
    setMessage('Création du compte...');

    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        setMessage(`❌ Erreur: ${authError.message}`);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setMessage('❌ Erreur lors de la création du compte');
        setLoading(false);
        return;
      }

      // 2. Créer l\'établissement automatiquement
      const { data: establishment, error: estError } = await supabase
        .from('establishments')
        .insert({
          owner_id: authData.user.id,
          name: 'Mon Établissement',
          email: email.trim(),
          plan: 'basic',
          is_active: true,
          address: 'À compléter',
          phone: 'À compléter',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (estError) {
        console.error('Erreur création établissement:', estError);
        // Pas grave si l\'établissement n\'est pas créé, on peut le faire plus tard
      }

      setSuccess(true);
      setMessage('✅ Compte créé avec succès! Vérifiez votre email pour confirmer.');
      
      // Redirection après 3 secondes
      setTimeout(() => {
        router.push('/auth/pro/connexion');
      }, 3000);

    } catch (error: any) {
      console.error('Erreur:', error);
      setMessage(`❌ Erreur: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom, #f5f5f5, white)',
      padding: '20px',
      fontFamily: 'system-ui'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        margin: '50px auto',
        background: 'white',
        borderRadius: '10px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          🚀 Créer un Compte Pro
        </h1>

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Répétez le mot de passe"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            />
          </div>

          {message && (
            <div style={{
              padding: '10px',
              marginBottom: '20px',
              borderRadius: '5px',
              background: success ? '#d4edda' : message.includes('❌') ? '#f8d7da' : '#d1ecf1',
              color: success ? '#155724' : message.includes('❌') ? '#721c24' : '#0c5460',
              border: `1px solid ${success ? '#c3e6cb' : message.includes('❌') ? '#f5c6cb' : '#bee5eb'}`
            }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Création en cours...' : 'Créer mon compte'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#666' }}>
            Déjà un compte?{' '}
            <a href="/auth/pro/connexion" style={{ color: '#007bff' }}>
              Se connecter
            </a>
          </p>
        </div>

        {/* Informations importantes */}
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '5px',
          fontSize: '14px',
          color: '#666'
        }}>
          <strong>ℹ️ Information:</strong>
          <ul style={{ marginTop: '10px', marginBottom: 0, paddingLeft: '20px' }}>
            <li>Un établissement sera créé automatiquement</li>
            <li>Plan Basic gratuit par défaut</li>
            <li>Vous pourrez tout modifier dans le dashboard</li>
            <li>Confirmation par email requise</li>
          </ul>
        </div>
      </div>

      {/* Debug info */}
      <div style={{
        maxWidth: '400px',
        margin: '20px auto',
        padding: '15px',
        background: '#333',
        color: '#fff',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <strong>Test rapide:</strong><br />
        Email: test.nouveau@test.com<br />
        Mot de passe: Test123!<br />
        <br />
        Cette page utilise directement Supabase Auth<br />
        Pas de route API intermédiaire
      </div>
    </div>
  );
}