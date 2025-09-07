'use client';

import { useState } from 'react';

export default function TestConnexionPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testDirectAPI = async () => {
    console.log('=== TEST API DIRECT ===');
    console.log('Email:', email);
    console.log('Password:', password);
    
    setLoading(true);
    setResult('Appel API en cours...');
    
    try {
      const response = await fetch('/api/auth/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signin',
          email: email.trim(),
          password: password.trim(),
        }),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      setResult(JSON.stringify(data, null, 2));
      
      if (data.success) {
        alert('Connexion réussie! Redirection dans 3 secondes...');
        setTimeout(() => {
          window.location.href = data.redirectTo || '/pro/dashboard';
        }, 3000);
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setResult(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORM SUBMIT ===');
    testDirectAPI();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Page de Test - Connexion Pro</h1>
        
        {/* Test 1: Formulaire basique */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test 1: Formulaire HTML basique</h2>
          <form onSubmit={testFormSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="test@example.com"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Chargement...' : 'Tester Submit Form'}
              </button>
            </div>
          </form>
        </div>

        {/* Test 2: Bouton direct */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test 2: Appel API direct (sans form)</h2>
          <button
            onClick={testDirectAPI}
            disabled={loading || !email || !password}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Tester API Direct'}
          </button>
        </div>

        {/* Test 3: Lien vers l\'ancienne page */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test 3: Navigation</h2>
          <div className="space-y-2">
            <a href="/auth/pro/connexion" className="block text-blue-500 underline">
              → Page connexion normale (href)
            </a>
            <button
              onClick={() => window.location.href = '/auth/pro/connexion'}
              className="text-blue-500 underline"
            >
              → Page connexion (window.location)
            </button>
          </div>
        </div>

        {/* Résultat */}
        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Résultat:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {result}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold mb-4">Instructions de test:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Entrez vos identifiants dans les champs</li>
            <li>Ouvrez la console (F12)</li>
            <li>Testez d\'abord le bouton "Tester API Direct"</li>
            <li>Si ça fonctionne, testez le formulaire</li>
            <li>Observez les logs dans la console</li>
          </ol>
        </div>
      </div>
    </div>
  );
}