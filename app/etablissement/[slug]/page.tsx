import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, Phone, Globe, Clock, Calendar, 
  ChevronLeft, ChevronRight, Star, Shield, Crown 
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: establishment } = await supabase
    .from('establishments')
    .select('name, description')
    .eq('slug', params.slug)
    .single();

  if (!establishment) {
    return {
      title: 'Établissement non trouvé - Guide de Lyon',
      description: 'Cet établissement n\'existe pas'
    };
  }

  return {
    title: `${establishment.name} - Guide de Lyon`,
    description: establishment.description?.substring(0, 160),
  };
}

async function getEstablishment(slug: string) {
  const { data: establishment } = await supabase
    .from('establishments')
    .select('*')
    .eq('slug', slug)
    .single();

  return establishment;
}

export default async function EstablishmentPage({ params }: { params: { slug: string } }) {
  const establishment = await getEstablishment(params.slug);

  if (!establishment) {
    notFound();
  }

  // Extraire les données depuis metadata
  const mainImage = establishment.metadata?.main_image;
  const additionalImages = establishment.metadata?.additional_images || [];
  const allImages = mainImage ? [mainImage, ...additionalImages] : additionalImages;
  const plan = establishment.metadata?.plan || 'basic';
  const viewsCount = establishment.metadata?.views_count || 0;
  const addressDistrict = establishment.metadata?.address_district;

  // Vérifier si l'établissement a un plan payant pour afficher le carrousel
  const hasCarousel = plan === 'pro' || plan === 'expert';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Carrousel de photos (si plan Pro ou Expert) */}
      {hasCarousel && allImages.length > 0 && (
        <PhotoCarousel images={allImages} name={establishment.name} />
      )}

      {/* Image simple (si plan Basic) */}
      {!hasCarousel && mainImage && (
        <div className="relative h-96 w-full">
          <Image
            src={mainImage}
            alt={establishment.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header avec badges */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {establishment.name}
              </h1>
              {addressDistrict && (
                <p className="text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {addressDistrict}
                </p>
              )}
            </div>
            <PlanBadge plan={plan} />
          </div>

          {/* Informations de contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {establishment.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={`tel:${establishment.phone}`} className="text-blue-600 hover:underline">
                  {establishment.phone}
                </a>
              </div>
            )}
            {establishment.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <a href={`https://${establishment.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {establishment.website}
                </a>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">{viewsCount} vues</span>
            </div>
          </div>
        </div>

        {/* Tabs de navigation */}
        <TabNavigation establishmentId={establishment.id} />

        {/* Contenu des tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <TabContent establishment={establishment} />
        </div>
      </div>
    </div>
  );
}

// Composant Carrousel de photos
function PhotoCarousel({ images, name }: { images: string[], name: string }) {
  'use client';
  
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div className="relative h-[500px] w-full bg-gray-900">
      <Image
        src={images[currentIndex]}
        alt={`${name} - Photo ${currentIndex + 1}`}
        fill
        className="object-cover"
        priority
      />
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Indicateurs */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Composant Badge de plan
function PlanBadge({ plan }: { plan: string }) {
  if (plan === 'expert') {
    return (
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
        <Crown className="w-5 h-5" />
        <span className="font-bold">PREMIUM</span>
      </div>
    );
  }
  if (plan === 'pro') {
    return (
      <div className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
        <Shield className="w-5 h-5" />
        <span className="font-bold">PRO</span>
      </div>
    );
  }
  return null;
}

// Composant Navigation par tabs
function TabNavigation({ establishmentId }: { establishmentId: string }) {
  'use client';
  
  const [activeTab, setActiveTab] = React.useState('overview');
  
  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: null },
    { id: 'events', label: 'Événements', icon: Calendar },
    { id: 'hours', label: 'Horaires', icon: Clock },
    { id: 'photos', label: 'Photos', icon: null },
  ];

  return (
    <div className="border-b mb-6">
      <div className="flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Composant Contenu des tabs
function TabContent({ establishment }: { establishment: any }) {
  // Pour l'instant, afficher seulement la vue d'ensemble
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">À propos</h2>
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {establishment.description || 'Aucune description disponible.'}
      </p>
      
      {establishment.address && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Adresse</h3>
          <p className="text-gray-700">{establishment.address}</p>
          {establishment.city && establishment.postal_code && (
            <p className="text-gray-700">{establishment.postal_code} {establishment.city}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Import React pour les composants client
import * as React from 'react';