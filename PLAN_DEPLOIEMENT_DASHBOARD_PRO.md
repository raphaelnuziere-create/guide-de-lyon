# Plan de Déploiement Dashboard Pro - Guide de Lyon

## 📊 Phase 1 : Structure de Base de Données (Priorité 1)

### 1.1 Migration de la table `establishments`
```sql
-- Nouveaux champs à ajouter
ALTER TABLE establishments ADD COLUMN IF NOT EXISTS 
  plan VARCHAR(20) DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'expert')),
  plan_expires_at TIMESTAMP,
  plan_billing_cycle VARCHAR(20) CHECK (plan_billing_cycle IN ('monthly', 'yearly')),
  
  -- Compteurs et limites
  photos_count INTEGER DEFAULT 0,
  events_this_month INTEGER DEFAULT 0,
  events_reset_date DATE DEFAULT CURRENT_DATE,
  
  -- Vérification
  vat_number VARCHAR(50),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  
  -- Statistiques
  views_this_month INTEGER DEFAULT 0,
  clicks_phone INTEGER DEFAULT 0,
  clicks_website INTEGER DEFAULT 0,
  
  -- Paiement
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  
  -- Bonus annuel
  blog_articles_remaining INTEGER DEFAULT 0;
```

### 1.2 Table `events`
```sql
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_start TIMESTAMP NOT NULL,
  date_end TIMESTAMP,
  
  -- Diffusion selon le plan
  show_on_homepage BOOLEAN DEFAULT FALSE,
  show_in_newsletter BOOLEAN DEFAULT FALSE,
  show_on_social BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 1.3 Table `establishment_photos`
```sql
CREATE TABLE IF NOT EXISTS establishment_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(255),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 1.4 Table `subscriptions_history`
```sql
CREATE TABLE IF NOT EXISTS subscriptions_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id),
  plan VARCHAR(20) NOT NULL,
  billing_cycle VARCHAR(20),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  stripe_payment_intent_id VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Phase 2 : Backend - API et Logique Métier

### 2.1 Service de gestion des plans (`/app/lib/services/planService.ts`)
```typescript
export class PlanService {
  // Limites par plan
  static readonly LIMITS = {
    basic: { photos: 1, events: 3, diffusion: ['page'] },
    pro: { photos: 6, events: 3, diffusion: ['page', 'homepage', 'newsletter'] },
    expert: { photos: 10, events: 6, diffusion: ['page', 'homepage', 'newsletter', 'social'] }
  };

  // Vérifier si une action est autorisée
  static async canPerformAction(establishmentId: string, action: string) {}
  
  // Incrémenter les compteurs
  static async incrementCounter(establishmentId: string, counter: string) {}
  
  // Reset mensuel des compteurs
  static async resetMonthlyCounters() {}
  
  // Upgrade/Downgrade
  static async changePlan(establishmentId: string, newPlan: string) {}
}
```

### 2.2 API Routes (`/app/api/pro/`)
```
/api/pro/
  ├── dashboard/route.ts       # GET données dashboard
  ├── plan/route.ts            # GET/POST gestion plan
  ├── photos/route.ts          # CRUD photos avec vérification limites
  ├── events/route.ts          # CRUD événements avec compteur
  ├── stats/route.ts           # GET statistiques
  ├── verification/route.ts    # POST vérification TVA
  └── subscription/route.ts    # POST gestion abonnement Stripe
```

### 2.3 Middleware de vérification (`/app/middleware/planLimits.ts`)
```typescript
export async function checkPlanLimits(req: Request) {
  // Vérifier les limites avant chaque action
  // Exemples:
  // - Upload photo: vérifier photos_count < limite
  // - Créer événement: vérifier events_this_month < limite
  // - Diffusion: vérifier les canaux autorisés
}
```

## 💳 Phase 3 : Intégration Paiement Stripe

### 3.1 Configuration Stripe
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_EXPERT_MONTHLY=price_xxx
STRIPE_PRICE_EXPERT_YEARLY=price_xxx
```

### 3.2 Webhook Stripe (`/app/api/stripe/webhook/route.ts`)
```typescript
// Gérer les événements:
// - payment_intent.succeeded → Activer le plan
// - subscription.updated → Mettre à jour le plan
// - subscription.deleted → Downgrade vers Basic
// - invoice.payment_failed → Notification + suspension
```

