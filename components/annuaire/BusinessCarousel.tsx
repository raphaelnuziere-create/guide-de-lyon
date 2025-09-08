'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface Business {
  id: string;
  slug: string;
  name: string;
  main_image?: string;
}

interface BusinessCarouselProps {
  businesses: Business[];
  categorySlug: string;
  categoryLabel: string;
}

export function BusinessCarousel({ businesses, categorySlug, categoryLabel }: BusinessCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsPerView = 6; // Nombre d'items visibles sur desktop
  
  const maxIndex = Math.max(0, businesses.length - itemsPerView);

  const scroll = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(maxIndex, currentIndex + 1);
    
    setCurrentIndex(newIndex);
    
    if (carouselRef.current) {
      const itemWidth = carouselRef.current.scrollWidth / businesses.length;
      carouselRef.current.scrollTo({
        left: newIndex * itemWidth,
        behavior: 'smooth'
      });
    }
  };

  if (businesses.length === 0) return null;

  return (
    <div className="relative">
      {/* Navigation gauche */}
      <button
        onClick={() => scroll('left')}
        disabled={currentIndex === 0}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg border hover:bg-gray-50 transition ${
          currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
        }`}
        style={{ marginLeft: '-20px' }}
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      {/* Navigation droite */}
      <button
        onClick={() => scroll('right')}
        disabled={currentIndex >= maxIndex}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg border hover:bg-gray-50 transition ${
          currentIndex >= maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'
        }`}
        style={{ marginRight: '-20px' }}
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      {/* Carrousel */}
      <div
        ref={carouselRef}
        className="flex gap-4 overflow-hidden px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {businesses.map((business) => (
          <div
            key={business.id}
            className="flex-shrink-0 w-48"
          >
            <Link href={`/etablissement/${business.slug}`}>
              <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden group">
                {/* Image */}
                <div className="relative h-32 w-full bg-gray-100">
                  {business.main_image ? (
                    <Image
                      src={business.main_image}
                      alt={business.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="192px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-2xl font-bold">
                        {business.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition">
                    {business.name}
                  </h3>
                  <div className="text-xs text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span>Voir la fiche</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Bouton "Voir tout" */}
      <div className="flex justify-center mt-6">
        <Link 
          href={`/annuaire/${categorySlug}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:text-blue-600 transition group font-medium"
        >
          <span>Voir tous les {categoryLabel.toLowerCase()}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}