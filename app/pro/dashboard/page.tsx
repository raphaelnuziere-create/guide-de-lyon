'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  BuildingOfficeIcon,
  CalendarIcon,
  PhotoIcon,
  CogIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Créer le client Supabase avec vérification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default function SimpleDashboardPro() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [establishment, setEstablishment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/connexion/pro');
      } else {
        // Charger l'établissement pour tout utilisateur connecté
        // (le rôle 'merchant' est déterminé par la présence d'un établissement)
        loadEstablishment();
      }
    }
  }, [user, authLoading]);

  const loadEstablishment = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    if (!supabase) {
      console.error('❌ Supabase non configuré');
      setLoading(false);
      return;
    }
    
    try {
      // Première tentative
      let { data, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Si pas trouvé, attendre un peu et réessayer (pour les nouvelles inscriptions)
      if (error && error.code === 'PGRST116') {
        console.log('Établissement non trouvé, nouvelle tentative dans 1 seconde...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Deuxième tentative
        const retry = await supabase
          .from('establishments')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        data = retry.data;
        error = retry.error;
      }
      
      if (error) {
        console.error('Erreur chargement établissement:', error);
        if (error.code === 'PGRST116') {
          // Pas d'établissement trouvé après retry
          console.log('Pas d\'établissement, redirection vers inscription');
          router.push('/pro/inscription');
        } else {
          // Autre erreur
          setLoading(false);
        }
      } else {
        setEstablishment(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
          {!supabase && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
              <p className="text-red-700 font-semibold">⚠️ Configuration manquante</p>
              <p className="text-red-600 text-sm mt-2">
                Les variables d'environnement Supabase ne sont pas configurées sur ce serveur.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!establishment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Aucun établissement trouvé</p>
          <button
            onClick={() => router.push('/pro/inscription')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Créer mon établissement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{establishment.name}</h1>
              <p className="text-sm text-gray-600">Tableau de bord professionnel</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Message de bienvenue */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-green-900">
                Bienvenue sur votre espace professionnel !
              </h2>
              <p className="mt-1 text-green-700">
                Votre compte est actif. Vous pouvez maintenant gérer votre établissement.
              </p>
            </div>
          </div>
        </div>

        {/* Informations de l'établissement */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <BuildingOfficeIcon className="h-6 w-6 mr-2 text-blue-600" />
            Mon établissement
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nom</p>
              <p className="font-medium">{establishment.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{establishment.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Téléphone</p>
              <p className="font-medium">{establishment.phone || 'Non renseigné'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Adresse</p>
              <p className="font-medium">{establishment.address || 'Non renseignée'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Ville</p>
              <p className="font-medium">{establishment.city || 'Lyon'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">TVA</p>
              <p className="font-medium">{establishment.vat_number || 'Non renseigné'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                establishment.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {establishment.status === 'active' ? 'Actif' : 'En attente'}
              </span>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Basic (Gratuit)
              </span>
            </div>
          </div>
          
          {establishment.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="mt-1">{establishment.description}</p>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <CalendarIcon className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold mb-1">Événements</h3>
            <p className="text-sm text-gray-600 mb-3">
              Créez et gérez vos événements
            </p>
            <button className="text-sm text-blue-600 hover:underline flex items-center">
              Gérer les événements
              <ArrowRightIcon className="h-3 w-3 ml-1" />
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <PhotoIcon className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold mb-1">Photos</h3>
            <p className="text-sm text-gray-600 mb-3">
              Ajoutez des photos de votre établissement
            </p>
            <button className="text-sm text-blue-600 hover:underline flex items-center">
              Gérer les photos
              <ArrowRightIcon className="h-3 w-3 ml-1" />
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <CogIcon className="h-8 w-8 text-gray-600 mb-3" />
            <h3 className="font-semibold mb-1">Paramètres</h3>
            <p className="text-sm text-gray-600 mb-3">
              Configurez votre compte
            </p>
            <button className="text-sm text-blue-600 hover:underline flex items-center">
              Accéder aux paramètres
              <ArrowRightIcon className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Plan et upgrade */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Passez au plan Pro</h3>
          <p className="mb-4">
            Débloquez plus de fonctionnalités : newsletter, 6 photos, événements sur la homepage...
          </p>
          <button
            onClick={() => router.push('/pro')}
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100"
          >
            Découvrir les offres Pro
          </button>
        </div>
      </div>
    </div>
  );
}