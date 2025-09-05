-- ============================================
-- SCRIPT COMPLET - Configuration des images du blog
-- ============================================
-- Ce script fait tout : ajoute les colonnes ET les images

-- ÉTAPE 1 : Ajouter les colonnes image_url et image_alt si elles n'existent pas
DO $$
BEGIN
    -- Ajouter image_url si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN image_url TEXT;
        RAISE NOTICE '✅ Colonne image_url ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne image_url existe déjà';
    END IF;

    -- Ajouter image_alt si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'blog_posts' 
        AND column_name = 'image_alt'
    ) THEN
        ALTER TABLE blog_posts ADD COLUMN image_alt TEXT;
        RAISE NOTICE '✅ Colonne image_alt ajoutée';
    ELSE
        RAISE NOTICE 'ℹ️ Colonne image_alt existe déjà';
    END IF;
END $$;

-- ÉTAPE 2 : Vérifier que les colonnes sont bien créées
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name IN ('image_url', 'image_alt');
    
    IF col_count = 2 THEN
        RAISE NOTICE '✅ Les colonnes sont prêtes pour les images';
    ELSE
        RAISE EXCEPTION '❌ Problème avec les colonnes image';
    END IF;
END $$;

-- ÉTAPE 3 : Ajouter des images Pexels de haute qualité aux articles
UPDATE blog_posts
SET 
    image_url = CASE 
        -- Boulangerie / Pâtisserie
        WHEN title ILIKE '%boulangerie%' OR title ILIKE '%pain%' THEN 
            'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Restaurant avec terrasse
        WHEN title ILIKE '%terrasse%' THEN 
            'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Restaurant / Gastronomie
        WHEN title ILIKE '%restaurant%' OR title ILIKE '%gastronomie%' THEN 
            'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Brunch / Café
        WHEN title ILIKE '%brunch%' THEN 
            'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN title ILIKE '%café%' OR title ILIKE '%coffee%' THEN 
            'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Parc / Nature / Tête d'Or
        WHEN title ILIKE '%parc%' OR title ILIKE '%tête%' OR title ILIKE '%jardin%' THEN 
            'https://images.pexels.com/photos/2422974/pexels-photo-2422974.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Festival / Lumières / Événements
        WHEN title ILIKE '%festival%' OR title ILIKE '%lumière%' OR title ILIKE '%fête%' THEN 
            'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN title ILIKE '%événement%' OR title ILIKE '%agenda%' THEN 
            'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Marché / Commerce local
        WHEN title ILIKE '%marché%' OR title ILIKE '%course%' THEN 
            'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Musée / Art / Culture
        WHEN title ILIKE '%musée%' OR title ILIKE '%art%' OR title ILIKE '%exposition%' THEN 
            'https://images.pexels.com/photos/3004909/pexels-photo-3004909.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN title ILIKE '%culture%' OR title ILIKE '%patrimoine%' THEN 
            'https://images.pexels.com/photos/2570063/pexels-photo-2570063.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Transport / Mobilité
        WHEN title ILIKE '%transport%' OR title ILIKE '%tram%' OR title ILIKE '%métro%' THEN 
            'https://images.pexels.com/photos/1834164/pexels-photo-1834164.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN title ILIKE '%vélo%' OR title ILIKE '%mobilité%' THEN 
            'https://images.pexels.com/photos/2558681/pexels-photo-2558681.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Shopping / Commerce
        WHEN title ILIKE '%shopping%' OR title ILIKE '%boutique%' THEN 
            'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN title ILIKE '%commerce%' OR title ILIKE '%magasin%' THEN 
            'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Hôtel / Hébergement
        WHEN title ILIKE '%hôtel%' OR title ILIKE '%hébergement%' THEN 
            'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Sport / Fitness
        WHEN title ILIKE '%sport%' OR title ILIKE '%fitness%' OR title ILIKE '%gym%' THEN 
            'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Guide / Tourisme
        WHEN title ILIKE '%guide%' OR title ILIKE '%découvrir%' OR title ILIKE '%tourisme%' THEN 
            'https://images.pexels.com/photos/2411759/pexels-photo-2411759.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Nouveau / Ouverture
        WHEN title ILIKE '%nouveau%' OR title ILIKE '%ouverture%' OR title ILIKE '%ouvrir%' THEN 
            'https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Images par défaut de Lyon (variées)
        WHEN MOD(EXTRACT(EPOCH FROM created_at)::INTEGER, 5) = 0 THEN
            'https://images.pexels.com/photos/2363807/pexels-photo-2363807.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN MOD(EXTRACT(EPOCH FROM created_at)::INTEGER, 5) = 1 THEN
            'https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN MOD(EXTRACT(EPOCH FROM created_at)::INTEGER, 5) = 2 THEN
            'https://images.pexels.com/photos/1796715/pexels-photo-1796715.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN MOD(EXTRACT(EPOCH FROM created_at)::INTEGER, 5) = 3 THEN
            'https://images.pexels.com/photos/3214995/pexels-photo-3214995.jpeg?auto=compress&cs=tinysrgb&w=1600'
        ELSE
            'https://images.pexels.com/photos/2104882/pexels-photo-2104882.jpeg?auto=compress&cs=tinysrgb&w=1600'
    END,
    image_alt = CASE
        WHEN title ILIKE '%boulangerie%' THEN 'Boulangerie artisanale avec pains et viennoiseries'
        WHEN title ILIKE '%restaurant%' AND title ILIKE '%terrasse%' THEN 'Restaurant avec terrasse ensoleillée'
        WHEN title ILIKE '%restaurant%' THEN 'Restaurant gastronomique lyonnais'
        WHEN title ILIKE '%brunch%' THEN 'Brunch gourmand avec plats variés'
        WHEN title ILIKE '%café%' THEN 'Café cosy avec ambiance chaleureuse'
        WHEN title ILIKE '%parc%' THEN 'Parc verdoyant de Lyon'
        WHEN title ILIKE '%festival%' THEN 'Festival et illuminations à Lyon'
        WHEN title ILIKE '%marché%' THEN 'Marché local avec produits frais'
        WHEN title ILIKE '%musée%' THEN 'Musée et exposition culturelle'
        WHEN title ILIKE '%transport%' THEN 'Transport en commun lyonnais moderne'
        WHEN title ILIKE '%shopping%' THEN 'Zone commerciale animée'
        WHEN title ILIKE '%sport%' THEN 'Activités sportives à Lyon'
        ELSE 'Vue panoramique de la ville de Lyon'
    END
