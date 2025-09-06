import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, token } = body;
    
    if (!email || !password || !action) {
      return NextResponse.json({ 
        error: 'Email, mot de passe et action requis' 
      }, { status: 400 });
    }
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
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
            } catch {
              // Cookies en lecture seule en production
            }
          },
        },
      }
    );
    
    if (action === 'signup') {
      // INSCRIPTION
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://www.guide-de-lyon.fr/auth/verify',
        }
      });
      
      if (error) {
        return NextResponse.json({ 
          success: false,
          error: error.message 
        }, { status: 400 });
      }
      
      // Si pas de confirmation email requise, connecter directement
      if (data.session) {
        return NextResponse.json({
          success: true,
          message: 'Inscription réussie',
          redirectTo: '/pro/inscription'
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Inscription réussie. Vérifiez votre email.',
        needsConfirmation: true
      });
      
    } else if (action === 'signin') {
      // CONNEXION
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return NextResponse.json({ 
          success: false,
          error: error.message 
        }, { status: 400 });
      }
      
      if (data.session) {
        // Vérifier si établissement existe
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        return NextResponse.json({
          success: true,
          message: 'Connexion réussie',
          redirectTo: establishment ? '/pro/dashboard' : '/pro/inscription'
        });
      }
      
    } else if (action === 'reset') {
      // RESET PASSWORD
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://www.guide-de-lyon.fr/auth/reset-password',
      });
      
      if (error) {
        return NextResponse.json({ 
          success: false,
          error: error.message 
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Email de réinitialisation envoyé'
      });
      
    } else if (action === 'resend') {
      // RESEND CONFIRMATION EMAIL  
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'https://www.guide-de-lyon.fr/auth/verify',
        }
      });
      
      if (error) {
        // Si l'utilisateur n'existe pas, essayer de le créer à nouveau
        if (error.message.includes('not found')) {
          return NextResponse.json({ 
            success: false,
            error: 'Cet email n\'est pas inscrit. Veuillez créer un compte.' 
          }, { status: 400 });
        }
        return NextResponse.json({ 
          success: false,
          error: error.message 
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Nouveau lien de confirmation envoyé'
      });
      
    } else if (action === 'verify') {
      // VERIFY OTP TOKEN
      const { token } = body;
      
      if (!token) {
        return NextResponse.json({ 
          success: false,
          error: 'Token requis pour la vérification' 
        }, { status: 400 });
      }
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });
      
      if (error) {
        return NextResponse.json({ 
          success: false,
          error: error.message 
        }, { status: 400 });
      }
      
      if (data.session) {
        // Vérifier si établissement existe
        const { data: establishment } = await supabase
          .from('establishments')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        return NextResponse.json({
          success: true,
          message: 'Email vérifié avec succès',
          redirectTo: establishment ? '/pro/dashboard' : '/pro/inscription'
        });
      }
      
      return NextResponse.json({ 
        success: false,
        error: 'Vérification échouée' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Action non reconnue' 
    }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 });
  }
}