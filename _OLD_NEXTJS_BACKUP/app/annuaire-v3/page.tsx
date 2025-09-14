import { createDirectus, rest, readItems } from '@directus/sdk';
import Link from 'next/link';
import { MapPin, Phone, Globe, Star, Shield, Crown } from 'lucide-react';
import { Metadata } from 'next';

const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
  .with(rest());

// Types pour les établissements Directus
interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  plan: 'basic' | 'pro' | 'expert';
  badge_type?: 'verified' | 'expert' | null;
  display_priority: number;
  address?: string;
  postal_code?: string;
  city: string;
  phone?: string;
  website?: string;
  email?: string;
  views_count: number;
  gallery?: any[];
  date_created: string;
}

// Configuration des catégories
const categories = [
  { id: 'all', name: 'Toutes les catégories', icon: '🏢' },
  { id: 'restaurant', name: 'Restaurants', icon: '🍴' },
  { id: 'bar', name: 'Bars', icon: '🍺' },
  { id: 'cafe', name: 'Cafés', icon: '☕' },
  { id: 'boutique', name: 'Boutiques', icon: '🛍️' },
  { id: 'services', name: 'Services', icon: '🏥' },
  { id: 'culture', name: 'Culture', icon: '🎭' },
  { id: 'loisirs', name: 'Loisirs', icon: '🎯' }
];

// Métadonnées pour le SEO
export const metadata: Metadata = {
  title: 'Annuaire des entreprises de Lyon | Guide de Lyon v3',
  description: 'Découvrez les meilleures entreprises, restaurants, bars et services de Lyon. Annuaire local avec avis et informations pratiques.',
  openGraph: {
    title: 'Annuaire des entreprises lyonnaises',
    description: 'Plus de 500 établissements référencés à Lyon',
    type: 'website',
  },
};

interface AnnuairePageProps {
  searchParams: { category?: string; search?: string };
}

