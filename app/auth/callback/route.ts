import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const error_code = requestUrl.searchParams.get('error_code');
  const error_description = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/';
  
  console.log('🔍 Callback URL:', requestUrl.toString());
  console.log('📦 Params:', {
    code: code ? 'présent' : 'absent',
    token_hash: token_hash ? 'présent' : 'absent',
    type,
    error,
    error_code,
    error_description,
    search: requestUrl.search,
    origin: requestUrl.origin
  });
  
  // Si on a une erreur, gérer selon le type
  if (error) {
    console.error('❌ Erreur dans le callback:', error, error_code, error_description);
    
    // Si c'est un OTP expiré, proposer de renvoyer
    if (error_code === 'otp_expired') {
      return NextResponse.redirect(
        new URL(`/auth/pro/connexion?error=access_denied&error_code=otp_expired`, requestUrl.origin)
      );
    }
    
    return NextResponse.redirect(
      new URL(`/auth/pro/connexion?error=${error}&error_code=${error_code || ''}`, requestUrl.origin)
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
  
  // Si on a un token_hash et type=signup, c'est une confirmation email
  if (token_hash && type) {
    console.log('📧 Confirmation email avec token_hash');
    
    try {
      // Utiliser verifyOtp avec le token_hash
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'signup' | 'recovery' | 'email_change' | 'email',
      });
      
      if (verifyError) {
        console.error('❌ Erreur vérification OTP:', verifyError);
        
        // Si le token a expiré
        if (verifyError.message?.includes('expired')) {
          return NextResponse.redirect(
            new URL('/auth/pro/connexion?error=access_denied&error_code=otp_expired', requestUrl.origin)
          );
        }
        
        return NextResponse.redirect(
          new URL(`/auth/pro/connexion?error=verification_failed`, requestUrl.origin)
        );
      }
      
      if (data?.session) {
        console.log('✅ Session créée après vérification OTP');
        const user = data.session.user;
        
        // Vérifier si l'utilisateur a un établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        // Rediriger selon l'existence d'un établissement
        const redirectUrl = establishment ? '/pro/dashboard' : '/pro/inscription';
        return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
      }
      
      // Si pas de session malgré la vérification réussie
      return NextResponse.redirect(new URL('/auth/pro/connexion?confirmed=true', requestUrl.origin));
      
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la vérification:', error);
      return NextResponse.redirect(new URL('/auth/pro/connexion?error=unexpected', requestUrl.origin));
    }
  }

  // Si on a un code (OAuth ou Magic Link avec code)
  if (code) {
    console.log('🔄 Échange du code pour une session...');
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Erreur échange code:', error);
        
        if (error.message?.includes('expired')) {
          return NextResponse.redirect(new URL('/auth/pro/connexion?error=code_expired', requestUrl.origin));
        } else if (error.message?.includes('invalid')) {
          return NextResponse.redirect(new URL('/auth/pro/connexion?error=invalid_code', requestUrl.origin));
        }
        
        return NextResponse.redirect(new URL('/auth/pro/connexion?error=auth_failed', requestUrl.origin));
      }
      
      if (data?.session) {
        console.log('✅ Session créée avec succès');
        const user = data.session.user;
        
        // Vérifier si l'utilisateur a un établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        const redirectUrl = establishment ? '/pro/dashboard' : '/pro/inscription';
        return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
      }
      
      return NextResponse.redirect(new URL('/auth/pro/connexion?error=no_session', requestUrl.origin));
      
    } catch (error) {
      console.error('❌ Erreur inattendue:', error);
      return NextResponse.redirect(new URL('/auth/pro/connexion?error=unexpected', requestUrl.origin));
    }
  }
  
  // Si on arrive ici, pas de code ni token_hash
  console.log('⚠️ Callback sans code ni token_hash');
  return NextResponse.redirect(new URL('/auth/pro/connexion', requestUrl.origin));
}