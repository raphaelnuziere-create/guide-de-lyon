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

// Fonction pour récupérer les top 3 de chaque catégorie
async function getTopBusinessesByCategory() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Récupérer tous les établissements actifs
  const { data: allBusinesses } = await supabase
    .from('establishments')
    .select(`
      id,
      slug,
      name,
      description,
      category,
      metadata
    `)
    .eq('status', 'active');

  // Grouper par catégorie et prendre les top 3
  const grouped: Record<string, any[]> = {};
  
  if (allBusinesses) {
    // Mapper les données pour extraire depuis metadata
    const mappedBusinesses = allBusinesses.map(business => ({
      id: business.id,
      slug: business.slug,
      name: business.name,
      description: business.description,
      main_image: business.metadata?.main_image,
      plan: business.metadata?.plan || 'basic',
      sector: business.category, // category est le secteur
      address_district: business.metadata?.address_district,
      views_count: business.metadata?.views_count || 0
    }));

    // Trier d'abord par plan (expert > pro > basic) puis par vues
    const planOrder = { 'expert': 3, 'pro': 2, 'basic': 1 };
    const sortedBusinesses = mappedBusinesses.sort((a, b) => {
      const planDiff = (planOrder[b.plan as keyof typeof planOrder] || 0) - 
                      (planOrder[a.plan as keyof typeof planOrder] || 0);
      if (planDiff !== 0) return planDiff;
      return (b.views_count || 0) - (a.views_count || 0);
    });

    // Grouper et limiter à 3 par catégorie
    sortedBusinesses.forEach(business => {
      const sector = business.sector || 'autre';
      if (!grouped[sector]) {
        grouped[sector] = [];
      }
      if (grouped[sector].length < 3) {
        grouped[sector].push(business);
      }
    });
  }
  
  return grouped;
}

export default async function AnnuairePage() {
  // Récupérer les top 3 de chaque catégorie
  const categoryData = await getTopBusinessesByCategory();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              L'Annuaire de Référence de Lyon
            </h1>
            <p className="text-xl text-gray-600">
              Découvrez les meilleurs établissements lyonnais sélectionnés pour vous
            </p>
          </div>
        </div>
      </div>

      {/* Categories avec Top 3 */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const businesses = categoryData[category.dbValue] || [];
            const hasBusinesses = businesses.length > 0;
            
            return (
              <section key={category.slug} className="scroll-mt-20" id={category.slug}>
                {/* Header de catégorie */}
                <div className="flex items-center justify-between mb-6">
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
                      <h2 className="text-2xl font-bold text-gray-900">
                        {category.label}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  {hasBusinesses && (
                    <Link 
                      href={`/annuaire/${category.slug}`}
                      className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 transition group"
                    >
                      <span className="font-medium">Voir tous</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>

                {/* Grille Top 3 ou Message vide */}
                {hasBusinesses ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      {businesses.map((business: any, index: number) => (
                        <BusinessCard 
                          key={business.id} 
                          business={business} 
                          rank={index + 1}
                        />
                      ))}
                    </div>
                    
                    {/* Lien "Découvrir les autres" */}
                    <div className="text-center">
                      <Link 
                        href={`/annuaire/${category.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:text-blue-600 transition group"
                      >
                        <span className="font-medium">Découvrir les autres {category.label.toLowerCase()}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <p className="text-gray-500 mb-4">
                      Aucun établissement dans cette catégorie pour le moment
                    </p>
                    <Link 
                      href="/pro/inscription"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <span>Ajouter votre établissement</span>
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