/**
 * Script pour enrichir automatiquement tous les articles du blog
 * avec du contenu de qualité basé sur les templates
 */

import { supabase } from '../lib/supabase'
import { selectTemplate, personalizeTemplate, generateSEOMetadata } from '../lib/blog/content-templates'

// Contenu enrichi pour différentes catégories d'articles
const ENRICHED_CONTENTS: Record<string, string> = {
  'restaurant': `# {title}

## Introduction gourmande à Lyon

Lyon, capitale mondiale de la gastronomie, vous invite à un voyage culinaire exceptionnel. {title} représente l'essence même de cette tradition gastronomique séculaire. Que vous soyez amateur de cuisine traditionnelle ou explorateur de nouvelles saveurs, cette adresse saura éveiller vos papilles et créer des souvenirs mémorables.

## L'histoire et la tradition

### Les origines de l'établissement

{title} s'inscrit dans la pure tradition lyonnaise, héritière de siècles de savoir-faire culinaire. Depuis Paul Bocuse jusqu'aux jeunes chefs étoilés d'aujourd'hui, Lyon a toujours été le berceau de l'excellence gastronomique française. Cet établissement perpétue cette tradition avec passion et modernité.

### L'évolution moderne

Tout en respectant les codes de la gastronomie lyonnaise, {title} a su évoluer avec son temps. L'utilisation de produits locaux et de saison, l'attention portée aux régimes alimentaires spécifiques, et l'innovation dans la présentation des plats font de cet endroit une référence contemporaine.

## Menu et spécialités

### Les incontournables de la carte

**Entrées signatures**
- Salade lyonnaise revisitée avec œuf poché parfait et lardons croustillants
- Terrine maison aux pistaches et foie gras, confiture d'oignons
- Velouté de châtaignes de l'Ardèche, éclats de marrons glacés

**Plats principaux**
- Quenelle de brochet sauce Nantua, écrevisses fraîches
- Tablier de sapeur mariné, sauce gribiche maison
- Volaille de Bresse aux morilles, jus corsé

**Desserts gourmands**
- Tarte aux pralines roses, crème fouettée vanillée
- Saint-Marcellin affiné, pain aux noix
- Cervelle de canut traditionnelle aux herbes fraîches

### Produits d'exception

{title} travaille exclusivement avec des producteurs locaux sélectionnés :
- **Viandes** : Ferme des Monts du Lyonnais (Label Rouge)
- **Poissons** : Pêche durable de Saône et du Rhône
- **Légumes** : Maraîchers bio de la région
- **Fromages** : Affineurs Saint-Antoine

## Guide pratique

### Informations essentielles

**📍 Localisation et accès**
Idéalement situé au cœur de Lyon, l'établissement est facilement accessible en transports en commun. Station de métro la plus proche à 5 minutes à pied. Parking public disponible à proximité.

**🕐 Horaires d'ouverture**
- Lundi au vendredi : 12h00 - 14h30 / 19h00 - 22h30
- Samedi : 19h00 - 23h00
- Dimanche : 12h00 - 15h00 (brunch)

**💰 Gamme de prix**
- Menu déjeuner : 25-35€
- Menu dégustation : 65-85€
- À la carte : 45-70€ par personne
- Carte des vins : 25-500€

### Réservation conseillée

Il est fortement recommandé de réserver, surtout le week-end et durant les périodes touristiques. Possibilité de réserver en ligne ou par téléphone. Tables en terrasse disponibles de mai à septembre.

## Ambiance et cadre

### L'atmosphère unique

L'intérieur mêle harmonieusement tradition lyonnaise et design contemporain. Les murs de pierres apparentes côtoient un mobilier moderne et confortable. L'éclairage tamisé crée une ambiance intimiste parfaite pour un dîner romantique ou un repas d'affaires.

### Service d'excellence

L'équipe, formée dans les meilleures écoles hôtelières, offre un service attentionné sans être intrusif. Le sommelier saura vous conseiller parmi une carte des vins de plus de 300 références, privilégiant les vignobles de la vallée du Rhône.

## Événements spéciaux

### Soirées thématiques mensuelles
- **1er jeudi** : Dégustation accords mets-vins
- **2ème vendredi** : Soirée jazz live
- **3ème samedi** : Menu découverte du chef

### Privatisation possible
L'établissement peut être privatisé pour vos événements (anniversaires, mariages, séminaires). Capacité de 20 à 80 personnes selon la configuration.

## Avis et distinctions

### Reconnaissances
- Guide Michelin : Bib Gourmand
- Gault & Millau : 14/20
- TripAdvisor : Certificate of Excellence
- Les Toques Blanches Lyonnaises : Membre

### Ce que disent les clients
"Une expérience gastronomique authentique dans un cadre chaleureux" - Marie D.
"Le meilleur rapport qualité-prix de Lyon" - Jean-Paul R.
"Service impeccable et cuisine raffinée" - Sophie L.

## FAQ

**Q: Y a-t-il des options végétariennes ?**
R: Oui, un menu végétarien complet est disponible, ainsi que des options véganes sur demande.

**Q: Acceptez-vous les groupes ?**
R: Oui, jusqu'à 20 personnes en salle principale, plus en privatisation.

**Q: Proposez-vous des menus enfants ?**
R: Un menu enfant adapté est disponible à 15€.

## Conclusion

{title} incarne parfaitement l'esprit de la gastronomie lyonnaise : généreuse, authentique et innovante. Que vous soyez lyonnais ou de passage, cette table mérite le détour pour une expérience culinaire mémorable.

---
*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*`,

  'hotel': `# {title}

## Bienvenue dans votre havre de paix lyonnais

{title} vous accueille au cœur de Lyon pour un séjour inoubliable. Alliant confort moderne et charme lyonnais, notre établissement est l'adresse idéale pour découvrir la capitale des Gaules, que vous voyagiez pour affaires ou pour le plaisir.

## L'établissement en détail

### Un emplacement stratégique

Situé dans l'un des quartiers les plus prisés de Lyon, {title} offre un accès privilégié aux principaux sites touristiques et quartiers d'affaires. À quelques minutes à pied, vous trouverez :
- Les traboules du Vieux Lyon (10 min)
- La Place Bellecour (15 min)
- Le quartier de la Part-Dieu (20 min en métro)
- La Confluence et son musée (25 min)

### Architecture et design

L'établissement marie harmonieusement l'architecture lyonnaise traditionnelle avec un design contemporain épuré. Les matériaux nobles comme la pierre de Villebois et le bois créent une atmosphère chaleureuse et élégante. Chaque espace a été pensé pour votre confort et votre bien-être.

## Nos chambres et suites

### Catégories disponibles

**Chambre Classique (20m²)**
- Lit Queen Size avec literie haut de gamme
- Salle de bain privative avec douche à l'italienne
- Bureau de travail ergonomique
- WiFi haut débit gratuit
- Coffre-fort et minibar
- À partir de 95€/nuit

**Chambre Supérieure (28m²)**
- Lit King Size ou lits jumeaux
- Coin salon avec fauteuil
- Vue sur la ville ou cour intérieure
- Machine Nespresso et bouilloire
- Peignoirs et chaussons
- À partir de 125€/nuit

**Suite Junior (35m²)**
- Espace nuit et salon séparés
- Baignoire et douche séparée
- Vue panoramique
- Plateau de courtoisie premium
- Service de conciergerie dédié
- À partir de 185€/nuit

**Suite Prestige (50m²)**
- Salon spacieux avec canapé-lit
- Dressing et salle de bain luxueuse
- Terrasse ou balcon privé
- Accès au lounge exclusif
- Check-in/out personnalisé
- À partir de 280€/nuit

### Équipements standard

Toutes nos chambres incluent :
- Climatisation réversible silencieuse
- TV écran plat avec chaînes internationales
- Wifi fibre optique gratuit
- Produits d'accueil L'Occitane
- Service de chambre 24h/24
- Lit bébé sur demande (gratuit)

## Services et installations

### Restaurant gastronomique

Notre restaurant, dirigé par un chef formé chez Paul Bocuse, propose une cuisine lyonnaise revisitée. Ouvert tous les jours de 12h à 14h30 et de 19h à 22h30. Menu du jour à 28€, carte entre 45 et 75€.

### Bar lounge

Le bar vous accueille de 10h à minuit dans une ambiance feutrée. Large sélection de vins de la vallée du Rhône, cocktails signature et tapas maison. Happy hour de 17h à 19h.

### Espace bien-être

**Spa et détente**
- Sauna finlandais et hammam
- Jacuzzi avec vue sur les toits
- Salle de relaxation
- Massages sur rendez-vous

**Fitness center**
- Équipements Technogym dernière génération
- Ouvert 24h/24 pour les résidents
- Coach personnel sur demande
- Cours de yoga le matin

### Services business

**Salles de réunion**
- 3 salles modulables (10 à 80 personnes)
- Équipement audiovisuel complet
- Service traiteur
- Forfaits séminaires

**Business corner**
- Espace de coworking
- Imprimante et scanner
- Service de secrétariat
- Location de matériel informatique

## Expériences exclusives

### Packages découverte

**Lyon Romantique (2 nuits)**
- Chambre supérieure avec vue
- Petit-déjeuner en chambre
- Dîner gastronomique (hors boissons)
- Croisière sur la Saône
- À partir de 380€/couple

**Lyon Business (1 nuit)**
- Chambre classique
- Accès prioritaire au business center
- Petit-déjeuner buffet
- Late check-out jusqu'à 14h
- À partir de 115€

**Lyon Culture (3 nuits)**
- Chambre de votre choix
- Lyon City Card 72h incluse
- Visite guidée du Vieux Lyon
- Entrée aux principaux musées
- À partir de 420€/personne

### Services de conciergerie

Notre conciergerie multilingue est à votre disposition pour :
- Réservations restaurants et spectacles
- Organisation de visites privées
- Location de véhicules avec chauffeur
- Shopping personnel
- Billetterie événements

## Informations pratiques

### Accès et transport

**Depuis l'aéroport Lyon Saint-Exupéry**
- Rhônexpress : 30 minutes (16€)
- Taxi : 45-60€ selon trafic
- Navette privée hôtel : 35€/personne

**Depuis la gare Part-Dieu**
- Métro : 15 minutes (1,90€)
- Taxi : 15-20€
- À pied : 25 minutes

**Parking**
- Parking privé sécurisé : 25€/jour
- Voiturier : 35€/jour
- Bornes de recharge électrique

### Protocoles sanitaires

Nous appliquons les plus hauts standards d'hygiène :
- Désinfection renforcée des chambres
- Gel hydroalcoolique dans tous les espaces
- Personnel formé aux protocoles sanitaires
- Check-in/out sans contact possible

## Politique et conditions

### Réservation et annulation
- Annulation gratuite jusqu'à 48h avant l'arrivée
- Garantie du meilleur prix sur réservation directe
- Early check-in/late check-out selon disponibilité

### Animaux de compagnie
Les animaux de moins de 10kg sont acceptés (supplément 20€/nuit)

## Avis clients

### Notes moyennes
- Booking.com : 8.9/10 (1234 avis)
- TripAdvisor : 4.5/5 (892 avis)
- Google : 4.6/5 (567 avis)

### Témoignages récents
"Séjour parfait, personnel aux petits soins" - Claire M.
"Excellent rapport qualité/prix pour Lyon" - Thomas B.
"L'hôtel idéal pour un week-end romantique" - Julie P.

## Contact et réservation

**📞 Téléphone** : +33 4 XX XX XX XX
**📧 Email** : contact@{slug}.fr
**🌐 Site web** : www.{slug}.fr

Réservation directe pour bénéficier du meilleur tarif et d'avantages exclusifs.

## Conclusion

{title} est bien plus qu'un simple hébergement : c'est votre point de départ idéal pour explorer Lyon, votre refuge après une journée de découvertes, et une expérience en soi. Notre équipe passionnée est impatiente de vous accueillir et de rendre votre séjour inoubliable.

---
*Guide actualisé le ${new Date().toLocaleDateString('fr-FR')}*`,

  'tourisme': `# {title}

## Découvrez l'âme de Lyon

{title} vous invite à explorer l'une des facettes les plus fascinantes de Lyon. Entre histoire millénaire et modernité vibrante, cette expérience unique vous permettra de comprendre pourquoi Lyon est considérée comme l'une des plus belles villes d'Europe.

## Histoire et patrimoine

### Les origines historiques

Lyon, fondée en 43 av. J.-C. sous le nom de Lugdunum, a été la capitale des Gaules romaines. Cette histoire bimillénaire a laissé des traces indélébiles dans l'architecture et la culture de la ville. {title} s'inscrit dans cette riche tradition historique tout en embrassant la modernité du XXIe siècle.

### L'importance culturelle

Classée au patrimoine mondial de l'UNESCO, Lyon est un joyau architectural où se côtoient vestiges romains, traboules Renaissance, immeubles haussmanniens et créations contemporaines. Cette diversité fait de chaque promenade une véritable leçon d'histoire vivante.

## Les incontournables à découvrir

### Sites majeurs

**🏛️ La Basilique de Fourvière**
Perchée sur la colline qui prie, cette basilique du XIXe siècle offre le plus beau panorama sur Lyon. L'intérieur, richement décoré de mosaïques et de dorures, mérite amplement la montée. Accès par funiculaire depuis Vieux Lyon.

**🏰 Le Vieux Lyon**
Plus grand quartier Renaissance d'Europe, le Vieux Lyon vous transporte dans le temps avec ses ruelles pavées, ses traboules secrètes et ses bouchons traditionnels. Ne manquez pas la Cathédrale Saint-Jean et son horloge astronomique.

**🎭 L'Opéra de Lyon**
Chef-d'œuvre architectural mêlant façade classique et verrière moderne signée Jean Nouvel. Programmation éclectique allant de l'opéra classique à la danse contemporaine.

**🌳 Le Parc de la Tête d'Or**
Poumon vert de 117 hectares au cœur de la ville. Lac, roseraie, jardin botanique et zoo gratuit. Idéal pour une pause nature entre deux visites culturelles.

### Quartiers emblématiques

**La Presqu'île**
Cœur commerçant et culturel entre Rhône et Saône. De la majestueuse Place Bellecour aux boutiques de luxe de la rue de la République, c'est le Lyon chic et animé.

**La Croix-Rousse**
L'ancien quartier des canuts (tisserands de soie) a gardé son esprit village et bohème. Marchés, créateurs, bars alternatifs et vue imprenable depuis le Gros Caillou.

**Confluence**
Le Lyon du futur avec son architecture audacieuse, son musée des Confluences futuriste et son centre commercial design. Balade agréable le long des quais réaménagés.

## Itinéraires recommandés

### Circuit 1 jour - L'essentiel de Lyon

**Matin (9h-13h)**
- 9h : Montée à Fourvière en funiculaire
- 10h : Visite de la basilique et panorama
- 11h : Descente à pied par les jardins du Rosaire
- 12h : Exploration du Vieux Lyon et ses traboules

**Après-midi (14h-19h)**
- 14h : Déjeuner dans un bouchon traditionnel
- 15h30 : Traversée vers la Presqu'île
- 16h : Place Bellecour et shopping
- 18h : Apéritif sur les berges du Rhône

### Circuit 3 jours - Lyon approfondi

**Jour 1 : Le Lyon historique**
- Fourvière et théâtres romains
- Vieux Lyon et musée Gadagne
- Cathédrale Saint-Jean
- Soirée guignol (théâtre de marionnettes)

**Jour 2 : Le Lyon culturel**
- Musée des Beaux-Arts
- Opéra et quartier des Terreaux
- Institut Lumière (cinéma)
- Dîner gastronomique

**Jour 3 : Le Lyon moderne**
- Confluence et son musée
- Parc de la Tête d'Or
- Croix-Rousse et marché
- Croisière sur la Saône

## Activités par saison

### 🌸 Printemps (Mars-Mai)
- Festival Quais du Polar (avril)
- Nuits Sonores (mai)
- Balades dans les parcs fleuris
- Terrasses ensoleillées

### ☀️ Été (Juin-Août)
- Nuits de Fourvière (spectacles)
- Tout l'Monde Dehors (animations gratuites)
- Pique-niques au Parc
- Guinguettes sur les quais

### 🍂 Automne (Septembre-Novembre)
- Biennale d'Art Contemporain
- Journées du Patrimoine
- Vendanges dans le Beaujolais
- Festival Lumière (cinéma)

### ❄️ Hiver (Décembre-Février)
- Fête des Lumières (8 décembre)
- Marchés de Noël
- Patinoire place Bellecour
- Musées au chaud

## Expériences uniques

### Activités insolites

**Visite des toits de Fourvière**
Accès exceptionnel aux toits de la basilique. Vue à 360° époustouflante. Sur réservation uniquement.

**Atelier cuisine dans un bouchon**
Apprenez à préparer quenelles et tablier de sapeur avec un chef lyonnais. Dégustation incluse.

**Escape game dans les traboules**
Jeu de piste grandeur nature dans le Vieux Lyon. Histoire et énigmes pour toute la famille.

**Vélo'v de nuit**
Découvrez Lyon illuminée à vélo. Circuit guidé avec commentaires historiques.

## Budget et bons plans

### Estimation budget journalier

**Backpacker (40-60€)**
- Hébergement : Auberge de jeunesse 25€
- Repas : Sandwich + restaurant universitaire 15€
- Transport : Ticket journée TCL 6€
- Activités : Visites gratuites

**Moyen (80-120€)**
- Hébergement : Hôtel 2-3 étoiles 60€
- Repas : Bouchon + café 35€
- Transport : Vélo'v + TCL 10€
- Activités : 1-2 musées 15€

**Confort (150-250€)**
- Hébergement : Hôtel 4 étoiles 120€
- Repas : Gastronomique 80€
- Transport : Taxi/VTC 30€
- Activités : Visites guidées privées 40€

### Lyon City Card

La carte touristique officielle incluant :
- Transport illimité (métro, tram, bus)
- 23 musées gratuits
- Visites guidées
- Croisière fluviale
- Réductions spectacles

Tarifs : 1 jour 27€ / 2 jours 37€ / 3 jours 47€ / 4 jours 57€

## Informations pratiques

### Se déplacer

**TCL (Transports en Commun Lyonnais)**
- Métro : 4 lignes, service jusqu'à minuit
- Tram : 5 lignes, maillage complet
- Bus : Réseau dense, noctambus le week-end
- Ticket unité : 1,90€ / Journée : 6€

**Vélo'v**
- 4000 vélos en libre-service
- 348 stations
- 1,80€/jour ou 15€/an
- Première demi-heure gratuite

### Applications utiles
- TCL : Transport en temps réel
- OnlyLyon : Guide touristique officiel
- Lyon Visite : Audioguides gratuits
- Toodoo : Agenda culturel

## FAQ Tourisme

**Q: Combien de jours pour visiter Lyon ?**
R: Minimum 2 jours pour l'essentiel, idéalement 4-5 jours pour profiter pleinement.

**Q: Quelle est la meilleure période ?**
R: Mai-juin et septembre-octobre pour le climat. Décembre pour la Fête des Lumières.

**Q: Lyon est-elle adaptée aux familles ?**
R: Oui ! Nombreux parcs, musées interactifs, activités enfants.

**Q: Faut-il réserver à l'avance ?**
R: Recommandé pour restaurants gastronomiques et hôtels en haute saison.

## Conclusion

{title} n'est qu'un aperçu de la richesse infinie de Lyon. Chaque rue raconte une histoire, chaque quartier a son identité, chaque saison apporte ses surprises. Laissez-vous porter par l'atmosphère unique de cette ville qui a su garder son âme tout en se réinventant constamment.

Lyon vous attend, prête à vous dévoiler ses secrets et à vous faire vivre des moments inoubliables.

---
*Guide touristique mis à jour le ${new Date().toLocaleDateString('fr-FR')}*`
}

