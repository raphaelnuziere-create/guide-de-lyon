-- =====================================================
-- SYSTÈME D'ABONNEMENT PROFESSIONNEL - GUIDE DE LYON
-- =====================================================

-- 1. TABLE DES PLANS D'ABONNEMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  
  -- Limites et fonctionnalités
  max_photos INTEGER NOT NULL DEFAULT 1,
  max_events_per_month INTEGER NOT NULL DEFAULT 0,
  max_description_length INTEGER NOT NULL DEFAULT 200,
  
  -- Visibilité des événements
  events_on_homepage BOOLEAN DEFAULT FALSE,
  events_in_newsletter BOOLEAN DEFAULT FALSE,
  events_on_social BOOLEAN DEFAULT FALSE,
  
  -- Features
  has_carousel BOOLEAN DEFAULT FALSE,
  has_video BOOLEAN DEFAULT FALSE,
  has_pdf_menu BOOLEAN DEFAULT FALSE,
  has_reservation_link BOOLEAN DEFAULT FALSE,
  has_statistics BOOLEAN DEFAULT FALSE,
  statistics_days INTEGER DEFAULT 0,
  
  -- Position dans l'annuaire
  directory_boost INTEGER DEFAULT 0, -- 0=standard, 100=pro, 200=expert
  badge_type VARCHAR(20), -- null, 'verified', 'expert'
  
  -- Métadonnées
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE DES ÉTABLISSEMENTS PROFESSIONNELS
-- =====================================================
CREATE TABLE IF NOT EXISTS establishments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  
  -- Contact
  email VARCHAR(255),
  phone VARCHAR(20),
  hide_email BOOLEAN DEFAULT FALSE,
  hide_phone BOOLEAN DEFAULT FALSE,
  website VARCHAR(255),
  
  -- Localisation
  address VARCHAR(500),
  postal_code VARCHAR(10),
  city VARCHAR(100) DEFAULT 'Lyon',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  -- Réseaux sociaux
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  
  -- Documents légaux
  vat_number VARCHAR(50), -- Numéro de TVA pour vérification
  siret VARCHAR(20),
  
  -- Horaires (JSON structuré)
  opening_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "17:00", "closed": false},
    "sunday": {"closed": true}
  }',
  
  -- Features spécifiques au plan
  reservation_link VARCHAR(500),
  
  -- Statut
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, suspended, closed
  verified_at TIMESTAMPTZ,
  
  -- Métadonnées
  category VARCHAR(100),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE DES ABONNEMENTS ACTIFS
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  
  -- Stripe
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  
  -- Statut et périodes
  status VARCHAR(20) DEFAULT 'trialing', -- trialing, active, past_due, canceled, paused
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
  
  -- Dates importantes
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  -- Quotas utilisés ce mois
  events_used_this_month INTEGER DEFAULT 0,
  last_quota_reset TIMESTAMPTZ DEFAULT NOW(),
  
  -- Tracking essai gratuit
  trial_event_published BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE DES MÉDIAS (PHOTOS/VIDÉOS)
-- =====================================================
CREATE TABLE IF NOT EXISTS establishment_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  
  type VARCHAR(20) NOT NULL, -- 'cover', 'gallery', 'video', 'menu_pdf'
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  caption VARCHAR(255),
  
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE DES ÉVÉNEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  
  -- Informations de base
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Dates et horaires
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Catégorie et tags
  category VARCHAR(100),
  tags TEXT[],
  
  -- Média
  image_url VARCHAR(500),
  
  -- Visibilité selon le plan
  show_on_homepage BOOLEAN DEFAULT FALSE,
  show_in_newsletter BOOLEAN DEFAULT FALSE,
  publish_to_social BOOLEAN DEFAULT FALSE,
  
  -- Capacité (optionnel)
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  
  -- Lien externe
  booking_link VARCHAR(500),
  
  -- Statut
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, canceled
  published_at TIMESTAMPTZ,
  
  -- Tracking diffusion sociale
  facebook_posted BOOLEAN DEFAULT FALSE,
  instagram_posted BOOLEAN DEFAULT FALSE,
  social_posted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE DES STATISTIQUES
-- =====================================================
CREATE TABLE IF NOT EXISTS establishment_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  
  -- Métriques
  profile_views INTEGER DEFAULT 0,
  phone_clicks INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  direction_clicks INTEGER DEFAULT 0,
  event_views INTEGER DEFAULT 0,
  reservation_clicks INTEGER DEFAULT 0,
  
  -- Sources de trafic
  traffic_sources JSONB DEFAULT '{
    "direct": 0,
    "search": 0,
    "social": 0,
    "newsletter": 0,
    "other": 0
  }',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(establishment_id, date)
);

