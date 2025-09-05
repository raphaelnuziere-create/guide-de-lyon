# 🚨 EXÉCUTEZ CE SCRIPT MAINTENANT

## ✅ Un seul script qui fait TOUT !

### Étape unique :

1. **Ouvrez Supabase** : https://supabase.com
2. **SQL Editor**
3. **Copiez TOUT le contenu** du fichier : `COMPLETE_BLOG_IMAGES_SETUP.sql`
4. **Collez** dans l'éditeur
5. **Cliquez sur Run**

## ✅ Ce que fait le script :

1. **Crée les colonnes** `image_url` et `image_alt` si elles n'existent pas
2. **Ajoute automatiquement** des images Pexels HD à tous les articles
3. **Détecte le thème** de chaque article (boulangerie, restaurant, etc.)
4. **Optimise** avec des index pour les performances
5. **Affiche un rapport** avec le nombre d'articles mis à jour

## 🎨 Images intelligentes :

Le script analyse les titres et choisit la bonne image :
- "boulangerie" → Photo de boulangerie
- "restaurant terrasse" → Photo de terrasse
- "parc" → Photo de nature
- "festival lumières" → Photo d'événement
- Etc...

## ✅ Après l'exécution :

Allez sur https://www.guide-de-lyon.fr/blog

**Les images sont là !** 🎉

## ❓ Si ça ne marche pas :

1. Vérifiez que la table s'appelle bien `blog_posts`
2. Regardez les messages d'erreur dans SQL Editor
3. Réessayez avec le script `COMPLETE_BLOG_IMAGES_SETUP.sql`

## 📝 Pour personnaliser une image :

Dans Supabase > Table Editor > blog_posts :
- Cliquez sur un article
- Modifiez `image_url` avec l'URL de votre choix
- Sauvegardez

C'est tout ! Plus simple, impossible 😊