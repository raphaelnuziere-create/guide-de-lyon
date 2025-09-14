/**
 * Service d'envoi d'emails avec Brevo (ex-SendinBlue)
 * Configuration et templates pour Guide de Lyon
 */

const brevo = require('@getbrevo/brevo');

// Configuration de l'API Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

export interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, any>;
  attachments?: Array<{
    content: string;
    name: string;
  }>;
}

/**
 * Fonction générique d'envoi d'email
 */
export async function sendEmail(options: EmailOptions) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  
  // Configuration de base
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.sender = {
    name: process.env.BREVO_SENDER_NAME || 'Guide de Lyon',
    email: process.env.BREVO_SENDER_EMAIL || 'contact@guide-de-lyon.fr'
  };
  
  // Destinataires (peut être un string ou un array)
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  sendSmtpEmail.to = recipients.map(email => ({ email }));
  
  // Contenu (template ou HTML direct)
  if (options.templateId) {
    sendSmtpEmail.templateId = options.templateId;
    sendSmtpEmail.params = options.params;
  } else {
    sendSmtpEmail.htmlContent = options.htmlContent;
    sendSmtpEmail.textContent = options.textContent || stripHtml(options.htmlContent);
  }
  
  // Pièces jointes optionnelles
  if (options.attachments) {
    sendSmtpEmail.attachment = options.attachments;
  }
  
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email envoyé:', data.messageId);
    return { 
      success: true, 
      messageId: data.messageId,
      recipients: recipients 
    };
  } catch (error: any) {
    console.error('❌ Erreur envoi email:', error?.response?.body || error);
    return { 
      success: false, 
      error: error?.response?.body?.message || error.message,
      recipients: recipients 
    };
  }
}

/**
 * Supprime les balises HTML pour créer une version texte
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Templates d'emails pré-configurés
 */
