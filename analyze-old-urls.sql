-- ============================================
-- ANALYSE DES ANCIENNES URLs POUR REDIRECTIONS SEO
-- ============================================

-- 1. Extraire les patterns d'URLs depuis old_url
SELECT 
    SPLIT_PART(old_url, '/', 1) as category_slug,
    COUNT(*) as total,
    STRING_AGG(DISTINCT SPLIT_PART(old_url, '/', 1), ', ') as unique_categories
FROM blog_posts
WHERE old_url IS NOT NULL AND old_url != ''
GROUP BY SPLIT_PART(old_url, '/', 1)
ORDER BY total DESC;

-- 2. Lister toutes les anciennes URLs uniques
SELECT DISTINCT
    old_url,
    slug as new_slug,
    title,
    category
FROM blog_posts
WHERE old_url IS NOT NULL AND old_url != ''
ORDER BY old_url;

-- 3. Analyser la structure complète des URLs
SELECT 
    old_url,
    slug as new_slug,
    title,
    CASE 
        WHEN old_url LIKE '%monuments-lyon%' THEN 'monuments-lyon'
        WHEN old_url LIKE '%restaurants-lyon%' THEN 'restaurants-lyon'
        WHEN old_url LIKE '%restaurant-lyon%' THEN 'restaurant-lyon'
        WHEN old_url LIKE '%hotels-lyon%' THEN 'hotels-lyon'
        WHEN old_url LIKE '%hotel-lyon%' THEN 'hotel-lyon'
        WHEN old_url LIKE '%bars-lyon%' THEN 'bars-lyon'
        WHEN old_url LIKE '%bar-lyon%' THEN 'bar-lyon'
        WHEN old_url LIKE '%musees-lyon%' THEN 'musees-lyon'
        WHEN old_url LIKE '%musee-lyon%' THEN 'musee-lyon'
        WHEN old_url LIKE '%parcs-lyon%' THEN 'parcs-lyon'
        WHEN old_url LIKE '%parc-lyon%' THEN 'parc-lyon'
        WHEN old_url LIKE '%shopping-lyon%' THEN 'shopping-lyon'
        WHEN old_url LIKE '%boutiques-lyon%' THEN 'boutiques-lyon'
        WHEN old_url LIKE '%culture-lyon%' THEN 'culture-lyon'
        WHEN old_url LIKE '%sortir-lyon%' THEN 'sortir-lyon'
        WHEN old_url LIKE '%visite-lyon%' THEN 'visite-lyon'
        WHEN old_url LIKE '%tourisme-lyon%' THEN 'tourisme-lyon'
        WHEN old_url LIKE '%evenements-lyon%' THEN 'evenements-lyon'
        WHEN old_url LIKE '%activites-lyon%' THEN 'activites-lyon'
        WHEN old_url LIKE '%loisirs-lyon%' THEN 'loisirs-lyon'
        WHEN old_url LIKE '%sport-lyon%' THEN 'sport-lyon'
        WHEN old_url LIKE '%bien-etre-lyon%' THEN 'bien-etre-lyon'
        WHEN old_url LIKE '%beaute-lyon%' THEN 'beaute-lyon'
        WHEN old_url LIKE '%coiffeur-lyon%' THEN 'coiffeur-lyon'
        WHEN old_url LIKE '%spa-lyon%' THEN 'spa-lyon'
        WHEN old_url LIKE '%cinema-lyon%' THEN 'cinema-lyon'
        WHEN old_url LIKE '%theatre-lyon%' THEN 'theatre-lyon'
        WHEN old_url LIKE '%concert-lyon%' THEN 'concert-lyon'
        WHEN old_url LIKE '%boite-nuit-lyon%' THEN 'boite-nuit-lyon'
        WHEN old_url LIKE '%discotheque-lyon%' THEN 'discotheque-lyon'
        WHEN old_url LIKE '%cafe-lyon%' THEN 'cafe-lyon'
        WHEN old_url LIKE '%brasserie-lyon%' THEN 'brasserie-lyon'
        WHEN old_url LIKE '%pizzeria-lyon%' THEN 'pizzeria-lyon'
        WHEN old_url LIKE '%sushi-lyon%' THEN 'sushi-lyon'
        WHEN old_url LIKE '%bouchon-lyon%' THEN 'bouchon-lyon'
        WHEN old_url LIKE '%gastronomie-lyon%' THEN 'gastronomie-lyon'
        ELSE 'autre'
    END as detected_category,
    created_at
FROM blog_posts
WHERE old_url IS NOT NULL AND old_url != ''
ORDER BY detected_category, old_url;

-- 4. Compter les articles par catégorie détectée
WITH categorized AS (
    SELECT 
        CASE 
            WHEN old_url LIKE '%monuments%' THEN 'monuments'
            WHEN old_url LIKE '%restaurant%' THEN 'restaurants'
            WHEN old_url LIKE '%hotel%' OR old_url LIKE '%hotels%' THEN 'hotels'
            WHEN old_url LIKE '%bar%' OR old_url LIKE '%bars%' THEN 'bars'
            WHEN old_url LIKE '%musee%' OR old_url LIKE '%musees%' THEN 'musees'
            WHEN old_url LIKE '%parc%' OR old_url LIKE '%parcs%' THEN 'parcs'
            WHEN old_url LIKE '%shopping%' OR old_url LIKE '%boutique%' THEN 'shopping'
            WHEN old_url LIKE '%culture%' OR old_url LIKE '%sortir%' THEN 'culture'
            WHEN old_url LIKE '%visite%' OR old_url LIKE '%tourisme%' THEN 'tourisme'
            WHEN old_url LIKE '%evenement%' OR old_url LIKE '%festival%' THEN 'evenements'
            WHEN old_url LIKE '%sport%' OR old_url LIKE '%fitness%' THEN 'sport'
            WHEN old_url LIKE '%bien-etre%' OR old_url LIKE '%spa%' THEN 'bien-etre'
            WHEN old_url LIKE '%cinema%' OR old_url LIKE '%theatre%' THEN 'spectacles'
            WHEN old_url LIKE '%boite%' OR old_url LIKE '%discotheque%' THEN 'nightlife'
            WHEN old_url LIKE '%cafe%' OR old_url LIKE '%coffee%' THEN 'cafes'
            WHEN old_url LIKE '%brasserie%' OR old_url LIKE '%bistrot%' THEN 'brasseries'
            WHEN old_url LIKE '%pizzeria%' OR old_url LIKE '%italien%' THEN 'italien'
            WHEN old_url LIKE '%sushi%' OR old_url LIKE '%japonais%' THEN 'japonais'
            WHEN old_url LIKE '%bouchon%' THEN 'bouchons'
            WHEN old_url LIKE '%gastronomie%' OR old_url LIKE '%etoile%' THEN 'gastronomie'
            ELSE 'autre'
        END as category_type,
        COUNT(*) as count
    FROM blog_posts
    WHERE old_url IS NOT NULL AND old_url != ''
    GROUP BY category_type
)
SELECT * FROM categorized
ORDER BY count DESC;

-- 5. Exporter la table de mapping pour les redirections
SELECT 
    old_url as "Ancienne URL",
    '/blog/' || slug as "Nouvelle URL",
    title as "Titre de l'article"
FROM blog_posts
WHERE old_url IS NOT NULL AND old_url != ''
ORDER BY old_url;