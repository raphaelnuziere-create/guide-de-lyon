# 📋 Guide de Lyon - Business Model & Workflows SAAS

*Documentation officielle mise à jour - Version finale*

## 🎯 **MODÈLE ÉCONOMIQUE**

### Plans d'Abonnement
- **BASIC (Gratuit)** : 1 photo, 3 événements/mois → **visible uniquement sur page entreprise**
- **PRO (19€/mois)** : 6 photos, 3 événements/mois → **visible page d'accueil**
- **EXPERT (29€/mois)** : 10 photos, 6 événements/mois → **page d'accueil + newsletter**

### Logique de Visibilité Événements
```
BASIC → events.visibility = 'establishment_only'
PRO → events.visibility = 'homepage' 
EXPERT → events.visibility = 'newsletter'
```

### Revenue Projection
- 500 entreprises PRO × 19€ = 9.5K€ MRR
- 200 entreprises EXPERT × 29€ = 5.8K€ MRR  
- **Total : 15.3K€ MRR = 183K€ ARR**

---

## 🔄 **WORKFLOWS UTILISATEURS**

### 1. Parcours Professionnel
```
Inscription → Sélection Plan → Dashboard → Gestion Contenu → Analytics → Upgrade
```

#### Dashboard Pro Features
- **Gestion Photos** : Upload selon limites plan
- **Création Événements** : Quota mensuel par plan
- **Analytics** : Vues, clics téléphone/site web
- **Upgrade Prompts** : Incitations contextuelles

### 2. Parcours Visiteur Public
```
Annuaire par Catégories → Fiche Établissement → Contact Direct (email/tel)
```

#### Contact Utilisateurs
- **Pas de système de messagerie intégré**
- Contact direct via coordonnées affichées sur fiche

---

## 🏗️ **ARCHITECTURE SYSTÈME**

### Tables Principales
- `establishments` : Données business + plan subscription
- `establishment_media` : Photos avec quotas par plan
- `events` : Événements avec visibilité conditionnelle
- `articles` : Blog + actualités Lyon automatisées

### Services Intégrés
- **Paiements** : Stripe (checkout + webhooks)
- **Email Marketing** : Brevo (newsletters segmentées)
- **Storage** : Supabase (photos + médias)
- **Analytics** : Tracking vues/clics custom

---

## 📅 **SYSTÈME ÉVÉNEMENTS (Priorité #1)**

### Schema Database
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  price DECIMAL(10,2),
  image_url VARCHAR(500),
  visibility VARCHAR(20) CHECK (visibility IN ('establishment_only', 'homepage', 'newsletter')),
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Quotas par Plan
- **BASIC** : 3 événements/mois, `visibility = 'establishment_only'`
- **PRO** : 3 événements/mois, `visibility = 'homepage'`
- **EXPERT** : 6 événements/mois, `visibility = 'newsletter'`

---

## 📰 **CONTENU AUTOMATISÉ**

### Blog & Actualités
- ✅ **Blog system** : Articles manuels + templates
- ✅ **Scraping 20 Minutes Lyon** : News automatiques
- ✅ **Newsletter integration** : Content distribution

### Sources de Contenu
- Articles rédigés manuellement
- Actualités Lyon (20 Minutes RSS)
- Événements entreprises (selon plan)

---

## 🔧 **INFRASTRUCTURE TECHNIQUE**

### Stack Technologique
- **Frontend** : Next.js 15.5.2 + TypeScript + TailwindCSS
- **Backend** : Supabase + API Routes Next.js
- **Paiements** : Stripe + webhooks
- **CMS** : Migration Directus en cours
- **Email** : Brevo API
- **Storage** : Supabase Storage

### APIs Critiques
- `/api/stripe/checkout` : Gestion abonnements
- `/api/photos/upload` : Upload média avec RLS
- `/api/scraping/test-20minutes` : Actualités automatisées
- `/api/webhooks/stripe` : Sync abonnements

---

## 🎨 **UX/UI GUIDELINES**

### Différenciation Plans
- **BASIC** : Badge gris, fonctionnalités limitées
- **PRO** : Badge bleu "PRO", accès homepage
- **EXPERT** : Badge doré "EXPERT", visibilité maximale

### Incitations Upgrade
- Limites visuelles dans dashboard
- Appels à action contextuels
- Analytics pour justifier ROI

---

## ✅ **PROCHAINES ÉTAPES**

### Phase 1 : Stabilisation
1. ✅ Corriger problèmes visuels (CSS/TailwindCSS)
2. ⏳ Finaliser workflow photos (/pro/photos)
3. 🎯 **Implémenter système événements complet**

### Phase 2 : Optimisation
1. Dashboard analytics avancées
2. A/B test pricing/conversion  
3. Automatisation newsletter

### Phase 3 : Scale
1. API partenaires
2. Mobile app
3. Expansion géographique

---

**📍 Status Actuel :** Migration Directus + implémentation events system
**🎯 Objectif Immédiat :** Démo fonctionnelle complète pour prospects
**💰 Target Business :** 15K€ MRR d'ici 12 mois

---
*Dernière mise à jour : 2025-01-14*
*Référence complète pour development et business decisions*