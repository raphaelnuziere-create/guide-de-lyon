# 🚀 Plan de Développement - Plateforme Professionnelle Guide de Lyon

## 📋 Vision Produit

**Objectif Principal** : Créer une plateforme SaaS complète permettant aux professionnels lyonnais (restaurants, hôtels, commerces, lieux culturels) de gérer leur présence en ligne et leurs événements, avec un modèle de monétisation par abonnement.

## 🎯 Architecture des Plans Tarifaires

### Plan GRATUIT - "Découverte"
- **0€/mois**
- Fiche établissement basique
- 1 photo maximum
- Horaires d'ouverture
- Contact (téléphone, email)
- Position sur la carte
- Visible dans l'annuaire (en bas de liste)

### Plan ESSENTIEL - "Visibilité"
- **19€/mois**
- Tout du plan Gratuit +
- 10 photos
- Description détaillée (1000 caractères)
- Liens réseaux sociaux
- **1 événement/mois** dans le calendrier
- Badge "Établissement Vérifié"
- Statistiques basiques (vues)
- Position améliorée dans l'annuaire

### Plan PREMIUM - "Performance"
- **49€/mois**
- Tout du plan Essentiel +
- Photos illimitées
- Vidéo de présentation
- **5 événements/mois** dans le calendrier
- Menu/Carte téléchargeable (PDF)
- Widget de réservation
- Réponse aux avis
- Analytics avancés
- Position prioritaire dans l'annuaire
- Mise en avant sur la page d'accueil (rotation)

