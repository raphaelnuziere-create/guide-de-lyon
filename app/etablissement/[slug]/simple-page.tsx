'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { EstablishmentService, type Establishment } from '@/lib/services/establishment-service'

export default function SimpleEstablishmentPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [establishment, setEstablishment] = useState<Establishment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEstablishmentData = async () => {
      setLoading(true)
      
      try {
        const establishmentData = await EstablishmentService.getBySlug(slug)
        
        if (!establishmentData) {
          setEstablishment(EstablishmentService.getFallbackEstablishment(slug))
        } else {
          setEstablishment(establishmentData)
        }
      } catch (error) {
        console.error('Error loading establishment:', error)
        setEstablishment(EstablishmentService.getFallbackEstablishment(slug))
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadEstablishmentData()
    }
  }, [slug])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Chargement...</h1>
      </div>
    )
  }

  if (!establishment) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Établissement non trouvé</h1>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0', fontSize: '2.5rem' }}>{establishment.name}</h1>
        <p style={{ margin: '1rem 0 0', fontSize: '1.2rem', opacity: 0.9 }}>
          {establishment.category}
        </p>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem'
      }}>
        {/* Hero Image */}
        {establishment.images.length > 0 && (
          <div style={{ 
            height: '300px',
            backgroundImage: `url(${establishment.images[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '8px',
            marginBottom: '2rem'
          }} />
        )}

        {/* Info Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {/* Left Column */}
          <div>
            {/* Rating */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>⭐</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {establishment.rating.toFixed(1)}
                </span>
                <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                  ({establishment.reviewsCount} avis)
                </span>
              </div>
            </div>

            {/* Description */}
            {establishment.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#333', borderBottom: '2px solid #2563eb', paddingBottom: '0.5rem' }}>
                  À propos
                </h2>
                <p style={{ lineHeight: '1.6', color: '#555' }}>
                  {establishment.description}
                </p>
              </div>
            )}

            {/* Features */}
            {establishment.features && establishment.features.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#333', borderBottom: '2px solid #2563eb', paddingBottom: '0.5rem' }}>
                  Services et équipements
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  {establishment.features.map((feature, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      padding: '0.5rem',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '4px'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            height: 'fit-content'
          }}>
            <h3 style={{ margin: '0 0 1rem', color: '#333' }}>Informations pratiques</h3>
            
            {establishment.address && (
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>📍</span>
                <div>
                  <p style={{ margin: '0', fontSize: '0.9rem' }}>{establishment.address}</p>
                  <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                    {establishment.postalCode} {establishment.city}
                  </p>
                </div>
              </div>
            )}

            {establishment.phone && (
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>📞</span>
                <a href={`tel:${establishment.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                  {establishment.phone}
                </a>
              </div>
            )}

            {establishment.website && (
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>🌐</span>
                <a 
                  href={establishment.website.startsWith('http') ? establishment.website : `https://${establishment.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#2563eb', textDecoration: 'none' }}
                >
                  {establishment.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            <button style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}>
              Contacter
            </button>
          </div>
        </div>

        {/* Opening Hours */}
        {establishment.openingHours && (
          <div style={{ 
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            marginTop: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem', color: '#333' }}>Horaires d&apos;ouverture</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {Object.entries(establishment.openingHours).map(([day, hours]) => (
                <div key={day} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '0.25rem 0',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ fontWeight: '500' }}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </span>
                  <span style={{ color: hours ? '#333' : '#999' }}>
                    {hours || 'Fermé'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {establishment.images.length > 1 && (
          <div style={{ 
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            marginTop: '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 1rem', color: '#333' }}>Galerie photos</h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {establishment.images.slice(1).map((image, index) => (
                <div key={index} style={{
                  height: '150px',
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}