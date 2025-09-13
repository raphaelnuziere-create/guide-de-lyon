import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth/admin-auth';

/**
 * POST /api/admin/newsletters/[id]/approve
 * Approuve une newsletter pour l'envoi
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

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

    if (newsletter.status !== 'pending') {
      return NextResponse.json(
        { error: 'Seules les newsletters en attente peuvent être approuvées' }, 
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    const { data: updatedNewsletter, error: updateError } = await supabase
      .from('newsletter_queue')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: 'admin', // Approuvé par admin
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur approbation newsletter:', updateError);
      return NextResponse.json({ error: 'Erreur lors de l\'approbation' }, { status: 500 });
    }

    console.log(`✅ Newsletter ${id} approuvée avec succès`);

    return NextResponse.json({
      success: true,
      newsletter: {
        id: updatedNewsletter.id,
        status: updatedNewsletter.status,
        approvedAt: updatedNewsletter.approved_at,
        approvedBy: updatedNewsletter.approved_by
      }
    });

  } catch (error) {
    console.error('Erreur approbation newsletter:', error);
    return NextResponse.json(
      { error: 'Erreur interne', details: error.message }, 
      { status: 500 }
    );
  }
}