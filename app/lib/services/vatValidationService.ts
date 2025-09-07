// Service de validation TVA européenne via l'API VIES
// Documentation: https://ec.europa.eu/taxation_customs/vies/

export interface VATValidationResult {
  valid: boolean;
  countryCode?: string;
  vatNumber?: string;
  name?: string;
  address?: string;
  requestDate?: Date;
  error?: string;
}

export class VATValidationService {
  private static readonly VIES_API_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/ms';
  private static readonly VAT_PATTERNS: Record<string, RegExp> = {
    // Patterns de validation pour chaque pays EU
    AT: /^ATU\d{8}$/,                     // Autriche
    BE: /^BE0\d{9}$/,                     // Belgique
    BG: /^BG\d{9,10}$/,                   // Bulgarie
    CY: /^CY\d{8}[A-Z]$/,                 // Chypre
    CZ: /^CZ\d{8,10}$/,                   // République tchèque
    DE: /^DE\d{9}$/,                      // Allemagne
    DK: /^DK\d{8}$/,                      // Danemark
    EE: /^EE\d{9}$/,                      // Estonie
    EL: /^EL\d{9}$/,                      // Grèce
    ES: /^ES[A-Z]\d{7}[A-Z]$|^ES\d{8}[A-Z]$|^ES[A-Z]\d{8}$/, // Espagne
    FI: /^FI\d{8}$/,                      // Finlande
    FR: /^FR[A-Z0-9]{2}\d{9}$/,           // France
    HR: /^HR\d{11}$/,                     // Croatie
    HU: /^HU\d{8}$/,                      // Hongrie
    IE: /^IE\d{7}[A-Z]{1,2}$|^IE\d[A-Z]\d{5}[A-Z]$/, // Irlande
    IT: /^IT\d{11}$/,                     // Italie
    LT: /^LT\d{9}$|^LT\d{12}$/,          // Lituanie
    LU: /^LU\d{8}$/,                      // Luxembourg
    LV: /^LV\d{11}$/,                     // Lettonie
    MT: /^MT\d{8}$/,                      // Malte
    NL: /^NL\d{9}B\d{2}$/,                // Pays-Bas
    PL: /^PL\d{10}$/,                     // Pologne
    PT: /^PT\d{9}$/,                      // Portugal
    RO: /^RO\d{2,10}$/,                   // Roumanie
    SE: /^SE\d{12}$/,                     // Suède
    SI: /^SI\d{8}$/,                      // Slovénie
    SK: /^SK\d{10}$/,                     // Slovaquie
  };

  /**
   * Valide le format d'un numéro de TVA
   */
  static validateFormat(vatNumber: string): boolean {
    if (!vatNumber || vatNumber.length < 4) return false;
    
    // Nettoyer le numéro (enlever espaces et caractères spéciaux)
    const cleanVAT = vatNumber.replace(/[\s\-\.]/g, '').toUpperCase();
    
    // Extraire le code pays (2 premiers caractères)
    const countryCode = cleanVAT.substring(0, 2);
    
    // Vérifier si le pattern existe pour ce pays
    const pattern = this.VAT_PATTERNS[countryCode];
    if (!pattern) return false;
    
    // Tester le pattern
    return pattern.test(cleanVAT);
  }

