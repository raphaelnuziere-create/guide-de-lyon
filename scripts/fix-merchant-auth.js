#!/usr/bin/env node

// Script pour corriger l'authentification merchant
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixMerchantAuth() {
  console.log('🔧 Correction de l\'authentification merchant...\n');

  try {
    const merchantEmail = 'merchant@guide-de-lyon.fr';
    
    // 1. Récupérer l'utilisateur
    console.log('1. Recherche de l\'utilisateur merchant...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Erreur récupération utilisateurs:', usersError);
      return;
    }
    
    const merchantUser = users.find(u => u.email === merchantEmail);
    if (!merchantUser) {
      console.error('❌ Utilisateur merchant non trouvé');
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', merchantUser.id);
    
    // 2. Créer/Mettre à jour la table profiles
    console.log('\n2. Création/Mise à jour du profil...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: merchantUser.id,
        email: merchantEmail,
        display_name: 'Restaurant Test Lyon',
        role: 'merchant',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error('❌ Erreur création profil:', profileError);
      // Continuer quand même
    } else {
      console.log('✅ Profil créé/mis à jour');
    }
    
    // 3. Créer/Mettre à jour la table merchants
    console.log('\n3. Création/Mise à jour dans la table merchants...');
    const { error: merchantError } = await supabase
      .from('merchants')
      .upsert({
        id: merchantUser.id,
        company_name: 'Restaurant Test Lyon',
        email: merchantEmail,
        phone: '04 78 12 34 56',
        plan: 'free',
        verified: false,
        created_at: new Date().toISOString()
      });
    
    if (merchantError) {
      console.error('❌ Erreur création merchant:', merchantError);
      // Continuer quand même
    } else {
      console.log('✅ Merchant créé/mis à jour');
    }
    
    // 4. Vérifier l'établissement
    console.log('\n4. Vérification de l\'établissement...');
    const { data: establishment, error: estError } = await supabase
      .from('establishments')
      .select('*')
      .eq('user_id', merchantUser.id)
      .single();
    
    if (estError || !establishment) {
      console.log('⚠️  Pas d\'établissement trouvé, création...');
      
      const { data: newEst, error: createError } = await supabase
        .from('establishments')
        .insert({
          user_id: merchantUser.id,
          name: 'Restaurant Test Lyon',
          vat_number: 'FR12345678901',
          phone: '04 78 12 34 56',
          address: '123 Rue de la République',
          city: 'Lyon',
          postal_code: '69001',
          email: merchantEmail,
          contact_name: 'Jean Test',
          status: 'active',
          description: 'Un restaurant de test pour la plateforme'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erreur création établissement:', createError);
      } else {
        console.log('✅ Établissement créé:', newEst.id);
        
        // Créer l'abonnement
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('slug', 'basic')
          .single();
        
        if (plan) {
          await supabase
            .from('subscriptions')
            .insert({
              establishment_id: newEst.id,
              plan_id: plan.id,
              status: 'active',
              events_used_this_month: 0
            });
          console.log('✅ Abonnement Basic créé');
        }
      }
    } else {
      console.log('✅ Établissement existant:', establishment.name);
    }
    
    // 5. Test de connexion
    console.log('\n5. Test de connexion...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: merchantEmail,
      password: 'Merchant2025!'
    });
    
    if (signInError) {
      console.error('❌ Erreur connexion:', signInError);
    } else {
      console.log('✅ Connexion test réussie');
    }
    
    console.log('\n✨ Correction terminée !');
    console.log('\n📝 Pour tester :');
    console.log('1. Allez sur http://localhost:3000/connexion/pro');
    console.log('2. Connectez-vous avec :');
    console.log('   Email: merchant@guide-de-lyon.fr');
    console.log('   Mot de passe: Merchant2025!');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter
fixMerchantAuth();