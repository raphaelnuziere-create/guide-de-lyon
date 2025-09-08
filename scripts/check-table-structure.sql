-- Vérifier TOUTES les colonnes existantes dans la table establishments
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'establishments'
ORDER BY ordinal_position;

-- Vérifier quelles colonnes manquent
SELECT 
    'address_district' as missing_column
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'establishments' 
    AND column_name = 'address_district'
)
UNION
SELECT 
    'views_count' as missing_column
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'establishments' 
    AND column_name = 'views_count'
)
UNION
SELECT 
    'slug' as missing_column
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'establishments' 
    AND column_name = 'slug'
);

-- Si vous voulez ajouter les colonnes manquantes, décommentez et exécutez :
-- ALTER TABLE establishments ADD COLUMN IF NOT EXISTS address_district TEXT;
-- ALTER TABLE establishments ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
-- ALTER TABLE establishments ADD COLUMN IF NOT EXISTS slug TEXT;