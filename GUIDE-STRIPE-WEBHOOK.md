# 🔐 Configuration du Webhook Stripe - Guide Étape par Étape

## 📍 Où obtenir votre STRIPE_WEBHOOK_SECRET

### Étape 1 : Connectez-vous à Stripe
Allez sur [https://dashboard.stripe.com](https://dashboard.stripe.com) et connectez-vous.

### Étape 2 : Accédez aux Webhooks
Dans le menu de gauche, cliquez sur :
- **Developers** (Développeurs)
- **Webhooks**

### Étape 3 : Créez un nouveau Webhook

1. Cliquez sur le bouton **"+ Add endpoint"** (Ajouter un endpoint)

2. Remplissez les informations :
   ```
   Endpoint URL: https://www.guide-de-lyon.fr/api/webhooks/stripe
   
   Description: Guide de Lyon - Webhook de paiement
   ```

3. Dans **"Events to send"** (Événements à envoyer), sélectionnez :
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

   Ou cliquez sur **"receive all events"** pour tout recevoir.

4. Cliquez sur **"Add endpoint"**

### Étape 4 : Récupérez votre clé secrète

Une fois le webhook créé :

1. Vous verrez votre nouveau webhook dans la liste
2. Cliquez dessus pour voir les détails
3. Dans la section **"Signing secret"**, cliquez sur **"Reveal"** (Révéler)
4. Vous verrez une clé qui commence par `whsec_`

   Exemple :
   ```
   whsec_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
   ```

5. **Copiez cette clé complète**

### Étape 5 : Ajoutez la clé dans votre .env.local

Ouvrez votre fichier `.env.local` et ajoutez :
```bash
STRIPE_WEBHOOK_SECRET=whsec_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789
```

## ✅ Vérification

### Test local (développement)

Pour tester en local, utilisez Stripe CLI :

1. Installez Stripe CLI :
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows
   scoop install stripe
   ```

2. Connectez-vous :
   ```bash
   stripe login
   ```

3. Écoutez les webhooks localement :
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. La CLI vous donnera une clé temporaire :
   ```
   Ready! Your webhook signing secret is whsec_test_xxx (^C to quit)
   ```

5. Utilisez cette clé temporaire dans `.env.local` pour les tests

### Test de l'endpoint

Visitez : http://localhost:3000/api/webhooks/stripe

Vous devriez voir :
```json
{
  "status": "ok",
  "message": "Webhook Stripe configuré",
  "configured": true
}
```

## 🔍 Débugger les problèmes courants

### Erreur : "Webhook signature verification failed"

**Causes possibles :**
1. La clé `STRIPE_WEBHOOK_SECRET` est incorrecte
2. Vous utilisez la mauvaise clé (test vs live)
3. Le webhook n'est pas configuré sur la bonne URL

**Solution :**
- Vérifiez que vous avez copié la clé complète (incluant `whsec_`)
- Assurez-vous d'utiliser la bonne clé selon l'environnement

### Erreur : "No signatures found matching the expected signature"

**Cause :** Le body de la requête a été modifié

**Solution :**
- Ne pas parser le body avant la vérification
- Utiliser `request.text()` et non `request.json()`

## 📊 Voir les logs des webhooks

1. Dans Stripe Dashboard, allez dans **Developers → Webhooks**
2. Cliquez sur votre webhook
3. Scrollez jusqu'à **"Webhook attempts"**
4. Vous verrez tous les appels avec leur statut

## 🚀 Déploiement en production

1. **Créez un webhook de production** dans Stripe (pas en mode test)
2. **Utilisez l'URL de production** : `https://www.guide-de-lyon.fr/api/webhooks/stripe`
3. **Ajoutez la clé dans Vercel** :
   - Allez sur Vercel Dashboard
   - Settings → Environment Variables
   - Ajoutez `STRIPE_WEBHOOK_SECRET` avec la valeur de production

## 💡 Conseil de sécurité

⚠️ **Ne jamais commiter la clé webhook dans Git !**

Toujours utiliser les variables d'environnement :
- `.env.local` pour le développement (non commité)
- Variables Vercel pour la production

---

## 📝 Résumé rapide

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint → `https://www.guide-de-lyon.fr/api/webhooks/stripe`
3. Sélectionner les events
4. Copier la clé `whsec_xxx`
5. Ajouter dans `.env.local` : `STRIPE_WEBHOOK_SECRET=whsec_xxx`
6. Déployer et tester !

Votre webhook est maintenant configuré et prêt à recevoir les événements Stripe ! 🎉