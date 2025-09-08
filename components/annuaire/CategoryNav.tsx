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
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="hidden lg:block sticky top-0 bg-white border-b z-30 shadow-sm">
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
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                  }
                `}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(category.slug)?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  });
                }}
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