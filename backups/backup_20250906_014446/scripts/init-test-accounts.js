/**
 * Script d'initialisation des comptes de test
 * À exécuter une seule fois pour créer les comptes admin et merchant de test
 * 
 * Usage: node scripts/init-test-accounts.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Clé service avec droits admin

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('Assurez-vous d\'avoir configuré:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (clé service role, pas anon)');
  process.exit(1);
}

// Créer le client Supabase avec la clé service
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestAccounts() {
  console.log('🚀 Création des comptes de test...\n');

  // 1. Créer le compte admin
  console.log('📌 Création du compte admin...');
  try {
    const { data: adminAuth, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@guide-de-lyon.fr',
      password: 'Admin2025!',
      email_confirm: true,
      user_metadata: {
        display_name: 'Administrateur',
        role: 'admin'
      }
    });

    if (adminError) {
      if (adminError.message.includes('already been registered')) {
        console.log('⚠️  Le compte admin existe déjà');
      } else {
        throw adminError;
      }
    } else if (adminAuth?.user) {
      // Mettre à jour le profil
      await supabase
        .from('profiles')
        .upsert({
          id: adminAuth.user.id,
          role: 'admin',
          display_name: 'Administrateur'
        });
      console.log('✅ Compte admin créé avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur création admin:', error.message);
  }

  // 2. Créer le compte merchant de test
  console.log('\n📌 Création du compte merchant de test...');
  try {
    const { data: merchantAuth, error: merchantError } = await supabase.auth.admin.createUser({
      email: 'merchant@guide-de-lyon.fr',
      password: 'Merchant2025!',
      email_confirm: true,
      user_metadata: {
        display_name: 'Restaurant Test Lyon',
        role: 'merchant'
      }
    });

    if (merchantError) {
      if (merchantError.message.includes('already been registered')) {
        console.log('⚠️  Le compte merchant existe déjà');
      } else {
        throw merchantError;
      }
    } else if (merchantAuth?.user) {
      // Créer le profil merchant
      await supabase
        .from('profiles')
        .upsert({
          id: merchantAuth.user.id,
          role: 'merchant',
          display_name: 'Restaurant Test Lyon'
        });

      // Créer les données merchant
      await supabase
        .from('merchants')
        .upsert({
          id: merchantAuth.user.id,
          company_name: 'Restaurant Test Lyon',
          email: 'merchant@guide-de-lyon.fr',
          phone: '04 78 12 34 56',
          plan: 'free',
          verified: true,
          verification_date: new Date().toISOString()
        });

      console.log('✅ Compte merchant créé avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur création merchant:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📝 COMPTES DE TEST DISPONIBLES:');
  console.log('='.repeat(50));
  console.log('\n🔐 ADMIN:');
  console.log('   Email: admin@guide-de-lyon.fr');
  console.log('   Pass:  Admin2025!');
  console.log('\n🏢 MERCHANT:');
  console.log('   Email: merchant@guide-de-lyon.fr');
  console.log('   Pass:  Merchant2025!');
  console.log('\n✨ Les comptes sont prêts à être utilisés !');
}

// Exécuter le script
createTestAccounts().catch(console.error);