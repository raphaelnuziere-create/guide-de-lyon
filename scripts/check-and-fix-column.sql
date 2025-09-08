-- Script pour vérifier et corriger la colonne de lien avec auth.users

-- 1. Vérifier quelle colonne existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'establishments' 
AND column_name IN ('owner_id', 'user_id');

-- 2. Si la colonne est 'user_id' au lieu de 'owner_id', la renommer
-- Décommenter et exécuter si nécessaire :
-- ALTER TABLE establishments RENAME COLUMN user_id TO owner_id;

-- 3. Vérifier que la colonne existe et a le bon type
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'establishments'
AND column_name IN ('owner_id', 'user_id')
ORDER BY ordinal_position;

-- 4. Vérifier les établissements existants
SELECT 
    id,
    name,
    COALESCE(owner_id, user_id) as user_reference,
    plan,
    status,
    created_at
FROM establishments
ORDER BY created_at DESC
LIMIT 10;

-- 5. Si nécessaire, ajouter la colonne owner_id si elle n'existe pas
-- ALTER TABLE establishments ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 6. Si les deux colonnes existent, migrer les données de user_id vers owner_id
-- UPDATE establishments SET owner_id = user_id WHERE owner_id IS NULL AND user_id IS NOT NULL;

-- 7. Une fois la migration faite, supprimer l'ancienne colonne
-- ALTER TABLE establishments DROP COLUMN IF EXISTS user_id;