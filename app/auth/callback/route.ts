import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  const code = requestUrl.searchParams.get('code');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Gestion du lien de confirmation email (token + type)
  if (token && type) {
    try {
      // Vérifier le token de confirmation email
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any
      });

      if (!error && data.user) {
        console.log('✅ Email confirmé pour:', data.user.email);
        
        // Créer une session pour l'utilisateur
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session?.access_token || '',
          refresh_token: data.session?.refresh_token || ''
        });

        if (!sessionError) {
          // Vérifier si l'utilisateur a déjà un établissement
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
    } catch (err) {
      console.error('Erreur confirmation email:', err);
    }
  }

  // Gestion du code OAuth (pour connexion normale)
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Vérifier si l'utilisateur a déjà un établissement
          const { data: establishment } = await supabase
            .from('establishments')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (establishment) {
            return NextResponse.redirect(new URL('/pro/dashboard', requestUrl.origin));
          } else {
            return NextResponse.redirect(new URL('/pro/inscription', requestUrl.origin));
          }
        }
      }
    } catch (err) {
      console.error('Erreur échange code:', err);
    }
  }

  // Si token_hash est présent (nouvelle méthode Supabase)
  if (token_hash && type) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any
      });

      if (!error && data.user) {
        // Rediriger selon l'établissement
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
    } catch (err) {
      console.error('Erreur token_hash:', err);
    }
  }

  // En cas d'erreur, rediriger vers la page de connexion
  console.log('⚠️ Aucun token valide, redirection vers connexion');
  return NextResponse.redirect(new URL('/auth/pro/connexion', requestUrl.origin));
}