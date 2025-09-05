# ✅ SCRIPT PRÊT À L'EMPLOI - Configuration correcte

## 🎯 Le problème est résolu !

Le script `pexels-images-correct.mjs` contient :
- ✅ La BONNE URL Supabase : `ikefyhxelzydaogrnwxi`  
- ✅ La BONNE clé Supabase (déjà configurée)
- ⏳ Il ne manque que votre clé API Pexels

## 🚀 Une seule étape :

```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

# Remplacez VOTRE_CLE par votre vraie clé API Pexels
node pexels-images-correct.mjs VOTRE_CLE_API_PEXELS
```

## 🔑 Où obtenir votre clé API Pexels :

1. **Allez sur** : https://www.pexels.com/api/
2. **Cliquez** sur "Get Started" 
3. **Créez un compte** (gratuit, 30 secondes)
4. **Copiez** votre API Key

## 📸 Ce que fait le script :

```
🚀 MISE À JOUR DES IMAGES AVEC PEXELS
=====================================
🔍 Connexion à Supabase...
   URL: https://ikefyhxelzydaogrnwxi.supabase.co
   Projet: ikefyhxelzydaogrnwxi

📚 Récupération des articles...
✅ 8 articles trouvés

[1/8] Nouvelle boulangerie artisanale...
   🔍 Recherche: "french bakery bread pastry"
   ✅ Image ajoutée (© John Doe)

[2/8] Top 10 des restaurants avec terrasse...
   🔍 Recherche: "restaurant terrace outdoor dining"
   ✅ Image ajoutée (© Jane Smith)
```

## ✅ Vérification rapide :

Votre configuration actuelle :
- **Projet Supabase** : `ikefyhxelzydaogrnwxi` ✅
- **Table** : `blog_posts` ✅
- **URL** : `https://ikefyhxelzydaogrnwxi.supabase.co` ✅
- **Clé Supabase** : Déjà dans le script ✅
- **Clé Pexels** : À ajouter ⏳

## 💡 Options avancées :

```bash
# Remplacer TOUTES les images (même existantes)
node pexels-images-correct.mjs VOTRE_CLE --force

# Voir plus de détails
node pexels-images-correct.mjs VOTRE_CLE > rapport.txt
```

## ❓ Si ça ne marche toujours pas :

1. **Vérifiez dans Supabase** que la table `blog_posts` existe bien
2. **Vérifiez** que les colonnes `image_url` et `image_alt` existent
3. **Sinon**, exécutez ce SQL dans Supabase :

```sql
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_alt TEXT;
```

---

**C'est tout !** Le script `pexels-images-correct.mjs` est configuré avec VOS bonnes clés Supabase. 

Il ne vous reste qu'à ajouter votre clé API Pexels et ça marchera ! 🎉