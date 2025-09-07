-- Insertion des sources de scraping par défaut (VERSION CORRIGÉE)
-- À exécuter après la migration principale dans Supabase SQL Editor

-- Désactiver temporairement RLS pour l'insertion (nécessaire pour insérer sans authentification)
ALTER TABLE scraping_sources DISABLE ROW LEVEL SECURITY;

-- Supprimer les sources existantes pour éviter les doublons
DELETE FROM scraping_sources WHERE url IN (
  'https://www.leprogres.fr/edition-lyon-villeurbanne/rss',
  'https://www.lyoncapitale.fr/feed/',
  'https://tribunedelyon.fr/feed/',
  'https://actu.fr/auvergne-rhone-alpes/lyon_69123'
);

-- Insérer les nouvelles sources
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
  60,
  true,
  10
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
  90,
  true,
  10
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
  120,
  true,
  10
),
(
  'Actu Lyon HTML',
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
  120,
  false, -- Désactivé par défaut car nécessite Playwright
  5
);

-- Réactiver RLS après l'insertion
ALTER TABLE scraping_sources ENABLE ROW LEVEL SECURITY;

-- Vérifier que les sources ont bien été insérées
SELECT 
  name, 
  type, 
  is_active, 
  frequency_minutes,
  CASE 
    WHEN is_active = true THEN '✅ Active'
    ELSE '❌ Inactive'
  END as status
FROM scraping_sources 
ORDER BY name;

-- Afficher le nombre total de sources
SELECT COUNT(*) as total_sources FROM scraping_sources;