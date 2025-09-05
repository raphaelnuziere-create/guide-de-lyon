# 📸 Ajout des images aux articles de blog

## ✅ Étape 1 : Migration de la base de données (2 min)

1. **Ouvrez Supabase** : https://supabase.com
2. Allez dans votre projet
3. Cliquez sur **SQL Editor**
4. **Copiez-collez** le contenu de `supabase/migrations/002_add_blog_images.sql`
5. Cliquez sur **Run**

✅ La base de données est prête pour les images !

## ✅ Étape 2 : Ajouter les images aux articles (3 min)

### Option A : Script automatique (RECOMMANDÉ)

1. **Dans le terminal**, exécutez :
```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2
node scripts/update-blog-images-simple.js
```

Le script va :
- Analyser chaque titre d'article
- Trouver le thème (boulangerie, restaurant, etc.)
- Ajouter une image appropriée
- Si pas de thème → image de Lyon

### Option B : Avec l'API Pexels (Plus de choix)

1. Créez un compte sur https://www.pexels.com/api/
2. Obtenez votre clé API gratuite
3. Modifiez `scripts/update-blog-images.js` ligne 18 avec votre clé
4. Exécutez : `node scripts/update-blog-images.js`

## ✅ Étape 3 : Vérifier le résultat

Allez sur https://www.guide-de-lyon.fr/blog

Les articles ont maintenant des images ! 🎉

## 🎨 Comment ça marche ?

Le script est intelligent :
- **"Nouvelle boulangerie"** → Image de boulangerie
- **"Restaurant gastronomique"** → Image de restaurant  
- **"Parc de la Tête d'Or"** → Image de parc
- **Pas de thème détecté** → Belle image de Lyon

## 📝 Notes

- Les images sont gratuites et libres de droits
- Chaque article a une image unique
- Les images sont optimisées pour le web
- Compatible mobile et desktop

## 🆘 En cas de problème

Si le script ne fonctionne pas :
1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez que les dépendances sont installées : `npm install`
3. Vérifiez la connexion Supabase dans le script

## ✨ Résultat

Avant : Blog sans images 😢
Après : Blog avec de belles images thématiques 🎉

Le bouton **Blog** est maintenant visible dans le footer du site !