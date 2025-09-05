# 🎯 MODE D'EMPLOI - Images Pexels avec votre clé API

## ✅ ÉTAPE 1 : Préparer la base (30 secondes)

Dans **Supabase > SQL Editor**, collez et exécutez :

```sql
-- Créer les colonnes pour les images
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS image_alt TEXT;
```

## ✅ ÉTAPE 2 : Utiliser votre clé API (1 minute)

Dans le **terminal** :

```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

# Remplacez VOTRE_CLE par votre vraie clé API Pexels
node add-pexels-images.mjs VOTRE_CLE_API_PEXELS
```

## 🎉 C'EST FAIT !

Le script va :
1. 🔍 Analyser chaque titre d'article
2. 🎨 Chercher la meilleure image sur Pexels
3. 💾 L'ajouter automatiquement
4. ✅ Afficher "Image ajoutée"

## 📸 Exemples de ce qui se passe :

```
[1/8] Nouvelle boulangerie artisanale...
   🔍 Recherche: "french bakery bread"
   ✅ Image ajoutée (© John Doe)

[2/8] Top 10 des restaurants avec terrasse...
   🔍 Recherche: "restaurant terrace outdoor"
   ✅ Image ajoutée (© Jane Smith)
```

## 🔑 Où obtenir votre clé API ?

1. **Allez sur** : https://www.pexels.com/api/
2. **Créez un compte** (gratuit)
3. **Cliquez** sur "Your API Key"
4. **Copiez** la clé (longue suite de lettres/chiffres)

## ❓ Problème ?

**"CLÉ API MANQUANTE"**
→ Vous avez oublié de mettre votre clé

**"Erreur API 401"**
→ Votre clé est incorrecte

**"Erreur Supabase"**
→ Exécutez d'abord l'étape 1 dans SQL Editor

## 💡 Astuce

Pour remplacer TOUTES les images (même celles existantes) :
```bash
# D'abord, effacer les images existantes dans Supabase
UPDATE blog_posts SET image_url = NULL;

# Puis relancer le script
node add-pexels-images.mjs VOTRE_CLE_API
```

---

**C'est vraiment tout !** Vos articles ont maintenant de belles images Pexels HD 🎉