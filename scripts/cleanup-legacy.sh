#!/bin/bash

echo "🧹 NETTOYAGE GUIDE-LYON V3"
echo "=========================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de confirmation
confirm() {
    read -p "$1 (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

echo -e "${BLUE}Ce script va nettoyer votre projet pour la migration vers Directus${NC}"
echo "Il va supprimer:"
echo "  • Les dépendances Supabase"
echo "  • Les dépendances Firebase" 
echo "  • Les fichiers de configuration obsolètes"
echo "  • Les composants legacy"
echo

if ! confirm "Voulez-vous continuer ?"; then
    echo "❌ Nettoyage annulé"
    exit 0
fi

echo -e "\n${YELLOW}⚠️  SAUVEGARDE AUTOMATIQUE...${NC}"
BACKUP_DIR="backup_legacy_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR
echo "📁 Sauvegarde créée: $BACKUP_DIR"

# Sauvegarder les fichiers importants
cp -r lib/ $BACKUP_DIR/ 2>/dev/null || true
cp -r components/ $BACKUP_DIR/ 2>/dev/null || true
cp package.json $BACKUP_DIR/ 2>/dev/null || true

echo -e "\n${GREEN}1. SUPPRESSION DES DÉPENDANCES OBSOLÈTES${NC}"

# Supprimer les dépendances Supabase
echo "🗑️  Suppression des packages Supabase..."
npm uninstall @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/auth-ui-react @supabase/auth-ui-shared @supabase/ssr 2>/dev/null || true

# Supprimer Firebase
echo "🗑️  Suppression des packages Firebase..."
npm uninstall firebase firebase-admin 2>/dev/null || true

echo -e "\n${GREEN}2. INSTALLATION DES NOUVELLES DÉPENDANCES${NC}"

# Installer Directus SDK si pas déjà fait
echo "📦 Installation @directus/sdk..."
npm install @directus/sdk

# Installer les utilitaires supplémentaires
echo "📦 Installation des utilitaires..."
npm install lucide-react clsx tailwind-merge

echo -e "\n${GREEN}3. NETTOYAGE DES FICHIERS OBSOLÈTES${NC}"

# Supprimer les fichiers de configuration obsolètes
echo "🗑️  Suppression des configs obsolètes..."
rm -f lib/supabase.ts 2>/dev/null || true
rm -f lib/firebase.ts 2>/dev/null || true
rm -f lib/auth/supabase-auth.ts 2>/dev/null || true
rm -f lib/auth/firebase-auth.ts 2>/dev/null || true

# Nettoyer les composants obsolètes (avec confirmation)
if confirm "Supprimer les composants Supabase obsolètes ?"; then
    find components/ -name "*supabase*" -type f -delete 2>/dev/null || true
    find app/ -name "*supabase*" -type f -delete 2>/dev/null || true
    echo "✅ Composants Supabase supprimés"
fi

echo -e "\n${GREEN}4. MISE À JOUR DE LA CONFIGURATION${NC}"

# Créer un nouveau service Directus propre
echo "📝 Création du service Directus unifié..."
cat > lib/directus.ts << 'EOF'
import { createDirectus, rest, authentication, readItems, createItem, updateItem, deleteItem } from '@directus/sdk';

// Configuration Directus
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

if (!directusUrl) {
  throw new Error('NEXT_PUBLIC_DIRECTUS_URL must be defined');
}

// Client Directus
export const directus = createDirectus(directusUrl)
  .with(rest())
  .with(authentication());

// Types
export interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  plan: 'basic' | 'pro' | 'expert';
  badge_type?: 'verified' | 'expert' | null;
  display_priority: number;
  address?: string;
  postal_code?: string;
  city: string;
  phone?: string;
  website?: string;
  email?: string;
  views_count: number;
  gallery?: any[];
  status: string;
  date_created: string;
  date_updated: string;
}

export interface Event {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  event_date: string;
  end_date?: string;
  location?: string;
  price?: number;
  visible_homepage: boolean;
  visible_newsletter: boolean;
  visible_social: boolean;
  status: string;
  date_created: string;
}

// Plans et quotas
export const PLANS = {
  basic: {
    name: 'Basic',
    price: 0,
    photos: 1,
    events: 3,
    homepage: false,
    newsletter: false,
    social: false,
    badge: null,
    priority: 3
  },
  pro: {
    name: 'Pro', 
    price: 19,
    photos: 6,
    events: 3,
    homepage: true,
    newsletter: true,
    social: false,
    badge: 'verified',
    priority: 2
  },
  expert: {
    name: 'Expert',
    price: 49,
    photos: 10,
    events: 5,
    homepage: true,
    newsletter: true,
    social: true,
    badge: 'expert',
    priority: 1
  }
} as const;

export default directus;
EOF

echo "✅ Service Directus créé"

# Mettre à jour les variables d'environnement
echo -e "\n${GREEN}5. MISE À JOUR DES VARIABLES D'ENVIRONNEMENT${NC}"
echo "📝 Ajout des nouvelles variables dans .env.local..."

# Ajouter les nouvelles variables si elles n'existent pas
if ! grep -q "DIRECTUS_UNIFIED" .env.local 2>/dev/null; then
    cat >> .env.local << 'EOF'

