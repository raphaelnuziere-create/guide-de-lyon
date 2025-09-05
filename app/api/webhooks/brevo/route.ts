import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialisation Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types des événements Brevo
interface BrevoWebhookEvent {
  event: 'request' | 'delivered' | 'hard_bounce' | 'soft_bounce' | 'blocked' | 
         'spam' | 'invalid_email' | 'deferred' | 'click' | 'opened' | 'unique_opened' |
         'unsubscribed' | 'list_addition' | 'contact_updated' | 'contact_deleted';
  email: string;
  id?: number;
  date?: string;
  ts?: number;
  message_id?: string;
  ts_event?: number;
  subject?: string;
  tag?: string;
  sending_ip?: string;
  ts_epoch?: number;
  tags?: string[];
  link?: string;
  sender_email?: string;
}

export async function POST(request: NextRequest) {
  try {
    const events: BrevoWebhookEvent[] = await request.json();
    
    // Brevo envoie un tableau d'événements
    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Format invalide - tableau d\'événements attendu' },
        { status: 400 }
      );
    }
    
    console.log(`📧 Webhook Brevo reçu: ${events.length} événements`);
    
    // Traiter chaque événement
    for (const event of events) {
      try {
        await processBrevoEvent(event);
      } catch (error) {
        console.error('Erreur traitement événement:', error);
      }
    }
    
    return NextResponse.json({ 
      success: true,
      processed: events.length 
    });
    
  } catch (error: any) {
    console.error('❌ Erreur webhook Brevo:', error);
    return NextResponse.json(
      { error: 'Erreur traitement webhook' },
      { status: 500 }
    );
  }
}

/**
 * Traite un événement Brevo individuel
 */
async function processBrevoEvent(event: BrevoWebhookEvent) {
  const { event: eventType, email, message_id, ts_event } = event;
  
  console.log(`Processing: ${eventType} for ${email}`);
  
  // Mettre à jour le log d'email si on a un message_id
  if (message_id) {
    const updates: any = {
      status: mapEventToStatus(eventType),
      updated_at: new Date().toISOString()
    };
    
    // Ajouter les timestamps spécifiques
    if (eventType === 'opened' || eventType === 'unique_opened') {
      updates.opened_at = ts_event ? new Date(ts_event * 1000).toISOString() : new Date().toISOString();
    }
    
    if (eventType === 'click') {
      updates.clicked_at = ts_event ? new Date(ts_event * 1000).toISOString() : new Date().toISOString();
      updates.clicked_link = event.link;
    }
    
    // Mettre à jour dans la base de données
    const { error } = await supabase
      .from('email_logs')
      .update(updates)
      .eq('message_id', message_id);
    
    if (error) {
      console.error('Erreur mise à jour email_logs:', error);
    }
  }
  
  // Gérer les désinscriptions
  if (eventType === 'unsubscribed') {
    await handleUnsubscribe(email);
  }
  
  // Gérer les bounces
  if (eventType === 'hard_bounce' || eventType === 'spam') {
    await handleBounce(email, eventType);
  }
}

/**
 * Map l'événement Brevo vers un statut
 */
function mapEventToStatus(event: string): string {
  const statusMap: Record<string, string> = {
    'request': 'sent',
    'delivered': 'delivered',
    'opened': 'opened',
    'unique_opened': 'opened',
    'click': 'clicked',
    'hard_bounce': 'bounced',
    'soft_bounce': 'soft_bounced',
    'spam': 'spam',
    'blocked': 'blocked',
    'invalid_email': 'invalid',
    'deferred': 'deferred',
    'unsubscribed': 'unsubscribed'
  };
  
  return statusMap[event] || event;
}

/**
 * Gère les désinscriptions
 */
async function handleUnsubscribe(email: string) {
  // Trouver l'utilisateur
  const { data: user } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
  
  if (user) {
    // Mettre à jour les préférences
    await supabase
      .from('email_preferences')
      .upsert({
        user_id: user.id,
        newsletter: false,
        promotional: false,
        updated_at: new Date().toISOString()
      });
    
    console.log(`✅ Désinscription enregistrée pour ${email}`);
  }
}

/**
 * Gère les bounces et spam
 */
async function handleBounce(email: string, type: string) {
  // Créer une entrée dans une table de blacklist
  await supabase
    .from('email_blacklist')
    .upsert({
      email: email,
      reason: type,
      created_at: new Date().toISOString()
    });
  
  console.log(`⚠️ Email blacklisté: ${email} (${type})`);
}

// Route GET pour vérifier la configuration
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook Brevo configuré',
    endpoint: '/api/webhooks/brevo',
    events: [
      'delivered',
      'opened',
      'clicked',
      'hard_bounce',
      'soft_bounce', 
      'spam',
      'unsubscribed',
      'blocked'
    ],
    instructions: {
      brevo_dashboard: 'https://app.brevo.com/settings/webhooks',
      url: 'https://www.guide-de-lyon.fr/api/webhooks/brevo',
      method: 'POST',
      events_to_select: 'All events or specific ones listed above'
    }
  });
}