/**
 * Extracteur de sujet à partir du titre et slug
 */

export interface ExtractedTopic {
  mainTopic: string
  location?: string
  businessName?: string
  category: 'coworking' | 'restaurant' | 'hotel' | 'tourism' | 'general'
  keywords: string[]
  specificFocus?: string
}

export function extractTopicFromArticle(title: string, slug: string): ExtractedTopic {
  const titleLower = title.toLowerCase()
  const slugLower = slug.toLowerCase()
  
  // Déterminer la catégorie principale
  let category: ExtractedTopic['category'] = 'general'
  if (titleLower.includes('coworking') || slugLower.includes('coworking')) {
    category = 'coworking'
  } else if (titleLower.includes('restaurant') || slugLower.includes('restaurant') || 
             titleLower.includes('bouchon') || titleLower.includes('cuisine')) {
    category = 'restaurant'
  } else if (titleLower.includes('hôtel') || titleLower.includes('hotel') || 
             slugLower.includes('hotel')) {
    category = 'hotel'
  } else if (titleLower.includes('musée') || titleLower.includes('musee') ||
             titleLower.includes('parc') || titleLower.includes('visite') ||
             titleLower.includes('tourisme') || titleLower.includes('monument')) {
    category = 'tourism'
  }
  
  // Extraire le nom du lieu/établissement
  let businessName: string | undefined
  let location: string | undefined
  
  // Patterns pour extraire les noms d'établissements
  const patterns = [
    /(?:coworking|espace|restaurant|hôtel|hotel|bouchon|musée|musee)\s+(?:le\s+|la\s+|les\s+|l')?([^à-]+?)(?:\s+à|\s+lyon|\s+-|$)/i,
    /^([^:]+?)(?:\s*:\s*|\s+-\s*)/,
    /^(.+?)\s+(?:lyon|dans|au|à)/i
  ]
  
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match && match[1]) {
      businessName = match[1].trim()
      break
    }
  }
  
  // Extraire la localisation (arrondissement, quartier)
  const locationPatterns = [
    /lyon\s+(\d+(?:er|ème|e)?)/i,
    /(\d+(?:er|ème|e)?)\s+arrondissement/i,
    /(?:quartier|secteur)\s+([^,\-]+)/i,
    /(croix[\s-]rousse|vieux[\s-]lyon|part[\s-]dieu|confluence|bellecour|terreaux|gerland|villeurbanne)/i
  ]
  
  for (const pattern of locationPatterns) {
    const match = (title + ' ' + slug).match(pattern)
    if (match && match[1]) {
      location = match[1].trim()
      break
    }
  }
  
  // Extraire les mots-clés pertinents
  const keywords: string[] = []
  const keywordPatterns = [
    'coworking', 'restaurant', 'hôtel', 'hotel', 'bouchon', 'cuisine',
    'gastronomie', 'musée', 'musee', 'parc', 'monument', 'visite',
    'culture', 'art', 'histoire', 'patrimoine', 'shopping', 'boutique',
    'marché', 'marche', 'bar', 'café', 'cafe', 'brasserie', 'bistrot',
    'terrasse', 'vue', 'panorama', 'jardin', 'espace vert'
  ]
  
  for (const keyword of keywordPatterns) {
    if (titleLower.includes(keyword) || slugLower.includes(keyword)) {
      keywords.push(keyword)
    }
  }
  
  // Identifier un focus spécifique
  let specificFocus: string | undefined
  if (titleLower.includes('meilleur')) {
    specificFocus = 'les meilleurs établissements'
  } else if (titleLower.includes('guide')) {
    specificFocus = 'guide complet'
  } else if (titleLower.includes('top') || titleLower.includes('selection')) {
    specificFocus = 'sélection des meilleures adresses'
  } else if (titleLower.includes('découvr')) {
    specificFocus = 'découverte et exploration'
  } else if (titleLower.includes('2024') || titleLower.includes('2025')) {
    specificFocus = 'actualités et nouveautés'
  }
  
  // Si pas de nom d'établissement trouvé, utiliser le titre nettoyé
  if (!businessName && category !== 'general') {
    businessName = title
      .replace(/^(le|la|les|l')\s+/i, '')
      .replace(/\s*:.*$/, '')
      .replace(/\s*-.*$/, '')
      .replace(/\s+à\s+lyon.*$/i, '')
      .replace(/\s+lyon.*$/i, '')
      .trim()
  }
  
  return {
    mainTopic: businessName || title,
    location,
    businessName,
    category,
    keywords: [...new Set(keywords)], // Enlever les doublons
    specificFocus
  }
}