#!/usr/bin/env node

// Script pour recréer le compte merchant avec établissement
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recreateMerchant() {
  console.log('🔄 Recréation complète du compte merchant...\n');

  try {
    const merchantEmail = 'merchant@guide-de-lyon.fr';
    const merchantPassword = 'Merchant2025!';
    
    // 1. Récupérer ou créer l'utilisateur
    console.log('1. Gestion de l\'utilisateur merchant...');
    
    // D'abord essayer de se connecter
    let userId;
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: merchantEmail,
      password: merchantPassword
    });
    
    if (signInData?.user) {
      userId = signInData.user.id;
      console.log('✅ Utilisateur existant trouvé:', userId);
    } else {
      // Créer le compte si nécessaire
      console.log('📝 Création du compte...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: merchantEmail,
        password: merchantPassword
      });
      
      if (signUpError) {
        console.error('❌ Erreur création compte:', signUpError);
        return;
      }
      
      userId = signUpData.user.id;
      console.log('✅ Compte créé:', userId);
    }
    
    // 2. Nettoyer les anciennes données
    console.log('\n2. Nettoyage des anciennes données...');
    
    // Supprimer les anciens abonnements liés à cet utilisateur
    const { data: oldEstablishments } = await supabase
      .from('establishments')
      .select('id')
      .eq('user_id', userId);
    
    if (oldEstablishments && oldEstablishments.length > 0) {
      for (const est of oldEstablishments) {
        await supabase.from('subscriptions').delete().eq('establishment_id', est.id);
      }
    }
    
    // Supprimer les anciens établissements
    await supabase.from('establishments').delete().eq('user_id', userId);
    console.log('✅ Anciennes données nettoyées');
    
    // 3. Créer le nouvel établissement
    console.log('\n3. Création de l\'établissement...');
    const { data: establishment, error: estError } = await supabase
      .from('establishments')
      .insert({
        user_id: userId,
        name: 'Restaurant Test Lyon',
        vat_number: 'FR12345678901',
        phone: '04 78 12 34 56',
        address: '123 Rue de la République',
        city: 'Lyon',
        postal_code: '69001',
        email: merchantEmail,
        status: 'active',
        description: 'Un restaurant de test pour la plateforme',
        website: 'https://restaurant-test.fr'
      })
      .select()
      .single();
    
    if (estError) {
      console.error('❌ Erreur création établissement:', estError);
      return;
    }
    
    console.log('✅ Établissement créé:', establishment.id);
    
    // 4. Créer l'abonnement
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
          establishment_id: establishment.id,
          plan_id: plan.id,
          status: 'active',
          events_used_this_month: 0,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      
      if (subError) {
        console.error('❌ Erreur création abonnement:', subError);
      } else {
        console.log('✅ Abonnement Basic créé');
      }
    }
    
    // 5. Test final
    console.log('\n5. Test de connexion final...');
    const { data: testSignIn, error: testError } = await supabase.auth.signInWithPassword({
      email: merchantEmail,
      password: merchantPassword
    });
    
    if (testError) {
      console.error('❌ Erreur test connexion:', testError);
    } else {
      console.log('✅ Connexion test réussie');
      
      // Vérifier que l'établissement est bien lié
      const { data: testEst } = await supabase
        .from('establishments')
        .select('*, subscriptions(*)')
        .eq('user_id', testSignIn.user.id)
        .single();
      
      if (testEst) {
        console.log('✅ Établissement vérifié:', testEst.name);
        console.log('✅ Abonnement vérifié:', testEst.subscriptions?.length > 0 ? 'Oui' : 'Non');
      }
    }
    
    console.log('\n🎉 Compte merchant recréé avec succès !');
    console.log('\n📝 Pour tester :');
    console.log('================================');
    console.log('URL: http://localhost:3000/connexion/pro');
    console.log('Email: merchant@guide-de-lyon.fr');
    console.log('Mot de passe: Merchant2025!');
    console.log('================================\n');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter
recreateMerchant();