### Plan ENTREPRISE - "Excellence"
- **99€/mois**
- Tout du plan Premium +
- **Événements illimités**
- Multi-établissements (jusqu'à 5)
- API access
- Bannière publicitaire sur le site
- Article blog sponsorisé/mois
- Support prioritaire
- Formation personnalisée
- Événements épinglés en tête du calendrier

## 🏗️ Phase 1 : Infrastructure de Base (Semaine 1-2)

### 1.1 Base de données Supabase
```sql
-- Tables principales
- establishments (établissements)
  - id, name, slug, description, address, coordinates
  - owner_id, plan_id, status, created_at, updated_at
  - features (JSON): horaires, services, équipements
  
- subscription_plans (plans d'abonnement)
  - id, name, price, features (JSON)
  - max_photos, max_events, position_boost
  
- subscriptions (abonnements actifs)
  - id, establishment_id, plan_id, stripe_subscription_id
  - status, current_period_start, current_period_end
  
- events (événements)
  - id, establishment_id, title, description, date_start, date_end
  - category, image_url, visibility_level, is_featured
  - max_participants, current_participants
  
- establishment_media (photos/vidéos)
  - id, establishment_id, type, url, caption, order
  
- analytics (statistiques)
  - establishment_id, date, views, clicks, reservations
```

### 1.2 Architecture technique
- **Frontend** : Next.js 14 avec App Router
- **Auth** : Supabase Auth (déjà en place)
- **Paiement** : Stripe (déjà configuré)
- **Storage** : Supabase Storage pour médias
- **Maps** : Mapbox/Leaflet pour la carte interactive
- **Calendar** : FullCalendar pour l'affichage événements

## 🎨 Phase 2 : Parcours Professionnel (Semaine 2-3)

### 2.1 Onboarding des professionnels
```
/pro/inscription
  ├── Étape 1: Création compte
  ├── Étape 2: Infos établissement
  ├── Étape 3: Upload photos + validation
  ├── Étape 4: Choix du plan
  └── Étape 5: Paiement Stripe
```

### 2.2 Dashboard Professionnel
```
/pro/dashboard
  ├── Vue d'ensemble (stats, alertes)
  ├── Mon établissement
  │   ├── Informations
  │   ├── Photos/Vidéos
  │   ├── Horaires
  │   └── Services
  ├── Événements
  │   ├── Créer
  │   ├── Calendrier
  │   └── Participants
  ├── Statistiques
  │   ├── Vues/Clics
  │   ├── Sources trafic
  │   └── Conversions
  ├── Avis clients
  └── Facturation
```

### 2.3 Fonctionnalités par plan

#### Composants conditionnels
```typescript
// Exemple de gestion des features
const PLAN_FEATURES = {
  FREE: {
    maxPhotos: 1,
    maxEvents: 0,
    analytics: false,
    featured: false
  },
  ESSENTIAL: {
    maxPhotos: 10,
    maxEvents: 1,
    analytics: 'basic',
    featured: false
  },
  PREMIUM: {
    maxPhotos: -1, // illimité
    maxEvents: 5,
    analytics: 'advanced',
    featured: 'rotation'
  },
  ENTERPRISE: {
    maxPhotos: -1,
    maxEvents: -1,
    analytics: 'full',
    featured: 'priority'
  }
}
```

## 📅 Phase 3 : Système d'Événements (Semaine 3-4)

### 3.1 Gestion des événements (côté Pro)
- Formulaire de création avec:
  - Titre, description riche
  - Date/heure début et fin
  - Catégorie (Concert, Expo, Dégustation, Promo, etc.)
  - Image de couverture
  - Nombre de places (optionnel)
  - Lien billetterie externe
  - Tags pour le SEO

### 3.2 Calendrier public
```
Page d'accueil:
┌─────────────────────────────────────┐
│  Événements à Lyon cette semaine    │
├─────────────────────────────────────┤
│  [Calendrier interactif]            │
│  - Vue mois/semaine/jour            │
│  - Filtres par catégorie            │
│  - Événements premium en surbrillance│
│  - Popup détails au clic            │
└─────────────────────────────────────┘
```

### 3.3 Algorithme de visibilité
```javascript
// Scoring pour l'ordre d'affichage
function calculateEventScore(event, subscription) {
  let score = 0;
  
  // Plan de base
  switch(subscription.plan) {
    case 'ENTERPRISE': score += 1000; break;
    case 'PREMIUM': score += 500; break;
    case 'ESSENTIAL': score += 100; break;
  }
  
  // Proximité temporelle
  const daysUntilEvent = getDaysUntil(event.date);
  if (daysUntilEvent <= 7) score += 200;
  
  // Popularité
  score += event.participants * 10;
  
  // Featured (entreprise only)
  if (event.is_featured) score += 2000;
  
  return score;
}
```

## 🎯 Phase 4 : Annuaire Intelligent (Semaine 4-5)

### 4.1 Page annuaire améliorée
```
/annuaire
  ├── Filtres avancés
  │   ├── Catégorie
  │   ├── Quartier
  │   ├── Prix moyen
  │   ├── Services (wifi, terrasse, etc.)
  │   └── Ouvert maintenant
  ├── Tri
  │   ├── Pertinence (selon plan)
  │   ├── Popularité
  │   ├── Note moyenne
  │   └── Distance
  └── Affichage
      ├── Liste
      ├── Grille
      └── Carte
```

### 4.2 Fiche établissement
Design adaptatif selon le plan:
- **Gratuit** : Infos minimales, CTA limités
- **Essentiel** : Galerie photos, horaires détaillés
- **Premium** : Vidéo, menu, widget réservation
- **Entreprise** : Full experience, bannière pub

## 📊 Phase 5 : Analytics & Reporting (Semaine 5-6)

### 5.1 Dashboard Analytics Pro
- **Métriques clés** :
  - Vues fiche établissement
  - Clics téléphone/site web
  - Taux de conversion
  - Origine du trafic
  - Performance événements

### 5.2 Rapports automatisés
- Email hebdomadaire avec performances
- Comparaison avec période précédente
- Recommandations d'optimisation
- Benchmark secteur (anonymisé)

## 💰 Phase 6 : Monétisation & Growth (Semaine 6-7)

### 6.1 Stratégies de conversion
1. **Trial Premium** : 14 jours gratuits du plan Premium
2. **Upgrade prompts** : Suggestions contextuelles
3. **Seasonal offers** : -20% pour engagement annuel
4. **Referral program** : 1 mois offert par parrainage

### 6.2 Outils marketing intégrés
- Email campaigns (via Brevo)
- Social media scheduler
- SEO optimizer pour fiches
- Review management system

## 🔧 Phase 7 : Optimisations & Scale (Semaine 7-8)

### 7.1 Performance
- Cache Redis pour les requêtes fréquentes
- CDN pour les médias
- Lazy loading des images
- Server-side rendering optimisé

### 7.2 Features avancées
- Chat en temps réel pro/client
- Système de réservation natif
- Programme de fidélité
- Intégration Google My Business

## 📱 Phase 8 : Mobile & PWA (Semaine 8-9)

### 8.1 Application mobile
- PWA pour installation mobile
- Notifications push événements
- Géolocalisation pour "autour de moi"
- QR codes pour les pros

## 🚦 Métriques de Succès

### KPIs Business
- **MRR** (Monthly Recurring Revenue)
- **Taux de conversion** Free → Paid
- **Churn rate** mensuel
- **LTV** (Lifetime Value) par client
- **CAC** (Customer Acquisition Cost)

### KPIs Produit
- **Établissements actifs** par plan
- **Événements créés** par mois
- **Taux d'engagement** utilisateurs
- **NPS** (Net Promoter Score)

## 🎬 Prochaines Actions Immédiates

### Semaine 1
1. ✅ Créer les tables Supabase
2. ✅ Implémenter les plans d'abonnement
3. ✅ Développer l'onboarding pro
4. ✅ Intégrer Stripe Checkout

### Semaine 2
1. ⏳ Dashboard pro basique
2. ⏳ Upload médias avec limitations
3. ⏳ Système d'événements
4. ⏳ Calendrier homepage

### Quick Wins
- Page /pro avec les plans et pricing
- Formulaire inscription pro
- Email de bienvenue automatique
- Badge "Vérifié" pour les payants

## 💡 Innovations Possibles

1. **AI Assistant** : Génération auto de descriptions
2. **Virtual Tours** : Visites 360° (Premium+)
3. **Dynamic Pricing** : Tarifs événements variables
4. **Marketplace** : Vente de produits locaux
5. **Loyalty Network** : Points inter-établissements

## 🔒 Considérations Techniques

### Sécurité
- Row Level Security Supabase
- Validation des uploads
- Rate limiting API
- RGPD compliance

### Scalabilité
- Architecture microservices ready
- Queue system pour tâches lourdes
- Auto-scaling infrastructure
- Monitoring avec Sentry

---

## 📌 Résumé Exécutif

**Objectif Q1 2025** : 
- 100 établissements inscrits
- 30% taux conversion Free→Paid
- 2000€ MRR

**Stack validé** :
- Next.js + Supabase + Stripe ✅
- Brevo pour emails ✅
- Vercel pour hosting ✅

**Priorité absolue** :
1. Onboarding fluide
2. Valeur immédiate (visibilité)
3. Dashboard simple mais puissant

Le projet Guide de Lyon peut devenir **LA référence** pour les professionnels lyonnais en combinant annuaire, événements et outils marketing dans une plateforme SaaS moderne et accessible.