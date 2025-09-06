import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL || 'Non défini',
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    status: 'checking'
  };

  // Vérifier si toutes les variables Supabase sont présentes
  const supabaseConfigured = config.supabase.url && config.supabase.anonKey;
  
  if (!supabaseConfigured) {
    config.status = 'missing_config';
  } else {
    config.status = 'configured';
  }

  return NextResponse.json(config);
}