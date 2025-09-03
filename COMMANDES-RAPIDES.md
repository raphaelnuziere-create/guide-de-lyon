# 🚀 COMMANDES RAPIDES - Guide de Lyon V2

## 🔥 Actions Immédiates pour Mise en Production

### 1️⃣ Configurer le domaine (URGENT - 5 min)
```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2
./scripts/setup-domain.sh
```

### 2️⃣ Configurer Firebase Admin (URGENT - 10 min)
```bash
# 1. Aller sur Firebase Console
open https://console.firebase.google.com/project/guide-de-lyon-b6a38/settings/serviceaccounts/adminsdk

# 2. Cliquer "Générer nouvelle clé privée"
# 3. Télécharger le fichier JSON
# 4. Copier les valeurs et exécuter :

vercel env add FIREBASE_ADMIN_PROJECT_ID production
# Coller: guide-de-lyon-b6a38

vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production  
# Coller: firebase-adminsdk-xxxxx@guide-de-lyon-b6a38.iam.gserviceaccount.com

vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
# Coller: la clé privée complète avec -----BEGIN PRIVATE KEY----- etc

# 5. Redéployer
vercel --prod
```

### 3️⃣ Déployer en production (2 min)
```bash
./scripts/deploy-production.sh
```

---

## 📱 Commandes Développement

### Démarrer en local
```bash
npm run dev
# Ouvrir http://localhost:3000
```

### Build et test
```bash
npm run build        # Build production
npm run lint         # Vérifier le code
npm run type-check   # Vérifier les types
```

---

## 🌐 Commandes Vercel

### Déploiement
```bash
vercel              # Deploy preview
vercel --prod       # Deploy production
vercel ls           # Lister les déploiements
vercel logs         # Voir les logs
vercel logs --follow # Suivre les logs en temps réel
```

### Domaines
```bash
vercel domains ls                          # Lister les domaines
vercel domains add guide-de-lyon.fr       # Ajouter domaine
vercel alias set [deployment] [domain]    # Lier domaine
vercel domains inspect guide-de-lyon.fr   # Vérifier config
```

### Variables d'environnement
```bash
vercel env ls                              # Lister les variables
vercel env add [NAME] production          # Ajouter variable
vercel env rm [NAME] production           # Supprimer variable
vercel env pull                            # Télécharger en .env.local
```

---

## 🔥 Commandes Firebase

### Configuration
```bash
firebase login
firebase use guide-de-lyon-b6a38
firebase projects:list
```

### Firestore
```bash
firebase firestore:indexes              # Voir les index
firebase firestore:delete --all-collections  # DANGER: Tout supprimer
```

### Deploy Firebase (rules, indexes)
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

---

## 💳 Commandes Stripe

### Configuration
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Écouter les webhooks en local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Créer un produit
stripe products create --name "Pro Visibilité" 

# Créer un prix
stripe prices create \
  --product prod_xxx \
  --unit-amount 1900 \
  --currency eur \
  --recurring-interval month
```

---

## 🐛 Debugging

### Vérifier le site
```bash
# Status HTTP
curl -I https://guide-lyon-v2.vercel.app

# Contenu
curl https://guide-lyon-v2.vercel.app

# DNS
nslookup guide-de-lyon.fr
dig guide-de-lyon.fr
```

### Logs et monitoring
```bash
vercel logs --follow                    # Logs temps réel
vercel inspect [deployment-url]         # Détails déploiement
```

### Nettoyer
```bash
rm -rf .next node_modules              # Reset complet
npm install
npm run build
```

---

## 📊 Tâches Quotidiennes

### Script automatique
```bash
./scripts/daily-tasks.sh
```

### Manuellement
```bash
# 1. Vérifier le site
curl -I https://guide-de-lyon.fr

# 2. Voir les stats
vercel analytics

# 3. Modérer les événements
open https://guide-de-lyon.fr/admin/events

# 4. Backup
firebase firestore:export gs://guide-lyon-backups/$(date +%Y%m%d)
```

---

## 🚨 En cas d'urgence

### Site DOWN
```bash
# 1. Vérifier le statut
vercel ls

# 2. Rollback au dernier déploiement stable
vercel rollback

# 3. Investiguer
vercel logs --since 1h
```

### Erreur de build
```bash
# 1. Clean build
rm -rf .next node_modules package-lock.json
npm install
npm run build

# 2. Si erreur persiste
git stash  # Sauvegarder les changements
git checkout main
git pull
vercel --prod
```

### Problème Firebase
```bash
# Vérifier les quotas
open https://console.firebase.google.com/project/guide-de-lyon-b6a38/usage

# Vérifier les rules
firebase deploy --only firestore:rules
```

---

## 📞 Contacts Urgents

- **Vercel Support**: https://vercel.com/support
- **Firebase Support**: https://firebase.google.com/support
- **Stripe Support**: support@stripe.com
- **OVH (domaine)**: 1007 (depuis France)

---

## 🎯 Checklist Mise en Production

- [ ] Domaine configuré sur Vercel
- [ ] DNS mis à jour chez OVH
- [ ] Firebase Admin configuré
- [ ] Variables d'environnement ajoutées
- [ ] SSL vérifié (automatique)
- [ ] Stripe configuré
- [ ] Email transactionnel configuré
- [ ] Backup automatique activé
- [ ] Monitoring activé
- [ ] Documentation à jour

---

**Dernière mise à jour**: 3 Septembre 2025