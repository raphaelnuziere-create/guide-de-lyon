#!/usr/bin/env node

const fetch = require('node-fetch');

const DIRECTUS_URL = 'http://localhost:8055';

async function createTestUsers() {
  console.log('🚀 Création des utilisateurs test dans Directus...');

  try {
    // 1. Login admin (essayer différents credentials)
    const adminCredentials = [
      { email: 'admin@admin.com', password: 'admin' },
      { email: 'admin@example.com', password: 'admin' },
      { email: 'admin@test.com', password: 'password' },
      { email: 'admin', password: 'admin' }
    ];

    let accessToken = null;
    let adminEmail = null;

    console.log('🔐 Tentative de connexion admin...');
    
    for (const creds of adminCredentials) {
      try {
        const loginResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(creds)
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          if (loginData.data && loginData.data.access_token) {
            accessToken = loginData.data.access_token;
            adminEmail = creds.email;
            console.log(`✅ Connexion admin réussie avec: ${adminEmail}`);
            break;
          }
        }
      } catch (error) {
        // Continue avec les autres credentials
      }
    }

    if (!accessToken) {
      console.log('❌ Impossible de se connecter en tant qu\'admin');
      console.log('📝 Veuillez créer les comptes manuellement :');
      console.log('   1. Aller sur http://localhost:8055/admin');
      console.log('   2. Se connecter');
      console.log('   3. Users > Create User');
      console.log('   4. Créer pro@test.com / ProTest123!');
      console.log('   5. Créer expert@test.com / ExpertTest123!');
      return;
    }

    // 2. Créer les utilisateurs test
    const testUsers = [
      {
        email: 'pro@test.com',
        password: 'ProTest123!',
        first_name: 'Test',
        last_name: 'Pro',
        status: 'active'
      },
      {
        email: 'expert@test.com',
        password: 'ExpertTest123!',
        first_name: 'Test',
        last_name: 'Expert',
        status: 'active'
      }
    ];

    console.log('👤 Création des utilisateurs...');

    for (const user of testUsers) {
      try {
        const createResponse = await fetch(`${DIRECTUS_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(user)
        });

        if (createResponse.ok) {
          const userData = await createResponse.json();
          console.log(`✅ Utilisateur créé: ${user.email} (ID: ${userData.data.id})`);
        } else {
          const errorData = await createResponse.text();
          if (errorData.includes('already exists') || errorData.includes('duplicate')) {
            console.log(`ℹ️ L'utilisateur ${user.email} existe déjà`);
          } else {
            console.log(`⚠️ Erreur création ${user.email}: ${errorData}`);
          }
        }
      } catch (error) {
        console.error(`❌ Erreur création ${user.email}:`, error.message);
      }
    }

    console.log('\n🎉 Configuration terminée !');
    console.log('🔗 Testez maintenant sur: http://localhost:3000/auth/pro/connexion');
    console.log('👤 Comptes disponibles:');
    console.log('   • PRO: pro@test.com / ProTest123!');
    console.log('   • EXPERT: expert@test.com / ExpertTest123!');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.log('\n🔧 Solution alternative:');
    console.log('1. Ouvrir http://localhost:8055/admin');
    console.log('2. Se connecter avec les credentials admin');
    console.log('3. Créer manuellement les utilisateurs ci-dessus');
  }
}

// Exécuter le script
createTestUsers().then(() => {
  console.log('✅ Script terminé');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script échoué:', error);
  process.exit(1);
});