-- 7. TABLE DES PRÉFÉRENCES NEWSLETTER
-- =====================================================
CREATE TABLE IF NOT EXISTS newsletter_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  
  -- Fréquences
  frequency VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly
  
  -- Types de contenu
  receive_events BOOLEAN DEFAULT TRUE,
  receive_news BOOLEAN DEFAULT TRUE,
  receive_blog BOOLEAN DEFAULT TRUE,
  
  -- Statut
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMPTZ,
  
  -- Tracking
  last_sent_at TIMESTAMPTZ,
  total_sent INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INSERTION DES 3 PLANS
-- =====================================================
INSERT INTO subscription_plans (
  name, slug, price_monthly, price_yearly,
  max_photos, max_events_per_month, max_description_length,
  events_on_homepage, events_in_newsletter, events_on_social,
  has_carousel, has_video, has_pdf_menu, has_reservation_link,
  has_statistics, statistics_days,
  directory_boost, badge_type,
  display_order
) VALUES 
-- PLAN BASIC (GRATUIT)
(
  'Basic', 'basic', 0.00, 0.00,
  1, 3, 200,
  false, false, false,
  false, false, false, false,
  false, 0,
  0, NULL,
  1
),
-- PLAN PRO (19€/mois)
(
  'Pro', 'pro', 19.00, 182.40,
  6, 3, 500,
  true, true, false,
  true, false, false, false,
  true, 30,
  100, 'verified',
  2
),
-- PLAN EXPERT (49€/mois)
(
  'Expert', 'expert', 49.00, 470.40,
  10, 5, 1500,
  true, true, true,
  true, true, true, true,
  true, 90,
  200, 'expert',
  3
);

-- 9. INDEXES POUR LES PERFORMANCES
-- =====================================================
CREATE INDEX idx_establishments_user_id ON establishments(user_id);
CREATE INDEX idx_establishments_status ON establishments(status);
CREATE INDEX idx_establishments_slug ON establishments(slug);
CREATE INDEX idx_subscriptions_establishment ON subscriptions(establishment_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_events_establishment ON events(establishment_id);
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_media_establishment ON establishment_media(establishment_id);
CREATE INDEX idx_analytics_establishment_date ON establishment_analytics(establishment_id, date);

-- 10. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_analytics ENABLE ROW LEVEL SECURITY;

-- Politiques pour establishments
CREATE POLICY "Public can view active establishments" ON establishments
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can manage their own establishments" ON establishments
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (
    establishment_id IN (
      SELECT id FROM establishments WHERE user_id = auth.uid()
    )
  );

-- Politiques pour events
CREATE POLICY "Public can view published events" ON events
  FOR SELECT USING (status = 'published');

CREATE POLICY "Users can manage their own events" ON events
  FOR ALL USING (
    establishment_id IN (
      SELECT id FROM establishments WHERE user_id = auth.uid()
    )
  );

-- Politiques pour media
CREATE POLICY "Public can view active media" ON establishment_media
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage their own media" ON establishment_media
  FOR ALL USING (
    establishment_id IN (
      SELECT id FROM establishments WHERE user_id = auth.uid()
    )
  );

-- Politiques pour analytics
CREATE POLICY "Users can view their own analytics" ON establishment_analytics
  FOR SELECT USING (
    establishment_id IN (
      SELECT id FROM establishments WHERE user_id = auth.uid()
    )
  );

-- 11. FONCTIONS UTILITAIRES
-- =====================================================

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

-- 12. TRIGGERS
-- =====================================================

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_establishments_updated_at BEFORE UPDATE ON establishments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger pour incrémenter le compteur d'événements
CREATE OR REPLACE FUNCTION increment_event_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    UPDATE subscriptions
    SET events_used_this_month = events_used_this_month + 1
    WHERE establishment_id = NEW.establishment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_published_trigger
  AFTER UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION increment_event_counter();

-- Trigger pour générer un slug automatiquement
CREATE OR REPLACE FUNCTION generate_establishment_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER establishment_slug_trigger
  BEFORE INSERT ON establishments
  FOR EACH ROW
  EXECUTE FUNCTION generate_establishment_slug();