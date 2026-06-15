const BASE = 'https://www.guide-de-lyon.fr';

export default function robots() {
  return { 
    rules: { 
      userAgent: '*', 
      allow: '/' 
    }, 
    sitemap: `${BASE}/sitemap.xml` 
  };
}