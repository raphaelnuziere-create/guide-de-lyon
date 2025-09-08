import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Vérifier un token simple pour éviter les abus
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (token !== 'lyon2024scrape') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    // Appeler la route de scraping
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.guide-de-lyon.fr';
    const response = await fetch(`${baseUrl}/api/scraping/run-full`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      triggered_at: new Date().toISOString(),
      result: data
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to trigger scraping',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}