  /**
   * Valide un numéro de TVA via l'API VIES de la Commission Européenne
   */
  static async validateOnline(vatNumber: string): Promise<VATValidationResult> {
    try {
      // Nettoyer le numéro
      const cleanVAT = vatNumber.replace(/[\s\-\.]/g, '').toUpperCase();
      
      // Validation du format d'abord
      if (!this.validateFormat(cleanVAT)) {
        return {
          valid: false,
          error: 'Format de numéro TVA invalide'
        };
      }
      
      // Extraire le code pays et le numéro
      const countryCode = cleanVAT.substring(0, 2);
      const number = cleanVAT.substring(2);
      
      // Appel à l'API VIES via un proxy ou directement si CORS est configuré
      // Note: En production, utilisez votre propre endpoint API pour éviter les problèmes CORS
      const response = await fetch('/api/vat/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCode,
          vatNumber: number
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        valid: data.valid === true,
        countryCode: data.countryCode,
        vatNumber: data.vatNumber,
        name: data.name,
        address: data.address,
        requestDate: new Date()
      };
      
    } catch (error) {
      console.error('[VATValidation] Error validating VAT:', error);
      
      // En cas d'erreur réseau, on vérifie au moins le format
      const formatValid = this.validateFormat(vatNumber);
      
      return {
        valid: false,
        error: 'Impossible de vérifier en ligne. ' + 
               (formatValid ? 'Le format semble correct.' : 'Format invalide.'),
        requestDate: new Date()
      };
    }
  }

  /**
   * Extrait le code pays d'un numéro de TVA
   */
  static getCountryCode(vatNumber: string): string | null {
    const cleanVAT = vatNumber.replace(/[\s\-\.]/g, '').toUpperCase();
    if (cleanVAT.length < 2) return null;
    
    const code = cleanVAT.substring(0, 2);
    return this.VAT_PATTERNS[code] ? code : null;
  }

  /**
   * Obtient le nom du pays à partir du code
   */
  static getCountryName(code: string): string {
    const countries: Record<string, string> = {
      AT: 'Autriche',
      BE: 'Belgique',
      BG: 'Bulgarie',
      CY: 'Chypre',
      CZ: 'République tchèque',
      DE: 'Allemagne',
      DK: 'Danemark',
      EE: 'Estonie',
      EL: 'Grèce',
      ES: 'Espagne',
      FI: 'Finlande',
      FR: 'France',
      HR: 'Croatie',
      HU: 'Hongrie',
      IE: 'Irlande',
      IT: 'Italie',
      LT: 'Lituanie',
      LU: 'Luxembourg',
      LV: 'Lettonie',
      MT: 'Malte',
      NL: 'Pays-Bas',
      PL: 'Pologne',
      PT: 'Portugal',
      RO: 'Roumanie',
      SE: 'Suède',
      SI: 'Slovénie',
      SK: 'Slovaquie',
    };
    
    return countries[code] || 'Inconnu';
  }

  /**
   * Formate un numéro de TVA pour l'affichage
   */
  static formatVATNumber(vatNumber: string): string {
    const cleanVAT = vatNumber.replace(/[\s\-\.]/g, '').toUpperCase();
    
    // Ajouter des espaces pour la lisibilité
    if (cleanVAT.length > 2) {
      const country = cleanVAT.substring(0, 2);
      const number = cleanVAT.substring(2);
      
      // Format selon le pays
      switch (country) {
        case 'FR':
          // FR XX 999 999 999
          if (number.length === 11) {
            return `${country} ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5, 8)} ${number.substring(8)}`;
          }
          break;
        case 'BE':
          // BE 0999.999.999
          if (number.length === 10) {
            return `${country} ${number.substring(0, 4)}.${number.substring(4, 7)}.${number.substring(7)}`;
          }
          break;
        case 'DE':
          // DE 999 999 999
          if (number.length === 9) {
            return `${country} ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
          }
          break;
        default:
          // Format générique avec espaces tous les 3 caractères
          const formatted = number.match(/.{1,3}/g)?.join(' ') || number;
          return `${country} ${formatted}`;
      }
    }
    
    return cleanVAT;
  }

  /**
   * Génère un exemple de numéro TVA pour un pays donné
   */
  static getExample(countryCode: string): string {
    const examples: Record<string, string> = {
      FR: 'FR 12 345 678 901',
      BE: 'BE 0123.456.789',
      DE: 'DE 123 456 789',
      ES: 'ES A12345678',
      IT: 'IT 12345678901',
      NL: 'NL 123456789B01',
      // Ajoutez d'autres exemples selon les besoins
    };
    
    return examples[countryCode] || `${countryCode} XXXXXXXXX`;
  }
}