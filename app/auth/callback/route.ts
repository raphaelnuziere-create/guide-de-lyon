import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Échanger le code contre une session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Vérifier si l'utilisateur a déjà un établissement
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (establishment) {
          // Si établissement existe, aller au dashboard
          return NextResponse.redirect(new URL('/pro/dashboard', requestUrl.origin));
        } else {
          // Sinon, aller à la page d'inscription établissement
          return NextResponse.redirect(new URL('/pro/inscription', requestUrl.origin));
        }
      }
    }
  }

  // En cas d'erreur ou pas de code, rediriger vers la page auth
  return NextResponse.redirect(new URL('/auth/pro', requestUrl.origin));
}