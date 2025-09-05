# 🚀 UTILISEZ VOTRE CLÉ API PEXELS MAINTENANT

## ✨ Super simple en 2 étapes :

### 1️⃣ Dans Supabase (30 sec)
```sql
-- Copiez-collez ce code dans SQL Editor
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'image_url') THEN
        ALTER TABLE blog_posts ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'image_alt') THEN
        ALTER TABLE blog_posts ADD COLUMN image_alt TEXT;
    END IF;
    RAISE NOTICE '✅ Colonnes prêtes !';
END $$;
```

### 2️⃣ Dans le terminal (1 min)
```bash
# Remplacez VOTRE_CLE par votre vraie clé API Pexels
node pexels-images.js VOTRE_CLE
```

## 🎉 C'EST TOUT !

Les images sont maintenant sur votre blog.

---

### 📝 Exemple avec une vraie clé :
```bash
node pexels-images.js 563492ad6f91700001000001abc123xyz456
```

### 🔑 Pas encore de clé ?
1. https://www.pexels.com/api/
2. Créez un compte gratuit
3. Copiez votre clé

### ✅ Le script va :
- Analyser chaque titre d'article
- Chercher la meilleure image sur Pexels
- L'ajouter automatiquement
- Afficher : "✅ Image ajoutée"

C'est vraiment tout ! 😊