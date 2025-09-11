import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client Supabase pour vérification auth
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Client Supabase admin pour bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Upload request received');
    
    // Récupérer le token d'authentification depuis les headers
    const authHeader = request.headers.get('authorization');
    console.log('[API] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('[API] No auth header found');
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('[API] Token extracted, length:', token.length);

    // Vérifier l'authentification avec le client normal
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    console.log('[API] Auth result - user:', !!user, 'error:', authError?.message);
    
    if (authError || !user) {
      console.log('[API] Authentication failed:', authError);
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    console.log('[API] User authenticated:', user.email, 'ID:', user.id);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const establishmentId = formData.get('establishmentId') as string;
    const caption = formData.get('caption') as string || null;
    const position = parseInt(formData.get('position') as string) || 0;

    if (!file || !establishmentId) {
      return NextResponse.json({ error: 'Fichier et establishment_id requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur possède l'établissement avec admin client
    const { data: establishment, error: estError } = await supabaseAdmin
      .from('establishments')
      .select('id, user_id')
      .eq('id', establishmentId)
      .eq('user_id', user.id)
      .single();

    if (estError || !establishment) {
      console.log('[API] Establishment verification failed:', estError);
      return NextResponse.json({ error: 'Établissement non trouvé ou non autorisé' }, { status: 403 });
    }

    console.log('[API] Establishment verified:', establishment.id);

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

    console.log('[API] Uploading file:', fileName);

    // Upload vers Supabase Storage avec admin client
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('establishment-photos')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.log('[API] Upload error:', uploadError);
      return NextResponse.json({ error: `Erreur upload: ${uploadError.message}` }, { status: 500 });
    }

    console.log('[API] File uploaded successfully:', uploadData.path);

    // Obtenir URL publique
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('establishment-photos')
      .getPublicUrl(uploadData.path);

    console.log('[API] Public URL generated:', publicUrl);

    // Enregistrer en base avec admin client (bypass RLS)
    const { data: photo, error: dbError } = await supabaseAdmin
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
      console.log('[API] Database error:', dbError);
      // Nettoyer le fichier uploadé en cas d'erreur DB
      await supabaseAdmin.storage
        .from('establishment-photos')
        .remove([uploadData.path]);
      
      return NextResponse.json({ error: `Erreur base de données: ${dbError.message}` }, { status: 500 });
    }

    console.log('[API] Photo record created:', photo.id);

    return NextResponse.json({ success: true, photo });

  } catch (error: any) {
    console.error('API photos/upload error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}