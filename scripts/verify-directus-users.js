#!/usr/bin/env node

const DIRECTUS_URL = 'https://guide-lyon-cms.directus.app';

async function verifyUsers() {
  console.log('🔍 VÉRIFICATION DES UTILISATEURS DIRECTUS');
  console.log(`📍 URL: ${DIRECTUS_URL}`);
  console.log('');

  try {
    // 1. Connexion admin
    const loginResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'raphael.nuziere@gmail.com',
        password: 'Azerty25!'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Connexion admin échouée');
      return;
    }
    
    const { data } = await loginResponse.json();
    const token = data.access_token;
    console.log('✅ Connecté comme admin');
    
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // 2. Vérifier les collections disponibles
    console.log('📊 Collections disponibles:');
    try {
      const collectionsResponse = await fetch(`${DIRECTUS_URL}/collections`, { headers });
      if (collectionsResponse.ok) {
        const collections = await collectionsResponse.json();
        collections.data.forEach(col => {
          console.log(`  - ${col.collection}`);
        });
      }
    } catch (error) {
      console.log('⚠️ Impossible de lister les collections');
    }

    console.log('');

    // 3. Vérifier les utilisateurs dans la collection users
    console.log('👥 Utilisateurs dans la collection "users":');
    try {
      const usersResponse = await fetch(`${DIRECTUS_URL}/items/users`, { headers });
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        if (users.data && users.data.length > 0) {
          users.data.forEach(user => {
            console.log(`  ✅ ${user.email} (role: ${user.role || 'non défini'})`);
          });
        } else {
          console.log('  ❌ Aucun utilisateur trouvé');
        }
      } else {
        console.log('  ❌ Impossible d\'accéder aux utilisateurs:', usersResponse.status);
      }
    } catch (error) {
      console.log('  ❌ Erreur accès users:', error.message);
    }

    // 4. Test de connexion avec les comptes de test
    console.log('');
    console.log('🔐 Test de connexion des comptes:');
    
    const testAccounts = [
      { email: 'pro@test.com', password: 'ProTest123!' },
      { email: 'expert@test.com', password: 'ExpertTest123!' }
    ];

    for (const account of testAccounts) {
      try {
        const testResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(account)
        });
        
        if (testResponse.ok) {
          console.log(`  ✅ ${account.email} - Connexion OK`);
        } else {
          const error = await testResponse.json();
          console.log(`  ❌ ${account.email} - Échec:`, error.errors?.[0]?.message || testResponse.status);
        }
      } catch (error) {
        console.log(`  ❌ ${account.email} - Erreur:`, error.message);
      }
    }

    console.log('');
    console.log('🔧 ACTIONS RECOMMANDÉES:');
    console.log('1. Si les utilisateurs n\'existent pas, les recréer manuellement dans Directus');
    console.log('2. Si les utilisateurs existent mais la connexion échoue, vérifier les mots de passe');
    console.log('3. Si tout semble OK, le problème vient du code frontend');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

verifyUsers();