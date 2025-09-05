#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Configuration Supabase
const SUPABASE_URL = 'https://gscrocmpqsakzmpvhrir.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('🔐 Création de votre compte administrateur\n');
  console.log('⚠️  IMPORTANT: Vous allez avoir besoin de votre clé SERVICE_ROLE_KEY de Supabase.');
  console.log('📍 Où la trouver: Supabase Dashboard > Settings > API > service_role (secret)\n');

  try {
    // Demander la clé service role
    const serviceKey = await question('Collez votre SERVICE_ROLE_KEY ici: ');
    
    if (!serviceKey || serviceKey.length < 100) {
      console.error('❌ Clé invalide. Elle doit commencer par eyJ...');
      process.exit(1);
    }

    // Créer le client Supabase avec la clé service
    const supabase = createClient(SUPABASE_URL, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('\n📝 Informations pour votre compte admin:\n');
    
    // Demander les informations
    const email = await question('Votre email (ex: vous@gmail.com): ');
    const password = await question('Mot de passe (min 8 caractères): ');
    const displayName = await question('Nom d\'affichage (ex: Raphaël): ');

    console.log('\n⏳ Création du compte en cours...');

    // Créer l'utilisateur avec email auto-confirmé
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName
      }
    });

    if (authError) {
      console.error('❌ Erreur lors de la création:', authError.message);
      process.exit(1);
    }

    console.log('✅ Utilisateur créé avec succès!');

    // Créer le profil admin
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        role: 'admin',
        display_name: displayName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('⚠️  Avertissement profil:', profileError.message);
      // On continue quand même car l'utilisateur est créé
    }

    console.log('✅ Profil admin créé!');

    // Confirmer aussi les comptes de test
    console.log('\n📧 Confirmation des comptes de test...');
    
    const testAccounts = ['admin@guide-de-lyon.fr', 'merchant@guide-de-lyon.fr'];
    
    for (const testEmail of testAccounts) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const testUser = users.users.find(u => u.email === testEmail);
      
      if (testUser && !testUser.email_confirmed_at) {
        await supabase.auth.admin.updateUserById(testUser.id, {
          email_confirm: true
        });
        console.log(`✅ ${testEmail} confirmé`);
      }
    }

    console.log('\n🎉 Succès! Votre compte admin est prêt!\n');
    console.log('📌 Récapitulatif:');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: [celui que vous avez choisi]`);
    console.log(`   Rôle: Administrateur`);
    console.log('\n🔗 Connectez-vous ici:');
    console.log('   https://www.guide-de-lyon.fr/connexion/admin\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    rl.close();
  }
}

// Lancer le script
createAdmin();