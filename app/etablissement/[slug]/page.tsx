import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EstablishmentPage from './components/EstablishmentPage'
import { EstablishmentService } from '@/lib/services/establishment-service'

interface PageProps {
  params: {
    slug: string
  }
}

// Génération de métadonnées dynamiques
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const establishment = await EstablishmentService.getBySlug(params.slug)
  
  if (!establishment) {
    return {
      title: 'Établissement non trouvé - Guide de Lyon',
      description: 'Cet établissement n\'existe pas ou n\'est plus disponible'
    }
  }

  const title = `${establishment.name} - ${establishment.category} à Lyon`
  const description = establishment.shortDescription || establishment.description || 
    `Découvrez ${establishment.name}, ${establishment.category} situé à ${establishment.city}. ${establishment.features.join(', ')}.`

  return {
    title,
    description,
    keywords: [
      establishment.name,
      establishment.category,
      establishment.subcategory,
      establishment.city,
      'Lyon',
      ...establishment.features,
      ...establishment.services
    ].filter(Boolean).join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://guide-de-lyon.fr/etablissement/${establishment.slug}`,
      images: establishment.images.length > 0 ? [
        {
          url: establishment.images[0],
          width: 1200,
          height: 630,
          alt: establishment.name
        }
      ] : [],
      siteName: 'Guide de Lyon',
      locale: 'fr_FR'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: establishment.images[0] || undefined
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://guide-de-lyon.fr/etablissement/${establishment.slug}`
    }
  }
}

export default async function Page({ params }: PageProps) {
  // Récupération côté serveur pour le SEO
  const establishment = await EstablishmentService.getBySlug(params.slug)
  
  if (!establishment) {
    notFound()
  }

  // Pré-charger les données connexes
  const [reviews, events, similarPlaces] = await Promise.all([
    EstablishmentService.getReviews(establishment.id, 5),
    EstablishmentService.getEvents(establishment.id),
    EstablishmentService.getSimilar(establishment.id, establishment.category, 3)
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: establishment.name,
    description: establishment.description,
    url: `https://guide-de-lyon.fr/etablissement/${establishment.slug}`,
    telephone: establishment.phone,
    email: establishment.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: establishment.address,
      addressLocality: establishment.city,
      postalCode: establishment.postalCode,
      addressCountry: 'FR'
    },
    geo: establishment.latitude && establishment.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: establishment.latitude,
      longitude: establishment.longitude
    } : undefined,
    image: establishment.images,
    priceRange: establishment.priceRange,
    aggregateRating: establishment.reviewsCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: establishment.rating,
      reviewCount: establishment.reviewsCount
    } : undefined,
    openingHours: establishment.openingHours ? Object.entries(establishment.openingHours)
      .filter(([_, hours]) => hours)
      .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)} ${hours}`) : undefined
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EstablishmentPage 
        establishment={establishment}
        reviews={reviews}
        events={events}
        similarPlaces={similarPlaces}
      />
    </>
  )
}