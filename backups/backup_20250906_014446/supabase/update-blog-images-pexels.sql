-- ============================================
-- SCRIPT POUR AJOUTER LES IMAGES PEXELS AUX ARTICLES
-- ============================================
-- 
-- ⚠️ REMPLACEZ VOTRE_CLE_API_PEXELS ci-dessous avec votre vraie clé

-- Configuration de votre clé API Pexels
DO $$
DECLARE
    PEXELS_API_KEY TEXT := 'VOTRE_CLE_API_PEXELS'; -- 👈 Collez votre clé API Pexels ici
    post_record RECORD;
    search_query TEXT;
    image_data JSONB;
    selected_image TEXT;
BEGIN
    -- Pour chaque article sans image
    FOR post_record IN 
        SELECT id, title, slug 
        FROM blog_posts 
        WHERE image_url IS NULL OR image_url = ''
    LOOP
        -- Déterminer le terme de recherche basé sur le titre
        search_query := CASE
            WHEN post_record.title ILIKE '%boulangerie%' THEN 'bakery bread lyon'
            WHEN post_record.title ILIKE '%restaurant%' THEN 'restaurant food lyon'
            WHEN post_record.title ILIKE '%parc%' OR post_record.title ILIKE '%tête%' THEN 'park nature lyon'
            WHEN post_record.title ILIKE '%festival%' OR post_record.title ILIKE '%lumière%' THEN 'festival lights lyon'
            WHEN post_record.title ILIKE '%marché%' THEN 'market fresh produce lyon'
            WHEN post_record.title ILIKE '%musée%' OR post_record.title ILIKE '%art%' THEN 'museum art gallery lyon'
            WHEN post_record.title ILIKE '%brunch%' OR post_record.title ILIKE '%café%' THEN 'cafe brunch restaurant lyon'
            WHEN post_record.title ILIKE '%transport%' OR post_record.title ILIKE '%tram%' THEN 'tram transport lyon'
            WHEN post_record.title ILIKE '%shopping%' THEN 'shopping boutique lyon'
            WHEN post_record.title ILIKE '%hôtel%' THEN 'hotel luxury lyon'
            ELSE 'lyon france city beautiful'
        END;

        RAISE NOTICE 'Article: % - Recherche: %', post_record.title, search_query;
    END LOOP;
END $$;

-- Pour l'instant, on utilise des images statiques de haute qualité
-- (Les appels API directs depuis SQL nécessitent une extension spéciale)
UPDATE blog_posts
SET 
    image_url = CASE 
        -- Boulangerie
        WHEN title ILIKE '%boulangerie%' THEN 
            'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Restaurant / Gastronomie
        WHEN title ILIKE '%restaurant%' AND title ILIKE '%terrasse%' THEN 
            'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN title ILIKE '%brunch%' THEN 
            'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN title ILIKE '%restaurant%' THEN 
            'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Parc / Nature
        WHEN title ILIKE '%parc%' OR title ILIKE '%tête d''or%' THEN 
            'https://images.pexels.com/photos/2422974/pexels-photo-2422974.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Festival / Événements
        WHEN title ILIKE '%festival%' OR title ILIKE '%lumière%' THEN 
            'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN title ILIKE '%événement%' THEN 
            'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Marché
        WHEN title ILIKE '%marché%' THEN 
            'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Musée / Art
        WHEN title ILIKE '%musée%' OR title ILIKE '%art%' THEN 
            'https://images.pexels.com/photos/3004909/pexels-photo-3004909.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Transport
        WHEN title ILIKE '%transport%' OR title ILIKE '%tram%' THEN 
            'https://images.pexels.com/photos/1834164/pexels-photo-1834164.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Shopping
        WHEN title ILIKE '%shopping%' THEN 
            'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=1600'
        
        -- Images par défaut de Lyon (différentes pour varier)
        WHEN id::text LIKE '%1%' OR id::text LIKE '%a%' THEN
            'https://images.pexels.com/photos/2363807/pexels-photo-2363807.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN id::text LIKE '%2%' OR id::text LIKE '%b%' THEN
            'https://images.pexels.com/photos/2422461/pexels-photo-2422461.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN id::text LIKE '%3%' OR id::text LIKE '%c%' THEN
            'https://images.pexels.com/photos/1796715/pexels-photo-1796715.jpeg?auto=compress&cs=tinysrgb&w=1600'
        WHEN id::text LIKE '%4%' OR id::text LIKE '%d%' THEN
            'https://images.pexels.com/photos/3214995/pexels-photo-3214995.jpeg?auto=compress&cs=tinysrgb&w=1600'
        ELSE
            'https://images.pexels.com/photos/2411759/pexels-photo-2411759.jpeg?auto=compress&cs=tinysrgb&w=1600'
    END,
    image_alt = CASE
        WHEN title ILIKE '%boulangerie%' THEN 'Boulangerie artisanale avec pains frais'
        WHEN title ILIKE '%restaurant%' THEN 'Restaurant gastronomique lyonnais'
        WHEN title ILIKE '%parc%' THEN 'Parc verdoyant à Lyon'
        WHEN title ILIKE '%festival%' THEN 'Festival et événement à Lyon'
        WHEN title ILIKE '%marché%' THEN 'Marché local avec produits frais'
        WHEN title ILIKE '%musée%' THEN 'Musée et exposition culturelle'
        WHEN title ILIKE '%transport%' THEN 'Transport en commun lyonnais'
        ELSE 'Vue de la ville de Lyon'
    END
WHERE image_url IS NULL OR image_url = '';

-- Afficher le résultat
SELECT 
    title,
    CASE 
        WHEN image_url IS NOT NULL THEN '✅ Image ajoutée'
        ELSE '❌ Pas d''image'
    END as statut,
    substring(image_url, 1, 50) || '...' as apercu_url
FROM blog_posts
ORDER BY created_at DESC;

-- Message de succès
DO $$
DECLARE
    total_count INTEGER;
    with_images INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM blog_posts;
    SELECT COUNT(*) INTO with_images FROM blog_posts WHERE image_url IS NOT NULL;
    
    RAISE NOTICE '=================================';
    RAISE NOTICE '✅ MISE À JOUR TERMINÉE';
    RAISE NOTICE '=================================';
    RAISE NOTICE 'Total articles: %', total_count;
    RAISE NOTICE 'Avec images: %', with_images;
    RAISE NOTICE 'Sans images: %', total_count - with_images;
    RAISE NOTICE '=================================';
END $$;