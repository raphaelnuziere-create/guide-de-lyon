#!/usr/bin/env node

/**
 * Script pour tester l'authentification en ligne sur www.guide-de-lyon.fr
 * Teste la connexion avec les comptes pro@test.com et expert@test.com
 */

const SITE_URL = 'https://www.guide-de-lyon.fr';

// Comptes de test
const TEST_ACCOUNTS = [
  { email: 'pro@test.com', password: 'testpro123!', plan: 'pro' },
  { email: 'expert@test.com', password: 'testexpert456!', plan: 'expert' }
];

console.log('🌐 TEST AUTHENTIFICATION EN LIGNE');
console.log('📍 Site:', SITE_URL);
console.log('');

async function testLogin(email, password, plan) {
  try {
    console.log(`🔐 Test connexion: ${email}`);
    
    // 1. Test de l'API de login
    const loginResponse = await fetch(`${SITE_URL}/api/auth/pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        action: 'signin',
        email, 
        password 
      })
    });

    console.log(`   Status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('   ✅ Connexion réussie');
      console.log(`   📊 Données: ${JSON.stringify(loginData, null, 2).substring(0, 200)}...`);
      
      // 2. Test de récupération du profil utilisateur
      const cookies = loginResponse.headers.get('set-cookie');
      
      if (cookies) {
        const profileResponse = await fetch(`${SITE_URL}/api/user/profile`, {
          headers: {
            'Cookie': cookies
          }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('   ✅ Profil récupéré');
          console.log(`   👤 User ID: ${profileData.userId || 'N/A'}`);
          console.log(`   🏢 Établissement ID: ${profileData.establishmentId || 'N/A'}`);
          console.log(`   📋 Plan: ${profileData.plan || 'N/A'}`);
        } else {
          console.log('   ⚠️  Erreur récupération profil:', profileResponse.status);
        }
      }
      
    } else {
      const errorText = await loginResponse.text().catch(() => 'Pas de réponse');
      console.log('   ❌ Connexion échouée');
      console.log(`   📝 Response body: ${errorText.substring(0, 500)}`);
      
      try {
        const errorData = JSON.parse(errorText);
        console.log(`   📝 Erreur: ${errorData.error || 'Erreur inconnue'}`);
      } catch (e) {
        console.log(`   📝 Erreur parsing JSON: ${e.message}`);
      }
    }
    
    console.log('');
    
  } catch (error) {
    console.error(`   💥 Erreur: ${error.message}`);
    console.log('');
  }
}

async function testSiteAccessibility() {
  try {
    console.log('🌐 Test accessibilité du site...');
    
    const response = await fetch(SITE_URL);
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log('   ✅ Site accessible');
    } else {
      console.log('   ❌ Site inaccessible');
    }
    
    // Test page de connexion
    const loginPageResponse = await fetch(`${SITE_URL}/auth/pro/connexion`);
    console.log(`   Page connexion: ${loginPageResponse.status}`);
    
    if (loginPageResponse.ok) {
      console.log('   ✅ Page connexion accessible');
    } else {
      console.log('   ❌ Page connexion inaccessible');
    }
    
  } catch (error) {
    console.error(`   💥 Erreur: ${error.message}`);
  }
  
  console.log('');
}

async function main() {
  // 1. Test d'accessibilité
  await testSiteAccessibility();
  
  // 2. Test des comptes
  for (const account of TEST_ACCOUNTS) {
    await testLogin(account.email, account.password, account.plan);
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎯 Tests terminés !');
  console.log('');
  console.log('📍 Pour tester manuellement :');
  console.log(`   1. Allez sur: ${SITE_URL}/auth/pro/connexion`);
  console.log('   2. Connectez-vous avec:');
  TEST_ACCOUNTS.forEach(account => {
    console.log(`      • ${account.email} / ${account.password} (plan ${account.plan})`);
  });
}

main().catch(console.error);