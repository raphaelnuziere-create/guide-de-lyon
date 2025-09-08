'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Crown, MapPin, TrendingUp } from 'lucide-react';

interface Business {
  id: string;
  slug: string;
  name: string;
  description?: string;
  main_image?: string;
  plan: 'basic' | 'pro' | 'expert';
  address_district?: string;
  views_count?: number;
}

interface ExpertBusinessCardProps {
  business: Business;
  rank: number;
}

export function ExpertBusinessCard({ business, rank }: ExpertBusinessCardProps) {
  const truncatedDescription = business.description && business.description.length > 150 
    ? business.description.substring(0, 150) + '...'
    : business.description || 'Établissement expert de référence à Lyon';

  return (
    <Link href={`/etablissement/${business.slug}`}>
      <article className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full expert-card-hover">
        {/* Image avec indicateur discret */}
        <div className="relative h-48 sm:h-56 lg:h-64 w-full bg-gray-100">
          {/* Indicateur discret top */}
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-white/90 backdrop-blur-sm text-amber-600 p-2 rounded-full shadow-lg">
              <Crown className="w-5 h-5" />
            </div>
          </div>

          {/* Badge de rang Top 1, 2, 3, 4 */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
              <span className="font-bold text-sm">#{rank}</span>
            </div>
          </div>
          
          {business.main_image ? (
            <Image
              src={business.main_image}
              alt={business.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={rank <= 3}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yellow-200 to-amber-300 flex items-center justify-center">
              <span className="text-amber-800 text-6xl font-bold">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Overlay gradient premium */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
        </div>
        
        {/* Content premium */}
        <div className="p-4 sm:p-5 lg:p-6">
          <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 sm:mb-3 line-clamp-1 group-hover:text-amber-600 transition">
            {business.name}
          </h3>
          
          <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 text-sm sm:text-base leading-relaxed">
            {truncatedDescription}
          </p>
          
          {/* Footer info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            {business.address_district && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="font-medium">{business.address_district}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span className="font-medium">{business.views_count || 0} vues</span>
            </div>
          </div>

          {/* Premium indicator line */}
          <div className="mt-4 h-1 w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-full opacity-80" />
        </div>
      </article>
    </Link>
  );
}