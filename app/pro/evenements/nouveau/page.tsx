'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

interface EventForm {
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  address: string;
  max_participants?: number;
  price?: string;
  status: 'draft' | 'published';
  photo?: File | null;
}

export default function NouveauEvenementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [establishment, setEstablishment] = useState<any>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [eventForm, setEventForm] = useState<EventForm>({
    title: '',
    description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    address: '',
    max_participants: undefined,
    price: '',
    status: 'draft',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/pro/connexion');
        return;
      }
      loadEstablishment();
    }
  }, [user, authLoading]);

  const loadEstablishment = async () => {
    if (!user || !supabase) return;
    
    try {
      // Essayer d'abord avec user_id
      let { data, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Si erreur de colonne, essayer avec owner_id
      if (error && error.message?.includes('column')) {
        const result = await supabase
          .from('establishments')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (data) {
        setEstablishment(data);
        // Pré-remplir l'adresse avec celle de l'établissement
        setEventForm(prev => ({
          ...prev,
          address: data.address || ''
        }));
      } else {
        setMessage({ type: 'error', text: 'Vous devez d\'abord créer un établissement' });
        setTimeout(() => {
          router.push('/pro/inscription');
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur chargement établissement:', error);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!eventForm.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    if (!eventForm.description.trim()) {
      newErrors.description = 'La description est requise';
    }
    if (!eventForm.start_date) {
      newErrors.start_date = 'La date de début est requise';
    }
    if (!eventForm.start_time) {
      newErrors.start_time = 'L\'heure de début est requise';
    }
    if (!eventForm.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    
    // Vérifier que la date de fin est après la date de début
    if (eventForm.end_date && eventForm.end_date < eventForm.start_date) {
      newErrors.end_date = 'La date de fin doit être après la date de début';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Veuillez corriger les erreurs' });
      return;
    }

    if (!establishment || !supabase) return;

    setLoading(true);
    setMessage(null);

    try {
      // Combiner date et heure
      const startDateTime = `${eventForm.start_date} ${eventForm.start_time}:00`;
      const endDateTime = eventForm.end_date && eventForm.end_time 
        ? `${eventForm.end_date} ${eventForm.end_time}:00`
        : null;

      // Gérer l'upload de photo si présente
      let imageUrl = null;
      if (eventForm.photo) {
        const fileExt = eventForm.photo.name.split('.').pop();
        const fileName = `${establishment.id}-${Date.now()}.${fileExt}`;
        const filePath = `events/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(filePath, eventForm.photo);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('public')
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
        }
      }

      const eventData = {
        establishment_id: establishment.id,
        title: eventForm.title,
        description: eventForm.description,
        start_date: startDateTime,
        end_date: endDateTime,
        address: eventForm.address,
        max_participants: eventForm.max_participants || null,
        price: eventForm.price || null,
        status: eventForm.status,
        show_on_establishment_page: true,
        show_on_homepage: establishment.plan !== 'basic',
        show_in_newsletter: establishment.plan !== 'basic',
        show_on_social: establishment.plan === 'expert',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Ajouter l'image seulement si elle existe
      if (imageUrl) {
        (eventData as any).image_url = imageUrl;
      }

      console.log('Création événement:', eventData);

      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (error) {
        console.error('Erreur création événement:', error);
        
        // Gestion des erreurs spécifiques
        if (error.message?.includes('events_establishment_id_fkey')) {
          setMessage({ type: 'error', text: 'Établissement invalide' });
        } else if (error.message?.includes('duplicate')) {
          setMessage({ type: 'error', text: 'Un événement similaire existe déjà' });
        } else {
          setMessage({ type: 'error', text: 'Erreur lors de la création: ' + error.message });
        }
        return;
      }

      setMessage({ type: 'success', text: 'Événement créé avec succès !' });
      setTimeout(() => {
        router.push('/pro/evenements');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Une erreur est survenue' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setEventForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : undefined) : value
    }));
    
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Veuillez sélectionner une image' });
        return;
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'L\'image ne doit pas dépasser 5MB' });
        return;
      }
      setEventForm(prev => ({ ...prev, photo: file }));
      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                href="/pro/evenements" 
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour aux événements
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold flex items-center">
              <Calendar className="w-6 h-6 mr-2" />
              Créer un nouvel événement
            </h1>
          </div>

          {message && (
            <div className={`mx-6 mt-4 p-4 rounded-lg flex items-start ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informations générales */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Informations générales
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre de l\'événement *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={eventForm.title}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Soirée dégustation de vins"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={eventForm.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Décrivez votre événement..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Date et heure */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Date et heure
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={eventForm.start_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.start_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.start_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de début *
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={eventForm.start_time}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.start_time ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.start_time && (
                    <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={eventForm.end_date}
                    onChange={handleChange}
                    min={eventForm.start_date || new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.end_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.end_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={eventForm.end_time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Lieu */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Lieu
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse de l\'événement *
                </label>
                <input
                  type="text"
                  name="address"
                  value={eventForm.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 10 rue de la République, 69001 Lyon"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Détails supplémentaires */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Détails supplémentaires
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre max de participants
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={eventForm.max_participants || ''}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={eventForm.price}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Gratuit, 10€, Sur réservation"
                  />
                </div>
              </div>
            </div>

            {/* Photo de l'événement */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                Photo de l'événement
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ajouter une photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Format accepté: JPG, PNG (max 5MB)
                  </p>
                </div>

                {photoPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Aperçu:</p>
                    <img
                      src={photoPreview}
                      alt="Aperçu"
                      className="max-w-xs rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut de l\'événement
              </label>
              <select
                name="status"
                value={eventForm.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Les brouillons ne sont pas visibles publiquement
              </p>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/pro/evenements"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Créer l\'événement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}