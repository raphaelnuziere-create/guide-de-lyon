-- Migration: Ajout du système de plans pour les établissements
-- Date: 2024

-- 1. Ajouter les colonnes pour le système de plans
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'expert')),
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS plan_billing_cycle VARCHAR(20) CHECK (plan_billing_cycle IN ('monthly', 'yearly')),

-- Compteurs et limites
ADD COLUMN IF NOT EXISTS photos_count INTEGER DEFAULT 0 CHECK (photos_count >= 0),
ADD COLUMN IF NOT EXISTS events_this_month INTEGER DEFAULT 0 CHECK (events_this_month >= 0),
ADD COLUMN IF NOT EXISTS events_reset_date DATE DEFAULT CURRENT_DATE,

-- Vérification TVA
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,

-- Statistiques mensuelles
ADD COLUMN IF NOT EXISTS views_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_phone INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_website INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stats_reset_date DATE DEFAULT CURRENT_DATE,

-- Intégration Stripe
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),

-- Bonus annuel
ADD COLUMN IF NOT EXISTS blog_articles_remaining INTEGER DEFAULT 0;

-- 2. Créer la table des photos d'établissement
CREATE TABLE IF NOT EXISTS establishment_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(255),
  position INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_establishment_photos_establishment ON establishment_photos(establishment_id);
CREATE INDEX IF NOT EXISTS idx_establishment_photos_position ON establishment_photos(position);

-- 3. Créer la table des événements
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_start TIMESTAMPTZ NOT NULL,
  date_end TIMESTAMPTZ,
  location VARCHAR(255),
  image_url TEXT,
  
  -- Canaux de diffusion selon le plan
  show_on_establishment_page BOOLEAN DEFAULT TRUE,
  show_on_homepage BOOLEAN DEFAULT FALSE,
  show_in_newsletter BOOLEAN DEFAULT FALSE,
  show_on_social BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_events_establishment ON events(establishment_id);
