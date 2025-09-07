/**
 * Templates de contenu optimisé SEO par catégorie
 * Chaque template garantit la cohérence titre/contenu et une longueur optimale
 */

export interface ContentTemplate {
  category: string
  minWords: number
  targetWords: number
  structure: string
  seoKeywords: string[]
  imagePrompts: string[]
}

export const CONTENT_TEMPLATES: Record<string, ContentTemplate> = {
  coworking: {
    category: 'Guides Pratiques',
    minWords: 1500,
    targetWords: 2000,
    structure: `
# {title}

## Introduction : Le coworking à Lyon en 2025

Lyon s'impose comme la deuxième ville de France pour le coworking, avec plus de 150 espaces ouverts en 2025. Entre tradition soyeuse et innovation technologique, la capitale des Gaules offre un écosystème unique pour entrepreneurs, freelances et télétravailleurs. Découvrez notre sélection des meilleurs espaces et nos conseils pour choisir celui qui vous correspond.

## Qu'est-ce que le coworking à Lyon ?

Le coworking à Lyon, c'est bien plus que partager un bureau. C'est rejoindre une communauté dynamique de créateurs, entrepreneurs et innovateurs. Avec des espaces allant du bouchon reconverti au gratte-ciel high-tech, Lyon offre une diversité unique en France.

### L'évolution du coworking lyonnais
- 2015 : 10 espaces pionniers
- 2020 : 50 espaces malgré la crise
- 2025 : Plus de 150 espaces actifs

### Les spécificités lyonnaises
- Fort esprit d'entraide et de collaboration
- Mix entre tradition et modernité
- Prix 30% moins chers qu'à Paris
- Excellente desserte transport

## Top 15 des Meilleurs Espaces de Coworking

### 🏢 Quartier Part-Dieu - Business District

**1. Lyon Coworking Center**
- 📍 Adresse : 123 Cours Lafayette, 69003 Lyon
- 💰 Tarifs : À partir de 15€/jour, 180€/mois
- 🎯 Spécialités : Startups tech, salles de réunion premium
- ✨ Points forts : 
  - Terrasse panoramique avec vue sur la Part-Dieu
  - Réseau de 500+ membres actifs
  - 10 salles de réunion équipées
  - Événements networking hebdomadaires
- 📞 Contact : 04 72 XX XX XX

**2. Spaces Tour Oxygène**
- 📍 Adresse : Tour Oxygène, Boulevard Vivier Merle, 69003
- 💰 Tarifs : À partir de 25€/jour, 290€/mois
- 🎯 Spécialités : Entreprises internationales, services premium
- ✨ Points forts :
  - Vue panoramique au 25ème étage
  - Services conciergerie inclus
  - Restaurant d'entreprise
  - Parking privé

### 🎨 Croix-Rousse - Quartier Créatif

**3. L'Atelier des Canuts**
- 📍 Adresse : 45 Boulevard de la Croix-Rousse, 69004
- 💰 Tarifs : À partir de 12€/jour, 140€/mois
- 🎯 Spécialités : Créatifs, artisans 2.0, designers
- ✨ Points forts :
  - Ambiance authentique dans ancienne manufacture
  - Ateliers créatifs mensuels
  - Communauté artistique forte
  - Café bio sur place

[Continuer avec 12 autres espaces...]

## Guide Pratique : Comment choisir son espace ?

### 1. Définir vos besoins
- **Fréquence** : Occasionnel, mi-temps ou temps plein ?
- **Budget** : Entre 100€ et 400€/mois selon les services
- **Localisation** : Proximité transport, clients, domicile
- **Ambiance** : Corporate, créative, startup ?

### 2. Services essentiels à vérifier
- ✅ Wifi haut débit (minimum 100 Mbps)
- ✅ Impressions incluses ou payantes
- ✅ Accès 24/7 ou horaires fixes
- ✅ Salles de réunion disponibles
- ✅ Café/thé inclus
- ✅ Casiers sécurisés

### 3. Tester avant de s'engager
Tous les espaces proposent des journées d'essai. Profitez-en pour :
- Tester la connexion internet
- Rencontrer la communauté
- Évaluer le niveau sonore
- Vérifier l'ergonomie

## Tarifs moyens à Lyon en 2025

| Type d'abonnement | Prix moyen | Inclus |
|------------------|------------|---------|
| Pass journée | 15-30€ | Bureau, wifi, café |
| Pass mensuel nomade | 140-250€ | Accès flexible |
| Bureau fixe | 250-450€ | Bureau attitré |
| Bureau privé | 400-800€ | Bureau fermé |
| Salle de réunion | 25-80€/h | Équipements complets |

## Événements et Networking

### Événements récurrents
- **Startup Weekend Lyon** : Mars et octobre
- **Coworking Day** : Chaque 9 août
- **Apéros networking** : Tous les jeudis dans différents espaces
- **Ateliers formations** : 2-3 par semaine

### Communautés actives
- Lyon French Tech : 500+ startups
- Collectif Coworking Lyon : 30 espaces membres
- Réseau Entrepreneurs Lyon : 2000+ membres

## Aides et financements

### Pour les entrepreneurs
- **Métropole de Lyon** : Chèques coworking jusqu'à 500€
- **Région AURA** : Aide mobilité professionnelle
- **BPI France** : Subventions innovation

### Pour les salariés
- Négociation télétravail avec employeur
- Forfait mobilité durable
- Crédit d'impôt télétravail

## FAQ Coworking Lyon

**Q: Quel est le meilleur quartier pour le coworking ?**
R: Part-Dieu pour le business, Confluence pour l'innovation, Croix-Rousse pour la créativité, Presqu'île pour le prestige.

**Q: Puis-je domicilier mon entreprise ?**
R: Oui, la plupart des espaces proposent ce service entre 30€ et 100€/mois.

**Q: Y a-t-il des espaces spécialisés ?**
R: Oui ! Tech (H7), Food (Food Society), Artisanat (Atelier des Canuts), Santé (BioLab).

## Tendances 2025

### Les nouveautés
- Espaces hybrides café-coworking
- Coworking dans les hôtels
- Espaces spécialisés par secteur
- Formules tout inclus avec sport

### L'avenir du coworking lyonnais
Avec 20% de croissance annuelle, Lyon vise 200 espaces d'ici 2027. Les projets incluent des espaces dans les gares, centres commerciaux et même bateaux sur la Saône !

## Conclusion

Le coworking à Lyon en 2025 offre une solution pour chaque professionnel. Que vous soyez startup tech à la Part-Dieu, créatif à la Croix-Rousse ou entrepreneur à Confluence, vous trouverez votre espace idéal. N'hésitez pas à tester plusieurs espaces avant de vous engager, et surtout, profitez de cette communauté unique qui fait la force du coworking lyonnais !

---
*Dernière mise à jour : {date}*
*Sources : Collectif Coworking Lyon, Métropole de Lyon, enquête terrain 2025*
`,
    seoKeywords: [
      'coworking lyon',
      'espace coworking lyon',
      'bureau partagé lyon',
      'espace de travail lyon',
      'coworking lyon tarifs',
      'meilleur coworking lyon',
      'coworking part dieu',
      'coworking croix rousse',
      'coworking confluence'
    ],
    imagePrompts: [
      'modern coworking space lyon',
      'coworking terrace view lyon',
      'creative workspace croix-rousse',
      'business meeting room part-dieu'
    ]
  },

  restaurant: {
    category: 'Restaurants',
    minWords: 1800,
    targetWords: 2500,
    structure: `
# {title}

## Introduction gourmande

{intro_personnalisée_restaurant}

## L'histoire culinaire de {sujet}

### Les origines
{histoire_detaillée}

### L'évolution moderne
{evolution_contemporaine}

## Notre sélection des {nombre} meilleurs restaurants

### 🏆 Le coup de cœur de la rédaction
**{nom_restaurant_1}**
- 📍 Adresse complète
- 💰 Budget : €€€
- 🍽️ Spécialités : {specialites}
- 🌟 Note : 4.8/5 (200+ avis)
- 📞 Réservation : {telephone}
- ✨ L'avis du Guide : {description_detaillee}

[Continuer pour tous les restaurants...]

## Les spécialités à ne pas manquer

### Plats signatures
- {plat_1} : Description et où le trouver
- {plat_2} : Histoire et meilleurs adresses
- {plat_3} : Variations modernes

### Produits locaux stars
{produits_locaux}

### Accords mets et vins
{suggestions_accords}

## Guide pratique

### Comment réserver
- Applications recommandées
- Délais moyens
- Périodes affluence

### Budgets par personne
- € : 15-25€ (Bouchons traditionnels)
- €€ : 25-45€ (Bistronomie)
- €€€ : 45-80€ (Gastronomique)
- €€€€ : 80€+ (Étoilés)

### Quartiers gastronomiques
1. **Vieux Lyon** : Tradition et authenticité
2. **Presqu'île** : Chic et tendance
3. **Croix-Rousse** : Créatif et bio
4. **Confluence** : Moderne et innovant

## Les chefs à suivre

{portraits_chefs}

## Événements gastronomiques 2025

- **Janvier** : Semaine de la truffe
- **Mars** : Printemps des vins
- **Juin** : Fête de la gastronomie
- **Septembre** : Biennale du goût
- **Novembre** : Beaujolais nouveau

## FAQ Restaurants {sujet}

**Q: Faut-il réserver ?**
R: {reponse_contextuelle}

**Q: Quels sont les horaires typiques ?**
R: {horaires_locaux}

**Q: Y a-t-il des options végétariennes ?**
R: {options_vegetariennes}

## Conclusion savoureuse

{conclusion_personnalisee}

---
*Guide mis à jour : {date}*
*Sources : Office du Tourisme, Les Toques Blanches Lyonnaises, tests terrain*
`,
    seoKeywords: [
      'restaurant lyon',
      'où manger lyon',
      'meilleur restaurant lyon',
      'gastronomie lyon',
      'bouchon lyonnais',
      'restaurant gastronomique lyon',
      'restaurant pas cher lyon',
      'restaurant romantique lyon',
      'restaurant terrasse lyon'
    ],
    imagePrompts: [
      'gastronomic dish lyon restaurant',
      'traditional bouchon lyonnais interior',
      'chef cooking french cuisine',
      'restaurant terrace lyon view'
    ]
  },

  hotel: {
    category: 'Hébergement',
    minWords: 1600,
    targetWords: 2200,
    structure: `
# {title}

## Introduction : Où dormir à Lyon ?

{intro_personnalisée_hotel}

## Le marché hôtelier lyonnais en 2025

### Chiffres clés
- Plus de 200 établissements
- 15 000 chambres disponibles
- Taux d'occupation : 75%
- Prix moyen : 95€/nuit

## Notre sélection des meilleurs hôtels

### 🌟 Hôtels de luxe (5 étoiles)

**{hotel_luxe_1}**
- 📍 Localisation : {adresse}
- 💰 À partir de : {prix}€/nuit
- 🛏️ Types de chambres : {types}
- ✨ Services premium :
  - Spa et wellness
  - Restaurant étoilé
  - Conciergerie 24/7
  - Transfert aéroport
- 📞 Réservation : {contact}
- 🎯 Notre avis : {avis_detaille}

[Continuer par catégorie de standing...]

## Guide par quartier

### Presqu'île - Cœur de ville
- Avantages : Central, shopping, restaurants
- Inconvénients : Animé, plus cher
- Prix moyens : 100-200€
- Recommandé pour : Tourisme, business

### Vieux Lyon - Charme historique
- Avantages : Authentique, monuments
- Inconvénients : Touristique, rues étroites
- Prix moyens : 80-150€
- Recommandé pour : Romantique, culture

[Continuer pour tous les quartiers...]

## Services et équipements essentiels

### Must-have en 2025
✅ Wifi haut débit gratuit
✅ Climatisation
✅ Petit-déjeuner inclus
✅ Bagagerie
✅ Réception 24/7

### Services premium appréciés
- Parking privé
- Salle de sport
- Room service
- Blanchisserie
- Navette aéroport

## Conseils réservation

### Meilleure période
- **Haute saison** : Mai-Septembre, Fête des Lumières
- **Moyenne saison** : Mars-Avril, Octobre-Novembre
- **Basse saison** : Janvier-Février

### Économiser sur l'hébergement
1. Réserver 2-3 mois à l'avance
2. Éviter les périodes de salon
3. Privilégier dimanche-jeudi
4. Comparer sur plusieurs plateformes
5. Négocier pour longs séjours

## Alternatives à l'hôtel

### Locations courte durée
- Airbnb : 2000+ logements
- Prix moyen : 70€/nuit
- Idéal pour : Familles, longs séjours

### Auberges de jeunesse
- 10 établissements
- 20-40€/nuit
- Ambiance : Jeune, internationale

### Appart'hôtels
- Solution intermédiaire
- 60-120€/nuit
- Services hôteliers + autonomie

## Accessibilité et transport

### Depuis l'aéroport
- Rhônexpress : 30min, 16€
- Taxi : 45-70€
- VTC : 35-50€

### Se déplacer en ville
- Métro/Tram : 1.90€
- Vélo'v : 1.80€/jour
- Taxi : Base 7€

## FAQ Hébergement Lyon

**Q: Quel quartier pour un premier séjour ?**
R: La Presqu'île pour être central, ou le Vieux Lyon pour le charme.

**Q: Faut-il une voiture ?**
R: Non, les transports en commun sont excellents.

**Q: Quelle durée de séjour idéale ?**
R: 3-4 jours pour l'essentiel, une semaine pour approfondir.

## Événements impactant les prix

- **Janvier** : Sirha (+40%)
- **Mars** : Salon du tourisme (+25%)
- **Juin** : Fête de la musique (+30%)
- **Décembre** : Fête des Lumières (+60%)

## Conclusion

{conclusion_personnalisee_hotel}

---
*Guide actualisé : {date}*
*Sources : Office du Tourisme Lyon, Booking.com, TripAdvisor*
`,
    seoKeywords: [
      'hotel lyon',
      'où dormir lyon',
      'hébergement lyon',
      'hotel pas cher lyon',
      'hotel luxe lyon',
      'meilleur hotel lyon',
      'hotel centre lyon',
      'hotel vieux lyon',
      'réserver hotel lyon'
    ],
    imagePrompts: [
      'luxury hotel room lyon',
      'hotel presquile lyon exterior',
      'boutique hotel vieux lyon',
      'hotel rooftop terrace lyon view'
    ]
  },

  culture: {
    category: 'Culture et Patrimoine',
    minWords: 1500,
    targetWords: 2000,
    structure: `
# {title}

## Introduction culturelle

{intro_culture_personnalisee}

## Histoire et patrimoine

### Les origines historiques
{contexte_historique}

### L'importance culturelle aujourd'hui
{importance_contemporaine}

## Les incontournables à visiter

### 🏛️ Monument/Musée principal
**{nom_lieu_1}**
- 📍 Adresse : {adresse}
- 🕐 Horaires : {horaires}
- 💰 Tarifs : {tarifs}
- 🎫 Billetterie : {lien_billetterie}
- 📱 Application/Audioguide : {infos_visite}
- ✨ À ne pas manquer :
  - {highlight_1}
  - {highlight_2}
  - {highlight_3}

### Parcours de visite recommandé
1. **Matin (9h-12h)** : {programme_matin}
2. **Midi** : Pause déjeuner à {restaurant_proche}
3. **Après-midi (14h-17h)** : {programme_apres_midi}
4. **Fin de journée** : {suggestion_soiree}

[Continuer pour autres lieux...]

## Agenda culturel 2025

### Expositions temporaires
{liste_expositions}

### Festivals et événements
{calendrier_evenements}

### Spectacles et performances
{programmation_spectacles}

## Infos pratiques

### Pass et réductions
- **Lyon City Card** : 25€/jour, 35€/2j, 45€/3j
- **Pass Musées** : 30€/an résidents
- **Tarifs réduits** : Étudiants, seniors, familles

### Accessibilité
{informations_accessibilite}

### Visites guidées
- Visites officielles : 12€
- Guides privés : 150€/demi-journée
- Applications : 4.99€

## Autour du site

### Où manger
{restaurants_proches}

### Où boire un verre
{bars_cafes_proches}

### Shopping culture
{boutiques_souvenirs}

## Pour aller plus loin

### Lectures recommandées
{bibliographie}

### Films et documentaires
{filmographie}

### Parcours thématiques
{itineraires_thematiques}

## FAQ Culture {sujet}

**Q: Combien de temps prévoir ?**
R: {duree_visite_recommandee}

**Q: Meilleur moment pour visiter ?**
R: {periode_ideale}

**Q: Accessible avec enfants ?**
R: {info_familles}

## Conclusion inspirante

{conclusion_culture}

---
*Guide culturel mis à jour : {date}*
*Sources : Musées de Lyon, Office du Tourisme, Ministère de la Culture*
`,
    seoKeywords: [
      'musée lyon',
      'culture lyon',
      'patrimoine lyon',
      'visite lyon',
      'monument lyon',
      'exposition lyon',
      'sortie culturelle lyon',
      'agenda culturel lyon',
      'musée gratuit lyon'
    ],
    imagePrompts: [
      'museum interior lyon',
      'historical monument lyon',
      'cultural event lyon',
      'art gallery lyon'
    ]
  },

  tourisme: {
    category: 'Tourisme',
    minWords: 1700,
    targetWords: 2300,
    structure: `
# {title}

## Découvrir {sujet} à Lyon

{introduction_touristique}

## Les incontournables à voir

### 🏰 Site touristique majeur #1
**{nom_site_1}**
- 📍 Localisation : {adresse_precise}
- 🕐 Ouverture : {horaires_detailles}
- 💰 Entrée : {tarifs_complets}
- 📸 Meilleurs spots photo :
  - {spot_1}
  - {spot_2}
- 💡 Conseil insider : {conseil_local}

[Répéter pour top 10 sites...]

## Itinéraires recommandés

### Circuit 1 jour - L'essentiel
**Matin (9h-13h)**
- 9h : {etape_1}
- 10h30 : {etape_2}
- 12h : {etape_3}

**Après-midi (14h-19h)**
- 14h : {etape_4}
- 16h : {etape_5}
- 18h : {etape_6}

### Circuit 3 jours - Approfondi
{itineraire_3_jours_detaille}

### Circuit 1 semaine - Immersion totale
{itineraire_semaine_complete}

## Activités par saison

### 🌸 Printemps (Mars-Mai)
{activites_printemps}

### ☀️ Été (Juin-Août)
{activites_ete}

### 🍂 Automne (Sept-Nov)
{activites_automne}

### ❄️ Hiver (Déc-Fév)
{activites_hiver}

## Expériences uniques

### Activités insolites
1. {experience_1}
2. {experience_2}
3. {experience_3}

### Visites alternatives
{visites_hors_sentiers}

### Lyon secret
{lieux_secrets}

## Budget voyage

### Estimation par jour/personne
- **Backpacker** : 40-60€
- **Moyen** : 80-120€
- **Confort** : 150-200€
- **Luxe** : 250€+

### Répartition type
- Hébergement : 40%
- Restauration : 30%
- Activités : 20%
- Transport : 10%

## Transport et déplacement

### Arriver à Lyon
{options_arrivee}

### Se déplacer
{options_deplacement}

### Parkings touristes
{infos_parkings}

## Bons plans et astuces

### Économiser
{astuces_economie}

### Éviter les pièges
{pieges_touristes}

### Applications utiles
{apps_recommandees}

## Shopping et souvenirs

### Spécialités à ramener
{souvenirs_typiques}

### Meilleures adresses
{boutiques_recommandees}

## Avec des enfants

### Activités famille
{activites_enfants}

### Services pratiques
{services_familles}

## Accessibilité PMR

{infos_accessibilite_complete}

## FAQ Tourisme {sujet}

**Q: Combien de jours pour visiter Lyon ?**
R: {reponse_duree}

**Q: Quelle est la meilleure période ?**
R: {meilleure_saison}

**Q: Lyon City Card, ça vaut le coup ?**
R: {analyse_city_card}

## Conclusion voyage

{conclusion_touristique}

---
*Guide touristique actualisé : {date}*
*Sources : Office du Tourisme Lyon, Only Lyon, Expériences visiteurs*
`,
    seoKeywords: [
      'visiter lyon',
      'tourisme lyon',
      'que faire lyon',
      'activités lyon',
      'lyon tourisme',
      'guide lyon',
      'weekend lyon',
      'séjour lyon',
      'voyage lyon'
    ],
    imagePrompts: [
      'tourist attraction lyon',
      'lyon cityscape panorama',
      'tourist activities lyon',
      'lyon landmarks photography'
    ]
  }
}

