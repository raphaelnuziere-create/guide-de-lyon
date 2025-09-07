-- Migration: Ajouter le tracking des quotas utilisés
-- Date: 2025-01-07

-- Ajouter les colonnes de tracking des quotas dans establishments
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS events_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS photos_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_quota_reset TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS quota_reset_count INTEGER DEFAULT 0;

-- Créer une table pour l'historique des resets
CREATE TABLE IF NOT EXISTS quota_reset_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  reset_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  events_before_reset INTEGER NOT NULL,
  photos_before_reset INTEGER NOT NULL,
  plan_at_reset VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer un index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_establishments_quota_reset 
ON establishments(last_quota_reset);

CREATE INDEX IF NOT EXISTS idx_quota_reset_history_establishment 
ON quota_reset_history(establishment_id);

-- Fonction pour reset les quotas d'un établissement
CREATE OR REPLACE FUNCTION reset_establishment_quotas(est_id UUID)
RETURNS void AS $$
BEGIN
  -- Sauvegarder l'historique
  INSERT INTO quota_reset_history (
    establishment_id,
    events_before_reset,
    photos_before_reset,
    plan_at_reset
  )
  SELECT 
    id,
    events_this_month,
    photos_this_month,
    plan
  FROM establishments
  WHERE id = est_id;

  -- Reset les compteurs
  UPDATE establishments
  SET 
    events_this_month = 0,
    photos_this_month = 0,
    last_quota_reset = NOW(),
    quota_reset_count = quota_reset_count + 1
  WHERE id = est_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour reset tous les quotas (à appeler mensuellement)
CREATE OR REPLACE FUNCTION reset_all_quotas()
RETURNS INTEGER AS $$
DECLARE
  reset_count INTEGER := 0;
BEGIN
  -- Sauvegarder l'historique pour tous les établissements
  INSERT INTO quota_reset_history (
    establishment_id,
    events_before_reset,
    photos_before_reset,
    plan_at_reset
  )
  SELECT 
    id,
    events_this_month,
    photos_this_month,
    plan
  FROM establishments
  WHERE events_this_month > 0 OR photos_this_month > 0;

  -- Compter combien d'établissements sont resetés
  SELECT COUNT(*) INTO reset_count
  FROM establishments
  WHERE events_this_month > 0 OR photos_this_month > 0;

  -- Reset tous les compteurs
  UPDATE establishments
  SET 
    events_this_month = 0,
    photos_this_month = 0,
    last_quota_reset = NOW(),
    quota_reset_count = quota_reset_count + 1
  WHERE events_this_month > 0 OR photos_this_month > 0;

  RETURN reset_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour incrémenter automatiquement le compteur d'événements
CREATE OR REPLACE FUNCTION increment_event_quota()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrémenter seulement si c'est un nouvel événement publié
  IF NEW.status = 'published' AND (OLD IS NULL OR OLD.status != 'published') THEN
    UPDATE establishments
    SET events_this_month = events_this_month + 1
    WHERE id = NEW.establishment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_increment_event_quota ON events;
CREATE TRIGGER trigger_increment_event_quota
AFTER INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION increment_event_quota();

-- Fonction pour vérifier si un établissement peut créer un événement
CREATE OR REPLACE FUNCTION can_create_event(est_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_events INTEGER;
  current_plan VARCHAR(20);
BEGIN
  -- Récupérer le plan et le nombre actuel d'événements
  SELECT events_this_month, plan INTO current_count, current_plan
  FROM establishments
  WHERE id = est_id;

  -- Déterminer la limite selon le plan
  CASE current_plan
    WHEN 'expert' THEN max_events := 6;
    WHEN 'pro' THEN max_events := 3;
    WHEN 'basic' THEN max_events := 3;
    ELSE max_events := 1;
  END CASE;

  -- Retourner true si sous la limite
  RETURN current_count < max_events;
END;
$$ LANGUAGE plpgsql;

-- Ajouter une politique RLS pour protéger les resets
ALTER TABLE quota_reset_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quota history viewable by establishment owner" ON quota_reset_history
FOR SELECT
USING (
  establishment_id IN (
    SELECT id FROM establishments 
    WHERE user_id = auth.uid()
  )
);

-- Commenter pour documentation
COMMENT ON COLUMN establishments.events_this_month IS 'Nombre d''événements créés ce mois-ci';
COMMENT ON COLUMN establishments.photos_this_month IS 'Nombre de photos uploadées ce mois-ci';
COMMENT ON COLUMN establishments.last_quota_reset IS 'Date du dernier reset des quotas';
COMMENT ON FUNCTION reset_all_quotas() IS 'Fonction à appeler le 1er de chaque mois pour reset tous les quotas';