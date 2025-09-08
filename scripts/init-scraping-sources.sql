-- ============================================
-- INITIALISATION DES SOURCES DE SCRAPING
-- ============================================
-- À exécuter dans le SQL Editor de Supabase Dashboard

-- Vérifier les sources existantes
SELECT * FROM scraping_sources;

-- Si la table n'existe pas, la créer
CREATE TABLE IF NOT EXISTS scraping_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  feed_url TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('rss', 'html', 'api')),
  category VARCHAR(100),
  selectors JSONB,
  is_active BOOLEAN DEFAULT true,
  frequency_minutes INTEGER DEFAULT 60,
  max_articles_per_run INTEGER DEFAULT 5,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  consecutive_errors INTEGER DEFAULT 0,
  total_articles_scraped INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supprimer les sources existantes pour repartir sur une base propre
DELETE FROM scraping_sources;

-- Insérer les sources RSS principales pour Lyon
INSERT INTO scraping_sources (name, url, feed_url, type, category, frequency_minutes, max_articles_per_run) VALUES
-- Sources locales Lyon
('Le Progrès - Lyon', 'https://www.leprogres.fr', 'https://www.leprogres.fr/lyon-metropole/rss', 'rss', 'actualite', 60, 5),
('Lyon Capitale', 'https://www.lyoncapitale.fr', 'https://www.lyoncapitale.fr/feed/', 'rss', 'actualite', 60, 5),
('Tribune de Lyon', 'https://tribunedelyon.fr', 'https://tribunedelyon.fr/feed/', 'rss', 'actualite', 120, 3),
('Lyon Mag', 'https://www.lyonmag.com', 'https://www.lyonmag.com/rss', 'rss', 'actualite', 60, 5),

-- Sources nationales avec section Lyon
('20 Minutes Lyon', 'https://www.20minutes.fr/lyon', 'https://www.20minutes.fr/feeds/rss-lyon.xml', 'rss', 'actualite', 60, 5),
('France 3 Auvergne-Rhône-Alpes', 'https://france3-regions.francetvinfo.fr/auvergne-rhone-alpes', 'https://france3-regions.francetvinfo.fr/auvergne-rhone-alpes/rss', 'rss', 'actualite', 120, 3),
('BFM Lyon', 'https://www.bfmtv.com/lyon/', 'https://www.bfmtv.com/rss/lyon/', 'rss', 'actualite', 60, 4),

-- Sources culturelles
('Le Petit Bulletin Lyon', 'https://www.petit-bulletin.fr/lyon/', 'https://www.petit-bulletin.fr/lyon/rss', 'rss', 'culture', 120, 3),
('Lyon Secret', 'https://www.lyonsecret.com', 'https://www.lyonsecret.com/feed/', 'rss', 'culture', 180, 2),

-- Sources économiques
('Eco de l\'Ain', 'https://www.eco01.fr', 'https://www.eco01.fr/feed', 'rss', 'economie', 180, 2),
('Bref Eco', 'https://www.brefeco.com', 'https://www.brefeco.com/feed', 'rss', 'economie', 240, 2);

-- Vérifier l'insertion
SELECT 
  name,
  type,
  category,
  frequency_minutes as "Fréquence (min)",
  max_articles_per_run as "Max articles",
  is_active as "Actif"
FROM scraping_sources
ORDER BY category, name;

-- Créer la table de logs si elle n'existe pas
CREATE TABLE IF NOT EXISTS scraping_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action VARCHAR(100),
  status VARCHAR(50),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vérifier que les articles peuvent être stockés
SELECT COUNT(*) as "Articles existants" FROM scraped_articles;

-- Voir les derniers articles scrapés
SELECT 
  original_title,
  source_name,
  status,
  created_at
FROM scraped_articles
ORDER BY created_at DESC
LIMIT 10;