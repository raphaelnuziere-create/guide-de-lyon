# 🚨 CRÉATION D'UN NOUVEAU PROJET VERCEL

Si les pages donnent toujours 404, créez un NOUVEAU projet Vercel. 
Voici comment faire en 5 minutes :

## 📋 ÉTAPES À SUIVRE

### 1️⃣ **Supprimer l'ancien projet** (optionnel)
1. Allez sur https://vercel.com/dashboard
2. Cliquez sur votre projet `guide-lyon-v2`
3. Settings → En bas → "Delete Project"

### 2️⃣ **Créer un nouveau projet**
1. Cliquez sur **"Add New..."** → **"Project"**
2. **"Import Git Repository"**
3. Si le repo n'apparaît pas, cliquez **"Add GitHub Account"**
4. Sélectionnez **`raphaelnuziere-create/guide-de-lyon`**
5. Cliquez **"Import"**

### 3️⃣ **Configuration IMPORTANTE**
Quand Vercel demande la configuration :

```
Project Name: guide-lyon-v2 (ou nouveau nom)
Framework Preset: Next.js ✅
Root Directory: ./ (laisser vide)
Build Command: npm run build
Output Directory: (laisser vide, Vercel détecte)
Install Command: npm install
```

### 4️⃣ **Variables d'environnement**
Cliquez sur **"Environment Variables"** et ajoutez :

```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyCx6EvZlp_pX9GaRu_NvCHTa3Tk_k18OU4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = guide-de-lyon-b6a38.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = guide-de-lyon-b6a38
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = guide-de-lyon-b6a38.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 173827247208
NEXT_PUBLIC_FIREBASE_APP_ID = 1:173827247208:web:899a74bd3a5a24f1f63fdd
NEXT_PUBLIC_SUPABASE_URL = https://ikefyhxelzydaogrnwxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTY3NTQsImV4cCI6MjA3MTI3Mjc1NH0.vJHDlWKUK0xUoXB_CCxNkVNnWhb7Wpq-mA097blKmzc
NEXT_PUBLIC_APP_URL = https://www.guide-de-lyon.fr
NODE_ENV = production
```

### 5️⃣ **Déployer**
Cliquez sur **"Deploy"**

## 🎯 APRÈS LE DÉPLOIEMENT

### Testez immédiatement :
1. https://[votre-projet].vercel.app/diagnostic
2. https://[votre-projet].vercel.app/test
3. https://[votre-projet].vercel.app/auth
4. https://[votre-projet].vercel.app/login-admin
5. https://[votre-projet].vercel.app/login-pro

### Si ça marche sur vercel.app :
1. Allez dans Settings → Domains
2. Ajoutez `www.guide-de-lyon.fr`
3. Suivez les instructions DNS

## 🔍 VÉRIFICATIONS SI ENCORE 404

### Dans Vercel Dashboard :
1. **Build Logs** : Y a-t-il des erreurs ?
2. **Function Logs** : Erreurs runtime ?
3. **Domains** : Le domaine est-il vérifié ?

### Tests de diagnostic :
```bash
# Test 1: Le repo est-il accessible ?
curl -I https://github.com/raphaelnuziere-create/guide-de-lyon

# Test 2: Le build local marche ?
npm run build

# Test 3: Le projet existe sur Vercel ?
vercel list
```

## ⚠️ DERNIER RECOURS

Si RIEN ne fonctionne, créez un projet depuis zéro :

```bash
# 1. Cloner dans un nouveau dossier
git clone https://github.com/raphaelnuziere-create/guide-de-lyon guide-lyon-new
cd guide-lyon-new

# 2. Installer et builder
npm install
npm run build

# 3. Déployer avec Vercel CLI
vercel

# Suivez les instructions :
# - Set up and deploy
# - Quel scope ? (votre compte)
# - Link to existing project? No
# - What's your project name? guide-lyon-new
# - In which directory? ./
# - Want to override? No
```

## 📞 SUPPORT

Si le problème persiste après tout ça :
1. Contactez le support Vercel : https://vercel.com/support
2. Partagez le rapport : VERCEL-DEBUG-REPORT.md
3. Mentionnez : "404 on all routes despite successful build"

---

✅ **Le build fonctionne localement**
✅ **Le code est correct**
✅ **Le repository est public**
❌ **Seul Vercel bloque**

→ La solution est de recréer le projet Vercel.