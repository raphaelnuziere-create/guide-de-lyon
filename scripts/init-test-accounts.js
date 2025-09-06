#!/usr/bin/env node

// Script pour créer les comptes de test
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables Supabase manquantes dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAccounts() {
  console.log('🚀 Création des comptes de test...\n');

  try {
    // 1. Créer le compte admin
    console.log('👤 Création du compte admin...');
    const adminEmail = 'admin@guide-de-lyon.fr';
    const adminPassword = 'Admin2025!';
    
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          display_name: 'Administrateur',
          role: 'admin'
        }
      }
    });

    if (adminError && !adminError.message.includes('already registered')) {
      console.error('❌ Erreur création admin:', adminError.message);
    } else if (adminData?.user) {
      console.log('✅ Compte admin créé:', adminEmail);
      
      // Créer le profil admin
      await supabase.from('profiles').upsert({
        id: adminData.user.id,
        email: adminEmail,
        display_name: 'Administrateur',
        role: 'admin'
      });
    } else {
      console.log('ℹ️  Compte admin existe déjà');
    }

    // 2. Créer le compte merchant de test
    console.log('\n👤 Création du compte merchant...');
    const merchantEmail = 'merchant@guide-de-lyon.fr';
    const merchantPassword = 'Merchant2025!';
    
    const { data: merchantData, error: merchantError } = await supabase.auth.signUp({
      email: merchantEmail,
      password: merchantPassword,
      options: {
        data: {
          display_name: 'Restaurant Test Lyon',
          role: 'merchant'
        }
      }
    });

    if (merchantError && !merchantError.message.includes('already registered')) {
      console.error('❌ Erreur création merchant:', merchantError.message);
    } else if (merchantData?.user) {
      console.log('✅ Compte merchant créé:', merchantEmail);
      
      // Créer le profil merchant
      await supabase.from('profiles').upsert({
        id: merchantData.user.id,
        email: merchantEmail,
        display_name: 'Restaurant Test Lyon',
        role: 'merchant'
      });
      
      // Créer l'entry dans la table merchants
      await supabase.from('merchants').upsert({
        id: merchantData.user.id,
        company_name: 'Restaurant Test Lyon',
        email: merchantEmail,
        phone: '04 78 12 34 56',
        plan: 'free',
        verified: false
      });

      // Créer un établissement pour le merchant
      const { data: establishment } = await supabase
        .from('establishments')
        .insert({
          user_id: merchantData.user.id,
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

      if (establishment) {
        console.log('✅ Établissement créé:', establishment.name);
        
        // Récupérer le plan Basic
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('slug', 'basic')
          .single();
        
        if (plan) {
          // Créer un abonnement Basic
          await supabase
            .from('subscriptions')
            .insert({
              establishment_id: establishment.id,
              plan_id: plan.id,
              status: 'active',
              events_used_this_month: 0
            });
          console.log('✅ Abonnement Basic créé');
        }
      }
    } else {
      console.log('ℹ️  Compte merchant existe déjà');
    }

    console.log('\n🎉 Comptes de test créés avec succès !');
    console.log('\n📝 Informations de connexion :');
    console.log('================================');
    console.log('Admin:');
    console.log('  Email: admin@guide-de-lyon.fr');
    console.log('  Mot de passe: Admin2025!');
    console.log('  URL: /connexion/admin');
    console.log('\nMerchant:');
    console.log('  Email: merchant@guide-de-lyon.fr');
    console.log('  Mot de passe: Merchant2025!');
    console.log('  URL: /connexion/pro');
    console.log('================================\n');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
createTestAccounts();