CREATE INDEX IF NOT EXISTS idx_events_date_start ON events(date_start);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 4. Créer la table d'historique des abonnements
CREATE TABLE IF NOT EXISTS subscriptions_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL,
  previous_plan VARCHAR(20),
  billing_cycle VARCHAR(20),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  stripe_payment_intent_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_history_establishment ON subscriptions_history(establishment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_history_status ON subscriptions_history(status);

-- 5. Fonction pour vérifier les limites du plan
CREATE OR REPLACE FUNCTION check_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
  current_plan VARCHAR(20);
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Récupérer le plan actuel
  SELECT plan INTO current_plan 
  FROM establishments 
  WHERE id = NEW.establishment_id;

  -- Pour les photos
  IF TG_TABLE_NAME = 'establishment_photos' THEN
    SELECT photos_count INTO current_count
    FROM establishments 
    WHERE id = NEW.establishment_id;
    
    -- Définir la limite selon le plan
    CASE current_plan
      WHEN 'basic' THEN max_allowed := 1;
      WHEN 'pro' THEN max_allowed := 6;
      WHEN 'expert' THEN max_allowed := 10;
      ELSE max_allowed := 1;
    END CASE;
    
    IF current_count >= max_allowed THEN
      RAISE EXCEPTION 'Limite de photos atteinte pour le plan %', current_plan;
    END IF;
  END IF;

  -- Pour les événements
  IF TG_TABLE_NAME = 'events' THEN
    SELECT events_this_month INTO current_count
    FROM establishments 
    WHERE id = NEW.establishment_id;
    
    CASE current_plan
      WHEN 'basic' THEN max_allowed := 3;
      WHEN 'pro' THEN max_allowed := 3;
      WHEN 'expert' THEN max_allowed := 6;
      ELSE max_allowed := 3;
    END CASE;
    
    IF current_count >= max_allowed THEN
      RAISE EXCEPTION 'Limite d''événements atteinte pour le mois';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Triggers pour vérifier les limites
DROP TRIGGER IF EXISTS check_photo_limit ON establishment_photos;
CREATE TRIGGER check_photo_limit
  BEFORE INSERT ON establishment_photos
  FOR EACH ROW
  EXECUTE FUNCTION check_plan_limits();

DROP TRIGGER IF EXISTS check_event_limit ON events;
CREATE TRIGGER check_event_limit
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION check_plan_limits();

-- 7. Fonction pour incrémenter les compteurs
CREATE OR REPLACE FUNCTION increment_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Pour les photos
  IF TG_TABLE_NAME = 'establishment_photos' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE establishments 
      SET photos_count = photos_count + 1
      WHERE id = NEW.establishment_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE establishments 
      SET photos_count = photos_count - 1
      WHERE id = OLD.establishment_id;
    END IF;
  END IF;

  -- Pour les événements
  IF TG_TABLE_NAME = 'events' AND NEW.status = 'published' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE establishments 
      SET events_this_month = events_this_month + 1
      WHERE id = NEW.establishment_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Triggers pour les compteurs
DROP TRIGGER IF EXISTS increment_photo_counter ON establishment_photos;
CREATE TRIGGER increment_photo_counter
  AFTER INSERT OR DELETE ON establishment_photos
  FOR EACH ROW
  EXECUTE FUNCTION increment_counters();

DROP TRIGGER IF EXISTS increment_event_counter ON events;
CREATE TRIGGER increment_event_counter
  AFTER INSERT ON events
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION increment_counters();

-- 9. Fonction pour reset mensuel des compteurs
CREATE OR REPLACE FUNCTION reset_monthly_counters()
RETURNS void AS $$
BEGIN
  -- Reset les événements le 1er du mois
  UPDATE establishments
  SET 
    events_this_month = 0,
    events_reset_date = CURRENT_DATE
  WHERE events_reset_date < DATE_TRUNC('month', CURRENT_DATE);
  
  -- Reset les stats le 1er du mois
  UPDATE establishments
  SET 
    views_this_month = 0,
    clicks_phone = 0,
    clicks_website = 0,
    stats_reset_date = CURRENT_DATE
  WHERE stats_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- 10. Row Level Security (RLS)
ALTER TABLE establishment_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions_history ENABLE ROW LEVEL SECURITY;

-- Policies pour establishment_photos
CREATE POLICY "Users can view all photos" ON establishment_photos
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their establishment photos" ON establishment_photos
  FOR ALL USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- Policies pour events
CREATE POLICY "Users can view published events" ON events
  FOR SELECT USING (status = 'published' OR establishment_id IN (
    SELECT id FROM establishments WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their establishment events" ON events
  FOR ALL USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- Policies pour subscriptions_history
CREATE POLICY "Users can view their subscription history" ON subscriptions_history
  FOR SELECT USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- 11. Fonction helper pour obtenir les limites du plan
CREATE OR REPLACE FUNCTION get_plan_limits(p_plan VARCHAR(20))
RETURNS TABLE(
  max_photos INTEGER,
  max_events INTEGER,
  can_show_homepage BOOLEAN,
  can_show_newsletter BOOLEAN,
  can_show_social BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE p_plan
      WHEN 'basic' THEN 1
      WHEN 'pro' THEN 6
      WHEN 'expert' THEN 10
      ELSE 1
    END AS max_photos,
    CASE p_plan
      WHEN 'basic' THEN 3
      WHEN 'pro' THEN 3
      WHEN 'expert' THEN 6
      ELSE 3
    END AS max_events,
    CASE p_plan
      WHEN 'basic' THEN FALSE
      ELSE TRUE
    END AS can_show_homepage,
    CASE p_plan
      WHEN 'basic' THEN FALSE
      ELSE TRUE
    END AS can_show_newsletter,
    CASE p_plan
      WHEN 'expert' THEN TRUE
      ELSE FALSE
    END AS can_show_social;
END;
$$ LANGUAGE plpgsql;