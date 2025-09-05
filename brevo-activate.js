#!/usr/bin/env node
/**
 * Script pour activer Brevo en envoyant des emails de test
 * Cela va débloquer l'interface Transactional
 */

const brevo = require('@getbrevo/brevo');
const fs = require('fs');
const path = require('path');

// Lire .env.local manuellement
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Utiliser les variables
const BREVO_API_KEY = envVars.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = envVars.BREVO_SENDER_EMAIL || 'contact@guide-de-lyon.fr';
const BREVO_SENDER_NAME = envVars.BREVO_SENDER_NAME || 'Guide de Lyon';

console.log('🚀 Activation de Brevo Transactional\n');
console.log('=' .repeat(50));
console.log('API Key:', BREVO_API_KEY ? '✅ Configurée' : '❌ Manquante');
console.log('Email expéditeur:', BREVO_SENDER_EMAIL);
console.log('=' .repeat(50));

if (!BREVO_API_KEY) {
  console.error('\n❌ BREVO_API_KEY manquante dans .env.local');
  process.exit(1);
}

const apiInstance = new brevo.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = BREVO_API_KEY;

async function sendActivationEmails() {
  // Votre email pour recevoir les tests
  const yourEmail = 'raphaelnuziere@gmail.com'; // Changez par votre email
  
  const testEmails = [
    {
      subject: 'Test 1 - Activation Brevo pour Guide de Lyon',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">Test d'activation Brevo</h1>
          <p>Ceci est le premier email de test pour activer les fonctionnalités transactionnelles.</p>
          <p style="color: #666;">Email envoyé depuis le script d'activation.</p>
          <hr style="border: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">Guide de Lyon - Test Email 1/3</p>
        </div>
      `,
      to: [{ email: yourEmail, name: 'Test User' }]
    },
    {
      subject: 'Test 2 - Newsletter Guide de Lyon',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Newsletter Test</h1>
          </div>
          <div style="padding: 30px;">
            <p>Test de newsletter pour activer Brevo.</p>
            <p>Les logs devraient apparaître après cet envoi.</p>
          </div>
        </div>
      `,
      to: [{ email: yourEmail, name: 'Test User' }]
    },
    {
      subject: 'Test 3 - Bienvenue sur Guide de Lyon',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #28a745;">✅ Bienvenue !</h1>
          <p>Dernier email de test pour l'activation.</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Status:</strong> Test réussi</p>
            <p style="margin: 0;"><strong>Plateforme:</strong> Brevo</p>
            <p style="margin: 0;"><strong>Projet:</strong> Guide de Lyon</p>
          </div>
          <p style="color: #666; font-size: 14px;">
            Après réception de cet email, rafraîchissez la page Brevo.
          </p>
        </div>
      `,
      to: [{ email: yourEmail, name: 'Test User' }]
    }
  ];

  for (let i = 0; i < testEmails.length; i++) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = testEmails[i].subject;
    sendSmtpEmail.htmlContent = testEmails[i].htmlContent;
    sendSmtpEmail.sender = {
      name: BREVO_SENDER_NAME,
      email: BREVO_SENDER_EMAIL
    };
    sendSmtpEmail.to = testEmails[i].to;
    
    // Ajouter des headers pour tracking
    sendSmtpEmail.headers = {
      'X-Mailin-Tag': 'activation-test',
      'X-Mailin-custom': 'guide-lyon-activation'
    };
    
    try {
      console.log(`\n📧 Envoi email ${i + 1}/3: "${testEmails[i].subject}"`);
      console.log(`   Destinataire: ${testEmails[i].to[0].email}`);
      
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`   ✅ Succès ! Message ID: ${data.messageId}`);
      
      // Attendre 3 secondes entre les envois
      if (i < testEmails.length - 1) {
        console.log('   ⏳ Attente 3 secondes...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error(`   ❌ Erreur:`, error.response?.text || error.message);
      
      if (error.response?.text) {
        try {
          const errorBody = JSON.parse(error.response.text);
          console.error('   Détails:', errorBody.message || errorBody);
        } catch (e) {
          // Ignorer si pas JSON
        }
      }
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✨ Processus d\'activation terminé !');
  console.log('\n📋 INSTRUCTIONS IMPORTANTES :');
  console.log('=' .repeat(50));
  console.log('1. ✉️  Vérifiez votre boîte mail (' + yourEmail + ')');
  console.log('2. 🔄 Rafraîchissez la page Brevo SMTP');
  console.log('3. 📊 Les logs devraient apparaître');
  console.log('4. ✅ L\'onglet "Transactional" sera débloqué');
  console.log('\n💡 ASTUCE : Si les logs n\'apparaissent pas :');
  console.log('   - Vérifiez l\'onglet "Real-time" dans Brevo');
  console.log('   - Allez dans "Logs" → "Email logs"');
  console.log('   - Ou dans "Statistics" → "Global statistics"');
  console.log('\n🔗 Lien direct : https://app.brevo.com/real-time');
}

// Fonction pour vérifier le compte
async function checkAccount() {
  try {
    const accountApi = new brevo.AccountApi();
    accountApi.authentications['apiKey'].apiKey = BREVO_API_KEY;
    
    const account = await accountApi.getAccount();
    console.log('\n📊 Compte Brevo détecté :');
    console.log('   Email:', account.email);
    console.log('   Société:', account.companyName || 'Non définie');
    console.log('   Plan:', account.plan?.[0]?.type || 'Free');
  } catch (error) {
    console.error('\n⚠️  Impossible de vérifier le compte');
  }
}

// Exécution
async function main() {
  await checkAccount();
  console.log('');
  await sendActivationEmails();
}

main().catch(console.error);