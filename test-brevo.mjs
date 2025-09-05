#!/usr/bin/env node
/**
 * Script de test pour vérifier la configuration Brevo
 * Usage: node test-brevo.mjs
 */

import { config } from 'dotenv';
import brevo from '@getbrevo/brevo';
import { readFileSync } from 'fs';

// Charger les variables depuis .env.local
config({ path: '.env.local' });

// Vérification des variables d'environnement
console.log('🔍 Vérification de la configuration Brevo\n');
console.log('=' .repeat(50));

const requiredVars = {
  'BREVO_API_KEY': process.env.BREVO_API_KEY,
  'BREVO_SENDER_EMAIL': process.env.BREVO_SENDER_EMAIL,
  'BREVO_SENDER_NAME': process.env.BREVO_SENDER_NAME
};

let configOk = true;

for (const [key, value] of Object.entries(requiredVars)) {
  if (value) {
    console.log(`✅ ${key}: Configuré`);
    if (key === 'BREVO_API_KEY') {
      console.log(`   Début de la clé: ${value.substring(0, 10)}...`);
    } else {
      console.log(`   Valeur: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: MANQUANT`);
    configOk = false;
  }
}

console.log('\n' + '=' .repeat(50));

if (!configOk) {
  console.log('\n❌ Configuration incomplète !');
  console.log('Ajoutez les variables manquantes dans .env.local\n');
  process.exit(1);
}

// Test de connexion à l'API Brevo
console.log('\n🔄 Test de connexion à l\'API Brevo...\n');

async function testBrevoConnection() {
  try {
    const apiInstance = new brevo.AccountApi();
    const apiKey = apiInstance.authentications['apiKey'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    
    // Récupérer les informations du compte
    const account = await apiInstance.getAccount();
    
    console.log('✅ Connexion réussie !');
    console.log('\n📊 Informations du compte Brevo:');
    console.log('=' .repeat(50));
    console.log(`Email du compte: ${account.email}`);
    console.log(`Nom: ${account.firstName} ${account.lastName}`);
    
    // Plan et crédits
    if (account.plan && account.plan.length > 0) {
      const plan = account.plan[0];
      console.log(`\n📦 Plan actuel: ${plan.type}`);
      if (plan.creditsType === 'sendLimit') {
        console.log(`Limite d'envoi: ${plan.credits} emails/jour`);
      }
    }
    
    // Test d'envoi simple
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Configuration Brevo fonctionnelle !');
    console.log('\n📧 Prochaines étapes:');
    console.log('1. Testez l\'envoi sur: http://localhost:3000/admin/emails');
    console.log('2. Configurez vos templates sur: https://app.brevo.com');
    console.log('3. Vérifiez vos domaines sur: https://app.brevo.com/senders');
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion à Brevo:');
    
    if (error.response && error.response.body) {
      console.error('Message:', error.response.body.message || error.response.body);
      console.error('Code:', error.response.body.code);
    } else {
      console.error(error.message);
    }
    
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez que votre clé API est correcte');
    console.log('2. Générez une nouvelle clé sur:');
    console.log('   https://app.brevo.com/settings/keys/api');
    console.log('3. Vérifiez que votre compte est actif');
  }
}

// Exécuter le test
await testBrevoConnection();