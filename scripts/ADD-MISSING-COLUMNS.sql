-- SCRIPT POUR AJOUTER LES COLONNES MANQUANTES DANS SUPABASE
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Ajouter la colonne address_district si elle n'existe pas
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS address_district TEXT;

-- 2. Ajouter la colonne views_count si elle n'existe pas
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 3. Ajouter la colonne slug si elle n'existe pas
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 4. Ajouter les colonnes de dates si elles n'existent pas
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Ajouter les colonnes de réseaux sociaux si elles n'existent pas
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS facebook_url TEXT;

ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- 6. Ajouter la colonne vat_number si elle n'existe pas
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS vat_number TEXT;

-- 7. Ajouter la colonne plan_billing_cycle si elle n'existe pas
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS plan_billing_cycle TEXT DEFAULT 'monthly';

-- 8. Vérifier que toutes les colonnes sont bien créées
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'establishments'
ORDER BY ordinal_position;