#!/usr/bin/env node
/**
 * Test rapide avec votre email Gmail
 */

const brevo = require('@getbrevo/brevo');
const fs = require('fs');
const path = require('path');

// Lire .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const BREVO_API_KEY = envContent.match(/BREVO_API_KEY=(.*)/)?.[1];

// Configuration
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = BREVO_API_KEY;

async function sendTest() {
  console.log('📧 Test d\'envoi avec Gmail...\n');
  
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  
  sendSmtpEmail.subject = '✅ Test Gmail - Guide de Lyon';
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
        <h1 style="margin: 0;">🎉 Test Réussi !</h1>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa; margin-top: 20px; border-radius: 10px;">
        <h2 style="color: #28a745;">✅ Les emails fonctionnent !</h2>
        
        <p>Excellent ! Votre configuration Brevo est correcte.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Informations de test :</h3>
          <ul style="color: #666;">
            <li><strong>Expéditeur :</strong> raphaelnuziere@gmail.com</li>
            <li><strong>Nom :</strong> Guide de Lyon</li>
            <li><strong>API :</strong> Brevo (ex-SendinBlue)</li>
            <li><strong>Heure :</strong> ${new Date().toLocaleString('fr-FR')}</li>
          </ul>
        </div>
        
        <p style="color: #666;">
          Vous pouvez maintenant utiliser le dashboard admin pour envoyer tous types d'emails :
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.guide-de-lyon.fr/admin/emails" 
             style="display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Accéder au Dashboard Email
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Guide de Lyon - Système Email<br>
          Powered by Brevo
        </p>
      </div>
    </div>
  `;
  
  sendSmtpEmail.sender = {
    name: 'Guide de Lyon',
    email: 'raphaelnuziere@gmail.com' // VOTRE EMAIL GMAIL
  };
  
  sendSmtpEmail.to = [{ 
    email: 'raphaelnuziere@gmail.com', // DESTINATAIRE (vous-même pour le test)
    name: 'Raphael'
  }];
  
  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email envoyé avec succès !');
    console.log('📬 Vérifiez votre boîte Gmail');
    console.log('Message ID:', result.messageId || 'N/A');
    
    console.log('\n✨ Prochaines étapes :');
    console.log('1. Allez dans Brevo → Settings → Senders');
    console.log('2. Ajoutez raphaelnuziere@gmail.com si pas déjà fait');
    console.log('3. Confirmez via l\'email reçu');
    console.log('4. Testez sur https://www.guide-de-lyon.fr/admin/emails');
    
  } catch (error) {
    console.error('❌ Erreur:', error.response?.text || error.message);
    
    if (error.response?.text?.includes('sender')) {
      console.log('\n⚠️  SOLUTION :');
      console.log('1. Allez sur https://app.brevo.com');
      console.log('2. Settings → Senders → Add a new sender');
      console.log('3. Email: raphaelnuziere@gmail.com');
      console.log('4. Name: Guide de Lyon');
      console.log('5. Validez l\'email de confirmation dans Gmail');
    }
  }
}

sendTest();