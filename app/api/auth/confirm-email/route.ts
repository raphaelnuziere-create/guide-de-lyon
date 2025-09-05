import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cette route nécessite la clé service_role pour confirmer les emails
// NE JAMAIS exposer cette clé côté client !

export async function POST(request: Request) {
  try {
    // Vérifier qu'on est en développement ou qu'on a les droits
    const isDevelopment = process.env.NODE_ENV === 'development';
    const autoConfirmEnabled = process.env.ENABLE_AUTO_CONFIRM === 'true';
    
    if (!isDevelopment && !autoConfirmEnabled) {
      return NextResponse.json(
        { error: 'Auto-confirmation non autorisée' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId requis' },
        { status: 400 }
      );
    }

    // Si on a la clé service_role, on peut confirmer directement
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      // Sans la clé service_role, on ne peut pas auto-confirmer
      // Mais on retourne quand même un succès en dev pour ne pas bloquer
      if (isDevelopment) {
        console.log('[DEV] Auto-confirmation simulée pour:', userId);
        return NextResponse.json({ 
          success: true, 
          message: 'Auto-confirmation simulée en développement' 
        });
      }
      
      return NextResponse.json(
        { error: 'Configuration manquante pour l\'auto-confirmation' },
        { status: 500 }
      );
    }

    // Créer un client Supabase avec la clé service_role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Confirmer l'email directement dans la base de données
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );

    if (error) {
      console.error('Erreur confirmation email:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la confirmation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email confirmé avec succès'
    });

  } catch (error) {
    console.error('Erreur API confirm-email:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}