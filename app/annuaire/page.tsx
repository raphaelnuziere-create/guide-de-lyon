import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Utensils, Coffee, ShoppingBag, Scissors, 
  Hotel, Palette, Activity, Heart, 
  Briefcase, Building, Car, Grid,
  ArrowRight, Crown, Shield 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { BusinessCard } from '@/components/annuaire/BusinessCard';
import { ExpertBusinessCard } from '@/components/annuaire/ExpertBusinessCard';
import { BusinessCarousel } from '@/components/annuaire/BusinessCarousel';

export const metadata: Metadata = {
  title: 'Annuaire des Entreprises Lyon - Guide de Lyon',
  description: 'Découvrez les meilleurs établissements de Lyon par catégorie. Restaurants, bars, shopping, beauté et plus.',
};

const CATEGORIES = [
  { 
    slug: 'restaurants', 
    label: 'Restaurants & Food', 
    icon: Utensils, 
    color: '#EF4444',
    bgColor: '#FEE2E2',
    dbValue: 'restaurant-food',
    description: 'Les meilleures tables lyonnaises'
  },
  { 
    slug: 'bars', 
    label: 'Bars & Nightlife', 
    icon: Coffee, 
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    dbValue: 'bar-nightlife',
    description: 'Sortir et prendre un verre'
  },
  { 
    slug: 'shopping', 
    label: 'Shopping & Mode', 
    icon: ShoppingBag, 
    color: '#EC4899',
    bgColor: '#FCE7F3',
    dbValue: 'shopping-mode',
    description: 'Boutiques et centres commerciaux'
  },
  { 
    slug: 'beaute', 
    label: 'Beauté & Bien-être', 
    icon: Scissors, 
    color: '#F97316',
    bgColor: '#FED7AA',
    dbValue: 'beaute-bienetre',
    description: 'Prendre soin de soi'
  },
  { 
    slug: 'hotels', 
    label: 'Hôtels & Hébergement', 
    icon: Hotel, 
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    dbValue: 'hotel-hebergement',
    description: 'Où dormir à Lyon'
  },
  { 
    slug: 'culture', 
    label: 'Culture & Loisirs', 
    icon: Palette, 
    color: '#10B981',
    bgColor: '#D1FAE5',
    dbValue: 'culture-loisirs',
    description: 'Musées, théâtres et activités'
  },
  { 
    slug: 'sport', 
    label: 'Sport & Fitness', 
    icon: Activity, 
    color: '#F59E0B',
    bgColor: '#FED7AA',
    dbValue: 'sport-fitness',
    description: 'Salles et clubs sportifs'
  },
  { 
    slug: 'sante', 
    label: 'Santé & Médical', 
    icon: Heart, 
    color: '#EF4444',
    bgColor: '#FEE2E2',
    dbValue: 'sante-medical',
    description: 'Professionnels de santé'
  },
  { 
    slug: 'services', 
    label: 'Services Pro', 
    icon: Briefcase, 
    color: '#6B7280',
    bgColor: '#F3F4F6',
    dbValue: 'services-pro',
    description: 'Services aux entreprises'
  },
  { 
    slug: 'immobilier', 
    label: 'Immobilier', 
    icon: Building, 
    color: '#059669',
    bgColor: '#D1FAE5',
    dbValue: 'immobilier',
    description: 'Agences et annonces'
  },
  { 
    slug: 'auto', 
    label: 'Auto & Transport', 
    icon: Car, 
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    dbValue: 'auto-transport',
    description: 'Garages et concessions'
  },
  { 
    slug: 'autre', 
    label: 'Autres', 
    icon: Grid, 
    color: '#64748B',
    bgColor: '#F1F5F9',
    dbValue: 'autre',
    description: 'Autres services'
  }
];

