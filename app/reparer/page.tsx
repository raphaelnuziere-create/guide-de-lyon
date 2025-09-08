'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase/client';

export default function ReparerPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [orphanEstablishments, setOrphanEstablishments] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    diagnostic();
  }, []);

  const diagnostic = async () => {
    setLoading(true);
    
    // 1. Vérifier la session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setCurrentUser(session.user);
      setMessage(`✅ Connecté: ${session.user.email} (ID: ${session.user.id})`);
      
      // 2. Chercher les établissements de cet utilisateur
      const { data: userEstabs } = await supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', session.user.id);
      
      if (userEstabs && userEstabs.length > 0) {
        setEstablishments(userEstabs);
        setMessage(prev => prev + `\n✅ ${userEstabs.length} établissement(s) trouvé(s)`);
      } else {
        setMessage(prev => prev + '\n⚠️ Aucun établissement lié à ce compte');
      }
      
      // 3. Chercher les établissements orphelins avec le même email
      const { data: orphans } = await supabase
        .from('establishments')
        .select('*')
        .is('owner_id', null)
        .eq('email', session.user.email);
      
      if (orphans && orphans.length > 0) {
        setOrphanEstablishments(orphans);
        setMessage(prev => prev + `\n🔧 ${orphans.length} établissement(s) orphelin(s) trouvé(s) avec votre email`);
      }
      
    } else {
      setMessage('❌ Non connecté - Connectez-vous d\'abord');
    }
    
    setLoading(false);
  };

  const repairEstablishment = async (establishmentId: string) => {
    if (!currentUser) {
      alert('Vous devez être connecté');
      return;
    }

    const { error } = await supabase
      .from('establishments')
      .update({ owner_id: currentUser.id })
      .eq('id', establishmentId);

    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      alert('✅ Établissement réparé avec succès!');
      diagnostic(); // Recharger
    }
  };

  const createNewEstablishment = async () => {
    if (!currentUser) {
      alert('Vous devez être connecté');
      return;
    }

    const { data, error } = await supabase
      .from('establishments')
      .insert({
        owner_id: currentUser.id,
        name: 'Mon Établissement',
        email: currentUser.email,
        plan: 'basic',
        is_active: true,
        address: 'À compléter',
        phone: 'À compléter'
      })
      .select()
      .single();

    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      alert('✅ Nouvel établissement créé!');
      diagnostic();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>🔧 Réparation de Compte</h1>
      
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          {/* État actuel */}
          <div style={{ 
            background: currentUser ? '#e8f5e9' : '#ffebee', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '20px',
            whiteSpace: 'pre-line'
          }}>
            <h3>Diagnostic:</h3>
            <pre style={{ fontSize: '14px' }}>{message}</pre>
          </div>

          {/* Établissements actuels */}
          {establishments.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3>✅ Vos établissements:</h3>
              {establishments.map(est => (
                <div key={est.id} style={{ 
                  background: '#f5f5f5', 
                  padding: '10px', 
                  marginBottom: '10px',
                  borderRadius: '5px' 
                }}>
                  <strong>{est.name}</strong> (Plan: {est.plan})
                  <br />
                  <small>ID: {est.id}</small>
                </div>
              ))}
              <a href="/pro/dashboard" style={{ 
                display: 'inline-block',
                marginTop: '10px',
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px'
              }}>
                Aller au Dashboard →
              </a>
            </div>
          )}

          {/* Établissements orphelins */}
          {orphanEstablishments.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3>🔧 Établissements à réparer:</h3>
              {orphanEstablishments.map(est => (
                <div key={est.id} style={{ 
                  background: '#fff3e0', 
                  padding: '10px', 
                  marginBottom: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ffcc80'
                }}>
                  <strong>{est.name}</strong>
                  <br />
                  <small>Email: {est.email} | Créé: {new Date(est.created_at).toLocaleDateString()}</small>
                  <br />
                  <button 
                    onClick={() => repairEstablishment(est.id)}
                    style={{
                      marginTop: '5px',
                      padding: '5px 15px',
                      background: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Réparer (lier à mon compte)
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Créer un nouvel établissement */}
          {currentUser && establishments.length === 0 && orphanEstablishments.length === 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Aucun établissement trouvé</h3>
              <button 
                onClick={createNewEstablishment}
                style={{
                  padding: '10px 20px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Créer un nouvel établissement
              </button>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <h3>Actions rapides:</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={diagnostic} style={{
                padding: '8px 16px',
                background: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                🔄 Actualiser
              </button>
              
              <a href="/auth/pro/connexion" style={{
                padding: '8px 16px',
                background: '#607D8B',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                🔐 Page de connexion
              </a>
              
              <a href="/pro/dashboard" style={{
                padding: '8px 16px',
                background: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                📊 Dashboard
              </a>
            </div>
          </div>

          {/* Instructions SQL */}
          <div style={{ marginTop: '30px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <h3>Si ça ne marche pas, utilisez SQL:</h3>
            <pre style={{ background: '#333', color: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`-- 1. Trouvez votre user_id
SELECT id, email FROM auth.users 
WHERE email = '${currentUser?.email || 'VOTRE_EMAIL'}';

-- 2. Réparez l'établissement
UPDATE establishments 
SET owner_id = 'COPIEZ_USER_ID_ICI'
WHERE email = '${currentUser?.email || 'VOTRE_EMAIL'}';`}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}