'use client';

import { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width = 1200,
  height = 630,
  className = '',
  priority = false
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Image par défaut de Lyon
  const fallbackImage = 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200';

  // Si l'image est une URL de proxy, l'utiliser directement
  const imageSrc = imageError ? fallbackImage : src;

  // Pour les images externes, on doit les proxy
  const finalSrc = imageSrc.startsWith('http') && !imageSrc.includes('unsplash.com') 
    ? `/api/images/proxy?url=${encodeURIComponent(imageSrc)}`
    : imageSrc;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
        priority={priority}
        unoptimized={finalSrc.includes('/api/images/proxy')}
      />
    </div>
  );
}