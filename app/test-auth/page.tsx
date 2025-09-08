'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuration directe sans singleton
const supabaseUrl = 'https://ikefyhxelzydaogrnwxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTY3NTQsImV4cCI6MjA3MTI3Mjc1NH0.vJHDlWKUK0xUoXB_CCxNkVNnWhb7Wpq-mA097blKmzc';

export default function TestAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Créer un client temporaire pour le test
      const testClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });

      // Tenter la connexion
      const { data, error } = await testClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setResult({
          success: false,
          error: error.message,
          details: error
        });
      } else {
        setResult({
          success: true,
          user: data.user?.email,
          userId: data.user?.id,
          session: !!data.session
        });

        // Vérifier l'établissement
        const { data: estData, error: estError } = await testClient
          .from('establishments')
          .select('*')
          .eq('user_id', data.user?.id)
          .single();

        setResult(prev => ({
          ...prev,
          establishment: estData,
          establishmentError: estError?.message
        }));

        // Se déconnecter après le test
        await testClient.auth.signOut();
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: 'Exception: ' + err.message
      });
    }

    setLoading(false);
  };

  const testAccounts = [
    { email: 'pro@test.com', password: 'ProTest123!' },
    { email: 'expert@test.com', password: 'ExpertTest123!' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔧 Test d'Authentification</h1>
        
        {/* Comptes de test rapides */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="font-semibold mb-3">Comptes de test rapides:</h2>
          <div className="space-y-2">
            {testAccounts.map(account => (
              <button
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
                className="block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                <div className="font-mono text-sm">{account.email}</div>
                <div className="text-xs text-gray-600">{account.password}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire de test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="pro@test.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="ProTest123!"
              />
            </div>

            <button
              onClick={handleTest}
              disabled={loading || !email || !password}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Test en cours...' : 'Tester la connexion'}
            </button>
          </div>

          {/* Résultats */}
          {result && (
            <div className={`mt-6 p-4 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h3 className="font-semibold mb-2">
                {result.success ? '✅ Connexion réussie' : '❌ Échec de connexion'}
              </h3>
              
              <div className="text-sm space-y-1">
                {result.error && (
                  <div className="text-red-700">
                    <strong>Erreur:</strong> {result.error}
                  </div>
                )}
                
                {result.user && (
                  <div><strong>Email:</strong> {result.user}</div>
                )}
                
                {result.userId && (
                  <div><strong>User ID:</strong> {result.userId}</div>
                )}
                
                {result.session !== undefined && (
                  <div><strong>Session:</strong> {result.session ? 'Créée' : 'Non créée'}</div>
                )}

                {result.establishment && (
                  <div className="mt-3 p-2 bg-white rounded">
                    <strong>Établissement trouvé:</strong>
                    <div className="text-xs mt-1">
                      <div>Nom: {result.establishment.name}</div>
                      <div>Plan: {result.establishment.plan}</div>
                      <div>Email: {result.establishment.email}</div>
                    </div>
                  </div>
                )}

                {result.establishmentError && (
                  <div className="text-orange-700">
                    <strong>Établissement:</strong> {result.establishmentError}
                  </div>
                )}
              </div>

              {result.details && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-gray-600">Détails techniques</summary>
                  <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Cliquez sur un compte de test rapide pour remplir les champs</li>
            <li>Ou entrez manuellement les identifiants</li>
            <li>Cliquez sur "Tester la connexion"</li>
            <li>Vérifiez les résultats et erreurs</li>
          </ol>
        </div>

        {/* Lien vers la vraie page de connexion */}
        <div className="mt-6 text-center">
          <a 
            href="/auth/pro/connexion" 
            className="text-blue-600 hover:underline"
          >
            → Retour à la page de connexion normale
          </a>
        </div>
      </div>
    </div>
  );
}