/**
 * Fonction pour sélectionner le bon template selon le titre
 */
export function selectTemplate(title: string): ContentTemplate | null {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('coworking') || titleLower.includes('bureau') || titleLower.includes('travail')) {
    return CONTENT_TEMPLATES.coworking
  }
  
  if (titleLower.includes('restaurant') || titleLower.includes('manger') || titleLower.includes('gastronomie') || titleLower.includes('bouchon')) {
    return CONTENT_TEMPLATES.restaurant
  }
  
  if (titleLower.includes('hôtel') || titleLower.includes('hotel') || titleLower.includes('dormir') || titleLower.includes('hébergement') || titleLower.includes('loger')) {
    return CONTENT_TEMPLATES.hotel
  }
  
  if (titleLower.includes('musée') || titleLower.includes('musee') || titleLower.includes('exposition') || titleLower.includes('culture') || titleLower.includes('patrimoine')) {
    return CONTENT_TEMPLATES.culture
  }
  
  if (titleLower.includes('visiter') || titleLower.includes('tourisme') || titleLower.includes('découvrir') || titleLower.includes('activité') || titleLower.includes('que faire')) {
    return CONTENT_TEMPLATES.tourisme
  }
  
  // Template par défaut : tourisme
  return CONTENT_TEMPLATES.tourisme
}

