import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ 
        error: 'Email requis' 
      }, { status: 400 });
    }
    
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      // Utiliser la clé anon si pas de service key
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
                // Ignorer
              }
            },
          },
        }
      );
      
      // Tenter une connexion pour voir l'erreur exacte
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: 'test_wrong_password_12345'
      });
      
      return NextResponse.json({
        hasServiceKey: false,
        userExists: signInError?.message?.includes('Invalid login') ? true : false,
        errorMessage: signInError?.message || 'Aucune erreur',
        errorStatus: signInError?.status,
        suggestion: signInError?.message?.includes('Invalid login') 
          ? 'L\'utilisateur existe. Vérifiez le mot de passe.'
          : signInError?.message?.includes('Email not confirmed')
          ? 'Email non confirmé. Vérifiez votre boîte mail.'
          : 'L\'utilisateur n\'existe peut-être pas. Créez un nouveau compte.'
      });
    }
    
    // Avec service key, on peut avoir plus d'infos
    const supabase = createServerClient(
      supabaseUrl,
      supabaseServiceKey,
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
              // Ignorer
            }
          },
        },
      }
    );
    
    // Rechercher l'utilisateur
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers({
      filter: `email.eq.${email}`,
      page: 1,
      perPage: 1
    });
    
    if (searchError) {
      return NextResponse.json({ 
        error: 'Erreur recherche',
        details: searchError.message
      }, { status: 400 });
    }
    
    if (!users || users.users.length === 0) {
      return NextResponse.json({
        userExists: false,
        message: 'Utilisateur non trouvé',
        suggestion: 'Créez un nouveau compte sur /auth/pro/inscription'
      });
    }
    
    const user = users.users[0];
    
    // Analyser l'état de l'utilisateur
    const analysis = {
      userExists: true,
      userId: user.id,
      email: user.email,
      emailConfirmed: !!user.email_confirmed_at,
      phoneConfirmed: !!user.phone_confirmed_at,
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
      banned: !!user.banned_until,
      bannedUntil: user.banned_until,
      
      // Métadonnées
      provider: user.app_metadata?.provider || 'email',
      providers: user.app_metadata?.providers || [],
      
      // Analyse des problèmes
      problems: [] as string[],
      solutions: [] as string[]
    };
    
    // Identifier les problèmes
    if (!analysis.emailConfirmed) {
      analysis.problems.push('Email non confirmé');
      analysis.solutions.push('Désactivez "Confirm email" dans Supabase Dashboard');
    }
    
    if (analysis.banned) {
      analysis.problems.push(`Utilisateur banni jusqu'à ${analysis.bannedUntil}`);
      analysis.solutions.push('Débannir l\'utilisateur dans Supabase Dashboard');
    }
    
    if (!analysis.lastSignIn) {
      analysis.problems.push('Jamais connecté');
      analysis.solutions.push('Le mot de passe pourrait être incorrect');
    }
    
    // Si aucun problème détecté mais connexion échoue
    if (analysis.problems.length === 0) {
      analysis.problems.push('Mot de passe probablement incorrect');
      analysis.solutions.push('Réinitialisez le mot de passe ou créez un nouveau compte');
    }
    
    return NextResponse.json(analysis);
    
  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json({
      error: 'Erreur serveur',
      details: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de vérification utilisateur',
    usage: {
      method: 'POST',
      body: {
        email: 'user@example.com'
      }
    },
    note: 'Vérifie l\'état d\'un utilisateur et diagnostique les problèmes'
  });
}