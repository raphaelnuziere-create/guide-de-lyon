#!/usr/bin/env node

/**
 * Script pour débugger la connexion Directus en production
 */

const PRODUCTION_URL = 'https://www.guide-de-lyon.fr';

console.log('🔍 DEBUG DIRECTUS EN PRODUCTION');
console.log('');

async function testDirectusConfigAPI() {
  try {
    console.log('🌐 Test API de configuration...');
    
    // Tester l'endpoint de vérification des variables d'env
    const response = await fetch(`${PRODUCTION_URL}/api/check-config`);
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Config accessible');
      console.log(`   📊 Données: ${JSON.stringify(data, null, 2)}`);
    } else {
      const errorText = await response.text();
      console.log('   ❌ Erreur config');
      console.log(`   📝 Response: ${errorText.substring(0, 500)}`);
    }
    
  } catch (error) {
    console.error(`   💥 Erreur: ${error.message}`);
  }
  
  console.log('');
}

async function testDirectusConnection() {
  try {
    console.log('🗄️  Test connexion Directus directe...');
    
    // Tester la connexion directe à Directus
    const directusUrl = 'https://guide-lyon-cms.directus.app';
    const response = await fetch(`${directusUrl}/server/health`);
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Directus accessible');
      console.log(`   📊 Health: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log('   ❌ Directus inaccessible');
    }
    
  } catch (error) {
    console.error(`   💥 Erreur Directus: ${error.message}`);
  }
  
  console.log('');
}

async function testAuthAPI() {
  try {
    console.log('🔐 Test API auth en production...');
    
    // Tester avec les vraies données
    const response = await fetch(`${PRODUCTION_URL}/api/auth/pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'signin',
        email: 'pro@test.com',
        password: 'testpro123!'
      })
    });
    
    console.log(`   Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`   Response: ${responseText.substring(0, 1000)}`);
    
    if (response.ok) {
      console.log('   ✅ Auth API fonctionne');
    } else {
      console.log('   ❌ Auth API échoue');
    }
    
  } catch (error) {
    console.error(`   💥 Erreur: ${error.message}`);
  }
  
  console.log('');
}

async function testEnvVariables() {
  try {
    console.log('🔧 Test variables d\'environnement...');
    
    // Créer un endpoint temporaire pour tester les env vars
    const testPayload = {
      action: 'test-env'
    };
    
    const response = await fetch(`${PRODUCTION_URL}/api/test-env`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 404) {
      console.log('   ⚠️  Endpoint /api/test-env n\'existe pas (normal)');
    } else {
      const responseText = await response.text();
      console.log(`   Response: ${responseText.substring(0, 500)}`);
    }
    
  } catch (error) {
    console.error(`   💥 Erreur: ${error.message}`);
  }
  
  console.log('');
}

async function main() {
  console.log('🎯 DIAGNOSTIC COMPLET EN PRODUCTION');
  console.log('=====================================');
  console.log('');
  
  await testDirectusConnection();
  await testDirectusConfigAPI();
  await testEnvVariables();
  await testAuthAPI();
  
  console.log('🎯 Solutions possibles :');
  console.log('1. 🔧 Vérifier variables d\'environnement Vercel :');
  console.log('   - NEXT_PUBLIC_DIRECTUS_URL=https://guide-lyon-cms.directus.app');
  console.log('   - DIRECTUS_ADMIN_EMAIL=admin@guide-lyon.fr');
  console.log('   - DIRECTUS_ADMIN_PASSWORD=AdminPassword123!');
  console.log('   - NEXT_PUBLIC_USE_DIRECTUS=true');
  console.log('');
  console.log('2. 🌐 Vérifier que Directus Cloud est accessible depuis Vercel');
  console.log('3. 🔄 Redéployer après correction des variables');
  console.log('');
  console.log('💡 Commandes Vercel :');
  console.log('   vercel env ls                    # Lister les variables');
  console.log('   vercel env add [NAME]            # Ajouter une variable');
  console.log('   vercel --prod                    # Redéployer');
}

main().catch(console.error);