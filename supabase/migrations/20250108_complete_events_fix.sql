-- MIGRATION COMPLÈTE : FIX TABLE EVENTS
-- Date: 2025-01-08
-- Description: Ajoute TOUTES les colonnes manquantes pour les événements

-- Colonnes de base déjà existantes (ne pas ajouter) :
-- id, establishment_id, title, description, start_date, end_date, category, tags, 
-- image_url, max_participants, current_participants, booking_link, status, published_at,
-- facebook_posted, instagram_posted, social_posted_at, created_at, updated_at

-- AJOUTER TOUTES LES COLONNES MANQUANTES
ALTER TABLE events ADD COLUMN IF NOT EXISTS address VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_on_establishment_page BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_on_homepage BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_in_newsletter BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_on_social BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_address VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS price_info TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reservation_link VARCHAR(500);
ALTER TABLE events ADD COLUMN IF NOT EXISTS external_link VARCHAR(500);

-- CRÉER TABLE PHOTOS SI MANQUANTE
CREATE TABLE IF NOT EXISTS establishment_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  caption TEXT,
  position INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX POUR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_establishment_photos_establishment_id ON establishment_photos(establishment_id);
CREATE INDEX IF NOT EXISTS idx_establishment_photos_position ON establishment_photos(establishment_id, position);

-- COMMENTAIRES
COMMENT ON COLUMN events.address IS 'Adresse de l''événement (peut être différente de l''établissement)';
COMMENT ON COLUMN events.show_on_homepage IS 'Afficher sur la page d''accueil (PRO/EXPERT)';
COMMENT ON COLUMN events.show_in_newsletter IS 'Inclure dans la newsletter (PRO/EXPERT)';  
COMMENT ON COLUMN events.show_on_social IS 'Publier sur les réseaux sociaux (EXPERT)';
COMMENT ON TABLE establishment_photos IS 'Photos des établissements avec ordre et légendes';

-- VÉRIFICATION FINALE
SELECT 'MIGRATION TERMINÉE - Vérification:' AS status;
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('events', 'establishment_photos')
AND column_name IN ('address', 'show_on_social', 'show_in_newsletter', 'show_on_homepage', 'url', 'position')
ORDER BY table_name, column_name;