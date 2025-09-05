-- =====================================================
-- PARTIE 4 : FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour réinitialiser les quotas mensuels
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET events_used_this_month = 0,
      last_quota_reset = NOW()
  WHERE DATE_PART('month', last_quota_reset) != DATE_PART('month', NOW())
     OR DATE_PART('year', last_quota_reset) != DATE_PART('year', NOW());
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un établissement peut créer un événement
CREATE OR REPLACE FUNCTION can_create_event(p_establishment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_limit INTEGER;
  v_events_used INTEGER;
BEGIN
  SELECT 
    sp.max_events_per_month,
    s.events_used_this_month
  INTO v_plan_limit, v_events_used
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.establishment_id = p_establishment_id
    AND s.status IN ('trialing', 'active');
  
  IF v_plan_limit IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN v_events_used < v_plan_limit;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_unique_slug(p_name VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  v_slug VARCHAR;
  v_counter INTEGER := 0;
BEGIN
  v_slug := LOWER(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := TRIM(BOTH '-' FROM v_slug);
  
  WHILE EXISTS(SELECT 1 FROM establishments WHERE slug = v_slug || CASE WHEN v_counter > 0 THEN '-' || v_counter ELSE '' END) LOOP
    v_counter := v_counter + 1;
  END LOOP;
  
  IF v_counter > 0 THEN
    v_slug := v_slug || '-' || v_counter;
  END IF;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter le compteur d'événements
CREATE OR REPLACE FUNCTION increment_event_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    UPDATE subscriptions
    SET events_used_this_month = events_used_this_month + 1
    WHERE establishment_id = NEW.establishment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un slug automatiquement
CREATE OR REPLACE FUNCTION generate_establishment_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_establishments_updated_at ON establishments;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS event_published_trigger ON events;
DROP TRIGGER IF EXISTS establishment_slug_trigger ON establishments;

-- Create triggers
CREATE TRIGGER update_establishments_updated_at 
  BEFORE UPDATE ON establishments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at 
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER event_published_trigger
  AFTER INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION increment_event_counter();

CREATE TRIGGER establishment_slug_trigger
  BEFORE INSERT ON establishments
  FOR EACH ROW
  EXECUTE FUNCTION generate_establishment_slug();