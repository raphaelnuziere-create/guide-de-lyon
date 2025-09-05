#!/usr/bin/env node
/**
 * Script de test pour vérifier la configuration Brevo
 * Usage: node test-brevo-config.js
 */

import('dotenv/config').then(() => {
  require('dotenv').config({ path: '.env.local' });
}).catch(() => {
  // Si dotenv n'est pas disponible, continuer sans
});

const brevo = require('@getbrevo/brevo');

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
    console.log(`Nom du compte: ${account.companyName || 'N/A'}`);
    console.log(`Email: ${account.email}`);
    console.log(`Plan: ${account.plan?.[0]?.type || 'Free'}`);
    
    if (account.plan?.[0]?.credits) {
      console.log(`Crédits restants: ${account.plan[0].credits}`);
    }
    
    // Vérifier les domaines authentifiés
    const senderApi = new brevo.SendersApi();
    senderApi.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;
    
    try {
      const senders = await senderApi.getSenders();
      console.log('\n📧 Expéditeurs configurés:');
      console.log('=' .repeat(50));
      
      if (senders.senders && senders.senders.length > 0) {
        senders.senders.forEach(sender => {
          const status = sender.active ? '✅ Actif' : '⏸️ Inactif';
          console.log(`${status} ${sender.name} <${sender.email}>`);
        });
      } else {
        console.log('⚠️ Aucun expéditeur configuré');
        console.log('Ajoutez un expéditeur dans le dashboard Brevo');
      }
    } catch (senderError) {
      console.log('⚠️ Impossible de récupérer les expéditeurs');
    }
    
    // Test d'envoi (optionnel)
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Configuration Brevo fonctionnelle !');
    console.log('\nPour tester l\'envoi d\'email:');
    console.log('1. Allez sur http://localhost:3000/admin/emails');
    console.log('2. Entrez votre email et envoyez un test');
    
  } catch (error) {
    console.error('❌ Erreur de connexion à Brevo:');
    console.error(error.response?.body || error.message);
    
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez que votre clé API est correcte');
    console.log('2. Vérifiez que votre compte Brevo est actif');
    console.log('3. Générez une nouvelle clé API sur:');
    console.log('   https://app.brevo.com/settings/keys/api');
  }
}

// Exécuter le test
testBrevoConnection();