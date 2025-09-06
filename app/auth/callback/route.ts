import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  
  // Créer une URL de redirection pour la confirmation réussie
  const confirmationSuccessUrl = new URL('/auth/pro/confirmation-success', requestUrl.origin);
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Log tous les paramètres pour debug
    console.log('Callback params:', {
      token_hash: requestUrl.searchParams.get('token_hash'),
      token: requestUrl.searchParams.get('token'),
      type: requestUrl.searchParams.get('type'),
      code: requestUrl.searchParams.get('code'),
      error: requestUrl.searchParams.get('error'),
      error_description: requestUrl.searchParams.get('error_description')
    });

    // Si erreur Supabase
    const error = requestUrl.searchParams.get('error');
    if (error) {
      console.error('Erreur Supabase:', error, requestUrl.searchParams.get('error_description'));
      return NextResponse.redirect(new URL('/auth/pro/connexion?error=' + error, requestUrl.origin));
    }

    // Méthode 1: Code OAuth (connexion normale ou après confirmation)
    const code = requestUrl.searchParams.get('code');
    if (code) {
      console.log('Code OAuth détecté, échange contre session...');
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Erreur échange code:', error);
        return NextResponse.redirect(new URL('/auth/pro/connexion?error=session', requestUrl.origin));
      }

      if (data.user) {
        console.log('✅ Session créée pour:', data.user.email);
        
        // Vérifier si l'utilisateur a un établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        if (establishment) {
          return NextResponse.redirect(new URL('/pro/dashboard', requestUrl.origin));
        } else {
          return NextResponse.redirect(new URL('/pro/inscription', requestUrl.origin));
        }
      }
    }

    // Méthode 2: Token de confirmation email (ancien format)
    const token = requestUrl.searchParams.get('token');
    const type = requestUrl.searchParams.get('type');
    
    if (token && type === 'signup') {
      console.log('Token de confirmation email détecté');
      
      // Pour la confirmation email, Supabase devrait rediriger avec un code
      // Si on arrive ici, c'est que quelque chose ne va pas
      // Rediriger vers une page de confirmation avec message
      return NextResponse.redirect(confirmationSuccessUrl);
    }

    // Méthode 3: Token hash (nouvelle méthode)
    const token_hash = requestUrl.searchParams.get('token_hash');
    if (token_hash && type) {
      console.log('Token hash détecté');
      
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      });

      if (error) {
        console.error('Erreur vérification OTP:', error);
        return NextResponse.redirect(new URL('/auth/pro/connexion?error=verification', requestUrl.origin));
      }

      if (data.user) {
        console.log('✅ OTP vérifié pour:', data.user.email);
        return NextResponse.redirect(confirmationSuccessUrl);
      }
    }

    // Si aucune méthode ne correspond
    console.log('⚠️ Aucun paramètre valide trouvé');
    return NextResponse.redirect(new URL('/auth/pro/connexion', requestUrl.origin));
    
  } catch (error) {
    console.error('Erreur callback:', error);
    return NextResponse.redirect(new URL('/auth/pro/connexion?error=unknown', requestUrl.origin));
  }
}