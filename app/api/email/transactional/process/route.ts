import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { claudeEmailService } from '@/lib/ai/claude-email-service';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  return createClient(url, key);
}

// Interface pour les données de template
interface TemplateData {
  nom_entreprise?: string;
  event_title?: string;
  event_date_formatted?: string;
  event_location?: string;
  nouveau_forfait?: string;
  ancien_forfait?: string;
  homepage_visible?: boolean;
  [key: string]: any;
}

// Formatage des données selon le type d'événement
function formatTemplateData(eventType: string, triggerData: any, userData: any): TemplateData {
  const baseData: TemplateData = {
    nom_entreprise: userData.establishment_name || userData.company_name || userData.full_name || 'Entreprise'
  };

  switch (eventType) {
    case 'plan_upgrade':
    case 'plan_downgrade':
      return {
        ...baseData,
        nouveau_forfait: triggerData.new_plan || 'Premium',
        ancien_forfait: triggerData.old_plan || 'Gratuit',
        homepage_visible: triggerData.new_plan !== 'free'
      };

    case 'event_created_free':
    case 'event_created_premium':
      return {
        ...baseData,
        event_title: triggerData.event_title || 'Votre événement',
        event_date_formatted: triggerData.event_date ? 
          new Date(triggerData.event_date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Date à confirmer',
        event_location: triggerData.event_location || 'Lyon',
        homepage_visible: triggerData.homepage_visible || false
      };

    case 'user_welcome':
      return {
        ...baseData,
        forfait_choisi: userData.plan_type || 'gratuit'
      };

    default:
      return baseData;
  }
}

// Remplacement des variables dans le template
function replaceTemplateVariables(content: string, data: TemplateData): string {
  let result = content;
  
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value || ''));
  });
  
  // Gérer les conditions Handlebars simples
  result = result.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, condition, content) => {
    return data[condition] ? content : '';
  });
  
  return result;
}

// Envoi via Brevo
async function sendEmailViaBrevo(
  emailAddress: string, 
  subject: string, 
  htmlContent: string, 
  textContent: string
) {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'contact@guide-de-lyon.fr';
  const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Guide de Lyon';

  // Mode test : rediriger vers l'admin
  const isTestMode = process.env.EMAIL_TEST_MODE === 'true';
  const finalEmail = isTestMode ? process.env.ADMIN_EMAIL || 'raphael.nuziere@yahoo.com' : emailAddress;
  
  if (isTestMode) {
    subject = `[TEST] ${subject}`;
    htmlContent = `<div style="background: #fffbf0; padding: 15px; border: 2px solid #f39c12; border-radius: 5px; margin-bottom: 20px;">
      <strong>🧪 MODE TEST</strong><br>
      Email original destiné à: ${emailAddress}<br>
      Redirected vers: ${finalEmail}
    </div>` + htmlContent;
  }

  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY not configured');
  }

  const emailData = {
    sender: {
      name: SENDER_NAME,
      email: SENDER_EMAIL
    },
    to: [{
      email: finalEmail,
      name: emailAddress.split('@')[0]
    }],
    subject,
    htmlContent,
    textContent,
    tags: ["transactional", "guide-lyon"]
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

// Traitement d'un item de la queue
async function processQueueItem(queueItem: any, supabase: any) {
  try {
    console.log(`[Email Process] Processing queue item ${queueItem.id} for event: ${queueItem.event_type}`);
    
    // Marquer comme en cours de traitement
    await supabase
      .from('email_queue')
      .update({ 
        status: 'processing',
        processed_at: new Date().toISOString() 
      })
      .eq('id', queueItem.id);

    // Récupérer les données utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', queueItem.user_id)
      .single();

    if (userError || !userData) {
      throw new Error(`User not found: ${queueItem.user_id}`);
    }

    // Récupérer le template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', queueItem.template_id)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${queueItem.template_id}`);
    }

    // Préparer les données pour le template
    const templateData = formatTemplateData(queueItem.event_type, queueItem.trigger_data, userData);
    
    let finalSubject = template.subject_template;
    let finalHtmlContent = template.html_content;
    let finalTextContent = template.text_content;

    // Si template a un prompt IA et pas de contenu fixe, générer avec Claude
    if (template.ai_prompt && !template.is_system) {
      console.log(`[Email Process] Generating content with Claude for template: ${template.name}`);
      
      const generated = await claudeEmailService.generateTransactionalEmail({
        eventType: queueItem.event_type,
        userPlan: userData.plan_type || 'free',
        variables: templateData,
        templatePrompt: template.ai_prompt
      });

      if (generated && generated.confidence > 0.5) {
        finalSubject = generated.subject;
        finalHtmlContent = generated.htmlContent;
        finalTextContent = generated.textContent;
        
        console.log(`[Email Process] Claude generation successful, confidence: ${generated.confidence}`);
      } else {
        console.log(`[Email Process] Claude generation failed or low confidence, using template fallback`);
      }
    }

    // Remplacer les variables dans le contenu
    finalSubject = replaceTemplateVariables(finalSubject, templateData);
    finalHtmlContent = replaceTemplateVariables(finalHtmlContent, templateData);
    finalTextContent = replaceTemplateVariables(finalTextContent, templateData);

    // Envoyer l'email via Brevo
    const brevoResult = await sendEmailViaBrevo(
      userData.email,
      finalSubject,
      finalHtmlContent,
      finalTextContent
    );

    console.log(`[Email Process] Email sent successfully via Brevo: ${brevoResult.messageId}`);

    // Enregistrer dans l'historique
    await supabase
      .from('transactional_emails')
      .insert({
        user_id: queueItem.user_id,
        template_id: queueItem.template_id,
        email_address: userData.email,
        subject: finalSubject,
        html_content: finalHtmlContent,
        text_content: finalTextContent,
        triggered_by: queueItem.event_type,
        trigger_data: queueItem.trigger_data,
        status: 'sent',
        sent_at: new Date().toISOString(),
        brevo_message_id: brevoResult.messageId
      });

    // Marquer la queue comme terminée
    await supabase
      .from('email_queue')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString() 
      })
      .eq('id', queueItem.id);

    // Mettre à jour les statistiques du template
    await supabase
      .from('email_templates')
      .update({ 
        sent_count: template.sent_count + 1
      })
      .eq('id', queueItem.template_id);

    return {
      success: true,
      queueItemId: queueItem.id,
      brevoMessageId: brevoResult.messageId,
      emailAddress: userData.email,
      subject: finalSubject
    };

  } catch (error: any) {
    console.error(`[Email Process] Error processing queue item ${queueItem.id}:`, error);

    // Incrémenter les tentatives et marquer comme échec si max atteint
    const newAttempts = queueItem.attempts + 1;
    const status = newAttempts >= queueItem.max_attempts ? 'failed' : 'pending';
    
    await supabase
      .from('email_queue')
      .update({ 
        status,
        attempts: newAttempts,
        error_message: error.message,
        processed_at: new Date().toISOString()
      })
      .eq('id', queueItem.id);

    return {
      success: false,
      queueItemId: queueItem.id,
      error: error.message,
      attempts: newAttempts,
      maxAttempts: queueItem.max_attempts
    };
  }
}

