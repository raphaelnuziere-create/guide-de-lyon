-- Insertion des sources de scraping par défaut
-- À exécuter après la migration principale

-- Désactiver temporairement RLS pour l'insertion
ALTER TABLE scraping_sources DISABLE ROW LEVEL SECURITY;

-- Insérer les sources
INSERT INTO scraping_sources (name, url, type, selectors, frequency_minutes, is_active) 
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
  true
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
  true
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
  true
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
  120,
  false -- Désactivé par défaut car nécessite Playwright
)
ON CONFLICT (url) DO UPDATE
SET 
  name = EXCLUDED.name,
  selectors = EXCLUDED.selectors,
  frequency_minutes = EXCLUDED.frequency_minutes;

-- Réactiver RLS
ALTER TABLE scraping_sources ENABLE ROW LEVEL SECURITY;

-- Afficher les sources insérées
SELECT name, type, is_active, frequency_minutes 
FROM scraping_sources 
ORDER BY name;