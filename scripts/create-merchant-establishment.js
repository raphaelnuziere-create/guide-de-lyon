#!/usr/bin/env node

// Script pour créer l'établissement du compte merchant test
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMerchantEstablishment() {
  console.log('🔧 Création établissement pour merchant@guide-de-lyon.fr...\n');

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
      console.log('Créez d\'abord le compte sur /pro/inscription');
      return;
    }
    
    console.log('✅ Utilisateur trouvé:', merchantUser.id);
    
    // 2. Vérifier si établissement existe déjà
    console.log('\n2. Vérification établissement existant...');
    const { data: existing, error: checkError } = await supabase
      .from('establishments')
      .select('*')
      .eq('user_id', merchantUser.id)
      .single();
    
    if (existing) {
      console.log('✅ Établissement déjà existant:', existing.name);
      console.log('ID:', existing.id);
      return;
    }
    
    // 3. Créer l'établissement avec les bonnes colonnes
    console.log('\n3. Création de l\'établissement...');
    const { data: newEst, error: createError } = await supabase
      .from('establishments')
      .insert({
        user_id: merchantUser.id,
        name: 'Restaurant Test Lyon',
        email: merchantEmail,
        phone: '04 78 12 34 56',
        address: '123 Rue de la République',
        city: 'Lyon',
        postal_code: '69001',
        website: 'https://restaurant-test.fr',
        facebook_url: 'restaurant-test-lyon',
        instagram_url: '@restaurant_test',
        description: 'Un restaurant de test pour la plateforme. Cuisine traditionnelle lyonnaise.',
        category: 'Restaurant',
        status: 'active'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erreur création établissement:', createError);
      return;
    }
    
    console.log('✅ Établissement créé avec succès !');
    console.log('ID:', newEst.id);
    console.log('Nom:', newEst.name);
    
    // 4. Créer l'abonnement basique
    console.log('\n4. Création de l\'abonnement...');
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('slug', 'basic')
      .single();
    
    if (plan) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          establishment_id: newEst.id,
          plan_id: plan.id,
          status: 'active',
          events_used_this_month: 0,
          billing_cycle: 'monthly',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      
      if (subError) {
        console.log('⚠️ Abonnement non créé (table peut-être manquante):', subError.message);
      } else {
        console.log('✅ Abonnement Basic créé');
      }
    }
    
    console.log('\n✨ Configuration terminée !');
    console.log('\n📝 Pour tester :');
    console.log('1. Allez sur http://localhost:3000/connexion/pro');
    console.log('2. Connectez-vous avec :');
    console.log('   Email: merchant@guide-de-lyon.fr');
    console.log('   Mot de passe: Merchant2025!');
    console.log('3. Vous devriez arriver directement sur le dashboard');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter
createMerchantEstablishment();