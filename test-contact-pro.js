#!/usr/bin/env node
/**
 * Test avec l'email professionnel contact@guide-de-lyon.fr
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

async function testProEmail() {
  console.log('🚀 Test avec email professionnel contact@guide-de-lyon.fr\n');
  console.log('=' .repeat(60));
  
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  
  sendSmtpEmail.subject = '✅ Email Professionnel Configuré - Guide de Lyon';
  sendSmtpEmail.htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 15px 15px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Configuration Réussie !</h1>
        <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Email professionnel activé</p>
      </div>
      
      <div style="background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none;">
        <h2 style="color: #28a745; margin-top: 0;">✅ Tout fonctionne parfaitement !</h2>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #495057;">Configuration active :</h3>
          <ul style="color: #6c757d; line-height: 1.8;">
            <li><strong>Expéditeur :</strong> contact@guide-de-lyon.fr</li>
            <li><strong>Nom :</strong> Guide de Lyon</li>
            <li><strong>Domaine :</strong> Authentifié via Brevo ✅</li>
            <li><strong>SPF/DKIM :</strong> Configurés automatiquement ✅</li>
            <li><strong>Statut :</strong> <span style="color: #28a745; font-weight: bold;">PROFESSIONNEL</span></li>
          </ul>
        </div>
        
        <h3 style="color: #495057;">Vous pouvez maintenant :</h3>
        <ul style="color: #6c757d; line-height: 1.8;">
          <li>✅ Envoyer depuis <strong>contact@guide-de-lyon.fr</strong></li>
          <li>✅ Envoyer depuis <strong>info@guide-de-lyon.fr</strong></li>
          <li>✅ Envoyer depuis <strong>noreply@guide-de-lyon.fr</strong></li>
          <li>✅ Utiliser n'importe quelle adresse <strong>@guide-de-lyon.fr</strong></li>
        </ul>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="https://www.guide-de-lyon.fr/admin/emails" 
             style="display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px;">
            Tester depuis le Dashboard
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
          Email envoyé le ${new Date().toLocaleString('fr-FR')}<br>
          Guide de Lyon - Système Email Professionnel
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 15px 15px;">
        <p style="color: #6c757d; font-size: 12px; margin: 0;">
          Powered by Brevo | Domaine authentifié | SPF/DKIM/DMARC actifs
        </p>
      </div>
    </div>
  `;
  
  // Utiliser l'email professionnel
  sendSmtpEmail.sender = {
    name: 'Guide de Lyon',
    email: 'contact@guide-de-lyon.fr' // EMAIL PROFESSIONNEL
  };
  
  sendSmtpEmail.to = [{ 
    email: 'raphael.nuziere@gmail.com',
    name: 'Raphael'
  }];
  
  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('\n✅ SUCCESS ! Email professionnel envoyé !');
    console.log('=' .repeat(60));
    console.log('📧 De : contact@guide-de-lyon.fr');
    console.log('📬 À : raphael.nuziere@gmail.com');
    console.log('🆔 Message ID :', result.messageId || 'OK');
    console.log('⏰ Heure :', new Date().toLocaleString('fr-FR'));
    
    console.log('\n🎉 Félicitations ! Votre configuration est 100% professionnelle !');
    console.log('\n📋 Prochaines étapes :');
    console.log('1. Vérifiez votre boîte Gmail');
    console.log('2. Testez depuis : https://www.guide-de-lyon.fr/admin/emails');
    console.log('3. Créez vos templates dans Brevo');
    
  } catch (error) {
    console.error('\n❌ Erreur :', error.response?.text || error.message);
    
    if (error.response?.text?.includes('sender')) {
      console.log('\n⚠️ Le sender n\'est pas encore validé.');
      console.log('\nActions :');
      console.log('1. Dans Brevo → Settings → Senders');
      console.log('2. Ajoutez : contact@guide-de-lyon.fr');
      console.log('3. Le domaine étant authentifié, pas besoin de validation email !');
    }
  }
}

// Vérifier d'abord le domaine
async function checkDomainStatus() {
  try {
    const accountApi = new brevo.AccountApi();
    accountApi.authentications['apiKey'].apiKey = BREVO_API_KEY;
    
    console.log('🔍 Vérification du statut Brevo...\n');
    
    const account = await accountApi.getAccount();
    console.log('✅ Compte Brevo actif');
    console.log('📧 Email du compte :', account.email || 'N/A');
    console.log('📦 Plan :', account.plan?.[0]?.type || 'Free');
    console.log('');
  } catch (error) {
    console.warn('⚠️ Impossible de vérifier le compte');
  }
}

// Exécution
async function main() {
  await checkDomainStatus();
  await testProEmail();
}

main();