# ============================================
# 🎯 GUIDE-LYON V3 - DIRECTUS UNIFIÉ
# ============================================
# Plus de Supabase ni Firebase - Directus uniquement

# Directus (déjà configuré)
# NEXT_PUBLIC_DIRECTUS_URL=https://guide-lyon-cms.directus.app
# DIRECTUS_ADMIN_EMAIL=admin@guide-lyon.fr  
# DIRECTUS_ADMIN_PASSWORD=AdminPassword123!

# Flag de migration
DIRECTUS_UNIFIED=true
LEGACY_CLEANED=true

# Plans tarifaires v3
PLAN_BASIC_PHOTOS=1
PLAN_BASIC_EVENTS=3
PLAN_PRO_PHOTOS=6
PLAN_PRO_EVENTS=3  
PLAN_PRO_PRICE=19
PLAN_EXPERT_PHOTOS=10
PLAN_EXPERT_EVENTS=5
PLAN_EXPERT_PRICE=49

EOF
    echo "✅ Variables d'environnement mises à jour"
fi

echo -e "\n${GREEN}6. MISE À JOUR DU PACKAGE.JSON${NC}"

# Ajouter des scripts utiles
echo "📝 Ajout de scripts utiles..."
npm pkg set scripts.export-data="node scripts/export-supabase-data.js"
npm pkg set scripts.migrate-directus="node scripts/migrate-to-directus.js" 
npm pkg set scripts.cleanup="bash scripts/cleanup-legacy.sh"
npm pkg set scripts.dev:clean="rm -rf .next && npm run dev"

echo -e "\n${GREEN}7. GÉNÉRATION DU GUIDE DE DÉPLOIEMENT${NC}"

cat > GUIDE-DEPLOYMENT-V3.md << 'EOF'
# 🚀 GUIDE DÉPLOIEMENT - GUIDE LYON V3

## ✅ CHECKLIST AVANT DÉPLOIEMENT

### 1. Configuration Directus Cloud
- [ ] Collections créées (businesses, events, articles)
- [ ] Hooks installés (quotas et validation)
- [ ] Permissions configurées par plan
- [ ] Données migrées depuis Supabase

### 2. Variables d'environnement Vercel
```bash
# Directus
NEXT_PUBLIC_DIRECTUS_URL=https://guide-lyon-cms.directus.app
DIRECTUS_ADMIN_EMAIL=admin@guide-lyon.fr
DIRECTUS_ADMIN_PASSWORD=AdminPassword123!

# Stripe (tarifs v3)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Prix IDs Stripe
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_pro_yearly  
NEXT_PUBLIC_STRIPE_PRICE_EXPERT_MONTHLY=price_expert_monthly
NEXT_PUBLIC_STRIPE_PRICE_EXPERT_YEARLY=price_expert_yearly

# Autres services (déjà configurés)
BREVO_API_KEY=...
OPENAI_API_KEY=...
CLAUDE_API_KEY=...
GOOGLE_PLACES_API_KEY=...
```

### 3. Tests avant production
- [ ] Page `/tarifs` fonctionne
- [ ] Page `/annuaire-v3` affiche les établissements
- [ ] Badges et priorités corrects (Expert > Pro > Basic)
- [ ] Stripe checkout fonctionne
- [ ] Quotas respectés (photos et événements)

### 4. Déploiement
```bash
# Vérifier les builds
npm run build

# Déployer sur Vercel
vercel --prod

# Tester en production
curl https://www.guide-de-lyon.fr/annuaire-v3
```

## 🎯 URLS À TESTER
- https://www.guide-de-lyon.fr/tarifs
- https://www.guide-de-lyon.fr/annuaire-v3  
- https://www.guide-de-lyon.fr/api/stripe/create-checkout-session

## 📊 DIFFÉRENCES V2 → V3

| Feature | v2 (Supabase) | v3 (Directus) |
|---------|---------------|---------------|
| Auth | Supabase Auth | Directus Auth |
| DB | Supabase | Directus Cloud |
| Plans | Incohérents | Basic(0€), Pro(19€), Expert(49€) |
| Quotas | Manuel | Auto-validés par hooks |
| Affichage | Pas de priorité | Expert > Pro > Basic |
| Badges | Basique | Verified, Expert avec couleurs |

EOF

echo -e "\n${GREEN}✅ NETTOYAGE TERMINÉ !${NC}"
echo "=============================="
echo -e "${YELLOW}📁 Sauvegarde:${NC} $BACKUP_DIR"
echo -e "${YELLOW}📖 Guide:${NC} GUIDE-DEPLOYMENT-V3.md"
echo
echo -e "${BLUE}🎯 PROCHAINES ÉTAPES:${NC}"
echo "1. Configurer Directus Cloud avec le schéma"
echo "2. Exécuter: npm run export-data"
echo "3. Exécuter: npm run migrate-directus" 
echo "4. Tester: npm run dev"
echo "5. Déployer: vercel --prod"
echo
echo -e "${GREEN}🚀 Votre Guide Lyon v3 est prêt !${NC}"