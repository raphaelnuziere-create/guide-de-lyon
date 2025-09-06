import { NextRequest, NextResponse } from 'next/server';
import { emailTemplates } from '@/app/services/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, data } = body;
    
    // Validation basique
    if (!type || !email) {
      return NextResponse.json(
        { error: 'Type et email requis' },
        { status: 400 }
      );
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch(type) {
      case 'welcome':
        result = await emailTemplates.sendWelcome(
          email, 
          data?.name || 'Utilisateur'
        );
        break;
        
      case 'order':
        if (!data?.reference || !data?.amount) {
          return NextResponse.json(
            { error: 'Données de commande manquantes' },
            { status: 400 }
          );
        }
        result = await emailTemplates.sendOrderConfirmation(email, data);
        break;
        
      case 'newsletter':
        result = await emailTemplates.sendNewsletter(
          Array.isArray(email) ? email : [email],
          data?.articles || []
        );
        break;
        
      case 'password-reset':
        if (!data?.resetLink) {
          return NextResponse.json(
            { error: 'Lien de réinitialisation manquant' },
            { status: 400 }
          );
        }
        result = await emailTemplates.sendPasswordReset(email, data.resetLink);
        break;
        
      case 'pro-notification':
        if (!data?.notification) {
          return NextResponse.json(
            { error: 'Données de notification manquantes' },
            { status: 400 }
          );
        }
        result = await emailTemplates.sendProNotification(email, data.notification);
        break;
        
      default:
        return NextResponse.json(
          { error: `Type d'email inconnu: ${type}` },
          { status: 400 }
        );
    }
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId,
        message: 'Email envoyé avec succès'
      });
    } else {
      console.error('Échec envoi email:', result.error);
      return NextResponse.json(
        { 
          error: 'Échec de l\'envoi de l\'email',
          details: result.error 
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Erreur API send-email:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Route GET pour tester que l'endpoint existe
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API Email fonctionnelle',
    endpoints: {
      POST: '/api/send-email',
      types: [
        'welcome',
        'order',
        'newsletter', 
        'password-reset',
        'pro-notification'
      ]
    }
  });
}