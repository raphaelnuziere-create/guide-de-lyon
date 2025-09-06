import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  
  console.log('🔍 Callback URL:', requestUrl.toString());
  console.log('📦 Params:', {
    code: code ? 'présent' : 'absent',
    search: requestUrl.search,
    origin: requestUrl.origin
  });

  if (code) {
    const cookieStore = await cookies();
    
    // Nettoyer les variables d'environnement (retirer espaces et retours à la ligne)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
    
    console.log('🔐 Config Supabase:', {
      url: supabaseUrl,
      urlLength: supabaseUrl.length,
      hasKey: !!supabaseAnonKey,
      keyLength: supabaseAnonKey.length
    });
    
    // Créer le client Supabase avec gestion des cookies SSR
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
      // Échanger le code pour une session
      console.log('🔄 Échange du code pour une session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Erreur échange code:', error);
        console.error('Details:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        
        // Différents types d'erreurs
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
        console.log('👤 User ID:', user.id);
        console.log('📧 User email:', user.email);
        
        // Vérifier si l'utilisateur a un établissement
        const { data: establishment, error: establishmentError } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (establishmentError) {
          console.error('⚠️ Erreur recherche établissement (non bloquant):', establishmentError);
        }
        
        // Déterminer la redirection basée sur l'existence d'un établissement
        const redirectUrl = establishment 
          ? '/pro/dashboard' 
          : '/pro/inscription';
        
        console.log('🔀 Redirection vers:', redirectUrl);
        
        return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
      } else {
        console.log('⚠️ Pas de session créée malgré l\'absence d\'erreur');
        return NextResponse.redirect(new URL('/auth/pro/connexion?error=no_session', requestUrl.origin));
      }
    } catch (error) {
      console.error('❌ Erreur inattendue:', error);
      return NextResponse.redirect(new URL('/auth/pro/connexion?error=unexpected', requestUrl.origin));
    }
  }
  
  // Si pas de code (confirmation email sans auto-login)
  console.log('📧 Callback sans code - probablement une confirmation email');
  
  // Vérifier les différents paramètres possibles
  const type = requestUrl.searchParams.get('type');
  const errorCode = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  if (errorCode) {
    console.error('❌ Erreur Supabase:', errorCode, errorDescription);
    return NextResponse.redirect(new URL(`/auth/pro/connexion?error=${errorCode}`, requestUrl.origin));
  }
  
  // Si c'est une confirmation email réussie (type=signup ou email_change)
  if (type === 'signup' || type === 'email_change' || type === 'recovery') {
    console.log('✅ Confirmation email type:', type);
    return NextResponse.redirect(new URL('/auth/pro/connexion?confirmed=true', requestUrl.origin));
  }
  
  // Par défaut, rediriger vers connexion
  return NextResponse.redirect(new URL('/auth/pro/connexion', requestUrl.origin));
}