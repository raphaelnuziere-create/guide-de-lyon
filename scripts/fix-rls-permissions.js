#!/usr/bin/env node

// Script pour corriger les permissions RLS sur la table establishments
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
  console.log('Cette clé est nécessaire pour modifier les politiques RLS');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🔧 Correction des politiques RLS pour establishments...\n');

  try {
    // Test : créer un utilisateur test et un établissement
    console.log('1. Création d\'un utilisateur test...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Erreur création utilisateur test:', authError);
      return;
    }
    
    console.log('✅ Utilisateur test créé:', authData.user.id);
    
    // 2. Tenter de créer un établissement avec cet utilisateur
    console.log('\n2. Test création établissement...');
    
    // Se connecter en tant que cet utilisateur
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('❌ Erreur connexion:', signInError);
      return;
    }
    
    // Créer un client avec le token de l'utilisateur
    const userSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          Authorization: `Bearer ${signInData.session.access_token}`
        }
      }
    });
    
    const { data: establishment, error: estError } = await userSupabase
      .from('establishments')
      .insert({
        user_id: authData.user.id,
        name: 'Test Restaurant RLS',
        email: testEmail,
        category: 'Restaurant',
        status: 'pending'
      })
      .select()
      .single();
    
    if (estError) {
      console.error('❌ Erreur création établissement:', estError);
      console.log('\n⚠️  Les politiques RLS bloquent la création !');
      console.log('\n📝 Solution : Exécutez ce SQL dans Supabase Dashboard :');
      console.log('https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new\n');
      console.log('-- Copier-coller ce SQL :');
      console.log('----------------------------------------');
      console.log(`
-- Désactiver temporairement RLS
ALTER TABLE establishments DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can insert their own establishments" ON establishments;

-- Réactiver RLS
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- Créer nouvelle politique pour INSERT
CREATE POLICY "Authenticated users can create establishments" 
ON establishments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Vérifier
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'establishments';
      `);
      console.log('----------------------------------------');
    } else {
      console.log('✅ Établissement créé avec succès !');
      console.log('Les politiques RLS sont correctes.');
      
      // Nettoyer
      await supabase
        .from('establishments')
        .delete()
        .eq('id', establishment.id);
    }
    
    // 3. Nettoyer l'utilisateur test
    console.log('\n3. Nettoyage...');
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Utilisateur test supprimé');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Alternative : Utiliser directement le service role pour forcer la création
async function forceCreateEstablishment(userId, establishmentData) {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data, error } = await supabaseAdmin
    .from('establishments')
    .insert({
      user_id: userId,
      ...establishmentData
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erreur création forcée:', error);
    return null;
  }
  
  return data;
}

// Exporter pour utilisation dans inscription
module.exports = { forceCreateEstablishment };

// Exécuter si appelé directement
if (require.main === module) {
  fixRLSPolicies();
}