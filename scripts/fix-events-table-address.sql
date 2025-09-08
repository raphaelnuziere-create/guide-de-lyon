-- Fix events table - Add missing address column
-- Date: 2025-01-08
-- Issue: Frontend expects 'address' column but table events doesn't have it

-- 1. Add address column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS address VARCHAR(255);

-- 2. Ajouter une description pour la nouvelle colonne
COMMENT ON COLUMN events.address IS 'Adresse complète de l''événement (peut être différente de l''établissement)';

-- 3. Verify the structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name = 'address'
ORDER BY column_name;