export default async function AnnuaireV3Page({ searchParams }: AnnuairePageProps) {
  const awaitedParams = await searchParams;
  const selectedCategory = awaitedParams.category || 'all';
  const searchTerm = awaitedParams.search || '';

  // Construction du filtre Directus
  let filter: any = {
    status: { _eq: 'active' }
  };

  if (selectedCategory !== 'all') {
    filter.category = { _eq: selectedCategory };
  }

  if (searchTerm) {
    filter._or = [
      { name: { _icontains: searchTerm } },
      { description: { _icontains: searchTerm } },
      { city: { _icontains: searchTerm } }
    ];
  }

  // DONNÉES DE TEST - En attente de la configuration Directus
  const businesses: Business[] = [
    {
      id: '1',
      name: 'Restaurant Le Lyon d\'Or',
      slug: 'restaurant-lyon-or',
      description: 'Cuisine traditionnelle lyonnaise dans un cadre authentique',
      category: 'restaurants',
      plan: 'expert' as const,
      badge_type: 'expert' as const,
      display_priority: 1,
      address: '12 rue des Boucheries',
      postal_code: '69002',
      city: 'Lyon',
      phone: '04 78 12 34 56',
      website: 'https://lyon-or.fr',
      email: 'contact@lyon-or.fr',
      views_count: 245,
      date_created: '2024-01-15T10:30:00Z'
    },
    {
      id: '2', 
      name: 'Boutique Mode Lyon',
      slug: 'boutique-mode-lyon',
      description: 'Mode tendance et accessoires au coeur de Lyon',
      category: 'shopping',
      plan: 'pro' as const,
      badge_type: 'verified' as const,
      display_priority: 2,
      address: '45 rue de la République',
      postal_code: '69001',
      city: 'Lyon',
      phone: '04 78 98 76 54',
      website: 'https://mode-lyon.fr',
      email: 'info@mode-lyon.fr', 
      views_count: 189,
      date_created: '2024-01-10T14:20:00Z'
    },
    {
      id: '3',
      name: 'Café des Arts',
      slug: 'cafe-des-arts',
      description: 'Café culturel avec expositions et concerts',
      category: 'culture',
      plan: 'basic' as const,
      badge_type: null,
      display_priority: 3,
      address: '8 place Bellecour',
      postal_code: '69002',
      city: 'Lyon',
      phone: '04 78 11 22 33',
      views_count: 67,
      date_created: '2024-01-05T09:15:00Z'
    }
  ].filter(business => {
    // Appliquer les filtres
    if (selectedCategory !== 'all' && business.category !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      return business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             business.city.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec recherche */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎯 Annuaire v3 - Guide de Lyon
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Découvrez les {businesses.length} meilleurs établissements de Lyon
            </p>
            <div className="text-sm bg-green-100 text-green-800 inline-block px-3 py-1 rounded-full">
              ✨ Powered by Directus • Plans Basic (0€), Pro (19€), Expert (49€)
            </div>
            
            {/* Barre de recherche */}
            <div className="max-w-2xl mx-auto mt-6">
              <form method="GET" className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={searchTerm}
                  placeholder="Rechercher une entreprise, un restaurant..."
                  className="w-full px-6 py-4 pr-12 rounded-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none shadow-sm"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition"
                >
                  🔍
                </button>
                {selectedCategory !== 'all' && (
                  <input type="hidden" name="category" value={selectedCategory} />
                )}
              </form>
            </div>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/annuaire-v3${cat.id !== 'all' ? `?category=${cat.id}` : ''}${searchTerm ? `${cat.id !== 'all' ? '&' : '?'}search=${searchTerm}` : ''}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des établissements */}
      <div className="container mx-auto px-4 py-12">
        {businesses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun établissement trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez avec d'autres mots-clés ou changez de catégorie
            </p>
            <Link
              href="/annuaire-v3"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Voir tous les établissements
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}

        {/* Pagination ou "Charger plus" si nécessaire */}
        {businesses.length >= 50 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Vous voyez les 50 premiers résultats
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Charger plus d'établissements
            </button>
          </div>
        )}

        {/* Debug info (développement) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
            <strong>Debug :</strong> {businesses.length} établissements chargés depuis Directus • 
            Catégorie: {selectedCategory} • 
            Recherche: "{searchTerm}" • 
            Tri: Expert → Pro → Basic
          </div>
        )}
      </div>
    </div>
  );
}

// Composant carte d'établissement
function BusinessCard({ business }: { business: Business }) {
  const BadgeComponent = () => {
    if (business.plan === 'expert' && business.badge_type === 'expert') {
      return (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center z-10">
          <Crown className="w-3 h-3 mr-1" />
          Expert
        </div>
      );
    }
    
    if (business.plan === 'pro' && business.badge_type === 'verified') {
      return (
        <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center z-10">
          <Shield className="w-3 h-3 mr-1" />
          Vérifié
        </div>
      );
    }
    
    return null;
  };

  const getRingColor = () => {
    if (business.plan === 'expert') return 'ring-2 ring-yellow-400 ring-opacity-50';
    if (business.plan === 'pro') return 'ring-1 ring-blue-300 ring-opacity-50';
    return '';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      restaurant: '🍴',
      bar: '🍺',
      cafe: '☕',
      boutique: '🛍️',
      services: '🏥',
      culture: '🎭',
      loisirs: '🎯'
    };
    return icons[category] || '🏢';
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'expert': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'pro': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <Link
      href={`/etablissement/${business.slug}`}
      className={`block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group ${getRingColor()}`}
    >
      <div className="relative">
        {/* Badge plan */}
        <BadgeComponent />
        
        {/* Image ou placeholder */}
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          {business.gallery && business.gallery.length > 0 ? (
            <img
              src={business.gallery[0].url}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {getCategoryIcon(business.category)}
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Contenu */}
        <div className="p-6">
          {/* Titre et catégorie */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
              {business.name}
            </h3>
            <div className="flex items-center justify-between text-sm">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full capitalize">
                {getCategoryIcon(business.category)} {business.category}
              </span>
              <div className="flex items-center text-gray-500">
                <Star className="w-4 h-4 mr-1" />
                <span>{business.views_count}</span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {business.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {business.description.replace(/<[^>]*>/g, '').substring(0, 120)}
              {business.description.length > 120 && '...'}
            </p>
          )}
          
          {/* Informations pratiques */}
          <div className="space-y-2 text-sm">
            {business.address && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="line-clamp-1">
                  {business.address}, {business.postal_code} {business.city}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                {business.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-1" />
                    <span className="text-xs">Tél.</span>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-4 h-4 mr-1" />
                    <span className="text-xs">Site</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                {new Date(business.date_created).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
          
          {/* Indicateur plan + ordre d'affichage */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getPlanBadgeColor(business.plan)}`}>
                  {business.plan.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  #{business.display_priority}
                </span>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-blue-600 font-medium">Voir la fiche →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}