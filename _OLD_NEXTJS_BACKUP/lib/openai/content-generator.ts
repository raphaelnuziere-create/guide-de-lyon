/**
 * Générateur de contenu intelligent basé sur OpenAI
 */

import { openai, isOpenAIConfigured } from './client'

export interface ArticleContext {
  title: string
  slug: string
  currentContent?: string
  excerpt?: string
}

export async function generateArticleContent(context: ArticleContext): Promise<{
  content: string
  metaDescription: string
  excerpt: string
} | null> {
  if (!isOpenAIConfigured() || !openai) {
    console.error('❌ OpenAI non configuré')
    return null
  }

  try {
    // Analyser le titre pour extraire le sujet principal
    const subject = extractSubject(context.title, context.slug)
    
    // Générer le prompt principal pour le contenu
    const contentPrompt = buildContentPrompt(subject, context)
    
    // Générer le contenu principal
    console.log(`🤖 Génération du contenu pour: ${context.title}`)
    const contentResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en rédaction web et en tourisme lyonnais. Tu DOIS écrire des articles TRÈS LONGS et COMPLETS. Minimum ABSOLU : 1500 mots. Objectif : 2000 mots. Sois EXHAUSTIF dans tes descriptions.'
        },
        {
          role: 'user',
          content: contentPrompt + '\n\nRAPPEL CRUCIAL : Écris un article LONG et DÉTAILLÉ d\'au moins 1500 mots. Ne sois pas concis, développe chaque point en profondeur.'
        }
      ],
      max_tokens: 6000,
      temperature: 0.7,
    })

    const content = contentResponse.choices[0]?.message?.content || ''
    
    if (!content) {
      throw new Error('Contenu vide généré')
    }

    // Générer la meta description
    const metaResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Génère une meta description SEO de 150-160 caractères pour cet article sur "${context.title}" à Lyon. Réponds uniquement avec la meta description.`
        }
      ],
      max_tokens: 100,
      temperature: 0.5,
    })

    const metaDescription = metaResponse.choices[0]?.message?.content || ''

    // Générer l'extrait
    const excerptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Crée un extrait accrocheur de 150-200 caractères pour l'article "${context.title}". Réponds uniquement avec l'extrait.`
        }
      ],
      max_tokens: 100,
      temperature: 0.5,
    })

    const excerpt = excerptResponse.choices[0]?.message?.content || ''

    return {
      content: formatContent(content),
      metaDescription: metaDescription.substring(0, 160),
      excerpt: excerpt.substring(0, 200)
    }

  } catch (error) {
    console.error(`❌ Erreur génération pour ${context.title}:`, error)
    return null
  }
}

