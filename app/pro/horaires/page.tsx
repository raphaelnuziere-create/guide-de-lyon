'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';
import { OpeningHours } from '@/components/dashboard/OpeningHours';

interface TimeSlot {
  open: string;
  close: string;
}

interface OpeningHoursData {
  [key: string]: TimeSlot[] | null;
}

export default function HorairesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hours, setHours] = useState<OpeningHoursData>({});
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadHours();
  }, []);

  const loadHours = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/pro/connexion');
        return;
      }

      // Récupérer l'établissement
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id, opening_hours')
        .eq('owner_id', session.user.id)
        .single();

      if (businessError || !business) {
        setMessage({ type: 'error', text: 'Impossible de charger vos données' });
        setLoading(false);
        return;
      }

      setBusinessId(business.id);
      
      // Charger les horaires existants
      if (business.opening_hours) {
        setHours(business.opening_hours as OpeningHoursData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Une erreur est survenue' });
      setLoading(false);
    }
  };

  const handleSave = async (newHours: OpeningHoursData) => {
    if (!businessId) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({ 
          opening_hours: newHours,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId);

      if (error) throw error;

      setHours(newHours);
      setMessage({ type: 'success', text: 'Horaires sauvegardés avec succès!' });
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/pro/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
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
        <div className="mb-6">
          <Link 
            href="/pro/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Link>
          
          <h1 className="text-2xl font-bold text-gray-900">Gérer les horaires d'ouverture</h1>
          <p className="text-gray-600 mt-2">
            Configurez vos horaires d'ouverture et fermetures exceptionnelles
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Composant horaires */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <OpeningHours 
            initialHours={hours}
            onSave={handleSave}
            readOnly={saving}
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between items-center">
          <Link 
            href="/pro/dashboard"
            className="text-gray-600 hover:text-gray-900"
          >
            Annuler
          </Link>
          
          <button
            onClick={() => handleSave(hours)}
            disabled={saving}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
              saving 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Sauvegarder
              </>
            )}
          </button>
        </div>

        {/* Aide */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Conseils</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Vous pouvez définir plusieurs créneaux horaires par jour</li>
            <li>• Utilisez "Copier à tous les jours" pour appliquer les mêmes horaires</li>
            <li>• N'oubliez pas d'ajouter vos fermetures exceptionnelles (jours fériés, congés...)</li>
            <li>• Les horaires sont immédiatement visibles sur votre page établissement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}