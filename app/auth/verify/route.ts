import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const error_code = requestUrl.searchParams.get('error_code');
  
  console.log('🔍 Direct Verify URL:', requestUrl.toString());
  console.log('📦 Verify Params:', {
    code: code ? 'présent' : 'absent',
    token: token ? `${token.substring(0, 20)}...` : 'absent',
    type,
    error,
    error_code
  });
  
  // Si on a une erreur
  if (error) {
    console.error('❌ Erreur dans verify:', error, error_code);
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
  
  // Si on a un code (Supabase a fait l'échange PKCE pour nous)
  if (code) {
    console.log('🔄 Code reçu, échange pour une session...');
    
    try {
      // Essayer d'échanger le code sans code_verifier
      // Supabase devrait avoir stocké le code_verifier côté serveur
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('❌ Erreur échange code:', exchangeError);
        
        // Si le code a expiré ou est invalide
        if (exchangeError.message?.includes('expired') || exchangeError.message?.includes('invalid')) {
          return NextResponse.redirect(
            new URL('/auth/pro/connexion?error=access_denied&error_code=otp_expired', requestUrl.origin)
          );
        }
        
        // Si c'est un problème de code_verifier, essayer de se connecter directement
        // car l'utilisateur existe peut-être déjà et est confirmé
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('✅ Session existante trouvée');
          const { data: establishment } = await supabase
            .from('establishments')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          const redirectUrl = establishment ? '/pro/dashboard' : '/pro/inscription';
          return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
        }
        
        return NextResponse.redirect(
          new URL(`/auth/pro/connexion?error=verification_failed`, requestUrl.origin)
        );
      }
      
      if (data?.session) {
        console.log('✅ Session créée avec succès');
        const user = data.session.user;
        console.log('👤 User ID:', user.id);
        console.log('📧 User email:', user.email);
        
        // Vérifier si l'utilisateur a un établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        const redirectUrl = establishment ? '/pro/dashboard' : '/pro/inscription';
        console.log('🔀 Redirection vers:', redirectUrl);
        
        return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
      }
    } catch (error) {
      console.error('❌ Erreur inattendue:', error);
    }
  }
  
  // Si on a un token direct (cas où Supabase n'a pas fait l'échange)
  if (token) {
    console.log('🔐 Token reçu, vérification OTP...');
    
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: (type || 'signup') as 'signup' | 'recovery' | 'email_change' | 'email',
      });
      
      if (verifyError) {
        console.error('❌ Erreur vérification OTP:', verifyError);
        return NextResponse.redirect(
          new URL('/auth/pro/connexion?error=verification_failed', requestUrl.origin)
        );
      }
      
      if (data?.session) {
        console.log('✅ Session créée après vérification OTP');
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', data.session.user.id)
          .maybeSingle();
        
        const redirectUrl = establishment ? '/pro/dashboard' : '/pro/inscription';
        return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
      }
    } catch (error) {
      console.error('❌ Erreur vérification token:', error);
    }
  }
  
  // Si on n'a ni code ni token, rediriger vers connexion
  console.log('⚠️ Ni code ni token reçu');
  return NextResponse.redirect(new URL('/auth/pro/connexion?error=missing_params', requestUrl.origin));
}