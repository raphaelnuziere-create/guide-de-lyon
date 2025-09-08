'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  FileText,
  AlertCircle,
  Camera,
  Loader2
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

interface EstablishmentData {
  id: string;
  name: string;
  description: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  category: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
}

const CATEGORIES = [
  { value: 'restaurant-food', label: 'Restaurant & Food' },
  { value: 'bar-nightlife', label: 'Bar & Nightlife' },
  { value: 'shopping-mode', label: 'Shopping & Mode' },
  { value: 'beaute-bienetre', label: 'Beauté & Bien-être' },
  { value: 'hotel-hebergement', label: 'Hôtel & Hébergement' },
  { value: 'culture-loisirs', label: 'Culture & Loisirs' },
  { value: 'sport-fitness', label: 'Sport & Fitness' },
  { value: 'sante-medical', label: 'Santé & Médical' },
  { value: 'services-pro', label: 'Services professionnels' },
  { value: 'immobilier', label: 'Immobilier' },
  { value: 'auto-transport', label: 'Auto & Transport' },
  { value: 'autre', label: 'Autre' }
];

export default function EditEstablishmentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [establishment, setEstablishment] = useState<EstablishmentData>({
    id: '',
    name: '',
    description: '',
    address: '',
    postal_code: '',
    city: 'Lyon',
    phone: '',
    email: '',
    website: '',
    category: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    youtube_url: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/pro/connexion');
        return;
      }
      loadEstablishmentData();
    }
  }, [user, authLoading]);

  const loadEstablishmentData = async () => {
    if (!user || !supabase) return;
    
    try {
      setLoading(true);
      
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

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur chargement établissement:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
        return;
      }

      if (data) {
        console.log('Établissement chargé:', data);
        setEstablishment({
          id: data.id,
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          postal_code: data.postal_code || '',
          city: data.city || 'Lyon',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          category: data.category || '',
          facebook_url: data.facebook_url || '',
          instagram_url: data.instagram_url || '',
          twitter_url: data.twitter_url || '',
          linkedin_url: data.linkedin_url || '',
          youtube_url: data.youtube_url || ''
        });
      } else {
        console.log('Aucun établissement trouvé');
        setMessage({ type: 'error', text: 'Aucun établissement trouvé. Veuillez d\'abord créer votre établissement.' });
        setTimeout(() => {
          router.push('/pro/inscription');
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!establishment.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    if (!establishment.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    }
    if (!establishment.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(establishment.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!establishment.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    if (!establishment.category) {
      newErrors.category = 'La catégorie est requise';
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

    if (!user || !supabase) return;

    setSaving(true);
    setMessage(null);

    try {
      const updateData = {
        name: establishment.name,
        description: establishment.description,
        address: establishment.address,
        postal_code: establishment.postal_code,
        city: establishment.city,
        phone: establishment.phone,
        email: establishment.email,
        website: establishment.website || null,
        category: establishment.category,
        facebook_url: establishment.facebook_url || null,
        instagram_url: establishment.instagram_url || null,
        twitter_url: establishment.twitter_url || null,
        linkedin_url: establishment.linkedin_url || null,
        youtube_url: establishment.youtube_url || null,
        updated_at: new Date().toISOString()
      };

      console.log('Mise à jour avec:', updateData);

      // Essayer d'abord avec user_id
      let { error } = await supabase
        .from('establishments')
        .update(updateData)
        .eq('user_id', user.id);

      // Si erreur de colonne, essayer avec owner_id
      if (error && error.message?.includes('column')) {
        const result = await supabase
          .from('establishments')
          .update(updateData)
          .eq('owner_id', user.id);
        error = result.error;
      }

      if (error) {
        console.error('Erreur sauvegarde:', error);
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde: ' + error.message });
      } else {
        setMessage({ type: 'success', text: 'Établissement mis à jour avec succès !' });
        setTimeout(() => {
          router.push('/pro/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEstablishment({
      ...establishment,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Chargement...</p>
        </div>
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
                href="/pro/dashboard" 
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour au tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold flex items-center">
              <Building2 className="w-6 h-6 mr-2" />
              Modifier mon établissement
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'établissement *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={establishment.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={establishment.category}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={establishment.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez votre établissement..."
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Contact
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={establishment.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={establishment.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={establishment.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Adresse
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={establishment.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={establishment.postal_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={establishment.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Réseaux sociaux
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Facebook className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="url"
                    name="facebook_url"
                    value={establishment.facebook_url}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="URL Facebook"
                  />
                </div>

                <div className="flex items-center">
                  <Instagram className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="url"
                    name="instagram_url"
                    value={establishment.instagram_url}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="URL Instagram"
                  />
                </div>

                <div className="flex items-center">
                  <Twitter className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="url"
                    name="twitter_url"
                    value={establishment.twitter_url}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="URL Twitter"
                  />
                </div>

                <div className="flex items-center">
                  <Linkedin className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="url"
                    name="linkedin_url"
                    value={establishment.linkedin_url}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="URL LinkedIn"
                  />
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/pro/dashboard"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
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