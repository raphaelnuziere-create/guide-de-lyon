#!/usr/bin/env node

const DIRECTUS_URL = 'https://guide-lyon-cms.directus.app';

async function debugAuth() {
  console.log('🔍 DEBUG AUTHENTIFICATION DIRECTUS');
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

    // 2. Vérifier les utilisateurs dans directus_users (système)
    console.log('👥 Utilisateurs système (directus_users):');
    try {
      const systemUsersResponse = await fetch(`${DIRECTUS_URL}/users`, { headers });
      if (systemUsersResponse.ok) {
        const systemUsers = await systemUsersResponse.json();
        console.log('  Total:', systemUsers.data?.length || 0);
        systemUsers.data?.forEach(user => {
          console.log(`  - ${user.email} (id: ${user.id}, role: ${user.role})`);
        });
      } else {
        console.log('  ❌ Impossible d\'accéder aux utilisateurs système');
      }
    } catch (error) {
      console.log('  ❌ Erreur:', error.message);
    }

    console.log('');

    // 3. Vérifier les utilisateurs dans notre collection personnalisée
    console.log('👤 Utilisateurs collection custom (users):');
    try {
      const customUsersResponse = await fetch(`${DIRECTUS_URL}/items/users`, { headers });
      if (customUsersResponse.ok) {
        const customUsers = await customUsersResponse.json();
        console.log('  Total:', customUsers.data?.length || 0);
        customUsers.data?.forEach(user => {
          console.log(`  - ${user.email} (id: ${user.id}, role: ${user.role})`);
        });
      } else {
        console.log('  ❌ Impossible d\'accéder à la collection users');
      }
    } catch (error) {
      console.log('  ❌ Erreur:', error.message);
    }

    console.log('');

    // 4. Vérifier les rôles disponibles
    console.log('🛡️  Rôles disponibles:');
    try {
      const rolesResponse = await fetch(`${DIRECTUS_URL}/roles`, { headers });
      if (rolesResponse.ok) {
        const roles = await rolesResponse.json();
        roles.data?.forEach(role => {
          console.log(`  - ${role.name} (id: ${role.id})`);
        });
      }
    } catch (error) {
      console.log('  ❌ Erreur roles:', error.message);
    }

    console.log('');

    // 5. Test de connexion détaillé
    console.log('🔐 Test connexion détaillé:');
    
    const testAccounts = [
      { email: 'pro@test.com', password: 'ProTest123!' },
      { email: 'expert@test.com', password: 'ExpertTest123!' }
    ];

    for (const account of testAccounts) {
      try {
        console.log(`\n  🔍 Test ${account.email}:`);
        
        const testResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(account)
        });
        
        const responseText = await testResponse.text();
        console.log(`    Status: ${testResponse.status}`);
        console.log(`    Headers:`, Object.fromEntries(testResponse.headers.entries()));
        
        try {
          const responseData = JSON.parse(responseText);
          console.log(`    Response:`, responseData);
          
          if (testResponse.ok) {
            console.log(`    ✅ Connexion réussie`);
          } else {
            console.log(`    ❌ Échec: ${responseData.errors?.[0]?.message || 'Erreur inconnue'}`);
          }
        } catch {
          console.log(`    Raw response: ${responseText}`);
        }
        
      } catch (error) {
        console.log(`    ❌ Erreur réseau: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

debugAuth();