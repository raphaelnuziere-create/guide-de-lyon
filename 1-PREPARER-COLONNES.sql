-- ============================================
-- ÉTAPE 1 : PRÉPARER LES COLONNES
-- ============================================
-- Exécutez ce script AVANT d'utiliser la clé API Pexels

-- Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
    -- Colonne image_url
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

    -- Colonne image_alt
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

-- Vérifier le résultat
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'blog_posts'
AND column_name IN ('image_url', 'image_alt');

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ TABLE PRÊTE POUR LES IMAGES !';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Maintenant, exécutez dans le terminal:';
    RAISE NOTICE 'node pexels-images.js VOTRE_CLE_API';
    RAISE NOTICE '';
END $$;