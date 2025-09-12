-- Migration: Système d'événements complet avec logique de visibilité selon plans
-- Date: 2025-01-14
-- Description: Implémente le système d'événements avec quotas et visibilité selon les plans d'abonnement

-- 1. Vérifier/Créer la table events avec la bonne structure
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
  
  -- Contenu de l'événement
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  start_time TIME,
  end_time TIME,
  
  -- Détails pratiques
  location VARCHAR(255),
  address VARCHAR(500),
  price DECIMAL(10,2),
  capacity INTEGER,
  image_url VARCHAR(500),
  
  -- Logique de visibilité selon le plan (key feature!)
  visibility VARCHAR(20) NOT NULL DEFAULT 'establishment_only' 
    CHECK (visibility IN ('establishment_only', 'homepage', 'newsletter')),
  
  -- Statut et métadonnées
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- 2. Ajouter les colonnes manquantes si elles n'existent pas
DO $$ 
BEGIN
  -- Ajouter visibility si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='visibility') THEN
    ALTER TABLE events ADD COLUMN visibility VARCHAR(20) NOT NULL DEFAULT 'establishment_only' 
      CHECK (visibility IN ('establishment_only', 'homepage', 'newsletter'));
  END IF;
  
  -- Ajouter price si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='price') THEN
    ALTER TABLE events ADD COLUMN price DECIMAL(10,2);
  END IF;
  
  -- Ajouter capacity si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='capacity') THEN
    ALTER TABLE events ADD COLUMN capacity INTEGER;
  END IF;
  
  -- Ajouter start_time et end_time si elles n'existent pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='start_time') THEN
    ALTER TABLE events ADD COLUMN start_time TIME;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='end_time') THEN
    ALTER TABLE events ADD COLUMN end_time TIME;
  END IF;
  
  -- Ajouter address si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='address') THEN
    ALTER TABLE events ADD COLUMN address VARCHAR(500);
  END IF;
  
END $$;

-- 3. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_events_establishment_id ON events(establishment_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_published_at ON events(published_at);

-- Index composé pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_events_visibility_date ON events(visibility, start_date) 
  WHERE status = 'published';

-- 4. Créer la table de comptage des événements par mois
CREATE TABLE IF NOT EXISTS event_quotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  events_used INTEGER DEFAULT 0,
  events_limit INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte unique par établissement/mois
  UNIQUE(establishment_id, year, month)
);

-- Index pour event_quotas
CREATE INDEX IF NOT EXISTS idx_event_quotas_establishment ON event_quotas(establishment_id);
CREATE INDEX IF NOT EXISTS idx_event_quotas_period ON event_quotas(year, month);

-- 5. Fonction pour vérifier les quotas d'événements
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
  -- Extraire année et mois
  v_year := EXTRACT(YEAR FROM p_event_date);
  v_month := EXTRACT(MONTH FROM p_event_date);
  
  -- Récupérer le plan de l'établissement
  SELECT plan INTO v_plan 
  FROM establishments 
  WHERE id = p_establishment_id;
  
  -- Définir les limites selon le plan
  CASE v_plan
    WHEN 'basic' THEN v_max_events := 3;
    WHEN 'pro' THEN v_max_events := 3;
    WHEN 'expert' THEN v_max_events := 6;
    ELSE v_max_events := 3; -- défaut
  END CASE;
  
  -- Compter les événements publiés ce mois
  SELECT COUNT(*)::INTEGER INTO v_current_count
  FROM events e
  WHERE e.establishment_id = p_establishment_id
    AND EXTRACT(YEAR FROM e.start_date) = v_year
    AND EXTRACT(MONTH FROM e.start_date) = v_month
    AND e.status = 'published';
  
  -- Mettre à jour ou créer l'enregistrement quota
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
  -- Récupérer le plan de l'établissement
  SELECT plan INTO v_plan 
  FROM establishments 
  WHERE id = p_establishment_id;
  
  -- Retourner la visibilité selon le plan
  CASE v_plan
    WHEN 'basic' THEN RETURN 'establishment_only';
    WHEN 'pro' THEN RETURN 'homepage';
    WHEN 'expert' THEN RETURN 'newsletter';
    ELSE RETURN 'establishment_only'; -- défaut
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger pour mettre à jour automatiquement la visibilité
CREATE OR REPLACE FUNCTION update_event_visibility_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un nouvel événement, définir la visibilité selon le plan
  IF TG_OP = 'INSERT' THEN
    NEW.visibility = set_event_visibility_by_plan(NEW.establishment_id);
  END IF;
  
  -- Mettre à jour updated_at
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

