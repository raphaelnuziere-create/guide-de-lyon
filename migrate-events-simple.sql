-- Migration simplifiée pour le système d'événements
-- À appliquer dans Supabase Dashboard > SQL Editor

-- 1. Ajouter la colonne visibility à la table events existante
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) 
DEFAULT 'establishment_only' 
CHECK (visibility IN ('establishment_only', 'homepage', 'newsletter'));

-- 2. Ajouter les colonnes manquantes
ALTER TABLE events ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS capacity INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS address VARCHAR(500);

-- 3. Créer la table event_quotas
CREATE TABLE IF NOT EXISTS event_quotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  events_used INTEGER DEFAULT 0,
  events_limit INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(establishment_id, year, month)
);

-- 4. Index pour event_quotas
CREATE INDEX IF NOT EXISTS idx_event_quotas_establishment ON event_quotas(establishment_id);
CREATE INDEX IF NOT EXISTS idx_event_quotas_period ON event_quotas(year, month);

-- 5. Fonction pour vérifier les quotas
CREATE OR REPLACE FUNCTION check_event_quota(
  p_establishment_id UUID,
  p_event_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
DECLARE
  v_plan TEXT;
  v_max_events INTEGER;
  v_current_count INTEGER;
  v_year INTEGER;
  v_month INTEGER;
BEGIN
  v_year := EXTRACT(YEAR FROM p_event_date);
  v_month := EXTRACT(MONTH FROM p_event_date);
  
  SELECT plan INTO v_plan 
  FROM establishments 
  WHERE id = p_establishment_id;
  
  CASE v_plan
    WHEN 'basic' THEN v_max_events := 3;
    WHEN 'pro' THEN v_max_events := 3;
    WHEN 'expert' THEN v_max_events := 6;
    ELSE v_max_events := 3;
  END CASE;
  
  SELECT COUNT(*)::INTEGER INTO v_current_count
  FROM events e
  WHERE e.establishment_id = p_establishment_id
    AND EXTRACT(YEAR FROM e.start_date) = v_year
    AND EXTRACT(MONTH FROM e.start_date) = v_month
    AND e.status = 'published';
  
  INSERT INTO event_quotas (establishment_id, year, month, events_used, events_limit)
  VALUES (p_establishment_id, v_year, v_month, v_current_count, v_max_events)
  ON CONFLICT (establishment_id, year, month)
  DO UPDATE SET 
    events_used = v_current_count,
    events_limit = v_max_events,
    updated_at = NOW();
  
  RETURN jsonb_build_object(
    'plan', v_plan,
    'events_used', v_current_count,
    'events_limit', v_max_events,
    'can_create', (v_current_count < v_max_events),
    'remaining', (v_max_events - v_current_count)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour définir la visibilité selon le plan
CREATE OR REPLACE FUNCTION set_event_visibility_by_plan(
  p_establishment_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_plan TEXT;
BEGIN
  SELECT plan INTO v_plan 
  FROM establishments 
  WHERE id = p_establishment_id;
  
  CASE v_plan
    WHEN 'basic' THEN RETURN 'establishment_only';
    WHEN 'pro' THEN RETURN 'homepage';
    WHEN 'expert' THEN RETURN 'newsletter';
    ELSE RETURN 'establishment_only';
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger pour mettre à jour la visibilité automatiquement
CREATE OR REPLACE FUNCTION update_event_visibility_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.visibility = set_event_visibility_by_plan(NEW.establishment_id);
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_event_visibility ON events;
CREATE TRIGGER trigger_update_event_visibility
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_event_visibility_trigger();

-- 8. Mettre à jour les événements existants avec la visibilité selon leur plan
UPDATE events 
SET visibility = set_event_visibility_by_plan(establishment_id)
WHERE visibility IS NULL OR visibility = 'establishment_only';

-- 9. Activer RLS sur les nouvelles tables
ALTER TABLE event_quotas ENABLE ROW LEVEL SECURITY;

-- 10. Politiques RLS pour event_quotas
DROP POLICY IF EXISTS "Propriétaires voient leurs quotas" ON event_quotas;
CREATE POLICY "Propriétaires voient leurs quotas" ON event_quotas
  FOR SELECT USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- Commentaires de documentation
COMMENT ON COLUMN events.visibility IS 'Visibilité selon le plan: establishment_only (Basic), homepage (Pro), newsletter (Expert)';
COMMENT ON TABLE event_quotas IS 'Suivi des quotas événements par mois et établissement';
COMMENT ON FUNCTION check_event_quota(UUID, TIMESTAMPTZ) IS 'Vérifie les quotas événements selon le plan';

-- Fin de la migration