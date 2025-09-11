import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client Supabase côté serveur avec ANON KEY (comme hier)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    // Configurer l'auth avec le token (comme ça marchait hier)
    await supabase.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const establishmentId = formData.get('establishmentId') as string;
    const caption = formData.get('caption') as string || null;
    const position = parseInt(formData.get('position') as string) || 0;

    if (!file || !establishmentId) {
      return NextResponse.json({ error: 'Fichier et establishment_id requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur possède l'établissement
    const { data: establishment, error: estError } = await supabase
      .from('establishments')
      .select('id')
      .eq('id', establishmentId)
      .eq('user_id', user.id)
      .single();

    if (estError || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé ou non autorisé' }, { status: 403 });
    }

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 });
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      return NextResponse.json({ error: 'L\'image ne peut pas dépasser 5MB' }, { status: 400 });
    }

    // Générer nom unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${establishmentId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload vers Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('establishment-photos')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: `Erreur upload: ${uploadError.message}` }, { status: 500 });
    }

    // Obtenir URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('establishment-photos')
      .getPublicUrl(uploadData.path);

    // Enregistrer en base - côté serveur avec auth user
    const { data: photo, error: dbError } = await supabase
      .from('establishment_photos')
      .insert({
        establishment_id: establishmentId,
        url: publicUrl,
        caption,
        position,
        is_main: false
      })
      .select()
      .single();

    if (dbError) {
      // Nettoyer le fichier uploadé en cas d'erreur DB
      await supabase.storage
        .from('establishment-photos')
        .remove([uploadData.path]);
      
      return NextResponse.json({ error: `Erreur base de données: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, photo });

  } catch (error: any) {
    console.error('API photos/upload error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}