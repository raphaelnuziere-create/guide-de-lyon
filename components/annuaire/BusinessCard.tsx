'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Crown, Shield, Star, MapPin, TrendingUp } from 'lucide-react';

interface BusinessCardProps {
  business: {
    id: string;
    slug: string;
    name: string;
    description?: string;
    main_image?: string;
    plan: 'basic' | 'pro' | 'expert';
    address_district?: string;
    views_count?: number;
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
        <div className={`${colors[rank as keyof typeof colors]} text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg rank-badge`}>
          <span className="font-bold text-sm">#{rank}</span>
        </div>
      </div>
    );
  };

  const truncatedDescription = business.description && business.description.length > 120 
    ? business.description.substring(0, 120) + '...'
    : business.description || 'Description non disponible';

  return (
    <Link href={`/etablissement/${business.slug}`}>
      <article className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full business-card-hover">
        {/* Image avec badges */}
        <div className="relative h-56 w-full bg-gray-100">
          <RankBadge />
          <PlanBadge />
          
          {business.main_image ? (
            <Image
              src={business.main_image}
              alt={business.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={rank <= 3}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-4xl font-bold">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
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
              <span>{business.views_count || 0} vues</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}