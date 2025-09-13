import { NextRequest, NextResponse } from 'next/server';
import { directusService } from '@/lib/services/directus';

// ⚠️  MIGRÉ VERS DIRECTUS ⚠️
// Cette API route n'est plus utilisée car PhotoService utilise directement Directus
// Conservation temporaire pour compatibilité

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Cette API est dépréciée. PhotoService utilise maintenant directement Directus.' 
  }, { status: 410 }); // 410 Gone
}