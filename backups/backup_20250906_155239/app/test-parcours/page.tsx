'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TestParcours() {
  const router = useRouter();
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Données de test
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'Test123!';
  const testData = {
    name: 'Restaurant Test',
    vat_number: 'FR12345678901',
    phone: '0478123456',
    address: '123 Rue Test, 69001 Lyon',
    contact_name: 'Jean Test',
    contact_email: testEmail
  };

  const addResult = (message: string, success = true) => {
    setResults(prev => [...prev, `${success ? '✅' : '❌'} ${message}`]);
  };

  const runTest = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // 1. Test connexion Supabase
      addResult('Test connexion Supabase...');
      const { data: plans } = await supabase.from('subscription_plans').select('*');
      if (plans) {
        addResult(`Connexion OK - ${plans.length} plans trouvés`);
      }

      // 2. Test inscription
      addResult('Test inscription utilisateur...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });
      
      if (signUpError) {
        addResult(`Erreur inscription: ${signUpError.message}`, false);
        return;
      }
      
      if (signUpData.user) {
        addResult(`Utilisateur créé: ${signUpData.user.id}`);
      }

      // 3. Test création établissement
      addResult('Test création établissement...');
      const { data: establishment, error: estError } = await supabase
        .from('establishments')
        .insert({
          ...testData,
          user_id: signUpData.user!.id,
          email: testEmail,
          status: 'pending'
        })
        .select()
        .single();
      
      if (estError) {
        addResult(`Erreur établissement: ${estError.message}`, false);
      } else {
        addResult(`Établissement créé: ${establishment.id}`);
      }

      // 4. Test création abonnement
      if (establishment) {
        addResult('Test création abonnement Basic...');
        const { data: basicPlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('slug', 'basic')
          .single();
        
        if (basicPlan) {
          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .insert({
              establishment_id: establishment.id,
              plan_id: basicPlan.id,
              status: 'trialing'
            })
            .select()
            .single();
          
          if (subError) {
            addResult(`Erreur abonnement: ${subError.message}`, false);
          } else {
            addResult(`Abonnement créé: ${subscription.id}`);
          }
        }
      }

      // 5. Test connexion
      addResult('Test connexion...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        addResult(`Erreur connexion: ${signInError.message}`, false);
      } else {
        addResult('Connexion réussie!');
      }

      // 6. Test récupération établissement
      if (signInData?.user) {
        addResult('Test récupération données...');
        const { data: myEstablishment } = await supabase
          .from('establishments')
          .select(`
            *,
            subscription:subscriptions(
              *,
              plan:subscription_plans(*)
            )
          `)
          .eq('user_id', signInData.user.id)
          .single();
        
        if (myEstablishment) {
          addResult(`Établissement récupéré: ${myEstablishment.name}`);
          if (myEstablishment.subscription) {
            addResult(`Plan: ${myEstablishment.subscription.plan.name}`);
          }
        }
      }

      // 7. Déconnexion
      await supabase.auth.signOut();
      addResult('Déconnexion réussie');
      
      addResult('🎉 Test complet réussi!');
      
    } catch (error: any) {
      addResult(`Erreur générale: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const cleanupTest = async () => {
    setLoading(true);
    try {
      // Nettoyer les données de test
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('establishments').delete().eq('user_id', user.id);
        await supabase.auth.signOut();
      }
      addResult('Nettoyage effectué');
    } catch (error: any) {
      addResult(`Erreur nettoyage: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Test du parcours professionnel</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Actions de test</h2>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={runTest}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Test en cours...' : 'Lancer le test complet'}
            </button>
            
            <button
              onClick={cleanupTest}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Nettoyer les données
            </button>
            
            <button
              onClick={() => router.push('/pro')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test manuel → /pro
            </button>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>Ce test va :</p>
            <ul className="list-disc list-inside ml-4">
              <li>Créer un compte utilisateur test</li>
              <li>Créer un établissement</li>
              <li>Créer un abonnement Basic</li>
              <li>Tester la connexion</li>
              <li>Vérifier la récupération des données</li>
            </ul>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Résultats du test</h2>
            <div className="space-y-2 font-mono text-sm">
              {results.map((result, index) => (
                <div key={index} className={result.startsWith('❌') ? 'text-red-600' : 'text-gray-700'}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Parcours manuel recommandé :</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Aller sur <code>/pro</code> et choisir un plan</li>
            <li>Remplir le formulaire d'inscription sur <code>/pro/inscription</code></li>
            <li>Confirmer l'email (vérifier les spams)</li>
            <li>Se connecter sur <code>/connexion/pro</code></li>
            <li>Accéder au dashboard sur <code>/pro/dashboard</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}