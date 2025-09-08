# PROMPT: Créer la Page d'Accueil de l'Annuaire avec Top 3 par Catégorie

## OBJECTIF
Transformer la page /annuaire en vitrine attrayante montrant les 3 meilleures entreprises de chaque catégorie (triées par plan puis vues) avec un lien "Découvrir les autres" vers la catégorie complète.

## SPÉCIFICATIONS DÉTAILLÉES

### 1. PAGE D'ACCUEIL ANNUAIRE COMPLÈTE

```typescript
// app/annuaire/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Utensils, Coffee, ShoppingBag, Scissors, 
  Hotel, Palette, Activity, Heart, 
  Briefcase, Building, Car, Grid,
  ArrowRight, Crown, Shield 
} from 'lucide-react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
```

### 2. COMPOSANT BUSINESS CARD POUR TOP 3

```typescript
// components/annuaire/BusinessCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Crown, Shield, Star, MapPin, TrendingUp } from 'lucide-react';

interface BusinessCardProps {
  business: {
    id: string;
    slug: string;
    name: string;
    description: string;
    main_image: string;
    plan: 'basic' | 'pro' | 'expert';
    address_district?: string;
    views_count: number;
  };
  rank: number;
}

export function BusinessCard({ business, rank }: BusinessCardProps) {
  // Badge de plan
  const PlanBadge = () => {
    if (business.plan === 'expert') {
      return (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Crown className="w-4 h-4" />
            <span className="text-xs font-bold">PREMIUM</span>
          </div>
        </div>
      );
    }
    if (business.plan === 'pro') {
      return (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold">PRO</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Badge de rang (Top 1, 2, 3)
  const RankBadge = () => {
    const colors = {
      1: 'bg-gradient-to-r from-yellow-400 to-amber-500',
      2: 'bg-gradient-to-r from-gray-300 to-gray-400',
      3: 'bg-gradient-to-r from-amber-600 to-amber-700'
    };
    
    return (
      <div className="absolute top-3 left-3 z-10">
        <div className={`${colors[rank as keyof typeof colors]} text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg`}>
          <span className="font-bold text-sm">#{rank}</span>
        </div>
      </div>
    );
  };

  const truncatedDescription = business.description.length > 120 
    ? business.description.substring(0, 120) + '...'
    : business.description;

  return (
    <Link href={`/etablissement/${business.slug}`}>
      <article className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
        {/* Image avec badges */}
        <div className="relative h-56 w-full bg-gray-100">
          <RankBadge />
          <PlanBadge />
          
          <Image
            src={business.main_image || '/placeholder-business.jpg'}
            alt={business.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={rank <= 3}
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition">
            {business.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {truncatedDescription}
          </p>
          
          {/* Footer info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {business.address_district && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{business.address_district}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{business.views_count} vues</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
```

### 3. NAVIGATION STICKY POUR DESKTOP

```typescript
// components/annuaire/CategoryNav.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  Utensils, Coffee, ShoppingBag, Scissors, 
  Hotel, Palette, Activity, Heart, 
  Briefcase, Building, Car, Grid 
} from 'lucide-react';

const CATEGORIES = [
  { slug: 'restaurants', label: 'Restaurants', icon: Utensils },
  { slug: 'bars', label: 'Bars', icon: Coffee },
  { slug: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { slug: 'beaute', label: 'Beauté', icon: Scissors },
  { slug: 'hotels', label: 'Hôtels', icon: Hotel },
  { slug: 'culture', label: 'Culture', icon: Palette },
  { slug: 'sport', label: 'Sport', icon: Activity },
  { slug: 'sante', label: 'Santé', icon: Heart },
  { slug: 'services', label: 'Services', icon: Briefcase },
  { slug: 'immobilier', label: 'Immobilier', icon: Building },
  { slug: 'auto', label: 'Auto', icon: Car },
  { slug: 'autre', label: 'Autres', icon: Grid }
];

export function CategoryNav() {
  const [activeSection, setActiveSection] = useState('');
  
  useEffect(() => {
    const handleScroll = () => {
      const sections = CATEGORIES.map(cat => ({
        id: cat.slug,
        element: document.getElementById(cat.slug)
      }));
      
      const current = sections.find(section => {
        if (!section.element) return false;
        const rect = section.element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });
      
      if (current) {
        setActiveSection(current.id);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="hidden lg:block sticky top-0 bg-white border-b z-30">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-1 py-3 overflow-x-auto">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = activeSection === category.slug;
            
            return (
              <a
                key={category.slug}
                href={`#${category.slug}`}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{category.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
