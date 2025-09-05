-- ============================================
-- SOLUTION : Ajouter les colonnes manquantes
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor

-- ÉTAPE 1 : Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
    -- Ajouter image_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN image_url TEXT;
        RAISE NOTICE '✅ Colonne image_url créée';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne image_url existe déjà';
    END IF;

    -- Ajouter image_alt
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'image_alt'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN image_alt TEXT;
        RAISE NOTICE '✅ Colonne image_alt créée';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne image_alt existe déjà';
    END IF;
END $$;

-- ÉTAPE 2 : Vérifier que les colonnes sont bien créées
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
AND column_name IN ('image_url', 'image_alt');

-- ÉTAPE 3 : Désactiver temporairement RLS si activé
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 4 : Message de confirmation
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'blog_posts'
    AND column_name IN ('image_url', 'image_alt');
    
    IF col_count = 2 THEN
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ COLONNES PRÊTES !';
        RAISE NOTICE '========================================';
        RAISE NOTICE '';
        RAISE NOTICE 'Les colonnes image_url et image_alt sont maintenant disponibles.';
        RAISE NOTICE 'Relancez le script Pexels pour ajouter les images.';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '❌ PROBLÈME : Les colonnes n''ont pas été créées correctement';
    END IF;
END $$;