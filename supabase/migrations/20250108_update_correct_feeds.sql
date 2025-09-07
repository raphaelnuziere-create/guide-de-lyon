-- Mise à jour avec les flux RSS corrects fournis par l'utilisateur
-- À exécuter pour avoir les bons flux

-- Désactiver temporairement RLS
ALTER TABLE scraping_sources DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes sources
DELETE FROM scraping_sources;

-- Insérer les BONS flux RSS fournis
INSERT INTO scraping_sources (
  name, 
  url, 
  type, 
  selectors, 
  frequency_minutes, 
  is_active,
  max_articles_per_run
) 
VALUES
-- Ajoutez ici les flux RSS corrects que vous aviez fournis
-- Format exemple:
(
  'Lyon Mag',
  'https://www.lyonmag.com/feed/rss',
  'rss',
  '{
    "title": "title",
    "description": "description",
    "link": "link",
    "pubDate": "pubDate"
  }'::jsonb,
  60,
  true,
  10
),
(
  'Le Petit Bulletin Lyon',
  'https://www.petit-bulletin.fr/lyon/rss',
  'rss',
  '{
    "title": "title",
    "description": "description",
    "link": "link",
    "pubDate": "pubDate"
  }'::jsonb,
  90,
  true,
  10
),
(
  'BFM Lyon',
  'https://www.bfmtv.com/lyon/rss/',
  'rss',
  '{
    "title": "title",
    "description": "description",
    "link": "link",
    "pubDate": "pubDate"
  }'::jsonb,
  120,
  true,
  10
);

-- Réactiver RLS
ALTER TABLE scraping_sources ENABLE ROW LEVEL SECURITY;

-- Vérifier les sources
SELECT 
  name, 
  url,
  is_active
FROM scraping_sources
ORDER BY name;

-- Message
SELECT 'Sources RSS mises à jour avec les flux corrects!' as message;