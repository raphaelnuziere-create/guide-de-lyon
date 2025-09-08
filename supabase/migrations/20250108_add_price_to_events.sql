-- Migration: Ajout de la colonne price dans events
-- Date: 2025-01-08
-- Description: Ajoute la colonne price pour les événements

-- Ajouter la colonne price
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Ajouter la colonne is_free si elle n'existe pas
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- Commentaires
COMMENT ON COLUMN events.price IS 'Prix de l''événement (peut être NULL si gratuit)';
COMMENT ON COLUMN events.is_free IS 'true si l''événement est gratuit';