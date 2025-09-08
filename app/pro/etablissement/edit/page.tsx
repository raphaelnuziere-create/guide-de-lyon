'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Camera
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

interface BusinessData {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  category: string;
  subcategory: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  social_linkedin: string;
  social_youtube: string;
  tags: string[];
}

const CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hôtel' },
  { value: 'boutique', label: 'Boutique' },
  { value: 'service', label: 'Service' },
  { value: 'culture', label: 'Culture' },
  { value: 'sante', label: 'Santé' },
  { value: 'sport', label: 'Sport & Loisirs' },
  { value: 'beaute', label: 'Beauté & Bien-être' },
  { value: 'autre', label: 'Autre' }
];

export default function EditEstablishmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState<BusinessData>({
    id: '',
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    category: '',
    subcategory: '',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    social_linkedin: '',
    social_youtube: '',
    tags: []
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/pro/connexion');
        return;
      }

      const { data: businessData, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', session.user.id)
        .single();

      if (error || !businessData) {
        // Si pas d'établissement, créer un nouveau
        const { data: newBusiness, error: createError } = await supabase
          .from('businesses')
          .insert({
            owner_id: session.user.id,
            name: '',
            plan: 'basic',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (newBusiness) {
          setBusiness({
            ...business,
            id: newBusiness.id
          });
        }
      } else {
        setBusiness({
          id: businessData.id,
          name: businessData.name || '',
          description: businessData.description || '',
          address: businessData.address || '',
          phone: businessData.phone || '',
          email: businessData.email || '',
          website: businessData.website || '',
          category: businessData.category || '',
          subcategory: businessData.subcategory || '',
          social_facebook: businessData.social_facebook || '',
          social_instagram: businessData.social_instagram || '',
          social_twitter: businessData.social_twitter || '',
          social_linkedin: businessData.social_linkedin || '',
          social_youtube: businessData.social_youtube || '',
          tags: businessData.tags || []
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!business.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!business.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    
    if (!business.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    } else if (!/^[0-9\s\+\-\(\)]+$/.test(business.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }
    
    if (!business.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (business.website && !business.website.startsWith('http')) {
      newErrors.website = 'L\'URL doit commencer par http:// ou https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Veuillez corriger les erreurs' });
      return;
    }
    
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: business.name,
          description: business.description,
          address: business.address,
          phone: business.phone,
          email: business.email,
          website: business.website,
          category: business.category,
          subcategory: business.subcategory,
          social_facebook: business.social_facebook,
          social_instagram: business.social_instagram,
          social_twitter: business.social_twitter,
          social_linkedin: business.social_linkedin,
          social_youtube: business.social_youtube,
          tags: business.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', business.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Informations sauvegardées avec succès!' });
      
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

  const handleChange = (field: keyof BusinessData, value: any) => {
    setBusiness({ ...business, [field]: value });
    // Effacer l'erreur quand l'utilisateur corrige
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !business.tags.includes(newTag.trim())) {
      setBusiness({
        ...business,
        tags: [...business.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setBusiness({
      ...business,
      tags: business.tags.filter(t => t !== tag)
    });
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
          
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Modifier l'établissement
          </h1>
          <p className="text-gray-600 mt-2">
            Complétez et mettez à jour les informations de votre établissement
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

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Informations principales */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations principales</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  value={business.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Restaurant Le Lyonnais"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={business.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={business.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez votre établissement, vos spécialités, votre ambiance..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {business.description.length}/500 caractères
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Informations de contact</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={business.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 rue de la République, 69001 Lyon"
                  />
                </div>
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={business.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="04 78 00 00 00"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={business.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="contact@restaurant.fr"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={business.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.website ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://www.restaurant.fr"
                  />
                </div>
                {errors.website && (
                  <p className="text-red-500 text-xs mt-1">{errors.website}</p>
                )}
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Réseaux sociaux</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={business.social_facebook}
                    onChange={(e) => handleChange('social_facebook', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={business.social_instagram}
                    onChange={(e) => handleChange('social_instagram', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter
                </label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={business.social_twitter}
                    onChange={(e) => handleChange('social_twitter', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={business.social_linkedin}
                    onChange={(e) => handleChange('social_linkedin', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Tags</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ajouter un tag (ex: terrasse, wifi, parking...)"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {business.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
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
            onClick={handleSave}
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
      </div>
    </div>
  );
}