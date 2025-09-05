-- ============================================
-- DIAGNOSTIC : Vérifier les colonnes de blog_posts
-- ============================================

-- 1. Afficher toutes les colonnes de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;

-- 2. Vérifier si les colonnes image existent
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'blog_posts' AND column_name = 'image_url'
        ) THEN '✅ Colonne image_url EXISTE'
        ELSE '❌ Colonne image_url MANQUANTE'
    END as statut_image_url,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'blog_posts' AND column_name = 'image_alt'
        ) THEN '✅ Colonne image_alt EXISTE'
        ELSE '❌ Colonne image_alt MANQUANTE'
    END as statut_image_alt;

-- 3. Afficher un échantillon d'articles
SELECT 
    id,
    SUBSTRING(title, 1, 30) || '...' as titre,
    image_url,
    image_alt
FROM blog_posts
LIMIT 5;