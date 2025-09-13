#!/usr/bin/env node

const { createDirectus, rest, authentication } = require('@directus/sdk');

const DIRECTUS_URL = 'https://guide-lyon-cms.directus.app';

async function testConnection() {
  console.log('🔍 TEST DE CONNEXION DIRECTUS');
  console.log(`📍 URL: ${DIRECTUS_URL}`);
  console.log('');

  // Test 1: Vérifier si l'instance est accessible
  try {
    console.log('1. Test d\'accessibilité...');
    const response = await fetch(`${DIRECTUS_URL}/server/info`);
    if (response.ok) {
      const info = await response.json();
      console.log('✅ Instance accessible');
      console.log(`   Version: ${info.data?.directus?.version || 'inconnue'}`);
    } else {
      console.log(`❌ Instance non accessible (${response.status})`);
      return;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    return;
  }

  // Test 2: Vérifier l'API
  try {
    console.log('2. Test API REST...');
    const client = createDirectus(DIRECTUS_URL).with(rest());
    // Test simple sans auth
    const response = await fetch(`${DIRECTUS_URL}/server/ping`);
    console.log(`✅ API REST accessible (${response.status})`);
  } catch (error) {
    console.log('⚠️ API REST:', error.message);
  }

  // Test 3: Information sur l'admin
  console.log('3. Information admin...');
  console.log('   📧 Email attendu: admin@guide-lyon.fr');
  console.log('   🔑 Password: AdminPassword123!');
  console.log('');
  console.log('🔧 ACTIONS REQUISES:');
  console.log('1. Va sur https://guide-lyon-cms.directus.app/admin');
  console.log('2. Si pas de compte admin, créer un compte avec:');
  console.log('   - Email: admin@guide-lyon.fr');
  console.log('   - Password: AdminPassword123!');
  console.log('3. Vérifie que l\'instance est bien configurée');
  console.log('4. Relance le script d\'initialisation');
}

testConnection();