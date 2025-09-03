# 📋 PLAN DE DÉVELOPPEMENT ET MISE EN PRODUCTION - Guide de Lyon V2

## 🎯 Objectif Principal
Finaliser et déployer le Guide de Lyon V2 sur l'URL de production **www.guide-de-lyon.fr** avec toutes les fonctionnalités opérationnelles dans les 2 prochaines semaines.

---

## 📅 PHASE 1 : Configuration Production Immédiate (Jour 1-2)

### 1.1 Migration du domaine vers Vercel ⚡ URGENT
```bash
# Dans le projet guide-lyon-v2
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

# Ajouter le domaine personnalisé
vercel domains add guide-de-lyon.fr
vercel domains add www.guide-de-lyon.fr

# Configurer les DNS chez OVH ou votre registrar
# A Record: @ -> 76.76.21.21 (Vercel IP)
# CNAME: www -> cname.vercel-dns.com
```

### 1.2 Configuration Firebase Admin ⚡ URGENT
```bash
# 1. Générer la clé sur Firebase Console
# https://console.firebase.google.com/project/guide-de-lyon-b6a38/settings/serviceaccounts/adminsdk

# 2. Créer le script de configuration
cat > setup-firebase-admin.sh << 'EOF'
#!/bin/bash
echo "Configuration Firebase Admin..."

# Remplacer ces valeurs par celles du JSON téléchargé
vercel env add FIREBASE_ADMIN_PROJECT_ID production
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production

echo "Redéploiement..."
vercel --prod
EOF

chmod +x setup-firebase-admin.sh
./setup-firebase-admin.sh
```

### 1.3 Migration des données existantes
```javascript
// scripts/migrate-data-to-firebase.js
const migrateExistingData = async () => {
  // 1. Migrer les établissements de Supabase vers Firebase
  // 2. Créer les comptes merchants pour les établissements premium
  // 3. Importer les articles de blog existants
  console.log('Migration des données...');
};
```

### 1.4 Configuration SSL et sécurité
- ✅ HTTPS automatique avec Vercel
- Configurer les headers de sécurité dans `next.config.js`
- Activer la protection DDOS de Vercel

---

## 📅 PHASE 2 : Fonctionnalités Critiques (Jour 3-5)

### 2.1 Page d'accueil avec événements
**Fichier**: `/app/page.tsx`
```typescript
// Composants à créer:
- <UpcomingEvents /> // Événements à venir (Pro seulement)
- <FeaturedEvents /> // Événements mis en avant
- <EventCalendar /> // Calendrier interactif
```

### 2.2 Système de modération admin
**Fichiers à créer**:
```
/app/admin/events/
  ├── page.tsx           // Liste des événements à modérer
  ├── [id]/
  │   └── page.tsx       // Détail et modération
  └── moderation-queue.tsx // File d'attente
```

**Fonctionnalités**:
- Dashboard avec événements en attente
- Actions: Approuver / Rejeter / Demander modifications
- Notifications email automatiques aux merchants
- Statistiques de modération

### 2.3 Intégration Stripe pour les paiements
```bash
# Variables à ajouter
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

# Créer les produits dans Stripe Dashboard:
# - Plan Pro Visibilité: 19€/mois (price_xxx)
# - Plan Pro Boost: 49€/mois (price_yyy)
```

**Fichiers à créer**:
```
/app/api/stripe/
  ├── create-checkout.ts    // Créer session de paiement
  ├── webhook.ts            // Gérer les webhooks
  └── manage-subscription.ts // Gérer les abonnements
```

---

## 📅 PHASE 3 : Fonctionnalités Marketing (Jour 6-8)

### 3.1 Publication automatique réseaux sociaux
**API à intégrer**:
- Facebook Graph API
- Instagram Basic Display API

```typescript
// /lib/social-media/publisher.ts
export class SocialMediaPublisher {
  async publishEvent(event: Event) {
    // 1. Générer le contenu
    // 2. Optimiser les images
    // 3. Publier sur Facebook
    // 4. Publier sur Instagram
    // 5. Tracker dans Firebase
  }
}
```

### 3.2 Génération articles SEO mensuels
```typescript
// /app/api/blog/generate-monthly/route.ts
export async function POST() {
  // 1. Sélectionner les merchants Pro Boost
  // 2. Collecter leurs événements du mois
  // 3. Générer article avec OpenAI
  // 4. Publier automatiquement
  // 5. Envoyer notification
}
```

### 3.3 Système de newsletter
- Intégration Brevo/SendGrid
- Templates emails responsive
- Segmentation des audiences
- Tracking des performances

---

## 📅 PHASE 4 : Optimisation Performance (Jour 9-10)

### 4.1 Optimisations techniques
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'firebase'],
  }
}
```

### 4.2 Mise en cache
- Redis pour cache API (Vercel KV)
- ISR pour pages statiques
- Edge caching pour assets

### 4.3 SEO technique
```typescript
// Fichiers à créer:
/app/sitemap.xml       // Génération dynamique
/app/robots.txt        // Règles crawlers
/public/schema.json    // Structured data
```

---

## 📅 PHASE 5 : Tests et Monitoring (Jour 11-12)

### 5.1 Tests E2E avec Playwright
```typescript
// tests/e2e/
├── merchant-journey.spec.ts  // Parcours merchant complet
├── event-creation.spec.ts    // Création événement
├── payment-flow.spec.ts      // Process paiement
└── admin-moderation.spec.ts  // Modération admin
```

### 5.2 Monitoring production
```bash
# Sentry pour error tracking
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production

