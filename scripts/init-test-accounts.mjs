/**
 * Script d'initialisation des comptes de test
 * À exécuter une seule fois pour créer les comptes admin et merchant de test
 * 
 * Usage: node scripts/init-test-accounts.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Récupérer les variables depuis le fichier .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gscrocmpqsakzmpvhrir.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzY3JvY21wcXNha3ptcHZocmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3OTU0NDMsImV4cCI6MjA0NTM3MTQ0M30.HlCJpdUKDdMuHROiMOGD7rzddPqpXgh5c7yChzQEfJU';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestAccounts() {
  console.log('🚀 Création des comptes de test...\n');

  // 1. Créer le compte admin
  console.log('📌 Création du compte admin...');
  try {
    const { data: adminAuth, error: adminError } = await supabase.auth.signUp({
      email: 'admin@guide-de-lyon.fr',
      password: 'Admin2025!',
      options: {
        data: {
          display_name: 'Administrateur',
          role: 'admin'
        }
      }
    });

    if (adminError) {
      if (adminError.message.includes('already')) {
        console.log('⚠️  Le compte admin existe déjà');
      } else {
        throw adminError;
      }
    } else if (adminAuth?.user) {
      // Mettre à jour le profil en admin
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', adminAuth.user.id);
      
      console.log('✅ Compte admin créé avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur création admin:', error.message);
  }

  // 2. Créer le compte merchant de test
  console.log('\n📌 Création du compte merchant de test...');
  try {
    const { data: merchantAuth, error: merchantError } = await supabase.auth.signUp({
      email: 'merchant@guide-de-lyon.fr',
      password: 'Merchant2025!',
      options: {
        data: {
          display_name: 'Restaurant Test Lyon',
          role: 'merchant'
        }
      }
    });

    if (merchantError) {
      if (merchantError.message.includes('already')) {
        console.log('⚠️  Le compte merchant existe déjà');
      } else {
        throw merchantError;
      }
    } else if (merchantAuth?.user) {
      // Créer les données merchant
      await supabase
        .from('merchants')
        .insert({
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
  console.log('   URL:   /connexion/admin');
  console.log('\n🏢 MERCHANT:');
  console.log('   Email: merchant@guide-de-lyon.fr');
  console.log('   Pass:  Merchant2025!');
  console.log('   URL:   /connexion/pro');
  console.log('\n✨ Les comptes sont prêts à être utilisés !');
}

// Exécuter le script
createTestAccounts().catch(console.error);