// API Route pour le reset mensuel des quotas
// À configurer dans vercel.json pour s'exécuter le 1er de chaque mois

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Fonction pour obtenir le client Supabase
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('[CRON] Supabase configuration missing');
    return null;
  }
  
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function GET(request: Request) {
  try {
    // Obtenir le client Supabase
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 503 }
      );
    }
    // Vérifier le secret pour sécuriser l'endpoint
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[CRON] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting monthly quota reset...');

    // Exécuter la fonction SQL de reset
    const { data, error } = await supabaseAdmin.rpc('reset_all_quotas');

    if (error) {
      console.error('[CRON] Error resetting quotas:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 500 }
      );
    }

    console.log(`[CRON] Successfully reset quotas for ${data} establishments`);

    // Optionnel : Envoyer une notification ou un email récapitulatif
    await sendResetNotifications(data);

    // Créer un log dans une table dédiée
    await supabaseAdmin.from('system_logs').insert({
      type: 'quota_reset',
      message: `Monthly quota reset completed for ${data} establishments`,
      metadata: {
        count: data,
        date: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Quotas reset for ${data} establishments`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[CRON] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Fonction pour tester manuellement (avec protection)
export async function POST(request: Request) {
  try {
    // Vérifier le secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de test
    const body = await request.json();
    const { establishmentId, testMode = true } = body;

    if (!establishmentId) {
      return NextResponse.json(
        { error: 'establishmentId required for test' },
        { status: 400 }
      );
    }

    console.log(`[CRON TEST] Resetting quota for establishment ${establishmentId}`);

    // Obtenir le client Supabase pour le test
    const supabaseTest = getSupabaseAdmin();
    if (!supabaseTest) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 503 }
      );
    }

    // Reset un seul établissement pour le test
    const { error } = await supabaseTest.rpc('reset_establishment_quotas', {
      est_id: establishmentId
    });

    if (error) {
      console.error('[CRON TEST] Error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test reset completed for establishment ${establishmentId}`,
      testMode: true
    });

  } catch (error) {
    console.error('[CRON TEST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    );
  }
}

// Fonction helper pour envoyer des notifications
async function sendResetNotifications(resetCount: number) {
  try {
    // Si Brevo est configuré, envoyer un email récapitulatif
    if (process.env.BREVO_API_KEY) {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'Guide de Lyon',
            email: 'noreply@guide-de-lyon.fr'
          },
          to: [
            {
              email: process.env.ADMIN_EMAIL || 'admin@guide-de-lyon.fr',
              name: 'Admin'
            }
          ],
          subject: `[CRON] Reset mensuel des quotas - ${new Date().toLocaleDateString('fr-FR')}`,
          htmlContent: `
            <h2>Reset mensuel des quotas effectué</h2>
            <p>Le reset automatique des quotas a été effectué avec succès.</p>
            <ul>
              <li><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</li>
              <li><strong>Établissements resetés:</strong> ${resetCount}</li>
            </ul>
            <p>Les compteurs d'événements et de photos ont été remis à zéro pour le nouveau mois.</p>
          `
        })
      });

      if (!response.ok) {
        console.error('[CRON] Failed to send notification email');
      }
    }
  } catch (error) {
    console.error('[CRON] Error sending notifications:', error);
    // Ne pas faire échouer le job principal si la notification échoue
  }
}