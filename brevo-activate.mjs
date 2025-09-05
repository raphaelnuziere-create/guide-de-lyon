#!/usr/bin/env node
/**
 * Script pour activer Brevo en envoyant des emails de test
 * Cela va débloquer l'interface Transactional
 */

import brevo from '@getbrevo/brevo';
import { config } from 'dotenv';

// Charger les variables d'environnement
config({ path: '.env.local' });

const apiInstance = new brevo.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

console.log('🚀 Activation de Brevo Transactional\n');
console.log('=' .repeat(50));

async function sendActivationEmails() {
  const testEmails = [
    {
      subject: 'Test Activation Brevo 1 - Guide de Lyon',
      htmlContent: '<h1>Test 1</h1><p>Ceci est un email de test pour activer Brevo.</p>',
      to: [{ email: process.env.BREVO_SENDER_EMAIL || 'contact@guide-de-lyon.fr' }]
    },
    {
      subject: 'Test Activation Brevo 2 - Newsletter',
      htmlContent: '<h1>Test Newsletter</h1><p>Test de newsletter Guide de Lyon.</p>',
      to: [{ email: process.env.BREVO_SENDER_EMAIL || 'contact@guide-de-lyon.fr' }]
    },
    {
      subject: 'Test Activation Brevo 3 - Bienvenue',
      htmlContent: '<h1>Bienvenue !</h1><p>Test email de bienvenue.</p>',
      to: [{ email: process.env.BREVO_SENDER_EMAIL || 'contact@guide-de-lyon.fr' }]
    }
  ];

  for (let i = 0; i < testEmails.length; i++) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = testEmails[i].subject;
    sendSmtpEmail.htmlContent = testEmails[i].htmlContent;
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || 'Guide de Lyon',
      email: process.env.BREVO_SENDER_EMAIL || 'contact@guide-de-lyon.fr'
    };
    sendSmtpEmail.to = testEmails[i].to;
    
    try {
      console.log(`\n📧 Envoi email ${i + 1}/3...`);
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ Email envoyé ! ID: ${data.messageId}`);
      
      // Attendre 2 secondes entre les envois
      if (i < testEmails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ Erreur:`, error.response?.body || error.message);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Emails d\'activation envoyés !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Attendez 1-2 minutes');
  console.log('2. Rafraîchissez la page Brevo');
  console.log('3. Vous devriez voir les logs apparaître');
  console.log('4. L\'interface Transactional sera débloquée');
  console.log('\n💡 Si ça ne marche pas, vérifiez votre email dans Brevo');
}

// Vérifier la configuration d'abord
if (!process.env.BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY manquante dans .env.local');
  process.exit(1);
}

// Envoyer les emails
await sendActivationEmails();