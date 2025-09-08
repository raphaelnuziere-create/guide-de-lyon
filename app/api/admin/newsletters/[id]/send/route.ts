import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth/admin-auth';

/**
 * POST /api/admin/newsletters/[id]/send
 * Envoie une newsletter approuvée via Brevo
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID newsletter requis' }, { status: 400 });
    }

    // Vérifier l'authentification admin
    const authError = requireAdmin(request);
    if (authError) return authError;

    // Récupérer la newsletter
    const { data: newsletter, error: fetchError } = await supabase
      .from('newsletter_queue')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Erreur récupération newsletter:', fetchError);
      return NextResponse.json({ error: 'Newsletter non trouvée' }, { status: 404 });
    }

    if (newsletter.status !== 'approved') {
      return NextResponse.json(
        { error: 'Seules les newsletters approuvées peuvent être envoyées' }, 
        { status: 400 }
      );
    }

    // Récupérer les abonnés pour ce type de newsletter
    const frequency = newsletter.type === 'daily' ? 'daily_frequency' : 'weekly_frequency';
    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscribers')
      .select('email, first_name')
      .eq('is_active', true)
      .eq('verified_at', true)
      .eq(frequency, true);

    if (subscribersError) {
      console.error('Erreur récupération abonnés:', subscribersError);
      return NextResponse.json({ error: 'Erreur récupération abonnés' }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'Aucun abonné trouvé' }, { status: 400 });
    }

    console.log(`📧 Envoi newsletter ${newsletter.type} à ${subscribers.length} abonnés`);

    // Marquer comme en cours d'envoi
    await supabase
      .from('newsletter_queue')
      .update({
        status: 'sending',
        sending_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    // TODO: Intégrer avec Brevo pour l'envoi réel
    // Pour le moment, simulation de l'envoi
    const sendResults = await simulateSend(newsletter, subscribers);

    // Mettre à jour le statut final
    const { data: finalNewsletter, error: finalError } = await supabase
      .from('newsletter_queue')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_by: 'admin', // Envoyé par admin
        sent_to_count: sendResults.successCount,
        send_errors: sendResults.errors.length > 0 ? JSON.stringify(sendResults.errors) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (finalError) {
      console.error('Erreur mise à jour finale:', finalError);
      return NextResponse.json({ error: 'Erreur mise à jour statut' }, { status: 500 });
    }

    console.log(`✅ Newsletter ${id} envoyée à ${sendResults.successCount} abonnés`);

    return NextResponse.json({
      success: true,
      newsletter: {
        id: finalNewsletter.id,
        status: finalNewsletter.status,
        sentAt: finalNewsletter.sent_at,
        sentBy: finalNewsletter.sent_by,
        sentToCount: finalNewsletter.sent_to_count
      },
      sendResults: {
        successCount: sendResults.successCount,
        errorCount: sendResults.errors.length,
        errors: sendResults.errors.slice(0, 5) // Limiter les erreurs affichées
      }
    });

  } catch (error) {
    console.error('Erreur envoi newsletter:', error);
    
    // Marquer comme échoué en cas d'erreur
    await supabase
      .from('newsletter_queue')
      .update({
        status: 'failed',
        send_errors: JSON.stringify([{ error: error.message, timestamp: new Date().toISOString() }]),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi', details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Simulation de l'envoi (à remplacer par l'intégration Brevo)
 */
async function simulateSend(newsletter: any, subscribers: any[]) {
  console.log(`🔄 Simulation envoi newsletter "${newsletter.subject}" à ${subscribers.length} abonnés...`);
  
  // Simulation d'un délai d'envoi
  await new Promise(resolve => setTimeout(resolve, 2000));

  const errors = [];
  const successCount = subscribers.length;

  // TODO: Implémenter l'envoi réel avec Brevo
  // const brevoResponse = await fetch('https://api.brevo.com/v3/emailCampaigns', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'api-key': process.env.BREVO_API_KEY
  //   },
  //   body: JSON.stringify({
  //     name: newsletter.subject,
  //     subject: newsletter.subject,
  //     htmlContent: newsletter.content_preview,
  //     recipients: {
  //       listIds: [BREVO_LIST_ID]
  //     },
  //     scheduledAt: new Date().toISOString()
  //   })
  // });

  return {
    successCount,
    errors
  };
}