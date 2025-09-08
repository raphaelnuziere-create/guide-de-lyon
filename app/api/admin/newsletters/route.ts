import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth/admin-auth';

/**
 * GET /api/admin/newsletters
 * Récupère la liste des newsletters avec leur statut
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authError = requireAdmin(request);
    if (authError) return authError;

    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: newsletters, error } = await supabase
      .from('newsletter_queue')
      .select(`
        id,
        type,
        status,
        subject,
        scheduled_for,
        content,
        content_preview,
        subscribers_count,
        events_count,
        news_count,
        weather_data,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erreur récupération newsletters:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Formater les données pour le frontend
    const formattedNewsletters = newsletters?.map(newsletter => ({
      id: newsletter.id,
      type: newsletter.type,
      status: newsletter.status,
      subject: newsletter.subject,
      scheduledFor: newsletter.scheduled_for,
      subscribersCount: newsletter.subscribers_count || 0,
      eventsCount: newsletter.events_count || 0,
      newsCount: newsletter.news_count || 0,
      createdAt: newsletter.created_at,
      contentPreview: newsletter.content_preview || newsletter.content?.substring(0, 500) + '...',
      weather: newsletter.weather_data ? JSON.parse(newsletter.weather_data) : null
    })) || [];

    return NextResponse.json({
      success: true,
      newsletters: formattedNewsletters
    });

  } catch (error) {
    console.error('Erreur API newsletters:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}