// GET: Traiter la queue des emails en attente
export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    console.log('[Email Process] Starting queue processing...');

    // Récupérer les emails en attente (limité à 10 par batch)
    const { data: queueItems, error: queueError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(10);

    if (queueError) {
      throw new Error(`Queue fetch error: ${queueError.message}`);
    }

    if (!queueItems || queueItems.length === 0) {
      console.log('[Email Process] No pending emails in queue');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No emails to process'
      });
    }

    console.log(`[Email Process] Found ${queueItems.length} emails to process`);

    // Traiter chaque item
    const results = [];
    for (const item of queueItems) {
      const result = await processQueueItem(item, supabase);
      results.push(result);
      
      // Petit délai entre les envois pour éviter le rate limiting
      if (results.length < queueItems.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`[Email Process] Completed: ${successCount} success, ${failureCount} failures`);

    return NextResponse.json({
      success: true,
      processed: queueItems.length,
      successful: successCount,
      failed: failureCount,
      results: results.map(r => ({
        queueItemId: r.queueItemId,
        success: r.success,
        emailAddress: r.emailAddress,
        error: r.error
      }))
    });

  } catch (error: any) {
    console.error('[Email Process] Fatal error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

// POST: Traiter un email spécifique ou déclencher un traitement manuel
export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { queueItemId, eventType, userId, triggerData } = body;

    if (queueItemId) {
      // Traiter un item spécifique de la queue
      const { data: queueItem, error: queueError } = await supabase
        .from('email_queue')
        .select('*')
        .eq('id', queueItemId)
        .single();

      if (queueError || !queueItem) {
        return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
      }

      const result = await processQueueItem(queueItem, supabase);
      return NextResponse.json(result);
      
    } else if (eventType && userId) {
      // Déclencher un nouvel email transactionnel
      console.log(`[Email Process] Manual trigger for user ${userId}, event: ${eventType}`);
      
      const { data, error } = await supabase.rpc('trigger_transactional_email', {
        p_user_id: userId,
        p_event_type: eventType,
        p_trigger_data: triggerData || {},
        p_delay_minutes: 0
      });

      if (error) {
        throw new Error(`Trigger error: ${error.message}`);
      }

      return NextResponse.json({
        success: true,
        queueId: data,
        message: 'Email queued for processing'
      });
      
    } else {
      return NextResponse.json({ 
        error: 'Missing required parameters: queueItemId or (eventType + userId)' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[Email Process] POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}