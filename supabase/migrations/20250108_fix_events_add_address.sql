-- Fix events table: Add missing address column
-- Date: 2025-01-08
-- Issue: Frontend/services expecting 'address' column but table only has 'location'

-- Add address column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS address VARCHAR(255);

-- Copy existing location data to address for backward compatibility
-- (location will be the venue name, address will be the full address)
UPDATE events 
SET address = location 
WHERE address IS NULL AND location IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN events.location IS 'Nom du lieu/établissement (ex: Restaurant Le Gourmet)';
COMMENT ON COLUMN events.address IS 'Adresse complète (ex: 10 rue de la République, 69001 Lyon)';

-- Verify the changes
SELECT 'events table columns after fix:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('location', 'address', 'establishment_id')
ORDER BY column_name;