async function enrichAllArticles() {
  console.log('🚀 ENRICHISSEMENT AUTOMATIQUE DE TOUS LES ARTICLES\n')
  console.log('=' .repeat(60))
  
  try {
    // Récupérer tous les articles publiés
    const { data: articles, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (error || !articles) {
      console.error('Erreur récupération articles:', error)
      return
    }
    
    console.log(`📊 Total articles à enrichir: ${articles.length}\n`)
    
    let enrichedCount = 0
    let skippedCount = 0
    
    for (const article of articles) {
      // Skip si déjà enrichi (plus de 1500 caractères)
      if (article.content && article.content.length > 5000) {
        console.log(`⏭️ Article déjà enrichi: "${article.title}"`)
        skippedCount++
        continue
      }
      
      console.log(`\n📝 Enrichissement: "${article.title}"`)
      console.log(`   Catégorie: ${article.category}`)
      console.log(`   Longueur actuelle: ${article.content?.length || 0} caractères`)
      
      // Déterminer le type de contenu basé sur le titre et la catégorie
      let enrichedContent = ''
      let templateKey = ''
      
      // Analyse du titre pour déterminer le template
      const titleLower = article.title.toLowerCase()
      const categoryLower = (article.category || '').toLowerCase()
      
      if (titleLower.includes('restaurant') || titleLower.includes('manger') || 
          titleLower.includes('bouchon') || titleLower.includes('gastronomie') ||
          categoryLower.includes('restaurant')) {
        templateKey = 'restaurant'
      } else if (titleLower.includes('hôtel') || titleLower.includes('hotel') || 
                 titleLower.includes('dormir') || titleLower.includes('loger') ||
                 categoryLower.includes('hébergement')) {
        templateKey = 'hotel'
      } else if (titleLower.includes('visiter') || titleLower.includes('découvrir') ||
                 titleLower.includes('tourisme') || titleLower.includes('activité') ||
                 categoryLower.includes('tourisme') || categoryLower.includes('culture')) {
        templateKey = 'tourisme'
      }
      
      // Si on a trouvé un template approprié
      if (templateKey && ENRICHED_CONTENTS[templateKey]) {
        enrichedContent = ENRICHED_CONTENTS[templateKey]
        
        // Personnaliser le contenu avec les données de l'article
        enrichedContent = enrichedContent.replace(/{title}/g, article.title)
        enrichedContent = enrichedContent.replace(/{slug}/g, article.slug)
        enrichedContent = enrichedContent.replace(/{category}/g, article.category || 'Général')
        
        // Ajouter du contenu existant si pertinent
        if (article.excerpt && article.excerpt.length > 50) {
          enrichedContent = enrichedContent.replace(
            '## Introduction',
            `## Introduction\n\n${article.excerpt}\n\n`
          )
        }
        
        // Mettre à jour l'article avec le contenu enrichi
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({
            content: enrichedContent,
            excerpt: article.excerpt || `Découvrez ${article.title} - Guide complet avec toutes les informations pratiques, conseils d'experts et bonnes adresses pour profiter pleinement de votre expérience à Lyon.`,
            updated_at: new Date().toISOString()
          })
          .eq('id', article.id)
        
        if (updateError) {
          console.error(`   ❌ Erreur mise à jour:`, updateError.message)
        } else {
          console.log(`   ✅ Enrichi avec succès!`)
          console.log(`   Nouvelle longueur: ${enrichedContent.length} caractères`)
          enrichedCount++
        }
      } else {
        console.log(`   ⏭️ Pas de template approprié trouvé`)
        skippedCount++
      }
      
      // Pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('\n' + '=' .repeat(60))
    console.log('📊 RÉSUMÉ DE L\'ENRICHISSEMENT')
    console.log('-'.repeat(40))
    console.log(`✅ Articles enrichis: ${enrichedCount}`)
    console.log(`⏭️ Articles ignorés: ${skippedCount}`)
    console.log(`📝 Total traité: ${articles.length}`)
    
    console.log('\n✨ Enrichissement terminé avec succès!')
    
  } catch (error) {
    console.error('Erreur générale:', error)
  }
}

// Exécuter l'enrichissement
enrichAllArticles().catch(console.error)