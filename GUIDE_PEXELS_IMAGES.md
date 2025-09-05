# 📸 GUIDE COMPLET - Images Pexels pour le Blog

## ✅ Étape 1 : Configuration dans Supabase (2 min)

### Option A : Avec le script SQL (RAPIDE)
1. Ouvrez **Supabase** > **SQL Editor**
2. Ouvrez le fichier `supabase/update-blog-images-pexels.sql`
3. **REMPLACEZ** `VOTRE_CLE_API_PEXELS` par votre vraie clé (ligne 10)
4. **Exécutez** le script

✅ Les images sont ajoutées automatiquement !

### Option B : Avec Node.js et l'API Pexels (RECOMMANDÉ)
```bash
# Dans le terminal
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

# Avec votre clé API
node scripts/update-blog-with-pexels.js VOTRE_CLE_API_PEXELS

# Pour remplacer les images existantes
node scripts/update-blog-with-pexels.js VOTRE_CLE_API_PEXELS --force
```

## 🔑 Où obtenir votre clé API Pexels

1. Allez sur https://www.pexels.com/api/
2. Cliquez sur **"Get Started"**
3. Créez un compte gratuit
4. Cliquez sur **"Your API Key"**
5. Copiez la clé (commence par des lettres et chiffres)

**Limites gratuites** : 200 requêtes/heure, 20 000/mois

## 🔄 Redirections SEO (Déjà configurées)

Les anciennes URLs sont automatiquement redirigées :
- `/post/xxx` → `/blog/xxx`
- `/article/xxx` → `/blog/xxx`
- `/actualite/xxx` → `/blog/xxx`
- `nouvelle_boulangerie` → `nouvelle-boulangerie`

✅ Le SEO est préservé avec des redirections 301 !

## 🎨 Comment les images sont choisies

Le script analyse intelligemment les titres :

| Mot-clé dans le titre | Recherche Pexels | Type d'image |
|----------------------|------------------|--------------|
| boulangerie | "bakery lyon" | Pain, croissants |
| restaurant | "restaurant lyon" | Tables, plats |
| parc | "park lyon" | Nature, verdure |
| festival | "festival lyon" | Événements, lumières |
| marché | "french market" | Produits frais |
| musée | "museum lyon" | Art, culture |
| transport | "lyon tram" | Tram, métro |
| Autre | "lyon france" | Vue de Lyon |

## 📊 Vérification dans Supabase

1. **Table Editor** > **blog_posts**
2. Vérifiez les colonnes :
   - `image_url` : URL de l'image
   - `image_alt` : Description pour SEO

## 🚀 Résultat final

- ✅ Images haute qualité de Pexels
- ✅ Images thématiques intelligentes
- ✅ SEO optimisé (alt text)
- ✅ Redirections automatiques
- ✅ Performance optimisée

## 🛠️ Commandes utiles

```bash
# Voir les articles sans image
SELECT title FROM blog_posts WHERE image_url IS NULL;

# Compter les articles avec images
SELECT COUNT(*) FROM blog_posts WHERE image_url IS NOT NULL;

# Réinitialiser une image
UPDATE blog_posts SET image_url = NULL WHERE id = 'xxx';
```

## ❓ FAQ

**Q: Les images ne s'affichent pas ?**
R: Vérifiez que vous avez exécuté le script SQL dans Supabase

**Q: Comment changer une image ?**
R: Dans Table Editor, modifiez directement `image_url`

**Q: L'API Pexels ne fonctionne pas ?**
R: Vérifiez votre clé API et les limites (200/heure)

**Q: Les redirections ne marchent pas ?**
R: Redéployez sur Vercel pour activer le middleware

## 📝 Notes importantes

1. **Table correcte** : `blog_posts` (pas `original_blog_posts`)
2. **Clé API** : Gardez-la secrète, ne la commitez pas
3. **Images** : Toutes les images Pexels sont libres de droits
4. **SEO** : Les redirections 301 préservent le référencement

## ✨ C'est terminé !

Votre blog a maintenant :
- 🖼️ De belles images thématiques
- 🔄 Des redirections SEO automatiques
- 📱 Un design responsive
- ⚡ Des performances optimisées