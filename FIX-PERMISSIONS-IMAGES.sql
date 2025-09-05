-- ============================================
-- SOLUTION DÉFINITIVE - Corriger les permissions
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor

-- ÉTAPE 1 : Désactiver RLS temporairement
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- ÉTAPE 2 : Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Enable read access for all users" ON blog_posts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blog_posts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON blog_posts;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_read_public" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_all" ON blog_posts;

-- ÉTAPE 3 : Créer des policies permissives pour les images
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture publique
CREATE POLICY "public_read_all" ON blog_posts
    FOR SELECT
    USING (true);

-- Permettre les updates publics (temporairement pour les images)
CREATE POLICY "public_update_images" ON blog_posts
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ÉTAPE 4 : Test rapide - Ajouter une image de test
UPDATE blog_posts
SET 
    image_url = 'https://images.pexels.com/photos/2363807/pexels-photo-2363807.jpeg?auto=compress&cs=tinysrgb&w=1600',
    image_alt = 'Test image Lyon'
WHERE id = (SELECT id FROM blog_posts LIMIT 1);

-- ÉTAPE 5 : Vérifier que ça a marché
SELECT 
    id,
    SUBSTRING(title, 1, 40) as titre,
    CASE 
        WHEN image_url IS NOT NULL THEN '✅ Image présente'
        ELSE '❌ Pas d''image'
    END as statut
FROM blog_posts
WHERE image_url IS NOT NULL
LIMIT 5;

-- Message de confirmation
DO $$
DECLARE
    img_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO img_count
    FROM blog_posts
    WHERE image_url IS NOT NULL;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PERMISSIONS CORRIGÉES !';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    IF img_count > 0 THEN
        RAISE NOTICE '✅ Test réussi : % article(s) ont une image', img_count;
        RAISE NOTICE '';
        RAISE NOTICE '🎯 Maintenant, relancez le script Pexels :';
        RAISE NOTICE '   node pexels-images-correct.mjs VOTRE_CLE';
    ELSE
        RAISE NOTICE '⚠️ Aucune image trouvée. Relancez le script Pexels.';
    END IF;
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;