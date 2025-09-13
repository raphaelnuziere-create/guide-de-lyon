#!/usr/bin/env node

const DIRECTUS_URL = 'https://guide-lyon-cms.directus.app';

async function fixPasswords() {
  console.log('🔧 CORRECTION DES MOTS DE PASSE');
  
  try {
    // Connexion admin
    const loginResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'raphael.nuziere@gmail.com',
        password: 'Azerty25!'
      })
    });
    
    const { data } = await loginResponse.json();
    const token = data.access_token;
    console.log('✅ Connecté comme admin');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Récupérer les IDs des utilisateurs
    const usersResponse = await fetch(`${DIRECTUS_URL}/items/users`, { headers });
    const users = await usersResponse.json();
    
    const proUser = users.data.find(u => u.email === 'pro@test.com');
    const expertUser = users.data.find(u => u.email === 'expert@test.com');

    // Corriger le mot de passe PRO
    if (proUser) {
      const updateResponse = await fetch(`${DIRECTUS_URL}/items/users/${proUser.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          password: 'ProTest123!'
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Mot de passe PRO mis à jour');
      } else {
        console.log('❌ Erreur MAJ PRO:', await updateResponse.text());
      }
    }

    // Corriger le mot de passe EXPERT
    if (expertUser) {
      const updateResponse = await fetch(`${DIRECTUS_URL}/items/users/${expertUser.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          password: 'ExpertTest123!'
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Mot de passe EXPERT mis à jour');
      } else {
        console.log('❌ Erreur MAJ EXPERT:', await updateResponse.text());
      }
    }

    // Test final
    console.log('');
    console.log('🔐 Test de connexion après correction:');
    
    const testAccounts = [
      { email: 'pro@test.com', password: 'ProTest123!' },
      { email: 'expert@test.com', password: 'ExpertTest123!' }
    ];

    for (const account of testAccounts) {
      const testResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      
      if (testResponse.ok) {
        console.log(`  ✅ ${account.email} - Connexion OK`);
      } else {
        console.log(`  ❌ ${account.email} - Échec`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

fixPasswords();