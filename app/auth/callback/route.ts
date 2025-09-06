import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  
  // Log pour debug
  console.log('🔍 Callback reçu avec params:', requestUrl.search);
  
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const redirectTo = requestUrl.searchParams.get('redirect_to');
  
  // Si pas de code, c'est une confirmation email
  if (!code) {
    console.log('📧 Confirmation email détectée (pas de code)');
    // Après confirmation email, rediriger vers la page de connexion avec message de succès
    return NextResponse.redirect(new URL('/auth/pro/connexion?confirmed=true', requestUrl.origin));
  }
  
  // Si code présent, échanger contre une session
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    console.log('🔄 Échange du code pour une session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ Erreur échange code:', error);
      return NextResponse.redirect(new URL('/auth/pro/connexion?error=auth_failed', requestUrl.origin));
    }
    
    if (data?.session) {
      console.log('✅ Session créée avec succès');
      const user = data.session.user;
      
      // Vérifier si l'utilisateur a un établissement
      const { data: establishment, error: establishmentError } = await supabase
        .from('establishments')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (establishmentError) {
        console.error('❌ Erreur recherche établissement:', establishmentError);
      }
      
      // Déterminer la redirection
      if (establishment) {
        console.log('🏢 Établissement trouvé, redirection vers dashboard');
        return NextResponse.redirect(new URL('/pro/dashboard', requestUrl.origin));
      } else {
        console.log('📝 Pas d\'établissement, redirection vers inscription');
        return NextResponse.redirect(new URL('/pro/inscription', requestUrl.origin));
      }
    }
  } catch (error) {
    console.error('❌ Erreur callback:', error);
    return NextResponse.redirect(new URL('/auth/pro/connexion?error=unexpected', requestUrl.origin));
  }
  
  // Par défaut, rediriger vers connexion
  return NextResponse.redirect(new URL('/auth/pro/connexion', requestUrl.origin));
}