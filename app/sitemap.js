import { getRubriques, getArticles } from '../lib/airtable';

const BASE = 'https://www.guide-de-lyon.fr';

export const revalidate = 3600;

export default async function sitemap() {
  const [rubriques, articles] = await Promise.all([getRubriques(), getArticles()]);
  
  return [
    { 
      url: `${BASE}/`, 
      changeFrequency: 'weekly', 
      priority: 1 
    },
    ...rubriques.map((r) => ({ 
      url: `${BASE}/${r.Slug}`, 
      changeFrequency: 'weekly', 
      priority: 0.8 
    })),
    ...articles.map((a) => ({ 
      url: `${BASE}/article/${a.Slug}`, 
      lastModified: a['Date publication'] ? new Date(a['Date publication']) : undefined, 
      changeFrequency: 'monthly', 
      priority: 0.7 
    })),
  ];
}