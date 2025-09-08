import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { BusinessCard } from '@/components/annuaire/BusinessCard';
import { notFound } from 'next/navigation';

// Map des catégories valides
const CATEGORY_MAP: Record<string, { dbValue: string; label: string; description: string }> = {
  'restaurants': { 
    dbValue: 'restaurant-food', 
    label: 'Restaurants & Food',
    description: 'Tous les restaurants et établissements de restauration à Lyon'
  },
  'bars': { 
    dbValue: 'bar-nightlife', 
    label: 'Bars & Nightlife',
    description: 'Les meilleurs bars et lieux de sortie nocturne'
  },
  'shopping': { 
    dbValue: 'shopping-mode', 
    label: 'Shopping & Mode',
    description: 'Boutiques, centres commerciaux et magasins'
  },
  'beaute': { 
    dbValue: 'beaute-bienetre', 
    label: 'Beauté & Bien-être',
    description: 'Salons de beauté, spas et centres de bien-être'
  },
  'hotels': { 
    dbValue: 'hotel-hebergement', 
    label: 'Hôtels & Hébergement',
    description: 'Hôtels et solutions d\'hébergement'
  },
  'culture': { 
    dbValue: 'culture-loisirs', 
    label: 'Culture & Loisirs',
    description: 'Musées, théâtres, cinémas et activités culturelles'
  },
  'sport': { 
    dbValue: 'sport-fitness', 
    label: 'Sport & Fitness',
    description: 'Salles de sport, clubs et activités sportives'
  },
  'sante': { 
    dbValue: 'sante-medical', 
    label: 'Santé & Médical',
    description: 'Professionnels de santé et établissements médicaux'
  },
  'services': { 
    dbValue: 'services-pro', 
    label: 'Services Pro',
    description: 'Services professionnels et aux entreprises'
  },
  'immobilier': { 
    dbValue: 'immobilier', 
    label: 'Immobilier',
    description: 'Agences immobilières et services immobiliers'
  },
  'auto': { 
    dbValue: 'auto-transport', 
    label: 'Auto & Transport',
    description: 'Garages, concessions et services automobiles'
  },
  'autre': { 
    dbValue: 'autre', 
    label: 'Autres',
    description: 'Autres services et établissements'
  }
};

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const categoryInfo = CATEGORY_MAP[params.category];
  
  if (!categoryInfo) {
    return {
      title: 'Catégorie non trouvée - Guide de Lyon',
      description: 'Cette catégorie n\'existe pas'
    };
  }

  return {
    title: `${categoryInfo.label} à Lyon - Guide de Lyon`,
    description: categoryInfo.description,
  };
}

async function getBusinessesByCategory(categorySlug: string) {
  const categoryInfo = CATEGORY_MAP[categorySlug];
  if (!categoryInfo) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: businesses } = await supabase
    .from('establishments')
    .select(`
      id,
      slug,
      name,
      description,
      main_image,
      plan,
      sector,
      address_district,
      views_count
    `)
    .eq('status', 'active')
    .eq('sector', categoryInfo.dbValue)
    .order('plan', { ascending: false })
    .order('views_count', { ascending: false });

  return businesses || [];
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categoryInfo = CATEGORY_MAP[params.category];
  
  if (!categoryInfo) {
    notFound();
  }

  const businesses = await getBusinessesByCategory(params.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <Link 
            href="/annuaire"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'annuaire</span>
          </Link>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {categoryInfo.label}
          </h1>
          <p className="text-lg text-gray-600">
            {categoryInfo.description}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {businesses.length} établissement{businesses.length !== 1 ? 's' : ''} trouvé{businesses.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Liste des établissements */}
      <div className="container mx-auto px-4 py-8">
        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {businesses.map((business: any, index: number) => (
              <BusinessCard 
                key={business.id} 
                business={business} 
                rank={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">
              Aucun établissement dans cette catégorie pour le moment
            </p>
            <Link 
              href="/pro/inscription"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <span>Soyez le premier à vous inscrire</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}