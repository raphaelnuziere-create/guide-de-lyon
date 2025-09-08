-- ============================================
-- SYSTÈME NEWSLETTER MULTI-FRÉQUENCES
-- Guide de Lyon - Création des tables
-- ============================================

-- 1. Table principale des abonnés newsletter
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  verification_token VARCHAR(255),
  verified_at TIMESTAMP WITH TIME ZONE,
  unsubscribe_token VARCHAR(255) DEFAULT gen_random_uuid(),
  
  -- Préférences de fréquence
  daily_frequency BOOLEAN DEFAULT false,
  weekly_frequency BOOLEAN DEFAULT true, -- Par défaut hebdomadaire
  monthly_frequency BOOLEAN DEFAULT false,
  
  -- Préférences de contenu
  wants_events BOOLEAN DEFAULT true,
  wants_news BOOLEAN DEFAULT true,
  wants_articles BOOLEAN DEFAULT true,
  wants_deals BOOLEAN DEFAULT false,
  
  -- Métadonnées
  source VARCHAR(50) DEFAULT 'website', -- website, pro_signup, event_page, etc.
  utm_source VARCHAR(100),
  utm_campaign VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_email_sent TIMESTAMP WITH TIME ZONE,
  
  -- Index
  CONSTRAINT newsletter_subscribers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pour performances
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = true;
CREATE INDEX idx_newsletter_subscribers_daily ON newsletter_subscribers(daily_frequency) WHERE daily_frequency = true AND is_active = true;
CREATE INDEX idx_newsletter_subscribers_weekly ON newsletter_subscribers(weekly_frequency) WHERE weekly_frequency = true AND is_active = true;
CREATE INDEX idx_newsletter_subscribers_monthly ON newsletter_subscribers(monthly_frequency) WHERE monthly_frequency = true AND is_active = true;

-- 2. Table des envois de newsletter (tracking)
DROP TABLE IF EXISTS newsletter_sends CASCADE;
CREATE TABLE newsletter_sends (
  id SERIAL PRIMARY KEY,
  subscriber_id INTEGER REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  subject TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'html',
  
  -- Statistiques
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées de l'envoi
  brevo_message_id VARCHAR(255),
  events_count INTEGER DEFAULT 0,
  news_count INTEGER DEFAULT 0,
  articles_count INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, failed
  error_message TEXT,
  
  CONSTRAINT newsletter_sends_frequency_check CHECK (frequency IN ('daily', 'weekly', 'monthly'))
);

-- Index pour le tracking
CREATE INDEX idx_newsletter_sends_subscriber ON newsletter_sends(subscriber_id);
CREATE INDEX idx_newsletter_sends_frequency ON newsletter_sends(frequency);
CREATE INDEX idx_newsletter_sends_date ON newsletter_sends(sent_at);

-- 3. Table des contenus newsletter (cache)
DROP TABLE IF EXISTS newsletter_content_cache CASCADE;
CREATE TABLE newsletter_content_cache (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL, -- 'events', 'news', 'articles'
  frequency VARCHAR(20) NOT NULL,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  
  -- Contenu JSON
  content JSONB NOT NULL,
  items_count INTEGER DEFAULT 0,
  
  -- Métadonnées
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_valid BOOLEAN DEFAULT true,
  
  CONSTRAINT newsletter_content_cache_frequency_check CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  CONSTRAINT newsletter_content_cache_type_check CHECK (content_type IN ('events', 'news', 'articles', 'combined'))
);

-- Index pour le cache
CREATE INDEX idx_newsletter_content_cache_lookup ON newsletter_content_cache(content_type, frequency, date_range_start, date_range_end);
CREATE INDEX idx_newsletter_content_cache_expires ON newsletter_content_cache(expires_at);

-- 4. Fonction de mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour update automatique
CREATE TRIGGER update_newsletter_subscribers_updated_at 
  BEFORE UPDATE ON newsletter_subscribers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Fonctions utilitaires
CREATE OR REPLACE FUNCTION get_active_subscribers(freq VARCHAR(20))
RETURNS TABLE(id INTEGER, email VARCHAR(255), first_name VARCHAR(100)) AS $$
BEGIN
  RETURN QUERY
  SELECT ns.id, ns.email, ns.first_name
  FROM newsletter_subscribers ns
  WHERE ns.is_active = true
    AND ns.verified_at IS NOT NULL
    AND (
      (freq = 'daily' AND ns.daily_frequency = true) OR
      (freq = 'weekly' AND ns.weekly_frequency = true) OR
      (freq = 'monthly' AND ns.monthly_frequency = true)
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Vue pour les statistiques
CREATE OR REPLACE VIEW newsletter_stats AS
SELECT 
  (SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true AND verified_at IS NOT NULL) as total_active,
  (SELECT COUNT(*) FROM newsletter_subscribers WHERE daily_frequency = true AND is_active = true AND verified_at IS NOT NULL) as daily_subscribers,
  (SELECT COUNT(*) FROM newsletter_subscribers WHERE weekly_frequency = true AND is_active = true AND verified_at IS NOT NULL) as weekly_subscribers,
  (SELECT COUNT(*) FROM newsletter_subscribers WHERE monthly_frequency = true AND is_active = true AND verified_at IS NOT NULL) as monthly_subscribers,
  (SELECT COUNT(*) FROM newsletter_sends WHERE sent_at >= CURRENT_DATE - INTERVAL '7 days') as emails_sent_week,
  (SELECT COUNT(*) FROM newsletter_sends WHERE opened_at IS NOT NULL AND sent_at >= CURRENT_DATE - INTERVAL '30 days') as opened_month,
  (SELECT COUNT(*) FROM newsletter_sends WHERE clicked_at IS NOT NULL AND sent_at >= CURRENT_DATE - INTERVAL '30 days') as clicked_month;

-- 7. Données de test
INSERT INTO newsletter_subscribers (
  email, 
  first_name, 
  weekly_frequency, 
  wants_events, 
  wants_news, 
  wants_articles,
  verified_at
) VALUES 
('test@guide-lyon.com', 'Utilisateur Test', true, true, true, true, NOW()),
('admin@guide-lyon.com', 'Admin', true, true, true, true, NOW());

-- 8. Politique RLS (Row Level Security) - Optionnel
-- ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Subscribers can only see their own data" ON newsletter_subscribers
--   FOR ALL USING (auth.email() = email);

COMMENT ON TABLE newsletter_subscribers IS 'Table principale des abonnés newsletter avec gestion multi-fréquences';
COMMENT ON TABLE newsletter_sends IS 'Tracking des envois de newsletter avec statistiques';
COMMENT ON TABLE newsletter_content_cache IS 'Cache des contenus newsletter pour optimiser les performances';
COMMENT ON FUNCTION get_active_subscribers(VARCHAR) IS 'Récupère les abonnés actifs pour une fréquence donnée';
COMMENT ON VIEW newsletter_stats IS 'Vue des statistiques globales de newsletter';