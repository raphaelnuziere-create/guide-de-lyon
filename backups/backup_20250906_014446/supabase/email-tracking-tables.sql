-- ============================================
-- TABLES DE TRACKING EMAIL POUR GUIDE DE LYON
-- ============================================
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Table de logs des emails envoyés
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(50) DEFAULT 'sent',
  message_id VARCHAR(255) UNIQUE,
  
  -- Tracking des interactions
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  clicked_link TEXT,
  bounced_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  
  -- Métadonnées
  template_id INTEGER,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Table des préférences email par utilisateur
CREATE TABLE IF NOT EXISTS email_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Types d'emails
  newsletter BOOLEAN DEFAULT true,
  promotional BOOLEAN DEFAULT true,
  transactional BOOLEAN DEFAULT true,
  
  -- Fréquence
  frequency VARCHAR(20) DEFAULT 'weekly', -- instant, daily, weekly, monthly
  
  -- Préférences de contenu
  categories JSONB DEFAULT '{}', -- {restaurants: true, events: true, etc}
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Table de blacklist (bounces, spam, etc)
CREATE TABLE IF NOT EXISTS email_blacklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  reason VARCHAR(50) NOT NULL, -- hard_bounce, spam, manual, invalid
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Table des campagnes email
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- newsletter, promotional, announcement
  subject VARCHAR(255),
  template_id INTEGER,
  
  -- Statistiques
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  
  -- Configuration
  segment JSONB DEFAULT '{}', -- Critères de segmentation
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Table de liens trackés
CREATE TABLE IF NOT EXISTS email_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  tracking_url TEXT NOT NULL,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEX POUR PERFORMANCES
-- ============================================

-- Index sur email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_message_id ON email_logs(message_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs(created_at DESC);

-- Index sur email_preferences
CREATE INDEX IF NOT EXISTS idx_email_preferences_newsletter ON email_preferences(newsletter) WHERE newsletter = true;

-- Index sur email_blacklist
CREATE INDEX IF NOT EXISTS idx_email_blacklist_email ON email_blacklist(email);

-- Index sur email_campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_type ON email_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent ON email_campaigns(sent_at DESC);

-- ============================================
-- TRIGGERS POUR UPDATED_AT
-- ============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_email_logs_updated_at BEFORE UPDATE ON email_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at BEFORE UPDATE ON email_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FONCTIONS UTILES
-- ============================================

-- Fonction pour obtenir les stats d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_email_stats(user_id_param UUID)
RETURNS TABLE (
  total_emails_received INTEGER,
  total_opened INTEGER,
  total_clicked INTEGER,
  last_email_date TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_emails_received,
    COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END)::INTEGER as total_opened,
    COUNT(CASE WHEN clicked_at IS NOT NULL THEN 1 END)::INTEGER as total_clicked,
    MAX(created_at) as last_email_date
  FROM email_logs
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un email est blacklisté
CREATE OR REPLACE FUNCTION is_email_blacklisted(email_param VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM email_blacklist WHERE email = email_param);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- POLITIQUES DE SÉCURITÉ (RLS)
-- ============================================

-- Activer RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Politique pour email_logs (les utilisateurs peuvent voir leurs propres logs)
CREATE POLICY "Users can view own email logs" ON email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour email_preferences (les utilisateurs peuvent gérer leurs préférences)
CREATE POLICY "Users can view own preferences" ON email_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON email_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON email_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ============================================

-- Insérer des types d'emails de base
INSERT INTO email_logs (email_type, recipient_email, subject, status) VALUES
('welcome', 'test@example.com', 'Bienvenue sur Guide de Lyon', 'delivered'),
('newsletter', 'test@example.com', 'Les nouveautés de la semaine', 'opened')
ON CONFLICT DO NOTHING;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que les tables sont créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('email_logs', 'email_preferences', 'email_blacklist', 'email_campaigns', 'email_links')
ORDER BY table_name;

-- Message de succès
DO $$
BEGIN
  RAISE NOTICE 'Tables de tracking email créées avec succès !';
  RAISE NOTICE 'Tables créées: email_logs, email_preferences, email_blacklist, email_campaigns, email_links';
END $$;