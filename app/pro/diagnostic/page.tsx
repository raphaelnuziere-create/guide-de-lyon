'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          .eq('owner_id', user.id)
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
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Diagnostic en cours...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Diagnostic Pro</h1>

      {/* Authentification */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon status={diagnosticData.auth?.user ? 'ok' : 'error'} />
            Authentification
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              <Button 
                onClick={() => window.location.href = '/auth/pro/connexion'}
                className="mt-3"
              >
                Se connecter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Établissement */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon status={diagnosticData.establishment ? 'ok' : 'warning'} />
            Établissement
          </CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticData.establishment ? (
            <div className="space-y-2">
              <p className="text-green-600">✓ Établissement trouvé</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p><strong>Nom:</strong> {diagnosticData.establishment.name}</p>
                <p><strong>ID:</strong> {diagnosticData.establishment.id}</p>
                <p><strong>Plan:</strong> {diagnosticData.establishment.plan}</p>
                <p><strong>Statut:</strong> {diagnosticData.establishment.status}</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/pro/dashboard'}
                className="mt-3"
              >
                Aller au tableau de bord
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-yellow-600">⚠ Aucun établissement trouvé</p>
              {diagnosticData.auth?.user && (
                <Button 
                  onClick={() => window.location.href = '/pro/inscription'}
                  className="mt-3"
                >
                  Créer un établissement
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Base de données */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StatusIcon status={diagnosticData.database?.connected ? 'ok' : 'error'} />
            Connexion Base de Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticData.database?.connected ? (
            <p className="text-green-600">✓ Base de données accessible</p>
          ) : (
            <div>
              <p className="text-red-600">✗ Erreur de connexion</p>
              {diagnosticData.database?.error && (
                <div className="bg-red-50 p-3 rounded text-sm mt-2">
                  {JSON.stringify(diagnosticData.database.error, null, 2)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={runDiagnostic}
            className="w-full"
            variant="outline"
          >
            Relancer le diagnostic
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => window.location.href = '/auth/pro/connexion'}
              variant="outline"
            >
              Page de connexion
            </Button>
            <Button 
              onClick={() => window.location.href = '/pro/dashboard'}
              variant="outline"
            >
              Tableau de bord
            </Button>
          </div>

          {diagnosticData.auth?.user && !diagnosticData.establishment && (
            <Button 
              onClick={() => window.location.href = '/pro/inscription'}
              className="w-full"
            >
              Créer mon établissement
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}