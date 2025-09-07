'use client'

import { useState, useEffect } from 'react';
import { Check, X, Loader2, Info } from 'lucide-react';
import { VATValidationService } from '@/app/lib/services/vatValidationService';

interface VATNumberInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  required?: boolean;
  plan?: string;
}

export function VATNumberInput({ value, onChange, required = false, plan = 'basic' }: VATNumberInputProps) {
  const [vatNumber, setVatNumber] = useState(value || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const [touched, setTouched] = useState(false);

  // Validation automatique après un délai
  useEffect(() => {
    if (!vatNumber || vatNumber.length < 4) {
      setValidationResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      await validateVAT(vatNumber);
    }, 1000); // Attendre 1 seconde après la dernière frappe

    return () => clearTimeout(timer);
  }, [vatNumber]);

  const validateVAT = async (vat: string) => {
    setIsValidating(true);
    
    try {
      // Validation du format d'abord
      const formatValid = VATValidationService.validateFormat(vat);
      
      if (!formatValid) {
        setValidationResult({
          valid: false,
          message: 'Format invalide. Ex: FR 12 345 678 901'
        });
        onChange(vat, false);
        setIsValidating(false);
        return;
      }

      // Validation en ligne
      const result = await VATValidationService.validateOnline(vat);
      
      if (result.valid) {
        setValidationResult({
          valid: true,
          message: result.name ? `✓ ${result.name}` : '✓ Numéro TVA valide',
          details: result
        });
        onChange(vat, true);
      } else {
        setValidationResult({
          valid: false,
          message: result.error || 'Numéro TVA non trouvé dans la base VIES'
        });
        onChange(vat, false);
      }
    } catch (error) {
      console.error('Erreur validation TVA:', error);
      setValidationResult({
        valid: false,
        message: 'Erreur de validation. Vérifiez le format.'
      });
      onChange(vat, false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setVatNumber(newValue);
    setTouched(true);
  };

  const handleBlur = () => {
    setTouched(true);
    if (vatNumber && vatNumber.length >= 4) {
      validateVAT(vatNumber);
    }
  };

  // Déterminer si le champ TVA est requis selon le plan
  const isRequired = plan !== 'basic' || required;
  
  // Obtenir le code pays détecté
  const countryCode = VATValidationService.getCountryCode(vatNumber);
  const countryName = countryCode ? VATValidationService.getCountryName(countryCode) : '';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Numéro de TVA intracommunautaire
        {isRequired && <span className="text-red-500 ml-1">*</span>}
        {plan !== 'basic' && (
          <span className="text-xs text-gray-500 ml-2">
            (Obligatoire pour les plans Pro et Expert)
          </span>
        )}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={vatNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ex: FR 12 345 678 901"
          required={isRequired}
          className={`
            w-full px-3 py-2 pr-10 border rounded-lg 
            focus:ring-2 focus:outline-none transition
            ${touched && validationResult?.valid === false 
              ? 'border-red-500 focus:ring-red-500' 
              : validationResult?.valid === true
              ? 'border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:ring-blue-500'
            }
          `}
        />
        
        {/* Icône de statut */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {isValidating && (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          )}
          {!isValidating && validationResult?.valid === true && (
            <Check className="h-5 w-5 text-green-500" />
          )}
          {!isValidating && touched && validationResult?.valid === false && (
            <X className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Message de validation */}
      {touched && validationResult && (
        <div className={`text-sm ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
          {validationResult.message}
          {countryName && validationResult.valid && (
            <span className="text-gray-500 ml-2">({countryName})</span>
          )}
        </div>
      )}

      {/* Exemples de formats */}
      {!touched && (
        <div className="flex items-start space-x-1 text-xs text-gray-500">
          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            <p>Formats acceptés par pays :</p>
            <ul className="mt-1 space-y-0.5">
              <li>France : FR + 11 chiffres</li>
              <li>Belgique : BE + 0 + 9 chiffres</li>
              <li>Allemagne : DE + 9 chiffres</li>
            </ul>
          </div>
        </div>
      )}

      {/* Information sur la validation */}
      {validationResult?.details?.address && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p className="font-semibold">Entreprise validée :</p>
          <p>{validationResult.details.name}</p>
          <p className="text-gray-500">{validationResult.details.address}</p>
        </div>
      )}
    </div>
  );
}