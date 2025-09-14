# 🚀 GUIDE LYON V3 - DÉPLOIEMENT COMPLET

## 🎯 RÉSUMÉ DU PROJET

**Guide Lyon v3** est une refonte complète avec :
- ✅ **Directus Cloud uniquement** (fin du chaos Supabase/Firebase)
- ✅ **Plans tarifaires fixes** : Basic (0€), Pro (19€), Expert (49€)
- ✅ **Quotas automatisés** avec hooks de validation
- ✅ **Affichage prioritaire** : Expert → Pro → Basic
- ✅ **Badges professionnels** : Vérifié, Expert
- ✅ **Migration complète** des données existantes

---

## 📋 ÉTAPES DE DÉPLOIEMENT

### 1. 📦 EXPORT DES DONNÉES EXISTANTES

```bash
# Exporter toutes les données Supabase avant migration
node scripts/export-supabase-data.js
```

**Résultat :** Fichiers JSON dans `/export/` avec :
- `businesses.json` - Établissements
- `events.json` - Événements  
- `articles.json` - Blog
- `profiles.json` - Utilisateurs (anonymisés)

### 2. 🏗️ CONFIGURATION DIRECTUS CLOUD

#### A. Créer les collections

Dans votre Directus Cloud, importer le schéma :
```bash
# Utiliser le fichier généré
scripts/directus-schema.json
```

**Collections créées :**
- `businesses` - Établissements avec quotas et plans
- `events` - Événements avec visibilités
- `articles` - Blog existant
- `subscriptions` - Abonnements Stripe

#### B. Installer les hooks

Copier le contenu de `scripts/directus-hooks.js` dans Directus Cloud :
- **Validation des quotas** (photos et événements)
- **Auto-configuration** des plans
- **Reset mensuel** des compteurs
- **Sécurité** anti-contournement

### 3. 🔄 MIGRATION DES DONNÉES

```bash
# Migrer depuis Supabase vers Directus
node scripts/migrate-to-directus.js
```

**Ce que fait le script :**
- ✅ Convertit les anciens établissements
- ✅ Assigne les bons plans et quotas  
- ✅ Migre les événements avec visibilités
- ✅ Préserve les articles de blog
- ✅ Configure les badges et priorités

### 4. 💰 CONFIGURATION STRIPE

#### A. Variables d'environnement Vercel

```bash
# Dans Vercel Dashboard > Settings > Environment Variables

# Stripe
STRIPE_SECRET_KEY=sk_live_51N6dsn...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51N6dsn...
STRIPE_WEBHOOK_SECRET=whsec_...

# Prix IDs (à créer dans Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_1xxx_monthly
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_1xxx_yearly
NEXT_PUBLIC_STRIPE_PRICE_EXPERT_MONTHLY=price_1xxx_monthly  
NEXT_PUBLIC_STRIPE_PRICE_EXPERT_YEARLY=price_1xxx_yearly

# Directus (déjà configuré)
NEXT_PUBLIC_DIRECTUS_URL=https://guide-lyon-cms.directus.app
DIRECTUS_ADMIN_EMAIL=admin@guide-lyon.fr
DIRECTUS_ADMIN_PASSWORD=AdminPassword123!
```

#### B. Créer les prix dans Stripe

**Plan Pro (19€/mois) :**
- Prix mensuel : 19.00 EUR
- Prix annuel : 182.40 EUR (20% de réduction)

**Plan Expert (49€/mois) :**
- Prix mensuel : 49.00 EUR  
- Prix annuel : 470.40 EUR (20% de réduction)

### 5. 🧹 NETTOYAGE DU CODE LEGACY

```bash
# Nettoyer automatiquement l'ancien code
bash scripts/cleanup-legacy.sh
```

**Supprime :**
- Packages Supabase/Firebase
- Fichiers de configuration obsolètes
- Composants legacy
- Code mort

**Ajoute :**
- Service Directus unifié
- Types TypeScript corrects
- Scripts de maintenance

### 6. 🧪 TESTS LOCAUX

```bash
# Installer les dépendances propres
npm install

# Tester en local
npm run dev

# URLs à tester :
# http://localhost:3000/annuaire-v3
# http://localhost:3000/tarifs
```

