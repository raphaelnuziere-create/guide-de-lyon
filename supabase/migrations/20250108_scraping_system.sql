-- Migration: Système complet de scraping d'actualités
-- Date: 2025-01-08

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour stocker les articles scrapés et réécrits
CREATE TABLE IF NOT EXISTS scraped_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Source
  source_name VARCHAR(100),
  source_url TEXT,
  original_url TEXT UNIQUE,
  
  -- Contenu original
  original_title TEXT,
  original_content TEXT,
  original_excerpt TEXT,
  original_image_url TEXT,
  original_publish_date TIMESTAMPTZ,
  
  -- Contenu réécrit
  rewritten_title VARCHAR(255),
  rewritten_content TEXT,
  rewritten_excerpt TEXT,
  rewritten_meta_description VARCHAR(160),
  
  -- Images
  featured_image_url TEXT,
  image_alt_text TEXT,
  
  -- SEO
  slug VARCHAR(255) UNIQUE,
  keywords TEXT[],
  category VARCHAR(50),
  
  -- Statut
  status VARCHAR(20) DEFAULT 'scraped' CHECK (status IN ('scraped', 'rewritten', 'published', 'rejected', 'failed')),
  ai_confidence_score DECIMAL(3,2),
  
  -- Publishing
  published_at TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  
  -- Tracking
  scraping_hash TEXT,
  openai_tokens_used INT,
  processing_time_ms INT,
  
  -- Timestamps
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  rewritten_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour gérer les sources et leur configuration
CREATE TABLE IF NOT EXISTS scraping_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100),
  url TEXT,
  type VARCHAR(20) CHECK (type IN ('rss', 'html', 'api', 'json')),
  
  -- Configuration
  selectors JSONB,
  frequency_minutes INT DEFAULT 60,
  
  -- Limites
  max_articles_per_run INT DEFAULT 10,
  
  -- État
  is_active BOOLEAN DEFAULT TRUE,
  last_scraped_at TIMESTAMPTZ,
  last_error TEXT,
  consecutive_errors INT DEFAULT 0,
  
  -- Métriques
  total_articles_scraped INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de queue pour traitement asynchrone
CREATE TABLE IF NOT EXISTS scraping_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES scraping_sources(id) ON DELETE CASCADE,
  article_url TEXT,
  article_data JSONB,
  priority INT DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les logs de scraping
CREATE TABLE IF NOT EXISTS scraping_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES scraping_sources(id) ON DELETE CASCADE,
  action VARCHAR(50),
  status VARCHAR(20),
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_scraped_status ON scraped_articles(status);
CREATE INDEX IF NOT EXISTS idx_scraped_published ON scraped_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraped_slug ON scraped_articles(slug);
CREATE INDEX IF NOT EXISTS idx_scraped_category ON scraped_articles(category);
CREATE INDEX IF NOT EXISTS idx_queue_status ON scraping_queue(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_queue_created ON scraping_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sources_active ON scraping_sources(is_active);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scraped_articles_updated_at 
  BEFORE UPDATE ON scraped_articles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraping_sources_updated_at 
  BEFORE UPDATE ON scraping_sources 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour obtenir les statistiques
CREATE OR REPLACE FUNCTION get_scraping_stats()
RETURNS TABLE (
  status VARCHAR(20),
  count BIGINT,
  last_article TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.status,
    COUNT(*)::BIGINT,
    MAX(sa.created_at) as last_article
  FROM scraped_articles sa
  GROUP BY sa.status;
END;
$$ LANGUAGE plpgsql;

-- Insérer les sources par défaut
INSERT INTO scraping_sources (name, url, type, selectors, frequency_minutes) VALUES
(
  'Le Progrès Lyon RSS',
  'https://www.leprogres.fr/edition-lyon-villeurbanne/rss',
  'rss',
  '{
    "title": "title",
    "description": "description",
    "link": "link",
    "pubDate": "pubDate",
    "image": "enclosure[type=\"image/jpeg\"]"
  }'::jsonb,
  60
),
(
  'Actu Lyon',
  'https://actu.fr/auvergne-rhone-alpes/lyon_69123',
  'html',
  '{
    "container": ".latest-articles",
    "articles": "article",
    "title": "h2",
    "link": "a[href]",
    "image": "img",
    "date": "time",
    "excerpt": ".excerpt"
  }'::jsonb,
  120
),
(
  'Lyon Capitale RSS',
  'https://www.lyoncapitale.fr/feed/',
  'rss',
  '{
    "title": "title",
    "description": "description",
    "link": "link",
    "pubDate": "pubDate"
  }'::jsonb,
  90
),
(
  'Tribune de Lyon RSS',
  'https://tribunedelyon.fr/feed/',
  'rss',
  '{
    "title": "title",
    "description": "description",
    "link": "link",
    "pubDate": "pubDate"
  }'::jsonb,
  120
);

-- Politique de sécurité RLS
ALTER TABLE scraped_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_logs ENABLE ROW LEVEL SECURITY;

-- Policy pour lecture publique des articles publiés
CREATE POLICY "Articles publiés lisibles par tous" ON scraped_articles
  FOR SELECT
  USING (status = 'published');

-- Policy pour admin (à ajuster selon vos besoins)
CREATE POLICY "Admin peut tout faire" ON scraped_articles
  FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM users WHERE role = 'admin'
  ));

-- Commentaires
COMMENT ON TABLE scraped_articles IS 'Articles scrapés et réécrits avec IA';
COMMENT ON TABLE scraping_sources IS 'Sources de news à scraper';
COMMENT ON TABLE scraping_queue IS 'Queue de traitement asynchrone';
COMMENT ON COLUMN scraped_articles.ai_confidence_score IS 'Score de confiance de la réécriture IA (0-1)';
COMMENT ON COLUMN scraped_articles.scraping_hash IS 'Hash MD5 pour détecter les doublons';