'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';
import Image from 'next/image';

interface ImageUploadProps {
  type: 'profile' | 'gallery';
  maxFiles?: number;
  currentImages?: string[];
  businessId: string;
  onUploadComplete: (urls: string[]) => void;
  plan?: 'basic' | 'pro' | 'expert';
}

export function ImageUpload({ 
  type, 
  maxFiles = 1, 
  currentImages = [], 
  businessId,
  onUploadComplete,
  plan = 'basic'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string[]>(currentImages);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Limites selon le plan
  const getMaxImages = () => {
    if (type === 'profile') return 1;
    switch (plan) {
      case 'expert': return 10;
      case 'pro': return 6;
      default: return 1;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const maxAllowed = getMaxImages();
    const remainingSlots = maxAllowed - preview.length;
    
    if (acceptedFiles.length > remainingSlots) {
      setError(`Maximum ${maxAllowed} images autorisées pour votre plan ${plan}`);
      return;
    }

    // Vérifier la taille des fichiers (max 5MB)
    const oversizedFiles = acceptedFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Les fichiers doivent faire moins de 5MB');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirée');
      }

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        setUploadProgress(Math.round(((i + 1) / acceptedFiles.length) * 100));
        
        // Créer un nom unique
        const fileExt = file.name.split('.').pop();
        const fileName = `${businessId}/${type}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Upload vers Supabase Storage
        const { data, error } = await supabase.storage
          .from('business-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          // Si le bucket n'existe pas, le créer
          if (error.message.includes('not found')) {
            // Créer le bucket (nécessite des permissions admin)
            console.error('Bucket business-images n\'existe pas. Création nécessaire.');
            throw new Error('Configuration du stockage requise. Contactez l\'administrateur.');
          }
          throw error;
        }

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('business-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        
        // Ajouter au preview avec l'URL locale temporaire
        const objectUrl = URL.createObjectURL(file);
        setPreview(prev => [...prev, objectUrl]);
      }

      // Sauvegarder en base
      await saveToDatabase(uploadedUrls);
      onUploadComplete([...currentImages, ...uploadedUrls]);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Erreur lors de l\'upload');
      // Retirer les previews en cas d'erreur
      setPreview(currentImages);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [preview, plan, businessId, type, currentImages, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: getMaxImages() - preview.length,
    disabled: uploading || preview.length >= getMaxImages()
  });

  const removeImage = async (index: number) => {
    try {
      const imageUrl = preview[index];
      const newImages = preview.filter((_, i) => i !== index);
      setPreview(newImages);
      
      // Si c'est une URL Supabase, supprimer aussi de la base
      if (imageUrl.includes('supabase')) {
        const { error } = await supabase
          .from('businesses')
          .update({
            [type === 'profile' ? 'main_image' : 'gallery']: 
              type === 'profile' ? null : newImages.filter(url => url.includes('supabase'))
          })
          .eq('id', businessId);

        if (error) throw error;
      }
      
      onUploadComplete(newImages.filter(url => url.includes('supabase')));
    } catch (error) {
      console.error('Erreur suppression:', error);
      setError('Erreur lors de la suppression');
    }
  };

  async function saveToDatabase(urls: string[]) {
    const { error } = await supabase
      .from('businesses')
      .update({
        [type === 'profile' ? 'main_image' : 'gallery']: 
          type === 'profile' ? urls[0] : [...currentImages, ...urls],
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId);

    if (error) throw error;
  }

  const maxImages = getMaxImages();
  const canUpload = preview.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${!canUpload ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
          ${uploading ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-blue-600">Upload en cours... {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Déposez les images ici...</p>
            ) : canUpload ? (
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  Glissez-déposez vos images ici
                </p>
                <p className="text-sm text-gray-500">
                  ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG, WebP • Max 5MB par fichier
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 font-medium">
                  Limite atteinte
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Supprimez des images pour en ajouter de nouvelles
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Indicateur de quota */}
      {type === 'gallery' && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Images utilisées:</span>
            <span className={`font-medium ${
              preview.length >= maxImages ? 'text-red-600' : 'text-gray-900'
            }`}>
              {preview.length}/{maxImages}
            </span>
          </div>
          {plan && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              plan === 'expert' ? 'bg-purple-100 text-purple-700' :
              plan === 'pro' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
          )}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Preview des images */}
      {preview.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {preview.map((url, index) => (
            <div key={`${url}-${index}`} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                {url.startsWith('blob:') ? (
                  // Image locale (preview)
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Image depuis Supabase
                  <Image
                    src={url}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                )}
                
                {/* Overlay au hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200" />
              </div>
              
              {/* Bouton supprimer */}
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5
                         opacity-0 group-hover:opacity-100 transition-all duration-200
                         hover:bg-red-600 shadow-lg"
                title="Supprimer"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Badge image principale */}
              {type === 'gallery' && index === 0 && (
                <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-lg flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Principale
                </span>
              )}
              
              {/* Indicateur upload réussi */}
              {url.includes('supabase') && (
                <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Conseils */}
      {preview.length === 0 && !uploading && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 text-sm">Conseils pour vos photos</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Utilisez des photos de haute qualité (min 800x600px)</li>
            <li>• Montrez l'ambiance et les spécialités de votre établissement</li>
            <li>• Évitez les photos floues ou mal cadrées</li>
            {type === 'gallery' && <li>• La première image sera votre photo principale</li>}
          </ul>
        </div>
      )}
    </div>
  );
}