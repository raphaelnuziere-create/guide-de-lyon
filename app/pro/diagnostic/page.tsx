'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function DiagnosticPage() {
  const [diagnosticData, setDiagnosticData] = useState<any>({
    auth: null,
    establishment: null,
    database: null,
    loading: true
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    setDiagnosticData({ ...diagnosticData, loading: true });

    try {
      // 1. Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // 2. Check establishment if user exists
      let establishment = null;
      if (user) {
        const { data: estabData, error: estabError } = await supabase
          .from('establishments')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        establishment = estabData;
      }

      // 3. Check database connection
      const { data: dbTest, error: dbError } = await supabase
        .from('establishments')
        .select('count')
        .limit(1);

      setDiagnosticData({
        auth: { user, error: authError },
        establishment: establishment,
        database: { connected: !dbError, error: dbError },
        loading: false
      });
    } catch (error) {
      console.error('Diagnostic error:', error);
      setDiagnosticData({
        ...diagnosticData,
        loading: false,
        error: error
      });
    }
  };

  const StatusIcon = ({ status }: { status: 'ok' | 'error' | 'warning' }) => {
    if (status === 'ok') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  if (diagnosticData.loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-center">Diagnostic en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Diagnostic Pro</h1>

      {/* Authentification */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <StatusIcon status={diagnosticData.auth?.user ? 'ok' : 'error'} />
            Authentification
          </h2>
        </div>
        <div className="p-4">
          {diagnosticData.auth?.user ? (
            <div className="space-y-2">
              <p className="text-green-600">✓ Connecté</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Email:</strong> {diagnosticData.auth.user.email}</p>
                <p><strong>ID:</strong> {diagnosticData.auth.user.id}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-red-600">✗ Non connecté</p>
              <button 
                onClick={() => window.location.href = '/auth/pro/connexion'}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Se connecter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Établissement */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <StatusIcon status={diagnosticData.establishment ? 'ok' : 'warning'} />
            Établissement
          </h2>
        </div>
        <div className="p-4">
          {diagnosticData.establishment ? (
            <div className="space-y-2">
              <p className="text-green-600">✓ Établissement trouvé</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Nom:</strong> {diagnosticData.establishment.name}</p>
                <p><strong>ID:</strong> {diagnosticData.establishment.id}</p>
                <p><strong>Plan:</strong> {diagnosticData.establishment.plan}</p>
                <p><strong>Statut:</strong> {diagnosticData.establishment.status}</p>
              </div>
              <button 
                onClick={() => window.location.href = '/pro/dashboard'}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Aller au tableau de bord
              </button>
            </div>
          ) : (
            <div>
              <p className="text-yellow-600">⚠ Aucun établissement trouvé</p>
              {diagnosticData.auth?.user && (
                <button 
                  onClick={() => window.location.href = '/pro/inscription'}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Créer un établissement
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Base de données */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <StatusIcon status={diagnosticData.database?.connected ? 'ok' : 'error'} />
            Connexion Base de Données
          </h2>
        </div>
        <div className="p-4">
          {diagnosticData.database?.connected ? (
            <p className="text-green-600">✓ Base de données accessible</p>
          ) : (
            <div>
              <p className="text-red-600">✗ Erreur de connexion</p>
              {diagnosticData.database?.error && (
                <div className="bg-red-50 p-3 rounded text-sm mt-2">
                  <pre>{JSON.stringify(diagnosticData.database.error, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Actions</h2>
        </div>
        <div className="p-4 space-y-3">
          <button 
            onClick={runDiagnostic}
            className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
          >
            Relancer le diagnostic
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => window.location.href = '/auth/pro/connexion'}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
            >
              Page de connexion
            </button>
            <button 
              onClick={() => window.location.href = '/pro/dashboard'}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
            >
              Tableau de bord
            </button>
          </div>

          {diagnosticData.auth?.user && !diagnosticData.establishment && (
            <button 
              onClick={() => window.location.href = '/pro/inscription'}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Créer mon établissement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}