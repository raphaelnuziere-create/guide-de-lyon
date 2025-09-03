# 🔥 GUIDE COMPLET - Configuration Firebase Admin

## 📍 Où vous êtes maintenant
Vous êtes sur : https://console.firebase.google.com/project/guide-de-lyon-b6a38/overview

---

## ÉTAPE 1️⃣ : Aller dans les Paramètres

### Actions à faire :
1. **Cliquez sur l'engrenage ⚙️** en haut à gauche (à côté de "Vue d'ensemble du projet")
2. **Cliquez sur "Paramètres du projet"**

Vous arriverez sur : `https://console.firebase.google.com/project/guide-de-lyon-b6a38/settings/general`

---

## ÉTAPE 2️⃣ : Accéder aux Service Accounts

### Actions à faire :
1. Dans la page des paramètres, regardez les onglets en haut
2. **Cliquez sur l'onglet "Comptes de service"** (Service accounts)
   - C'est le 3ème ou 4ème onglet normalement

Vous arriverez sur : `https://console.firebase.google.com/project/guide-de-lyon-b6a38/settings/serviceaccounts/adminsdk`

---

## ÉTAPE 3️⃣ : Générer la Clé Privée

### Sur cette page, vous verrez :
- Un titre "SDK Admin Firebase"
- Un bouton bleu **"Générer une nouvelle clé privée"**

### Actions à faire :
1. **Cliquez sur le bouton bleu "Générer une nouvelle clé privée"**
2. Une popup apparaîtra avec un avertissement
3. **Cliquez sur "Générer la clé"**
4. **Un fichier JSON sera téléchargé** sur votre ordinateur
   - Il s'appellera quelque chose comme : `guide-de-lyon-b6a38-xxxxx.json`
   - Il sera probablement dans votre dossier Téléchargements

---

## ÉTAPE 4️⃣ : Ouvrir le Fichier JSON

### Actions à faire :
1. **Trouvez le fichier téléchargé** (dans Téléchargements)
2. **Ouvrez-le avec TextEdit** (clic droit → Ouvrir avec → TextEdit)
   - Ou double-cliquez simplement dessus

### Vous verrez quelque chose comme ça :
```json
{
  "type": "service_account",
  "project_id": "guide-de-lyon-b6a38",
  "private_key_id": "une-longue-chaîne-de-caractères",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqh...(très long texte)...-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@guide-de-lyon-b6a38.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

---

## ÉTAPE 5️⃣ : Copier les 3 Valeurs Importantes

### Vous devez copier EXACTEMENT ces 3 valeurs :

### 1. PROJECT_ID
- **Cherchez** : `"project_id":`
- **Copiez** : `guide-de-lyon-b6a38` (sans les guillemets)

### 2. CLIENT_EMAIL  
- **Cherchez** : `"client_email":`
- **Copiez** : tout l'email, par exemple :
  `firebase-adminsdk-xxxxx@guide-de-lyon-b6a38.iam.gserviceaccount.com`

### 3. PRIVATE_KEY (⚠️ Le plus important et délicat)
- **Cherchez** : `"private_key":`
- **Copiez** : TOUT ce qui est entre les guillemets, INCLUANT :
  - Le `-----BEGIN PRIVATE KEY-----`
  - Tout le texte au milieu (même les `\n`)
  - Le `-----END PRIVATE KEY-----`
  
**⚠️ ATTENTION** : La private_key est TRÈS longue (environ 20-30 lignes)

---

## ÉTAPE 6️⃣ : Ajouter les Variables sur Vercel

### Ouvrez un Terminal et exécutez ces commandes une par une :

### Commande 1 - Project ID
```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2
vercel env add FIREBASE_ADMIN_PROJECT_ID production
```
**Quand il demande la valeur, collez :** `guide-de-lyon-b6a38`
**Appuyez sur Entrée**

### Commande 2 - Client Email
```bash
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production
```
**Quand il demande la valeur, collez :** l'email complet que vous avez copié
**Appuyez sur Entrée**

### Commande 3 - Private Key (⚠️ Le plus délicat)
```bash
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
```
**Quand il demande la valeur :**
1. Collez TOUT le contenu de private_key
2. Ça commence par `-----BEGIN PRIVATE KEY-----`
3. Ça finit par `-----END PRIVATE KEY-----`
4. **Appuyez sur Entrée**

---

## ÉTAPE 7️⃣ : Redéployer le Site

### Une fois les 3 variables ajoutées :
```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2
vercel --prod
```

Attendez que le déploiement se termine (environ 1 minute).

---

## ÉTAPE 8️⃣ : Vérifier que Tout Fonctionne

### Testez le site :
```bash
# Ouvrir le site
open https://guide-lyon-v2.vercel.app

# Ou vérifier avec curl
curl -I https://guide-lyon-v2.vercel.app
```

Si vous obtenez HTTP 200, c'est bon !

---

## 🆘 EN CAS DE PROBLÈME

### Si la private key ne fonctionne pas :

#### Option A : Utiliser un fichier
1. Créez un fichier `.env.production` dans le projet
2. Ajoutez dedans :
```
FIREBASE_ADMIN_PROJECT_ID=guide-de-lyon-b6a38
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@guide-de-lyon-b6a38.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...(la clé complète)...\n-----END PRIVATE KEY-----\n"
```

#### Option B : Encoder en base64
```bash
# Encoder la clé
echo "VOTRE_PRIVATE_KEY" | base64

# Puis ajouter la version encodée sur Vercel
vercel env add FIREBASE_ADMIN_PRIVATE_KEY_BASE64 production
```

---

## ✅ CHECKLIST FINALE

- [ ] Fichier JSON téléchargé depuis Firebase
- [ ] project_id copié et ajouté sur Vercel
- [ ] client_email copié et ajouté sur Vercel  
- [ ] private_key copiée et ajoutée sur Vercel
- [ ] Site redéployé avec `vercel --prod`
- [ ] Site accessible sans erreur 401

---

## 📞 BESOIN D'AIDE ?

Si vous êtes bloqué à n'importe quelle étape, voici ce que vous pouvez faire :

1. **Capturez une capture d'écran** de l'endroit où vous êtes bloqué
2. **Copiez l'erreur exacte** si vous en avez une
3. Je pourrai vous guider plus précisément

---

## 🎯 RÉSULTAT ATTENDU

Une fois configuré correctement :
- ✅ L'authentification fonctionnera
- ✅ Les merchants pourront se connecter
- ✅ Les événements pourront être créés
- ✅ L'admin pourra modérer

---

**C'est plus simple que ça en a l'air ! Suivez juste les étapes une par une.**