```

### 4. OPTIMISATIONS ET REQUÊTE SQL

```sql
-- Fonction optimisée pour récupérer les top 3 par catégorie
CREATE OR REPLACE FUNCTION get_top_businesses_by_category()
RETURNS TABLE (
  id UUID,
  slug VARCHAR,
  name VARCHAR,
  description TEXT,
  main_image VARCHAR,
  plan VARCHAR,
  sector VARCHAR,
  address_district VARCHAR,
  views_count INT,
  rank_in_category INT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_businesses AS (
    SELECT 
      b.id,
      b.slug,
      b.name,
      b.description,
      b.main_image,
      b.plan,
      b.sector,
      b.address_district,
      b.views_count,
      ROW_NUMBER() OVER (
        PARTITION BY b.sector 
        ORDER BY 
          CASE 
            WHEN b.plan = 'expert' THEN 3
            WHEN b.plan = 'pro' THEN 2
            WHEN b.plan = 'basic' THEN 1
            ELSE 0
          END DESC,
          b.views_count DESC
      ) as rank_in_category
    FROM businesses b
    WHERE b.status = 'active'
  )
  SELECT * FROM ranked_businesses
  WHERE rank_in_category <= 3
  ORDER BY sector, rank_in_category;
END;
$$ LANGUAGE plpgsql;

-- Index pour optimiser
CREATE INDEX IF NOT EXISTS idx_businesses_category_ranking 
ON businesses(sector, status, plan DESC, views_count DESC)
WHERE status = 'active';
```

### 5. STYLE CSS ADDITIONNEL

```css
/* app/globals.css - Animations et effets */
@layer components {
  /* Effet de hover pour les cards */
  .business-card-hover {
    @apply transform transition-all duration-300;
  }
  
  .business-card-hover:hover {
    @apply -translate-y-1 shadow-xl;
  }
  
  /* Animation pour les badges de rang */
  @keyframes pulse-rank {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  .rank-badge {
    animation: pulse-rank 2s infinite;
  }
  
  /* Scrollbar personnalisée pour navigation mobile */
  .category-nav-mobile {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .category-nav-mobile::-webkit-scrollbar {
    display: none;
  }
}
```

### 6. COMPOSANT SKELETON LOADING

```typescript
// components/annuaire/AnnuaireSkeleton.tsx
export function AnnuaireSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        {[...Array(3)].map((_, categoryIndex) => (
          <section key={categoryIndex}>
            {/* Header skeleton */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            
            {/* Cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, cardIndex) => (
                <div key={cardIndex} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-56 bg-gray-200 animate-pulse" />
                  <div className="p-5">
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
```

### 7. VERSION MOBILE OPTIMISÉE

```typescript
// components/annuaire/MobileCategoryView.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export function MobileCategoryView({ category, businesses, categoryInfo }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = categoryInfo.icon;
  
  return (
    <div className="md:hidden bg-white rounded-lg shadow-sm mb-4">
      {/* Header cliquable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: categoryInfo.bgColor }}
          >
            <Icon className="w-5 h-5" style={{ color: categoryInfo.color }} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold">{categoryInfo.label}</h3>
            <p className="text-xs text-gray-500">
              {businesses.length > 0 ? `Top ${businesses.length}` : 'Aucun établissement'}
            </p>
          </div>
        </div>
        {businesses.length > 0 && (
          isExpanded ? <ChevronUp /> : <ChevronDown />
        )}
      </button>
      
      {/* Contenu expansible */}
      {isExpanded && businesses.length > 0 && (
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {businesses.map((business, index) => (
              <MiniBusinessCard key={business.id} business={business} rank={index + 1} />
            ))}
          </div>
          <Link 
            href={`/annuaire/${category}`}
            className="block mt-4 text-center text-primary font-medium"
          >
            Voir tous →
          </Link>
        </div>
      )}
    </div>
  );
}
```

## RÉSULTAT ATTENDU

La page d'accueil de l'annuaire doit :

✅ Afficher les 12 catégories avec leurs top 3 entreprises
✅ Tri : Expert > Pro > Basic, puis par vues
✅ Badge #1, #2, #3 pour le classement
✅ Badge Premium/Pro visible
✅ Bouton "Découvrir les autres [catégorie]"
✅ Navigation sticky sur desktop
✅ Navigation mobile en bas
✅ Design moderne et attractif
✅ Performance optimisée (une seule requête DB)
✅ Sections vides gérées élégamment

Cette page devient la vitrine principale de l'annuaire avec mise en avant des meilleurs établissements !