export const emailTemplates = {
  /**
   * Email de bienvenue après inscription
   */
  async sendWelcome(email: string, name: string) {
    return sendEmail({
      to: email,
      subject: `Bienvenue sur Guide de Lyon, ${name} !`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue ${name} ! 🎉</h1>
            </div>
            <div class="content">
              <p>Merci de vous être inscrit sur <strong>Guide de Lyon</strong> !</p>
              
              <p>Vous pouvez maintenant :</p>
              <ul>
                <li>📍 Découvrir les meilleurs endroits de Lyon</li>
                <li>⭐ Laisser des avis sur vos lieux préférés</li>
                <li>💾 Sauvegarder vos adresses favorites</li>
                <li>📅 Être informé des événements à venir</li>
              </ul>
              
              <center>
                <a href="https://www.guide-de-lyon.fr/annuaire" class="button">
                  Découvrir l'annuaire
                </a>
              </center>
              
              <p>Si vous avez des questions, n'hésitez pas à nous contacter !</p>
              
              <p>À bientôt sur Guide de Lyon,<br>
              L'équipe Guide de Lyon</p>
            </div>
            <div class="footer">
              <p>© 2025 Guide de Lyon - Tous droits réservés</p>
              <p>Cet email a été envoyé à ${email}</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  },
  
  /**
   * Email de confirmation après un achat/abonnement
   */
  async sendOrderConfirmation(email: string, orderDetails: {
    reference: string;
    amount: number;
    plan?: string;
    items?: any[];
  }) {
    return sendEmail({
      to: email,
      subject: `Confirmation de commande #${orderDetails.reference}`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; }
            .order-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .amount { font-size: 24px; color: #28a745; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Commande confirmée !</h1>
            </div>
            
            <div class="order-box">
              <h2>Détails de votre commande</h2>
              <p><strong>Référence :</strong> ${orderDetails.reference}</p>
              <p><strong>Montant total :</strong> <span class="amount">${orderDetails.amount}€</span></p>
              ${orderDetails.plan ? `<p><strong>Plan :</strong> ${orderDetails.plan}</p>` : ''}
            </div>
            
            <p>Vous recevrez un email de confirmation dès que votre paiement sera traité.</p>
            
            <p>Merci pour votre confiance !<br>
            L'équipe Guide de Lyon</p>
          </div>
        </body>
        </html>
      `
    });
  },
  
  /**
   * Newsletter hebdomadaire
   */
  async sendNewsletter(emails: string[], articles: Array<{
    title: string;
    slug: string;
    excerpt: string;
    image?: string;
  }>) {
    const articlesHtml = articles.map(article => `
      <div style="margin-bottom: 30px; padding: 20px; background: white; border-radius: 8px;">
        ${article.image ? `<img src="${article.image}" alt="${article.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px;">` : ''}
        <h3 style="color: #333; margin: 15px 0;">${article.title}</h3>
        <p style="color: #666;">${article.excerpt}</p>
        <a href="https://www.guide-de-lyon.fr/blog/${article.slug}" style="color: #667eea; text-decoration: none;">
          Lire la suite →
        </a>
      </div>
    `).join('');
    
    return sendEmail({
      to: emails,
      subject: '📰 Les nouveautés de Lyon cette semaine',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; }
            .unsubscribe { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📍 Les nouveautés de Lyon</h1>
              <p>Votre sélection hebdomadaire</p>
            </div>
            
            <div class="content">
              <h2>Cette semaine à Lyon</h2>
              ${articlesHtml}
            </div>
            
            <div class="unsubscribe">
              <p>Vous recevez cet email car vous êtes inscrit à notre newsletter.</p>
              <a href="https://www.guide-de-lyon.fr/unsubscribe" style="color: #999;">Se désabonner</a>
            </div>
          </div>
        </body>
        </html>
      `
    });
  },
  
  /**
   * Email de réinitialisation de mot de passe
   */
  async sendPasswordReset(email: string, resetLink: string) {
    return sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .button { display: inline-block; padding: 15px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Réinitialisation de mot de passe</h2>
            
            <p>Vous avez demandé à réinitialiser votre mot de passe sur Guide de Lyon.</p>
            
            <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
            
            <center style="margin: 30px 0;">
              <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </center>
            
            <p style="color: #666; font-size: 14px;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.
              Le lien expire dans 1 heure.
            </p>
            
            <p>L'équipe Guide de Lyon</p>
          </div>
        </body>
        </html>
      `
    });
  },
  
  /**
   * Notification pour les professionnels (nouveau avis, etc.)
   */
  async sendProNotification(email: string, notification: {
    type: 'new_review' | 'new_message' | 'subscription_expiring';
    data: any;
  }) {
    let subject = '';
    let content = '';
    
    switch(notification.type) {
      case 'new_review':
        subject = '⭐ Nouvel avis sur votre établissement';
        content = `
          <h2>Nouvel avis reçu !</h2>
          <p><strong>${notification.data.author}</strong> a laissé un avis sur votre établissement :</p>
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p>Note : ${'⭐'.repeat(notification.data.rating)}</p>
            <p>"${notification.data.comment}"</p>
          </div>
          <a href="https://www.guide-de-lyon.fr/pro/dashboard">Voir dans mon espace pro</a>
        `;
        break;
        
      case 'subscription_expiring':
        subject = '⏰ Votre abonnement expire bientôt';
        content = `
          <h2>Votre abonnement expire dans ${notification.data.days} jours</h2>
          <p>N'oubliez pas de renouveler votre abonnement pour continuer à bénéficier de tous les avantages.</p>
          <a href="https://www.guide-de-lyon.fr/pro/subscription">Renouveler maintenant</a>
        `;
        break;
    }
    
    return sendEmail({
      to: email,
      subject,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            ${content}
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Guide de Lyon - Espace Professionnel<br>
              <a href="https://www.guide-de-lyon.fr/pro">Accéder à mon espace</a>
            </p>
          </div>
        </body>
        </html>
      `
    });
  }
};