WHERE image_url IS NULL OR image_url = '';

-- ÉTAPE 4 : Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_blog_posts_image_url ON blog_posts(image_url);

-- ÉTAPE 5 : Afficher le résultat final
DO $$
DECLARE
    total_articles INTEGER;
    articles_avec_images INTEGER;
    articles_sans_images INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_articles FROM blog_posts;
    SELECT COUNT(*) INTO articles_avec_images FROM blog_posts WHERE image_url IS NOT NULL AND image_url != '';
    SELECT COUNT(*) INTO articles_sans_images FROM blog_posts WHERE image_url IS NULL OR image_url = '';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📊 RAPPORT FINAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE '📝 Total articles: %', total_articles;
    RAISE NOTICE '✅ Articles avec images: %', articles_avec_images;
    RAISE NOTICE '❌ Articles sans images: %', articles_sans_images;
    RAISE NOTICE '========================================';
    
    IF articles_sans_images = 0 THEN
        RAISE NOTICE '🎉 SUCCÈS! Tous les articles ont maintenant une image!';
    ELSE
        RAISE NOTICE '⚠️ Il reste % articles sans image', articles_sans_images;
    END IF;
END $$;

-- ÉTAPE 6 : Afficher un échantillon des articles avec leurs images
SELECT 
    SUBSTRING(title, 1, 40) || '...' as titre,
    CASE 
        WHEN image_url IS NOT NULL AND image_url != '' THEN '✅ Image ajoutée'
        ELSE '❌ Pas d''image'
    END as statut,
    SUBSTRING(image_url, 30, 30) || '...' as apercu_image
FROM blog_posts
ORDER BY created_at DESC
LIMIT 10;

-- FIN DU SCRIPT
-- Votre blog a maintenant de belles images Pexels !
-- Pour personnaliser une image, modifiez directement image_url dans Table Editor