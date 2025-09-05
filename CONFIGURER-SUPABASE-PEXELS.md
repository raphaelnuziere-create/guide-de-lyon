# 🔧 CONFIGURATION COMPLÈTE - Supabase + Pexels

## 🚨 IMPORTANT : Récupérer vos clés

### 1️⃣ Votre clé Supabase ANON KEY

1. **Allez sur** : https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/settings/api
2. Dans la section **Project API keys**
3. **Copiez** la clé `anon` `public` (elle commence par `eyJ...`)

### 2️⃣ Votre clé API Pexels

1. **Allez sur** : https://www.pexels.com/api/
2. **Créez un compte** ou connectez-vous
3. **Copiez** votre API Key

## 📝 Configurer le script

### Option A : Modifier le fichier (PLUS SIMPLE)

Ouvrez `add-pexels-images.mjs` et remplacez :

```javascript
// Ligne 10 - Votre clé Pexels
const PEXELS_API_KEY = 'VOTRE_CLE_PEXELS_ICI';

// Ligne 15 - Votre clé Supabase
const SUPABASE_KEY = 'VOTRE_ANON_KEY_ICI';
```

### Option B : Créer un nouveau fichier configuré

Créez `mes-images.mjs` :

```javascript
import { createClient } from '@supabase/supabase-js';

// VOS CLÉS ICI
const PEXELS_API_KEY = 'COLLEZ_VOTRE_CLE_PEXELS';
const SUPABASE_URL = 'https://ikefyhxelzydaogrnwxi.supabase.co';
const SUPABASE_KEY = 'COLLEZ_VOTRE_ANON_KEY';

// Le reste du code...
```

## 🚀 Exécuter le script

```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

# Si vous avez modifié le fichier
node add-pexels-images.mjs

# Si vous avez créé mes-images.mjs
node mes-images.mjs
```

## ✅ Exemple avec de vraies clés (fictives)

```javascript
const PEXELS_API_KEY = '563492ad6f917000010000014abc123def456789';
const SUPABASE_URL = 'https://ikefyhxelzydaogrnwxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 🎯 Ce que vous devriez voir

```
🚀 AJOUT DES IMAGES PEXELS
=====================================
📚 8 articles trouvés

[1/8] Nouvelle boulangerie artisanale...
   🔍 Recherche: "french bakery bread"
   ✅ Image ajoutée (© Photographer Name)

[2/8] Top 10 des restaurants...
   🔍 Recherche: "lyon restaurant food"
   ✅ Image ajoutée (© Photographer Name)
```

## ❓ Résolution des problèmes

**"Erreur Supabase: TypeError"**
→ Vérifiez votre ANON KEY dans Settings > API

**"Erreur API 401"**
→ Vérifiez votre clé Pexels

**"Table blog_posts not found"**
→ Créez d'abord la table dans SQL Editor

## 📍 Vos URLs correctes

- **Votre projet Supabase** : `ikefyhxelzydaogrnwxi`
- **URL complète** : `https://ikefyhxelzydaogrnwxi.supabase.co`
- **Dashboard** : https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi

C'est tout ! Une fois les 2 clés configurées, le script fonctionnera parfaitement 🎉