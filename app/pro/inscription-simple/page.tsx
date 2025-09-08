'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Building2, Loader2 } from 'lucide-react';

export default function InscriptionSimplePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'restaurant-food',
    description: '',
    phone: '',
    email: '',
    address: '',
    postal_code: '',
    city: 'Lyon'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/pro/connexion');
      return;
    }
    setUser(user);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Récupérer l\'utilisateur actuel
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        setError('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/pro/connexion');
        return;
      }
      
      // Créer l\'établissement avec seulement les champs basiques
      const establishmentData = {
        user_id: currentUser.id,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        postal_code: formData.postal_code,
        city: formData.city,
        plan: 'basic',
        status: 'pending'
      };
      
      console.log('[Inscription Simple] Données à insérer:', establishmentData);
      
      const { data, error: insertError } = await supabase
        .from('establishments')
        .insert(establishmentData)
        .select()
        .single();
      
      if (insertError) {
        console.error('[Inscription Simple] Erreur:', insertError);
        setError(`Erreur: ${insertError.message}`);
        return;
      }
      
      console.log('[Inscription Simple] Succès:', data);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/pro/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('[Inscription Simple] Erreur inattendue:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Établissement créé avec succès !
          </h2>
          <p className="text-gray-600">Redirection vers votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Créer votre établissement (Version simplifiée)</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom de l\'établissement *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Catégorie *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="restaurant-food">Restaurant & Food</option>
                <option value="bar-nightlife">Bar & Nightlife</option>
                <option value="shopping-mode">Shopping & Mode</option>
                <option value="beaute-bienetre">Beauté & Bien-être</option>
                <option value="hotel-hebergement">Hôtel & Hébergement</option>
                <option value="culture-loisirs">Culture & Loisirs</option>
                <option value="services-pro">Services professionnels</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Adresse *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Code postal *
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                'Créer mon établissement'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}