/**
 * Générateur de prompts spécialisés par catégorie
 */

import { ExtractedTopic } from './topic-extractor'

export function generatePrompt(topic: ExtractedTopic, currentContent?: string): string {
  const baseContext = `Tu es un expert en rédaction web et en tourisme lyonnais. 
Tu dois créer un article unique et spécifique sur "${topic.mainTopic}" à Lyon.
${topic.location ? `Localisation spécifique : ${topic.location}` : ''}
${topic.specificFocus ? `Focus : ${topic.specificFocus}` : ''}

IMPORTANT : 
- L'article doit être SPÉCIFIQUE à "${topic.mainTopic}" et non générique
- Utilise des exemples RÉELS de Lyon (noms de rues, quartiers, établissements existants)
- Inclus des informations pratiques (horaires, tarifs indicatifs, adresses)
- Mentionne des établissements voisins ou complémentaires
- Structure l'article avec des titres Markdown (##, ###)
- Longueur : 1500-2000 mots minimum
- Ton : informatif mais engageant, professionnel mais accessible`

  const categoryPrompts: Record<ExtractedTopic['category'], string> = {
    coworking: `
Rédige un article complet sur l'espace de coworking "${topic.businessName || topic.mainTopic}" à Lyon.

Structure suggérée :
1. Introduction captivante sur cet espace spécifique
2. ## Présentation de ${topic.businessName || topic.mainTopic}
   - Histoire et concept unique
   - Localisation précise et accessibilité
3. ## Les espaces de travail
   - Description détaillée des différents espaces
   - Capacité et types de postes
4. ## Services et équipements
   - Liste complète des services inclus
   - Équipements technologiques disponibles
5. ## Tarifs et formules
   - Détail des différentes offres
   - Comparaison avec la concurrence locale
6. ## Communauté et événements
   - Type de professionnels présents
   - Événements réguliers organisés
7. ## Pourquoi choisir ${topic.businessName || topic.mainTopic} ?
   - Points forts uniques
   - Témoignages ou retours d'expérience
8. ## Informations pratiques
   - Adresse complète
   - Horaires d'ouverture
   - Contact et réservation
9. ## Espaces de coworking similaires à proximité
   - Mentionner 2-3 alternatives dans le quartier

Inclus des détails SPÉCIFIQUES sur cet espace, pas des généralités sur le coworking.`,

    restaurant: `
Rédige un article détaillé sur le restaurant "${topic.businessName || topic.mainTopic}" à Lyon.

Structure suggérée :
1. Introduction appétissante sur ce restaurant spécifique
2. ## L'histoire de ${topic.businessName || topic.mainTopic}
   - Le chef et son parcours
   - Le concept unique du restaurant
3. ## La carte et les spécialités
   - Plats signatures détaillés
   - Gamme de prix
   - Options végétariennes/vegan si applicable
4. ## L'ambiance et le décor
   - Description de l'atmosphère
   - Style de décoration
   - Capacité et disposition
5. ## Une expérience gastronomique unique
   - Ce qui distingue ce restaurant
   - Moments idéaux pour y aller
6. ## Informations pratiques
   - Adresse exacte
   - Horaires d'ouverture par jour
   - Réservation (nécessaire ? comment ?)
   - Fourchette de prix
7. ## Que faire avant ou après ?
   - Bars à proximité
   - Activités dans le quartier
8. ## Avis et recommandations
   - Points forts selon les clients
   - Conseils pour profiter au maximum

Sois SPÉCIFIQUE à ce restaurant, mentionne ses plats réels, son chef, son quartier.`,

    hotel: `
Rédige un article complet sur l'hôtel "${topic.businessName || topic.mainTopic}" à Lyon.

Structure suggérée :
1. Introduction sur cet hôtel spécifique et son positionnement
2. ## Présentation de ${topic.businessName || topic.mainTopic}
   - Histoire et standing
   - Localisation et vue
3. ## Les chambres et suites
   - Types de chambres disponibles
   - Équipements et confort
   - Gamme de prix selon la saison
4. ## Services et équipements
   - Services hôteliers proposés
   - Installations (spa, piscine, gym...)
   - Restaurant de l'hôtel si applicable
5. ## L'emplacement idéal
   - Proximité des attractions
   - Accès transports en commun
   - Quartier et ambiance
6. ## Pour quel type de séjour ?
   - Clientèle cible
   - Occasions recommandées
7. ## Tarifs et réservation
   - Fourchette de prix
   - Périodes à privilégier
   - Conseils de réservation
8. ## Que voir et faire à proximité
   - Attractions à distance de marche
   - Restaurants recommandés
   - Shopping et culture
9. ## Informations pratiques
   - Adresse complète
   - Check-in/check-out
   - Parking et accès

Décris CET hôtel spécifiquement, pas les hôtels en général.`,

    tourism: `
Rédige un article captivant sur "${topic.mainTopic}" à Lyon.

Structure adaptée au sujet touristique :
1. Introduction engageante sur cette attraction/activité
2. ## Découvrir ${topic.mainTopic}
   - Description détaillée
   - Importance culturelle/historique
3. ## Histoire et patrimoine
   - Contexte historique
   - Anecdotes intéressantes
4. ## Que voir et faire
   - Points d'intérêt principaux
   - Activités proposées
   - Durée de visite recommandée
5. ## Informations pratiques
   - Horaires d'ouverture
   - Tarifs (plein, réduit, gratuit)
   - Accessibilité PMR
6. ## Comment s'y rendre
   - Adresse précise
   - Transports en commun
   - Parking à proximité
7. ## Aux alentours
   - Autres attractions proches
   - Restaurants et cafés
   - Shopping
8. ## Conseils de visite
   - Meilleur moment pour visiter
   - Éviter les foules
   - Bons plans et astuces

Fournis des informations RÉELLES et ACTUELLES sur cette attraction lyonnaise.`,

    general: `
Rédige un article informatif et unique sur "${topic.mainTopic}" à Lyon.

L'article doit :
- Être spécifique au sujet traité
- Inclure des exemples concrets de Lyon
- Proposer des informations pratiques
- Mentionner des adresses réelles
- Être structuré avec des sous-titres clairs
- Faire 1500-2000 mots minimum

Évite les généralités et concentre-toi sur des informations spécifiques et utiles.`
  }

  const prompt = baseContext + '\n\n' + categoryPrompts[topic.category]
  
  if (currentContent && currentContent.length > 100) {
    return prompt + `\n\nContenu actuel à améliorer et enrichir (garde les informations pertinentes mais réécris complètement) :\n${currentContent.substring(0, 500)}...`
  }
  
  return prompt + '\n\nCrée un article complet, unique et spécifique.'
}

export function generateMetaPrompt(title: string, content: string): string {
  return `Génère une meta description SEO optimisée (150-160 caractères) pour cet article :
Titre : ${title}
Contenu : ${content.substring(0, 500)}...

La meta description doit :
- Être accrocheuse et inciter au clic
- Contenir les mots-clés principaux
- Être spécifique à Lyon
- Faire exactement 150-160 caractères

Réponds UNIQUEMENT avec la meta description, sans guillemets ni ponctuation finale.`
}

export function generateExcerptPrompt(title: string, content: string): string {
  return `Crée un extrait accrocheur (2-3 phrases) pour cet article :
Titre : ${title}
Début du contenu : ${content.substring(0, 300)}...

L'extrait doit :
- Résumer l'essentiel de l'article
- Donner envie de lire la suite
- Mentionner Lyon
- Faire 150-200 caractères

Réponds UNIQUEMENT avec l'extrait, sans guillemets.`
}