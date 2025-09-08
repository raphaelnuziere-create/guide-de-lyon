-- ============================================
-- SCRIPT COMPLET : CORRIGER ET CONFIGURER 20 MINUTES
-- ============================================

-- 1. Vérifier la structure actuelle de la table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'scraping_sources'
ORDER BY ordinal_position;

-- 2. Ajouter la colonne feed_url si elle n'existe pas
ALTER TABLE scraping_sources 
ADD COLUMN IF NOT EXISTS feed_url TEXT;

-- 3. Nettoyer les sources existantes
DELETE FROM scraping_sources;

-- 4. Insérer 20 Minutes Lyon avec la bonne structure
INSERT INTO scraping_sources (
  name,
  url,
  feed_url,
  type,
  category,
  is_active,
  frequency_minutes,
  max_articles_per_run
) VALUES (
  '20 Minutes Lyon',
  'https://www.20minutes.fr/feeds/rss-lyon.xml',  -- URL principale = feed RSS
  'https://www.20minutes.fr/feeds/rss-lyon.xml',  -- Feed URL identique
  'rss',
  'actualite',
  true,
  60,
  10
);

-- 5. Vérifier l'insertion
SELECT 
  name as "Source",
  url as "URL",
  feed_url as "Feed",
  type as "Type",
  is_active as "Actif",
  frequency_minutes as "Freq (min)",
  max_articles_per_run as "Max/run"
FROM scraping_sources;

-- 6. Vérifier les derniers articles publiés
SELECT 
  rewritten_title as "Titre",
  status,
  published_at,
  ai_confidence_score as "Score"
FROM scraped_articles
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 5;

-- ============================================
-- Si tout est OK, vous devriez voir:
-- ✅ 1 source active (20 Minutes Lyon)
-- ✅ Fréquence: 60 minutes
-- ✅ Max 10 articles par run
-- ============================================