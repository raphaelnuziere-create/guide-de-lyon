'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Image,
  Plus,
  Trash2,
  ArrowLeft,
  Star,
  Upload,
  Lock,
  AlertCircle,
  ChevronRight,
  Camera,
  X,
  Grid,
  Move
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';
import { PhotoService, Photo } from '@/lib/services/photoService';
import { useUserPlan } from '@/lib/auth/useUserPlan';

// Interface Photo importée depuis PhotoService

export default function PhotosPage() {
  const router = useRouter();
  const { plan, planLimits, establishmentId, isLoading: planLoading } = useUserPlan();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosRemaining, setPhotosRemaining] = useState(0);
  const [draggedPhoto, setDraggedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!planLoading && establishmentId) {
      loadPhotos();
    }
  }, [planLoading, establishmentId]);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/pro/connexion');
        return;
      }

      // Charger l'établissement
      const establishmentData = await EstablishmentService.getEstablishment(user.id);
      if (!establishmentData) {
        router.push('/pro/inscription');
        return;
      }

      setEstablishment(establishmentData);

      // Charger les limites du plan
      const limits = await EstablishmentService.getPlanLimits(establishmentData.plan);
      setPlanLimits(limits);
      
      // Calculer les photos restantes
      const remaining = EstablishmentService.getPhotosRemaining(establishmentData);
      setPhotosRemaining(remaining);

      // Charger les photos
      const { data: photosData, error } = await supabase
        .from('establishment_photos')
        .select('*')
        .eq('establishment_id', establishmentData.id)
        .order('position', { ascending: true });

      if (!error && photosData) {
        setPhotos(photosData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      if (!establishmentId) {
        throw new Error('Aucun établissement trouvé');
      }

      const file = event.target.files[0];
      
      // Vérifier les limites
      const maxPhotos = planLimits.maxPhotos === -1 ? 999 : planLimits.maxPhotos;
      if (photos.length >= maxPhotos) {
        throw new Error(`Vous avez atteint la limite de ${maxPhotos} photo${maxPhotos > 1 ? 's' : ''} pour votre plan ${plan}`);
      }

      // Upload via PhotoService
      const newPhoto = await PhotoService.uploadPhoto(
        establishmentId,
        file,
        '', // caption vide pour l'instant
        photos.length // position = nombre actuel de photos
      );

      // Mettre à jour la liste
      setPhotos(prev => [...prev, newPhoto]);
      setPhotosRemaining(prev => Math.max(0, prev - 1));
      
    } catch (error: any) {
      console.error('Erreur upload:', error);
      alert(error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      // Reset input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const deletePhoto = async (photo: Photo) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;
    
    try {
      await PhotoService.deletePhoto(photo.id);
      
      // Retirer de la liste locale
      setPhotos(prev => prev.filter(p => p.id !== photo.id));
      setPhotosRemaining(prev => prev + 1);
      
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      alert(error.message || 'Erreur lors de la suppression');
    }
  };

  const setMainPhoto = async (photo: Photo) => {
    if (!establishmentId) return;
    
    try {
      await PhotoService.setMainPhoto(photo.id, establishmentId);
      
      // Mettre à jour localement
      setPhotos(prev => prev.map(p => ({ ...p, is_main: p.id === photo.id })));
      
    } catch (error: any) {
      console.error('Erreur photo principale:', error);
      alert(error.message || 'Erreur lors de la définition de la photo principale');
    }
  };

  const handleDragStart = (photo: Photo) => {
    setDraggedPhoto(photo);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetPhoto: Photo) => {
    e.preventDefault();
    
    if (!draggedPhoto || draggedPhoto.id === targetPhoto.id) return;

    try {
      // Échanger les positions
      await supabase
        .from('establishment_photos')
        .update({ position: targetPhoto.position })
        .eq('id', draggedPhoto.id);

      await supabase
        .from('establishment_photos')
        .update({ position: draggedPhoto.position })
        .eq('id', targetPhoto.id);

      // Recharger les données
      await checkAuthAndLoadData();
    } catch (error) {
      console.error('Error reordering photos:', error);
    } finally {
      setDraggedPhoto(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const canAddPhoto = photosRemaining > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/pro/dashboard" 
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Gestion des photos
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {photos.length}/{planLimits?.max_photos || 1} photos utilisées
              </span>
              {canAddPhoto ? (
                <label className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Ajouter une photo
                    </>
                  )}
                </label>
              ) : (
                <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Limite atteinte
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerte si limite atteinte */}
        {!canAddPhoto && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900">Limite de photos atteinte</h3>
              <p className="text-sm text-amber-800 mt-1">
                Vous avez atteint votre limite de {planLimits?.max_photos} photo{planLimits?.max_photos > 1 ? 's' : ''} pour votre plan {establishment?.plan}.
              </p>
              {establishment?.plan !== 'expert' && (
                <Link
                  href="/pro/abonnement"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-900 hover:text-amber-700 mt-2"
                >
                  Passer au plan {establishment?.plan === 'basic' ? 'Pro' : 'Expert'} pour plus de photos
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        {photos.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Grid className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Gestion de vos photos</p>
                <ul className="space-y-1">
                  <li>• Cliquez sur l'étoile pour définir la photo principale</li>
                  <li>• Glissez-déposez les photos pour les réorganiser</li>
                  <li>• La photo principale apparaît en premier dans les résultats de recherche</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Grille de photos */}
        {photos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune photo ajoutée
            </h2>
            <p className="text-gray-600 mb-6">
              Ajoutez des photos pour rendre votre établissement plus attractif
            </p>
            {canAddPhoto && (
              <label className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Upload className="h-5 w-5" />
                Ajouter votre première photo
              </label>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group bg-white rounded-lg shadow-sm overflow-hidden cursor-move"
                draggable
                onDragStart={() => handleDragStart(photo)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, photo)}
              >
                {/* Badge photo principale */}
                {photo.is_main && (
                  <div className="absolute top-2 left-2 z-10 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Photo principale
                  </div>
                )}

                {/* Image */}
                <div className="aspect-[4/3] relative">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Photo établissement'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      {!photo.is_main && (
                        <button
                          onClick={() => setMainPhoto(photo)}
                          className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition"
                          title="Définir comme photo principale"
                        >
                          <Star className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deletePhoto(photo)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Indicateur de position pour le drag & drop */}
                <div className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition">
                  <Move className="h-3 w-3 inline mr-1" />
                  Position {photo.position + 1}
                </div>
              </div>
            ))}

            {/* Placeholder pour ajouter une photo */}
            {canAddPhoto && (
              <label className="aspect-[4/3] bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-red-400 transition cursor-pointer flex flex-col items-center justify-center group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Plus className="h-8 w-8 text-gray-400 group-hover:text-red-600 mb-2" />
                <span className="text-sm text-gray-600 group-hover:text-red-600">
                  Ajouter une photo
                </span>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}