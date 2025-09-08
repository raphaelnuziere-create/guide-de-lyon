-- ============================================
-- SCRIPT FINAL : RÉPARER LA TABLE ET CONFIGURER
-- ============================================

-- 1. Voir la structure actuelle
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'scraping_sources'
ORDER BY ordinal_position;

-- 2. Ajouter TOUTES les colonnes manquantes
ALTER TABLE scraping_sources 
ADD COLUMN IF NOT EXISTS feed_url TEXT;

ALTER TABLE scraping_sources 
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

ALTER TABLE scraping_sources 
ADD COLUMN IF NOT EXISTS selectors JSONB;

ALTER TABLE scraping_sources 
ADD COLUMN IF NOT EXISTS frequency_minutes INTEGER DEFAULT 60;

ALTER TABLE scraping_sources 
ADD COLUMN IF NOT EXISTS max_articles_per_run INTEGER DEFAULT 5;

ALTER TABLE scraping_sources 
ADD COLUMN IF NOT EXISTS last_error TEXT;

ALTER TABLE scraping_sources 
ADD COLUMN IF NOT EXISTS consecutive_errors INTEGER DEFAULT 0;

ALTER TABLE scraping_sources 
ADD COLUMN IF NOT EXISTS total_articles_scraped INTEGER DEFAULT 0;

ALTER TABLE scraping_sources 
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2);

-- 3. Nettoyer et réinsérer
DELETE FROM scraping_sources;

-- 4. Insérer 20 Minutes Lyon (version simplifiée)
INSERT INTO scraping_sources (
  name,
  url,
  type,
  is_active
) VALUES (
  '20 Minutes Lyon',
  'https://www.20minutes.fr/feeds/rss-lyon.xml',
  'rss',
  true
);

-- 5. Mettre à jour avec les valeurs complètes
UPDATE scraping_sources 
SET 
  feed_url = 'https://www.20minutes.fr/feeds/rss-lyon.xml',
  category = 'actualite',
  frequency_minutes = 60,
  max_articles_per_run = 10
WHERE name = '20 Minutes Lyon';

-- 6. Vérifier le résultat
SELECT 
  name as "Source",
  url as "URL RSS",
  type,
  is_active as "Actif",
  frequency_minutes as "Fréquence",
  max_articles_per_run as "Max/run"
FROM scraping_sources;

-- 7. Test : voir si des articles existent
SELECT COUNT(*) as "Nombre articles" FROM scraped_articles;

-- ============================================
-- RÉSULTAT ATTENDU:
-- ✅ 1 source: 20 Minutes Lyon
-- ✅ Active: true
-- ✅ Fréquence: 60 min
-- ✅ Max: 10 articles/run
-- ============================================