# Analytics
vercel analytics enable
```

### 5.3 Tests de charge
- Tester avec 1000 utilisateurs simultanés
- Optimiser les requêtes Firestore
- Configurer l'auto-scaling

---

## 📅 PHASE 6 : Migration Finale (Jour 13-14)

### 6.1 Checklist pré-migration
- [ ] Backup complet des données
- [ ] Tests en environnement staging
- [ ] Documentation utilisateurs prête
- [ ] Support technique briefé
- [ ] Plan de rollback préparé

### 6.2 Migration DNS
```bash
# 1. Vérifier que tout fonctionne sur Vercel
curl https://guide-lyon-v2.vercel.app

# 2. Mettre à jour les DNS
# A: @ -> 76.76.21.21
# CNAME: www -> cname.vercel-dns.com

# 3. Attendre propagation (2-24h)
# 4. Vérifier SSL
```

### 6.3 Communications
- Email aux merchants existants
- Post sur réseaux sociaux
- Article de blog annonce

---

## 🚀 ACTIONS IMMÉDIATES (À FAIRE AUJOURD'HUI)

### Étape 1: Configurer le domaine
```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2
vercel domains add guide-de-lyon.fr
vercel domains add www.guide-de-lyon.fr
```

### Étape 2: Variables d'environnement critiques
```bash
# Firebase Admin (obtenir depuis Firebase Console)
vercel env add FIREBASE_ADMIN_PROJECT_ID production
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production

# Redéployer
vercel --prod
```

### Étape 3: Créer la page d'accueil avec événements
```typescript
// app/page.tsx - Ajouter section événements
import { EventsSection } from '@/components/homepage/events-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <EventsSection />  // Nouveau !
      <DirectorySection />
      <NewsletterSection />
    </>
  )
}
```

---

## 📊 KPIs de Succès

### Semaine 1
- ✅ Site accessible sur www.guide-de-lyon.fr
- ✅ 10 premiers merchants inscrits
- ✅ 20 événements créés
- ✅ Système de paiement fonctionnel

### Semaine 2
- ✅ 50 merchants actifs
- ✅ 100 événements publiés
- ✅ 5 articles SEO générés
- ✅ 1000 visiteurs uniques/jour

### Mois 1
- ✅ 200 merchants
- ✅ 10 abonnements Pro
- ✅ 500 événements
- ✅ ROI positif

---

## 🛠️ Stack Technique Finale

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + Lucide Icons
- **State**: React Context + Firebase Realtime

### Backend
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth
- **Storage**: Firebase Storage
- **Functions**: Vercel Edge Functions

### Infrastructure
- **Hosting**: Vercel Pro
- **CDN**: Vercel Edge Network
- **DNS**: OVH → Vercel
- **SSL**: Let's Encrypt (auto)

### Services Tiers
- **Paiements**: Stripe
- **Email**: Brevo/SendGrid
- **Analytics**: Vercel Analytics + GA4
- **Monitoring**: Sentry
- **Social**: Facebook/Instagram API

---

## 🔄 Workflow de Développement

### Branches Git
```bash
main          → Production (www.guide-de-lyon.fr)
staging       → Test (staging.guide-de-lyon.fr)
develop       → Développement
feature/*     → Nouvelles fonctionnalités
hotfix/*      → Corrections urgentes
```

### Process de déploiement
1. Développer sur `feature/xxx`
2. PR vers `develop`
3. Tests automatiques
4. Merge vers `staging`
5. Tests manuels
6. Merge vers `main`
7. Déploiement auto sur Vercel

---

## 📞 Support et Escalade

### Niveau 1 - Incidents mineurs
- Bugs UI
- Questions utilisateurs
→ Équipe support

### Niveau 2 - Incidents majeurs
- Paiements KO
- Site down
→ Dev senior (vous)

### Niveau 3 - Incidents critiques
- Fuite de données
- Hack/attaque
→ Équipe sécurité + CEO

---

## ✅ Checklist Quotidienne

### Matin (9h)
- [ ] Vérifier monitoring (Sentry, Analytics)
- [ ] Modérer événements en attente
- [ ] Répondre aux merchants

### Midi (12h)
- [ ] Deploy staging si nouvelles features
- [ ] Tests sur staging

### Soir (18h)
- [ ] Deploy production si validé
- [ ] Backup données
- [ ] Rapport quotidien

---

## 📈 Budget Estimé

### Coûts mensuels
- Vercel Pro: 20€
- Firebase: 25€ (Blaze plan)
- Stripe: 2% des transactions
- Brevo: 20€ (20k emails/mois)
- Domaine: 15€/an
**Total: ~70€/mois**

### Revenus estimés
- 10 Pro Visibilité × 19€ = 190€
- 5 Pro Boost × 49€ = 245€
**Total: 435€/mois**

**ROI: +365€/mois dès le 1er mois**

---

## 🎯 Prochaines Actions Concrètes

1. **MAINTENANT**: Ajouter le domaine sur Vercel
2. **Dans 1h**: Configurer Firebase Admin
3. **Aujourd'hui**: Créer page événements homepage
4. **Demain**: Implémenter modération admin
5. **Cette semaine**: Intégrer Stripe

---

**Document créé par**: Claude (Senior Dev)
**Date**: 3 Septembre 2025
**Version**: 1.0.0
**Statut**: EN COURS D'EXÉCUTION