## 🔄 Phase 4 : Jobs et Automatisations

### 4.1 Cron Jobs (Vercel Cron ou Supabase Edge Functions)
```typescript
// Daily - Minuit
- Reset des compteurs d'événements (début de mois)
- Vérification des abonnements expirés
- Downgrade automatique si paiement échoué

// Hourly
- Mise à jour des statistiques (vues, clics)
- Synchronisation avec Stripe
```

### 4.2 Triggers Supabase
```sql
-- Trigger pour limiter les uploads de photos
CREATE OR REPLACE FUNCTION check_photo_limit()
-- Trigger pour vérifier les événements
CREATE OR REPLACE FUNCTION check_event_limit()
-- Trigger pour mettre à jour les compteurs
CREATE OR REPLACE FUNCTION update_counters()
```

## 🎨 Phase 5 : Frontend - Intégration Dashboard

### 5.1 Hooks personnalisés (`/app/hooks/`)
```typescript
// usePlan.ts - Récupérer le plan actuel
export function usePlan() {
  const [plan, setPlan] = useState<Plan>();
  const [limits, setLimits] = useState<Limits>();
  const [usage, setUsage] = useState<Usage>();
}

// useSubscription.ts - Gérer l'abonnement
export function useSubscription() {
  const upgrade = async (newPlan: string) => {};
  const cancel = async () => {};
}
```

### 5.2 Composants réutilisables (`/app/components/pro/`)
```
/components/pro/
  ├── PlanBadge.tsx           # Badge du plan avec vérification
  ├── UsageBar.tsx            # Barre de progression usage/limite
  ├── UpgradeCard.tsx         # Card d'upgrade contextuelle
  ├── LimitWarning.tsx        # Alerte limite atteinte
  └── FeatureLocked.tsx       # Overlay pour features verrouillées
```

## 🚀 Phase 6 : Déploiement

### 6.1 Checklist pré-déploiement
- [ ] Migrations Supabase appliquées
- [ ] Variables d'environnement Vercel configurées
- [ ] Stripe webhooks configurés
- [ ] Cron jobs activés
- [ ] Tests unitaires passés
- [ ] Tests d'intégration passés

### 6.2 Déploiement progressif
1. **Beta testing** : 5 établissements pilotes
2. **Soft launch** : Plans Pro/Expert désactivés, Basic seulement
3. **Launch complet** : Tous les plans actifs
4. **Monitoring** : Dashboard Vercel + Sentry pour les erreurs

## 📈 Phase 7 : Monitoring et Optimisation

### 7.1 KPIs à suivre
- Taux de conversion Basic → Pro
- Taux de conversion Pro → Expert
- Churn rate mensuel
- Usage moyen par plan
- Revenue per user (RPU)

### 7.2 Tableaux de bord admin
```
/admin/
  ├── dashboard           # Vue globale des KPIs
  ├── establishments      # Gestion des établissements
  ├── subscriptions       # Suivi des abonnements
  └── revenue            # Analytics revenus
```

## 🔐 Sécurité

### Points critiques à sécuriser:
1. **Vérification TVA** : API externe pour validation
2. **Webhooks Stripe** : Signature verification
3. **Rate limiting** : Sur les uploads et créations
4. **Row Level Security** : Policies Supabase strictes
5. **Audit trail** : Logger toutes les modifications de plan

## ⏱️ Timeline estimée

| Phase | Durée | Priorité |
|-------|-------|----------|
| Phase 1 - BDD | 2 jours | Critical |
| Phase 2 - Backend | 3 jours | Critical |
| Phase 3 - Stripe | 2 jours | High |
| Phase 4 - Jobs | 1 jour | High |
| Phase 5 - Frontend | 2 jours | High |
| Phase 6 - Deploy | 1 jour | Medium |
| Phase 7 - Monitoring | Ongoing | Low |

**Total : 11 jours de développement**

## 🎯 Prochaines étapes immédiates

1. Créer les migrations Supabase
2. Implémenter le service de gestion des plans
3. Connecter le dashboard aux vraies données
4. Tester avec un établissement de test
5. Déployer en beta