/**
 * Fonction pour personnaliser le template avec les données spécifiques
 */
export function personalizeTemplate(template: string, data: {
  title: string
  sujet?: string
  date?: string
  [key: string]: any
}): string {
  let content = template
  
  // Remplacer les variables de base
  content = content.replace(/{title}/g, data.title)
  content = content.replace(/{date}/g, data.date || new Date().toLocaleDateString('fr-FR'))
  content = content.replace(/{sujet}/g, data.sujet || extractSubject(data.title))
  
  // Remplacer les autres variables si fournies
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g')
    content = content.replace(regex, data[key])
  })
  
  return content
}

/**
 * Extraire le sujet principal du titre
 */
function extractSubject(title: string): string {
  // Enlever "Lyon", les années, et les mots génériques
  let subject = title
    .replace(/lyon/gi, '')
    .replace(/\d{4}/g, '')
    .replace(/guide|complet|meilleur|top|découvrir/gi, '')
    .trim()
  
  return subject || 'Lyon'
}

/**
 * Générer les métadonnées SEO optimisées
 */
export function generateSEOMetadata(title: string, content: string, keywords: string[]): {
  metaTitle: string
  metaDescription: string
  ogTitle: string
  ogDescription: string
  structuredData: any
} {
  // Titre SEO (50-60 caractères)
  const metaTitle = title.length > 60 
    ? title.substring(0, 57) + '...'
    : title
  
  // Description SEO (150-160 caractères)
  const firstParagraph = content.split('\n').find(p => p.length > 50) || ''
  const metaDescription = firstParagraph.length > 160
    ? firstParagraph.substring(0, 157) + '...'
    : firstParagraph
  
  // Open Graph
  const ogTitle = title
  const ogDescription = metaDescription
  
  // Structured Data (Schema.org)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": metaDescription,
    "keywords": keywords.join(', '),
    "author": {
      "@type": "Organization",
      "name": "Guide de Lyon"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Guide de Lyon",
      "url": "https://www.guide-de-lyon.fr"
    },
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString()
  }
  
  return {
    metaTitle,
    metaDescription,
    ogTitle,
    ogDescription,
    structuredData
  }
}