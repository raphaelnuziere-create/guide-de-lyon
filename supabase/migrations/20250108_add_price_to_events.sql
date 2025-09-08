-- Migration: Ajout des colonnes manquantes dans events
-- Date: 2025-01-08
-- Description: Ajoute toutes les colonnes manquantes pour les événements

-- Ajouter les colonnes manquantes
ALTER TABLE events ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_on_establishment_page BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_address VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS price_info TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reservation_link VARCHAR(500);
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_link VARCHAR(500);

-- Commentaires
COMMENT ON COLUMN events.price IS 'Prix de l''événement (peut être NULL si gratuit)';
COMMENT ON COLUMN events.is_free IS 'true si l''événement est gratuit';
COMMENT ON COLUMN events.show_on_establishment_page IS 'Afficher sur la page établissement';
COMMENT ON COLUMN events.venue_name IS 'Nom du lieu (peut être différent de l''établissement)';
COMMENT ON COLUMN events.venue_address IS 'Adresse du lieu';
COMMENT ON COLUMN events.price_info IS 'Informations de prix en texte libre';
COMMENT ON COLUMN events.reservation_link IS 'Lien de réservation';
COMMENT ON COLUMN events.external_link IS 'Lien externe vers l''événement';