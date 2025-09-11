import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Crown, Shield } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { BusinessCard } from '@/components/annuaire/BusinessCard';
import { ExpertBusinessCard } from '@/components/annuaire/ExpertBusinessCard';
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
  
  // Récupérer les établissements avec leurs médias
  const { data: businessesRaw } = await supabase
    .from('establishments')
    .select(`
      id,
      slug,
      name,
      description,
      category,
      metadata,
      establishment_media (
        url,
        type,
        display_order
      )
    `)
    .eq('status', 'active')
    .eq('category', categoryInfo.dbValue);
    
  if (!businessesRaw) return { experts: [], others: [] };

  // Mapper les données avec la première photo de establishment_media
  const mapped = businessesRaw.map(business => {
    // Récupérer la première image depuis establishment_media
    const firstImage = business.establishment_media
      ?.filter((media: any) => media.type === 'image')
      ?.sort((a: any, b: any) => a.display_order - b.display_order)[0];
    
    return {
      id: business.id,
      slug: business.slug,
      name: business.name,
      description: business.description,
      main_image: firstImage?.url || business.metadata?.main_image, // Utiliser l'image de establishment_media en priorité
      plan: business.metadata?.plan || 'basic',
      address_district: business.metadata?.address_district,
      views_count: business.metadata?.views_count || 0
    };
  });

  // Séparer experts et autres
  const experts = mapped.filter(b => b.plan === 'expert')
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 4); // Limiter à 4 experts

  const others = mapped.filter(b => b.plan !== 'expert')
    .sort((a, b) => {
      const planOrder = { 'pro': 2, 'basic': 1 };
      const planDiff = (planOrder[b.plan as keyof typeof planOrder] || 0) - 
                      (planOrder[a.plan as keyof typeof planOrder] || 0);
      if (planDiff !== 0) return planDiff;
      return (b.views_count || 0) - (a.views_count || 0);
    });

  return { experts, others };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categoryInfo = CATEGORY_MAP[params.category];
  
  if (!categoryInfo) {
    notFound();
  }

  const data = await getBusinessesByCategory(params.category);
  if (!data) {
    notFound();
  }

  const { experts, others } = data;
  const totalCount = experts.length + others.length;

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
            {totalCount} établissement{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Contenu des établissements */}
      <div className="container mx-auto px-4 py-8">
        {totalCount > 0 ? (
          <div className="space-y-12">
            {/* Section Experts - 3 grandes cartes */}
            {experts.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Membres Experts</h2>
                  <div className="h-px bg-gradient-to-r from-amber-500 to-transparent flex-1" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {experts.map((business: any, index: number) => (
                    <ExpertBusinessCard 
                      key={business.id} 
                      business={business} 
                      rank={index + 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section Autres Membres - Grille 4 colonnes */}
            {others.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-blue-500">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {experts.length > 0 ? 'Autres Membres' : 'Tous les Membres'}
                  </h2>
                  <div className="h-px bg-gradient-to-r from-blue-500 to-transparent flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {others.map((business: any, index: number) => (
                    <BusinessCard 
                      key={business.id} 
                      business={business} 
                      rank={experts.length + index + 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              {categoryInfo.label}
            </h3>
            <p className="text-gray-500 mb-6">
              Aucun établissement dans cette catégorie pour le moment
            </p>
            <Link 
              href="/auth/pro/signup"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>Soyez le premier à vous inscrire</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}