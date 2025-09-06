import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (token && type) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Vérifier le token
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    });

    if (!error) {
      // Rediriger vers le dashboard après confirmation
      if (type === 'signup' || type === 'email') {
        return NextResponse.redirect(new URL('/pro/dashboard', requestUrl.origin));
      }
    }
  }

  // Redirection par défaut
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}