-- 8. Vue pour les événements avec informations établissement
CREATE OR REPLACE VIEW events_with_establishment AS
SELECT 
  e.*,
  est.name as establishment_name,
  est.plan as establishment_plan,
  est.slug as establishment_slug,
  est.category as establishment_category
FROM events e
JOIN establishments est ON e.establishment_id = est.id
WHERE e.status = 'published'
  AND est.status = 'active';

-- 9. Politiques RLS pour sécuriser l'accès aux événements
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_quotas ENABLE ROW LEVEL SECURITY;

-- RLS pour events : lecture publique des événements publiés
CREATE POLICY "Events publics lisibles" ON events
  FOR SELECT USING (status = 'published');

-- RLS pour events : les propriétaires peuvent tout faire sur leurs événements
CREATE POLICY "Propriétaires gèrent leurs événements" ON events
  FOR ALL USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

-- RLS pour event_quotas : propriétaires peuvent voir leurs quotas
CREATE POLICY "Propriétaires voient leurs quotas" ON event_quotas
  FOR SELECT USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

-- 10. Fonction pour obtenir les événements selon le contexte (homepage, newsletter, etc.)
CREATE OR REPLACE FUNCTION get_events_by_visibility(
  p_visibility TEXT DEFAULT 'homepage',
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  establishment_id UUID,
  title TEXT,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  start_time TIME,
  end_time TIME,
  location TEXT,
  address TEXT,
  price DECIMAL,
  capacity INTEGER,
  image_url TEXT,
  establishment_name TEXT,
  establishment_slug TEXT,
  establishment_plan TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.establishment_id,
    e.title,
    e.description,
    e.start_date,
    e.end_date,
    e.start_time,
    e.end_time,
    e.location,
    e.address,
    e.price,
    e.capacity,
    e.image_url,
    est.name as establishment_name,
    est.slug as establishment_slug,
    est.plan as establishment_plan
  FROM events e
  JOIN establishments est ON e.establishment_id = est.id
  WHERE e.status = 'published'
    AND est.status = 'active'
    AND e.start_date >= NOW()
    AND (
      (p_visibility = 'homepage' AND e.visibility IN ('homepage', 'newsletter')) OR
      (p_visibility = 'newsletter' AND e.visibility = 'newsletter') OR
      (p_visibility = 'establishment_only' AND e.visibility = 'establishment_only')
    )
  ORDER BY e.start_date ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Données d'exemple pour tester (optionnel)
-- Uncomment pour ajouter des données de test
/*
INSERT INTO events (
  establishment_id, 
  title, 
  description, 
  start_date, 
  start_time,
  location,
  visibility
) VALUES 
(
  (SELECT id FROM establishments LIMIT 1),
  'Test Event - Concert Jazz',
  'Concert de jazz exceptionnel dans notre établissement',
  NOW() + INTERVAL '7 days',
  '20:00:00',
  'Salle principale',
  'homepage'
);
*/

-- Commentaires et documentation
COMMENT ON TABLE events IS 'Événements des établissements avec système de visibilité selon les plans d''abonnement';
COMMENT ON COLUMN events.visibility IS 'Définit où l''événement est visible: establishment_only (Basic), homepage (Pro), newsletter (Expert)';
COMMENT ON TABLE event_quotas IS 'Suivi des quotas d''événements par mois et par établissement';
COMMENT ON FUNCTION check_event_quota(UUID, TIMESTAMPTZ) IS 'Vérifie si un établissement peut créer un nouvel événement selon son plan';
COMMENT ON FUNCTION set_event_visibility_by_plan(UUID) IS 'Détermine la visibilité d''un événement selon le plan de l''établissement';