// Fonction pour récupérer les établissements par catégorie avec distinction experts/autres
async function getBusinessesByCategory() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Récupérer tous les établissements actifs avec leurs médias
  const { data: allBusinesses } = await supabase
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
    .eq('status', 'active');

  const result: Record<string, { experts: any[], others: any[] }> = {};
  
  if (allBusinesses) {
    // Mapper les données pour extraire depuis metadata et establishment_media
    const mappedBusinesses = allBusinesses.map(business => {
      // Récupérer la première image depuis establishment_media
      const firstImage = business.establishment_media
        ?.filter((media: any) => media.type === 'image')
        ?.sort((a: any, b: any) => a.display_order - b.display_order)[0];
      
      return {
        id: business.id,
        slug: business.slug,
        name: business.name,
        description: business.description,
        main_image: firstImage?.url || business.metadata?.main_image, // Priorité aux images de establishment_media
        plan: business.metadata?.plan || 'basic',
        sector: business.category,
        address_district: business.metadata?.address_district,
        views_count: business.metadata?.views_count || 0
      };
    });

    // Grouper par catégorie
    mappedBusinesses.forEach(business => {
      const sector = business.sector || 'autre';
      if (!result[sector]) {
        result[sector] = { experts: [], others: [] };
      }
      
      if (business.plan === 'expert') {
        result[sector].experts.push(business);
      } else {
        result[sector].others.push(business);
      }
    });

    // Trier chaque groupe
    Object.keys(result).forEach(sector => {
      // Trier les experts par vues (les meilleurs en premier)
      result[sector].experts.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
      
      // Trier les autres par plan puis par vues
      const planOrder = { 'pro': 2, 'basic': 1 };
      result[sector].others.sort((a, b) => {
        const planDiff = (planOrder[b.plan as keyof typeof planOrder] || 0) - 
                        (planOrder[a.plan as keyof typeof planOrder] || 0);
        if (planDiff !== 0) return planDiff;
        return (b.views_count || 0) - (a.views_count || 0);
      });
      
      // Limiter à 4 experts max
      result[sector].experts = result[sector].experts.slice(0, 4);
    });
  }
  
  return result;
}

export default async function AnnuairePage() {
  // Récupérer les établissements par catégorie
  const categoryData = await getBusinessesByCategory();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              L'Annuaire de Référence de Lyon
            </h1>
            <p className="text-xl text-gray-600">
              Découvrez les meilleurs établissements lyonnais sélectionnés pour vous
            </p>
          </div>
        </div>
      </div>

      {/* Categories avec Top 3 */}
      <div className="container mx-auto px-4 py-4">
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const data = categoryData[category.dbValue] || { experts: [], others: [] };
            const experts = data.experts || [];
            const others = data.others || [];
            const hasExperts = experts.length > 0;
            const hasOthers = others.length > 0;
            const hasAny = hasExperts || hasOthers;
            
            return (
              <section key={category.slug} className="scroll-mt-20" id={category.slug}>
                {/* Header de catégorie */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: category.bgColor }}
                    >
                      <Icon 
                        className="w-6 h-6" 
                        style={{ color: category.color }}
                      />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        {category.label}
                      </h2>
                      <p className="text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  {hasAny && (
                    <Link 
                      href={`/annuaire/${category.slug}`}
                      className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 transition group"
                    >
                      <span className="font-medium">Voir tout</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>

                {hasAny ? (
                  <>
                    {/* Section Experts - 3 grandes fenêtres avec badge doré */}
                    {hasExperts && (
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Crown className="w-6 h-6 text-amber-500" />
                          <h3 className="text-xl font-bold text-gray-900">Membres Experts</h3>
                          <div className="h-px bg-gradient-to-r from-amber-500 to-transparent flex-1" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    
                    {/* Section Autres - Carrousel horizontal */}
                    {hasOthers && (
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Shield className="w-6 h-6 text-blue-500" />
                          <h3 className="text-xl font-bold text-gray-900">Autres Membres</h3>
                          <div className="h-px bg-gradient-to-r from-blue-500 to-transparent flex-1" />
                        </div>
                        <BusinessCarousel 
                          businesses={others}
                          categorySlug={category.slug}
                          categoryLabel={category.label}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="mb-6">
                      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {category.label}
                      </h3>
                      <p className="text-gray-500">
                        Aucun établissement dans cette catégorie pour le moment
                      </p>
                    </div>
                    <Link 
                      href="/auth/pro/signup"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>Soyez le premier à vous inscrire</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* Navigation rapide sur mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <a
                key={category.slug}
                href={`#${category.slug}`}
                className="flex-shrink-0 p-2 rounded-lg border border-gray-200"
                style={{ borderColor: category.color }}
              >
                <Icon className="w-5 h-5" style={{ color: category.color }} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}