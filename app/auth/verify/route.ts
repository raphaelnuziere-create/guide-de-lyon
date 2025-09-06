import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  const redirect_to = requestUrl.searchParams.get('redirect_to');
  
  console.log('🔍 Direct Verify URL:', requestUrl.toString());
  console.log('📦 Verify Params:', {
    token: token ? `${token.substring(0, 20)}...` : 'absent',
    type,
    redirect_to
  });
  
  if (!token || !type) {
    return NextResponse.redirect(
      new URL('/auth/pro/connexion?error=missing_params', requestUrl.origin)
    );
  }
  
  // Créer le client Supabase
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            console.error('Erreur setting cookies:', error);
          }
        },
      },
    }
  );
  
  try {
    console.log('🔐 Vérification du token OTP...');
    
    // Utiliser verifyOtp directement avec le token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as 'signup' | 'recovery' | 'email_change' | 'email',
    });
    
    if (error) {
      console.error('❌ Erreur vérification OTP:', error);
      
      // Si le token a expiré
      if (error.message?.includes('expired')) {
        return NextResponse.redirect(
          new URL('/auth/pro/connexion?error=access_denied&error_code=otp_expired', requestUrl.origin)
        );
      }
      
      // Si le token est invalide
      if (error.message?.includes('invalid')) {
        return NextResponse.redirect(
          new URL('/auth/pro/connexion?error=invalid_token', requestUrl.origin)
        );
      }
      
      return NextResponse.redirect(
        new URL(`/auth/pro/connexion?error=verification_failed&message=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }
    
    if (data?.session) {
      console.log('✅ Session créée après vérification OTP');
      const user = data.session.user;
      console.log('👤 User ID:', user.id);
      console.log('📧 User email:', user.email);
      
      // Vérifier si l'utilisateur a un établissement
      const { data: establishment } = await supabase
        .from('establishments')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Rediriger selon l'existence d'un établissement
      const redirectUrl = establishment ? '/pro/dashboard' : '/pro/inscription';
      console.log('🔀 Redirection vers:', redirectUrl);
      
      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
    }
    
    // Si pas de session malgré la vérification réussie, rediriger vers connexion
    console.log('⚠️ Vérification réussie mais pas de session');
    return NextResponse.redirect(new URL('/auth/pro/connexion?confirmed=true', requestUrl.origin));
    
  } catch (error) {
    console.error('❌ Erreur inattendue lors de la vérification:', error);
    return NextResponse.redirect(new URL('/auth/pro/connexion?error=unexpected', requestUrl.origin));
  }
}