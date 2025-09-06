import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  
  // Log pour debug
  console.log('🔍 Callback reçu avec params:', requestUrl.search);
  
  // Après confirmation email Supabase, on est redirigé ici SANS code
  // C'est normal, l'email est confirmé mais pas de session créée
  // On redirige vers la connexion avec un message de succès
  
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    // Cas OAuth/Magic Link avec code
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
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
    } catch (error) {
      console.error('Erreur échange code:', error);
    }
  }

  // Pour tous les autres cas (notamment confirmation email)
  // Rediriger vers connexion avec message
  return NextResponse.redirect(new URL('/auth/pro/connexion?confirmed=true', requestUrl.origin));
}