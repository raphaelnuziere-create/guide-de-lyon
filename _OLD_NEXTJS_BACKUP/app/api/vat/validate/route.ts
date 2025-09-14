// API Route pour valider les numéros de TVA européens
import { NextRequest, NextResponse } from 'next/server';

// URL de l'API VIES (utilise un proxy pour éviter CORS)
const VIES_PROXY_URL = 'https://api.allorigins.win/raw?url=';
const VIES_CHECK_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/ms';

export async function POST(request: NextRequest) {
  try {
    const { countryCode, vatNumber } = await request.json();

    if (!countryCode || !vatNumber) {
      return NextResponse.json(
        { error: 'Country code and VAT number are required' },
        { status: 400 }
      );
    }

    // Nettoyer les inputs
    const cleanCountry = countryCode.toUpperCase().replace(/[^A-Z]/g, '');
    const cleanNumber = vatNumber.replace(/[^0-9A-Z]/g, '');

    console.log(`[VAT API] Validating: ${cleanCountry}${cleanNumber}`);

    // Construire l'URL de validation
    const url = `${VIES_CHECK_URL}/${cleanCountry}/vat/${cleanNumber}`;
    
    try {
      // Essayer d'abord directement
      const directResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Timeout de 10 secondes
        signal: AbortSignal.timeout(10000),
      });

      if (directResponse.ok) {
        const data = await directResponse.json();
        return NextResponse.json({
          valid: data.isValid === true,
          countryCode: data.countryCode || cleanCountry,
          vatNumber: data.vatNumber || cleanNumber,
          name: data.name || '',
          address: data.address || '',
          requestDate: new Date().toISOString()
        });
      }
    } catch (directError) {
      console.log('[VAT API] Direct request failed, trying with proxy...');
    }

    // Si la requête directe échoue, utiliser un proxy
    const proxyUrl = `${VIES_PROXY_URL}${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!proxyResponse.ok) {
      // Si même le proxy échoue, faire une validation basique
      return performBasicValidation(cleanCountry, cleanNumber);
    }

    const data = await proxyResponse.json();
    
    return NextResponse.json({
      valid: data.isValid === true,
      countryCode: data.countryCode || cleanCountry,
      vatNumber: data.vatNumber || cleanNumber,
      name: data.name || '',
      address: data.address || '',
      requestDate: new Date().toISOString()
    });

  } catch (error) {
    console.error('[VAT API] Error:', error);
    
    // En cas d'erreur, retourner une validation basique
    const { countryCode, vatNumber } = await request.json().catch(() => ({ countryCode: '', vatNumber: '' }));
    return performBasicValidation(countryCode, vatNumber);
  }
}

// Validation basique en cas d'échec de l'API
function performBasicValidation(countryCode: string, vatNumber: string) {
  // Patterns de validation basiques
  const patterns: Record<string, RegExp> = {
    FR: /^\d{11}$/,
    BE: /^0\d{9}$/,
    DE: /^\d{9}$/,
    ES: /^[A-Z]\d{7}[A-Z]$|^\d{8}[A-Z]$|^[A-Z]\d{8}$/,
    IT: /^\d{11}$/,
    NL: /^\d{9}B\d{2}$/,
  };

  const pattern = patterns[countryCode];
  const isFormatValid = pattern ? pattern.test(vatNumber) : false;

  return NextResponse.json({
    valid: false,
    countryCode,
    vatNumber,
    name: '',
    address: '',
    error: isFormatValid 
      ? 'Impossible de vérifier en ligne, mais le format semble correct'
      : 'Format de numéro TVA invalide',
    requestDate: new Date().toISOString(),
    offlineValidation: true
  });
}

// Route GET pour tester si l'API fonctionne
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'VAT validation API is running',
    endpoints: {
      validate: 'POST /api/vat/validate',
      body: {
        countryCode: 'FR',
        vatNumber: '12345678901'
      }
    }
  });
}