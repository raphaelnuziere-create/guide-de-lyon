'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload, 
  FileText,
  Building2,
  AlertCircle,
  Camera,
  Check
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  icon: any;
}

export default function VerificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'in_review' | 'verified' | 'rejected'>('pending');
  const [businessData, setBusinessData] = useState<any>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: 'business_info',
      title: 'Informations complètes',
      description: 'Nom, adresse, téléphone, email',
      completed: false,
      required: true,
      icon: Building2
    },
    {
      id: 'business_doc',
      title: 'Document officiel',
      description: 'Kbis, SIRET ou autre justificatif',
      completed: false,
      required: true,
      icon: FileText
    },
    {
      id: 'photos',
      title: 'Photos de l\'établissement',
      description: 'Au moins 3 photos de qualité',
      completed: false,
      required: true,
      icon: Camera
    },
    {
      id: 'opening_hours',
      title: 'Horaires d\'ouverture',
      description: 'Horaires complets renseignés',
      completed: false,
      required: true,
      icon: Clock
    },
    {
      id: 'description',
      title: 'Description détaillée',
      description: 'Au moins 100 caractères',
      completed: false,
      required: false,
      icon: FileText
    }
  ]);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/pro/connexion');
        return;
      }

      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', session.user.id)
        .single();

      if (business) {
        setBusinessData(business);
        setVerificationStatus(business.verification_status || 'pending');
        
        // Vérifier les étapes complétées
        const updatedSteps = [...steps];
        
        // Info complètes
        if (business.name && business.address && business.phone && business.email) {
          updatedSteps[0].completed = true;
        }
        
        // Document officiel
        if (business.verification_document) {
          updatedSteps[1].completed = true;
        }
        
        // Photos
        if (business.gallery && business.gallery.length >= 3) {
          updatedSteps[2].completed = true;
        }
        
        // Horaires
        if (business.opening_hours && Object.keys(business.opening_hours).length > 0) {
          updatedSteps[3].completed = true;
        }
        
        // Description
        if (business.description && business.description.length >= 100) {
          updatedSteps[4].completed = true;
        }
        
        setSteps(updatedSteps);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Upload du document
      const fileExt = file.name.split('.').pop();
      const fileName = `verification/${session.user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('business-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Sauvegarder le chemin dans la base
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ 
          verification_document: fileName,
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', session.user.id);

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      const updatedSteps = [...steps];
      updatedSteps[1].completed = true;
      setSteps(updatedSteps);
      
      alert('Document uploadé avec succès!');
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload du document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmitVerification = async () => {
    // Vérifier que toutes les étapes requises sont complétées
    const requiredStepsCompleted = steps.filter(s => s.required).every(s => s.completed);
    
    if (!requiredStepsCompleted) {
      alert('Veuillez compléter toutes les étapes requises avant de soumettre');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Mettre à jour le statut de vérification
      const { error } = await supabase
        .from('businesses')
        .update({ 
          verification_status: 'in_review',
          verification_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('owner_id', session.user.id);

      if (error) throw error;

      setVerificationStatus('in_review');
      alert('Demande de vérification soumise! Nous reviendrons vers vous sous 48h.');
      
      setTimeout(() => {
        router.push('/pro/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur soumission:', error);
      alert('Erreur lors de la soumission');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/pro/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                Vérification de l'établissement
              </h1>
              <p className="text-gray-600 mt-2">
                Obtenez le badge "Établissement vérifié" pour renforcer votre crédibilité
              </p>
            </div>
            
            {/* Statut */}
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              verificationStatus === 'verified' 
                ? 'bg-green-100 text-green-700'
                : verificationStatus === 'in_review'
                ? 'bg-yellow-100 text-yellow-700'
                : verificationStatus === 'rejected'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {verificationStatus === 'verified' && <CheckCircle className="h-5 w-5" />}
              {verificationStatus === 'in_review' && <Clock className="h-5 w-5" />}
              {verificationStatus === 'rejected' && <XCircle className="h-5 w-5" />}
              <span className="font-medium">
                {verificationStatus === 'verified' && 'Vérifié'}
                {verificationStatus === 'in_review' && 'En cours de vérification'}
                {verificationStatus === 'rejected' && 'Refusé'}
                {verificationStatus === 'pending' && 'Non vérifié'}
              </span>
            </div>
          </div>
        </div>

        {/* Message selon statut */}
        {verificationStatus === 'in_review' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Vérification en cours</p>
              <p className="text-sm text-yellow-700 mt-1">
                Votre demande est en cours de traitement. Nous vous contacterons sous 48h.
              </p>
            </div>
          </div>
        )}

        {verificationStatus === 'verified' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Établissement vérifié!</p>
              <p className="text-sm text-green-700 mt-1">
                Votre badge de vérification est visible sur votre page établissement.
              </p>
            </div>
          </div>
        )}

        {/* Étapes de vérification */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Étapes de vérification</h2>
          
          <div className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${
                    step.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    step.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      step.completed ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      {step.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Requis
                        </span>
                      )}
                      {step.completed && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    
                    {/* Actions spécifiques */}
                    {step.id === 'business_doc' && !step.completed && (
                      <div className="mt-3">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            disabled={uploadingDoc}
                            className="hidden"
                          />
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            <Upload className="h-4 w-4" />
                            {uploadingDoc ? 'Upload...' : 'Uploader un document'}
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Formats acceptés: PDF, JPG, PNG (max 5MB)
                        </p>
                      </div>
                    )}
                    
                    {step.id === 'business_info' && !step.completed && (
                      <Link 
                        href="/pro/etablissement/edit"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
                      >
                        Compléter les informations →
                      </Link>
                    )}
                    
                    {step.id === 'photos' && !step.completed && (
                      <Link 
                        href="/pro/photos"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
                      >
                        Ajouter des photos →
                      </Link>
                    )}
                    
                    {step.id === 'opening_hours' && !step.completed && (
                      <Link 
                        href="/pro/horaires"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
                      >
                        Définir les horaires →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Avantages */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Avantages de la vérification
          </h2>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Badge "Établissement vérifié" visible sur votre page</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Augmentation de la confiance des visiteurs</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Meilleur référencement dans les résultats de recherche</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>Accès prioritaire aux nouvelles fonctionnalités</span>
            </li>
          </ul>
        </div>

        {/* Bouton de soumission */}
        {verificationStatus === 'pending' && (
          <div className="flex justify-center">
            <button
              onClick={handleSubmitVerification}
              disabled={!steps.filter(s => s.required).every(s => s.completed)}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                steps.filter(s => s.required).every(s => s.completed)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Shield className="h-5 w-5" />
              Soumettre pour vérification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}