import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth/admin-auth';

/**
 * POST /api/admin/newsletters/[id]/reject
 * Rejette une newsletter
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { reason } = await request.json();

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

    if (!['pending', 'approved'].includes(newsletter.status)) {
      return NextResponse.json(
        { error: 'Newsletter ne peut pas être rejetée dans cet état' }, 
        { status: 400 }
      );
    }

    // Mettre à jour le statut
    const { data: updatedNewsletter, error: updateError } = await supabase
      .from('newsletter_queue')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: 'admin', // Rejeté par admin
        rejection_reason: reason || 'Aucune raison spécifiée',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur rejet newsletter:', updateError);
      return NextResponse.json({ error: 'Erreur lors du rejet' }, { status: 500 });
    }

    console.log(`❌ Newsletter ${id} rejetée: ${reason || 'Aucune raison'}`);

    return NextResponse.json({
      success: true,
      newsletter: {
        id: updatedNewsletter.id,
        status: updatedNewsletter.status,
        rejectedAt: updatedNewsletter.rejected_at,
        rejectedBy: updatedNewsletter.rejected_by,
        rejectionReason: updatedNewsletter.rejection_reason
      }
    });

  } catch (error) {
    console.error('Erreur rejet newsletter:', error);
    return NextResponse.json(
      { error: 'Erreur interne', details: error.message }, 
      { status: 500 }
    );
  }
}