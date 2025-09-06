'use client';

import { useState } from 'react';

export default function TestAuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async (action: 'signin' | 'signup') => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/debug-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          action,
        }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Erreur réseau: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Auth Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="test@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="password123"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => testAuth('signup')}
                disabled={loading || !email || !password}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Test Inscription
              </button>
              
              <button
                onClick={() => testAuth('signin')}
                disabled={loading || !email || !password}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Test Connexion
              </button>
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">Chargement...</p>
          </div>
        )}
        
        {result && (
          <div className={`rounded-lg p-4 ${
            result.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h2 className="font-semibold mb-2">
              {result.success ? '✅ Succès' : '❌ Erreur'}
            </h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Entrez un email et mot de passe</li>
            <li>Cliquez sur "Test Inscription" pour créer un compte</li>
            <li>Vérifiez votre email pour le lien de confirmation</li>
            <li>Après confirmation, utilisez "Test Connexion"</li>
          </ol>
          <div className="mt-4 text-xs text-blue-700">
            <p>URLs importantes:</p>
            <ul className="list-disc list-inside mt-1">
              <li>/api/test-auth - Info config</li>
              <li>/api/debug-auth - Test auth</li>
              <li>/auth/callback - Callback Supabase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}