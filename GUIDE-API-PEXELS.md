# 🎯 GUIDE SIMPLE - Utiliser votre clé API Pexels

## 📋 En 2 étapes simples :

### ÉTAPE 1️⃣ : Préparer la base de données (30 secondes)

1. **Ouvrez Supabase** > **SQL Editor**
2. **Copiez** le contenu de `1-PREPARER-COLONNES.sql`
3. **Collez** et **Run**

✅ Les colonnes sont créées !

### ÉTAPE 2️⃣ : Ajouter les images avec Pexels (2 minutes)

**Option A : Dans le terminal (PLUS SIMPLE)**
```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2
node pexels-images.js VOTRE_CLE_API_PEXELS
```

**Option B : Modifier le fichier**
1. Ouvrez `pexels-images.js`
2. Ligne 10, remplacez `COLLEZ_VOTRE_CLE_API_ICI` par votre clé
3. Dans le terminal : `node pexels-images.js`

## ✅ C'est fait !

Le script va :
- 🔍 Chercher des images pour chaque article
- 🎨 Choisir les meilleures images
- 💾 Les sauvegarder dans Supabase
- 📊 Afficher un rapport

## 🔑 Où trouver votre clé API Pexels ?

1. https://www.pexels.com/api/
2. **"Get Started"** → Créez un compte
3. **"Your API Key"** → Copiez la clé

## 📸 Exemples de ce que fait le script :

| Article contient | Recherche sur Pexels | Résultat |
|-----------------|---------------------|----------|
| "boulangerie" | "french bakery bread" | 🥖 Photo de boulangerie |
| "restaurant terrasse" | "restaurant terrace outdoor" | 🍽️ Photo de terrasse |
| "parc" | "lyon park nature" | 🌳 Photo de parc |
| "festival lumières" | "lyon festival lights" | ✨ Photo d'illuminations |

## ⚡ Commandes utiles :

```bash
# Ajouter les images (première fois)
node pexels-images.js VOTRE_CLE

# Remplacer TOUTES les images
node pexels-images.js VOTRE_CLE --force

# Voir les logs détaillés
node pexels-images.js VOTRE_CLE > rapport.txt
```

## ❓ Problème ?

**"Erreur Supabase"**
→ Exécutez d'abord `1-PREPARER-COLONNES.sql`

**"Erreur API 401"**
→ Vérifiez votre clé API

**"Pas d'image trouvée"**
→ Normal pour certains articles, le script continue

## 🎉 Résultat

Allez sur https://www.guide-de-lyon.fr/blog

Chaque article a maintenant une belle image haute qualité de Pexels !

---

💡 **Astuce** : Gardez votre clé API pour pouvoir rafraîchir les images plus tard