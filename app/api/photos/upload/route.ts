import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client Supabase avec service key pour bypass RLS
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

// Client normal pour vérifier l'authentification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Upload photo request received');

    // Vérifier l'authentification avec le token de l'utilisateur
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.log('[API] Auth error:', authError);
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    console.log('[API] User authenticated:', user.email, 'ID:', user.id);

    // Vérifier que l'utilisateur possède l'établissement
    const formData = await request.formData();
    const establishmentId = formData.get('establishmentId') as string;
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string || '';
    const position = parseInt(formData.get('position') as string || '0');

    if (!establishmentId || !file) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Vérifier la propriété de l'établissement avec service key
    const { data: establishment, error: estError } = await supabaseAdmin
      .from('establishments')
      .select('id, user_id')
      .eq('id', establishmentId)
      .eq('user_id', user.id)
      .single();

    if (estError || !establishment) {
      console.log('[API] Establishment not found or not owned:', estError);
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    console.log('[API] Establishment verified:', establishment.id);

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      return NextResponse.json({ error: 'L\'image ne peut pas dépasser 5MB' }, { status: 400 });
    }

    // Upload du fichier
    const fileExt = file.name.split('.').pop();
    const fileName = `${establishmentId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('establishment-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.log('[API] Upload error:', uploadError);
      return NextResponse.json({ error: `Erreur upload: ${uploadError.message}` }, { status: 500 });
    }

    // Obtenir URL publique
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('establishment-photos')
      .getPublicUrl(uploadData.path);

    // Insérer en base avec service key (bypass RLS)
    const { data: photo, error: dbError } = await supabaseAdmin
      .from('establishment_photos')
      .insert({
        establishment_id: establishmentId,
        url: publicUrl,
        caption: caption || null,
        position: position || 0,
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

    console.log('[API] Photo created successfully:', photo.id);

    return NextResponse.json({ photo }, { status: 200 });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}