function extractSubject(title: string, slug: string): string {
  // Nettoyer le titre pour extraire le sujet principal
  let subject = title
    .replace(/^(le|la|les|l')\s+/i, '')
    .replace(/\s*:.*$/, '')
    .replace(/\s*-.*$/, '')
    .replace(/\s+à\s+lyon.*$/i, '')
    .replace(/\s+lyon.*$/i, '')
    .trim()

  // Si le sujet est trop générique, utiliser le slug pour plus de contexte
  if (subject.length < 10) {
    subject = slug
      .replace(/-/g, ' ')
      .replace(/lyon/gi, '')
      .trim()
  }

  return subject || title
}

function buildContentPrompt(subject: string, context: ArticleContext): string {
  const titleLower = context.title.toLowerCase()
  
  // Déterminer le type de contenu à générer basé sur des indices dans le titre
  let contentType = 'article informatif'
  let structure = ''
  
  if (titleLower.includes('restaurant') || titleLower.includes('bouchon') || titleLower.includes('cuisine')) {
    contentType = 'article sur un restaurant'
    structure = `
Structure suggérée :
- Introduction captivante
- Histoire et concept du restaurant
- Spécialités et carte
- Ambiance et décor
- Informations pratiques (adresse, horaires, prix)
- Que faire aux alentours`
  } else if (titleLower.includes('hôtel') || titleLower.includes('hotel') || titleLower.includes('hébergement')) {
    contentType = 'article sur un hôtel'
    structure = `
Structure suggérée :
- Présentation de l'établissement
- Types de chambres et équipements
- Services proposés
- Localisation et accessibilité
- Tarifs et réservation
- Attractions à proximité`
  } else if (titleLower.includes('musée') || titleLower.includes('parc') || titleLower.includes('monument')) {
    contentType = 'article touristique'
    structure = `
Structure suggérée :
- Introduction sur l'attraction
- Histoire et importance culturelle
- Que voir et faire
- Informations pratiques
- Conseils de visite
- Autres attractions proches`
  } else if (titleLower.includes('guide') || titleLower.includes('meilleur') || titleLower.includes('top')) {
    contentType = 'guide ou sélection'
    structure = `
Structure suggérée :
- Introduction du guide
- Critères de sélection
- Liste détaillée avec descriptions
- Comparaisons et recommandations
- Conseils pratiques
- Conclusion avec suggestions`
  }

  return `Rédige un ${contentType} unique et détaillé sur "${subject}" à Lyon.

Titre de l'article : ${context.title}

CONSIGNES CRITIQUES :
1. VÉRIFIE LA VÉRACITÉ : Ne mentionne QUE des établissements/lieux qui existent RÉELLEMENT à Lyon
2. Si tu n'es pas sûr qu'un lieu existe, NE PAS l'inventer
3. Utilise des exemples RÉELS et VÉRIFIÉS de Lyon
4. Structure avec des titres Markdown (## pour H2, ### pour H3)
5. Longueur : 1500-2000 mots MINIMUM
6. Inclus AU MOINS 2-3 liens externes vers des sites officiels (office tourisme, sites d'établissements, etc.)
7. Format des liens : [texte du lien](URL)
8. Évite les phrases génériques et le contenu passe-partout
9. NE JAMAIS utiliser un seul # pour les titres (utilise ## ou ###)

STRUCTURE OBLIGATOIRE :
- Introduction engageante (sans titre)
- ## Premier titre principal
- Contenu détaillé avec des informations concrètes
- ## Deuxième titre principal 
- Plus de contenu spécifique
- ### Sous-sections si nécessaire
- ## Informations pratiques
- Adresses, horaires, tarifs réels
- ## Conclusion

${structure}

EXEMPLE DE LIENS À INCLURE :
- Site officiel de l'Office du Tourisme : [Only Lyon](https://www.onlylyon.com)
- Sites d'établissements mentionnés
- Ressources utiles pertinentes

${context.currentContent && context.currentContent.length > 100 ? 
  `\nContenu existant à améliorer (garde les infos pertinentes mais réécris complètement) :\n${context.currentContent.substring(0, 500)}...` : 
  ''}

Commence directement par le contenu de l'article, sans titre principal (il sera ajouté automatiquement).`
}

function formatContent(content: string): string {
  // Nettoyer et formater le contenu
  let formatted = content
    .replace(/^#\s+[^\n]+\n/, '') // Enlever le titre principal s'il y en a un (avec un seul #)
    .replace(/\n#\s+([^\n]+)/g, '\n## $1') // Remplacer les # seuls par ##
    .replace(/\*\*([^*]+)\*\*/g, '**$1**') // Assurer le bon formatage du gras
    .replace(/\n{3,}/g, '\n\n') // Limiter les sauts de ligne
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Nettoyer les espaces vides multiples
    .trim()
  
  // Vérifier qu'il n'y a pas de # isolés (toujours au moins ##)
  if (formatted.includes('\n# ')) {
    console.warn('⚠️ Détection de titres avec un seul #, correction en cours...')
    formatted = formatted.replace(/\n# /g, '\n## ')
  }
  
  return formatted
}