# 🔐 Guide de Sécurité - Guide de Lyon

## Configuration des Variables d'Environnement

### 1. Configuration Locale

1. **Copier le fichier exemple** :
```bash
cp .env.local.example .env.local
```

2. **Remplir vos clés API** dans `.env.local` :
   - Ne JAMAIS commit ce fichier
   - Le fichier est automatiquement ignoré par Git

### 2. Configuration sur Vercel

Pour ajouter vos variables sur Vercel :

```bash
# Méthode 1: Via CLI
vercel env add VARIABLE_NAME production

# Méthode 2: Via Dashboard
# https://vercel.com/raphaels-projects-8d8ce8f4/guide-lyon-v2/settings/environment-variables
```

### 3. Variables Critiques à Configurer

#### 🔴 OBLIGATOIRES (Le site ne fonctionne pas sans)
```env
# Déjà configurées ✅
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### 🟡 IMPORTANTES (Pour la monétisation)
```env
# Stripe (Paiements)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Brevo (Emails)
BREVO_API_KEY=xkeysib-xxx
BREVO_SENDER_EMAIL=contact@guide-de-lyon.fr
BREVO_SENDER_NAME=Guide de Lyon
```

#### 🟢 OPTIONNELLES (Features avancées)
```env
# OpenAI (Modération IA)
OPENAI_API_KEY=sk-xxx

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-xxx

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza-xxx
```

## Où Obtenir les Clés API

### Stripe (Paiements)
1. Créer compte: https://dashboard.stripe.com/register
2. Mode Test d'abord: https://dashboard.stripe.com/test/apikeys
3. Mode Live: https://dashboard.stripe.com/apikeys
4. Webhooks: https://dashboard.stripe.com/webhooks

### Brevo (Emails - ex SendinBlue)
1. Créer compte: https://app.brevo.com/signup
2. API Key: Account Settings > SMTP & API > API Keys
3. Gratuit: 300 emails/jour

### OpenAI (IA)
1. Créer compte: https://platform.openai.com/signup
2. API Key: https://platform.openai.com/api-keys
3. Coût: ~0.002$ par modération

### Google Analytics
1. Créer propriété: https://analytics.google.com
2. Admin > Data Streams > Web
3. Measurement ID: G-XXXXXXXXXX

## Utilisation dans le Code

### Import Sécurisé
```typescript
// ✅ BON - Utiliser le config centralisé
import config from '@/lib/config/secrets'

const stripeKey = config.stripe.publishableKey
const supabaseUrl = config.supabase.url

// ❌ MAUVAIS - Ne pas accéder directement
const key = process.env.STRIPE_SECRET_KEY
```

### Validation au Démarrage
```typescript
// Le fichier secrets.ts valide automatiquement
// Si une clé obligatoire manque, l'app crash au démarrage
// C'est voulu pour éviter les erreurs en production
```

## Commandes Utiles

### Vérifier les Variables sur Vercel
```bash
# Lister toutes les variables
vercel env ls

# Voir une variable spécifique
vercel env pull .env.local
```

### Ajouter une Variable
```bash
# Pour production uniquement
vercel env add VARIABLE_NAME production

# Pour tous les environnements
vercel env add VARIABLE_NAME
```

### Supprimer une Variable
```bash
vercel env rm VARIABLE_NAME
```

## Sécurité Best Practices

### ✅ À FAIRE
1. Utiliser des clés différentes pour dev/prod
2. Régénérer les clés tous les 3 mois
3. Limiter les permissions (Principe du moindre privilège)
4. Activer 2FA sur tous les services
5. Monitorer l'usage des API

### ❌ À NE PAS FAIRE
1. Commit des fichiers .env
2. Partager les clés par email/slack
3. Utiliser les mêmes clés pour plusieurs projets
4. Logger les clés dans la console
5. Exposer les clés côté client (sauf NEXT_PUBLIC_*)

## En Cas de Fuite

Si une clé est compromise :

1. **Immédiatement** : Révoquer la clé sur le service
2. **Générer** une nouvelle clé
3. **Mettre à jour** sur Vercel
4. **Redéployer** l'application
5. **Vérifier** les logs pour usage suspect

## Structure des Fichiers

```
guide-lyon-v2/
├── .env.local              # ⚠️ JAMAIS COMMIT - Vos vraies clés
├── .env.local.example      # ✅ COMMIT OK - Template vide
├── .gitignore             # ✅ Vérifie que .env* est ignoré
└── lib/
    └── config/
        └── secrets.ts     # ✅ Config centralisée avec validation
```

## Support

Pour toute question de sécurité :
- Email: security@guide-de-lyon.fr
- Dashboard Vercel: https://vercel.com/raphaels-projects-8d8ce8f4/guide-lyon-v2

---

⚠️ **RAPPEL** : Ne JAMAIS partager vos clés API, même avec le support technique!