**Vérifications :**
- [ ] Annuaire charge les établissements depuis Directus
- [ ] Tri correct : Expert → Pro → Basic  
- [ ] Badges affichés correctement
- [ ] Page tarifs fonctionnelle
- [ ] Stripe checkout fonctionne

### 7. 🚀 DÉPLOIEMENT PRODUCTION

```bash
# Build de production
npm run build

# Déployer sur Vercel (projet existant)
vercel --prod

# Vérifier le déploiement
curl https://www.guide-de-lyon.fr/annuaire-v3
```

---

## 🎯 NOUVELLES FONCTIONNALITÉS V3

### 📊 Plans tarifaires cohérents

| Plan | Prix | Photos | Événements | Homepage | Newsletter | Réseaux | Badge |
|------|------|--------|-------------|-----------|------------|---------|--------|
| **Basic** | 0€ | 1 | 3/mois | ❌ | ❌ | ❌ | - |
| **Pro** | 19€ | 6 | 3/mois | ✅ | ✅ | ❌ | Vérifié |
| **Expert** | 49€ | 10 | 5/mois | ✅ | ✅ | ✅ | Expert |

### 🏆 Affichage prioritaire

Les établissements s'affichent dans cet ordre :
1. **Expert** (priority: 1) - Badge doré, ring jaune
2. **Pro** (priority: 2) - Badge bleu, ring bleu  
3. **Basic** (priority: 3) - Pas de badge, pas de ring

### 🤖 Validation automatique

**Hooks Directus** empêchent :
- ❌ Dépasser les quotas photos
- ❌ Créer trop d'événements/mois
- ❌ Contourner les visibilités 
- ❌ Modifier les badges manuellement

### 💳 Intégration Stripe améliorée

- ✅ Checkout sessions sécurisées
- ✅ Essai gratuit 7 jours pour Pro
- ✅ Gestion des webhooks
- ✅ Métadonnées enrichies

---

## 📱 URLS DE PRODUCTION

### Pages principales
- **Accueil :** https://www.guide-de-lyon.fr
- **Annuaire v3 :** https://www.guide-de-lyon.fr/annuaire-v3
- **Tarifs :** https://www.guide-de-lyon.fr/tarifs

### APIs
- **Stripe Checkout :** `/api/stripe/create-checkout-session`
- **Debug Directus :** `/api/debug/directus`

### Admin
- **Directus CMS :** https://guide-lyon-cms.directus.app
- **Stripe Dashboard :** https://dashboard.stripe.com

---

## 🔍 MONITORING & MAINTENANCE

### Quotas mensuels
Les hooks Directus gèrent automatiquement :
- Reset le 1er de chaque mois
- Comptage en temps réel
- Blocage si dépassement

### Analytics
Directus fournit nativement :
- Nombre d'établissements par plan
- Événements créés/mois
- Taux de conversion

### Support utilisateur
- **Basic :** Support standard
- **Pro :** Support prioritaire
- **Expert :** Support VIP 24/7

---

## 🆘 DÉPANNAGE

### Problèmes fréquents

**1. Erreur Directus "Unauthorized"**
```bash
# Vérifier les variables d'env
echo $DIRECTUS_ADMIN_EMAIL
echo $DIRECTUS_ADMIN_PASSWORD
```

**2. Quotas non respectés**
```bash
# Vérifier les hooks dans Directus
# Extensions > Hooks > quotas-validation
```

**3. Stripe checkout échoue**
```bash
# Vérifier les prix IDs dans Vercel
# Dashboard > Settings > Environment Variables
```

### Logs à surveiller

**Directus :**
- Connexions d'auth échouées
- Violations de quotas
- Erreurs de hooks

**Vercel :**
- Build failures
- API timeout
- Variables manquantes

---

## 📈 ROADMAP V4

Améliorations futures :
- [ ] Dashboard analytics avancé
- [ ] Notifications push
- [ ] App mobile React Native
- [ ] Multi-villes (Marseille, Nice...)
- [ ] API publique pour partenaires

---

## 👥 SUPPORT

**Développement :** Claude Code Assistant
**Hébergement :** Vercel Pro
**CMS :** Directus Cloud  
**Paiements :** Stripe

**Contact :** admin@guide-lyon.fr

---

✅ **Guide Lyon v3 est maintenant opérationnel !**