-- ============================================
-- NETTOYAGE COMPLET ET REDÉMARRAGE PROPRE
-- ============================================
-- EXÉCUTER DANS L'ORDRE !

-- 1. NETTOYER TOUS LES ARTICLES
DELETE FROM scraped_articles;

-- 2. VÉRIFIER QUE C'EST VIDE
SELECT COUNT(*) as "Articles restants (doit être 0)" FROM scraped_articles;

-- 3. NETTOYER ET RECONFIGURER LES SOURCES
DELETE FROM scraping_sources;

-- 4. AJOUTER UNIQUEMENT 20 MINUTES LYON
INSERT INTO scraping_sources (
  name,
  url,
  type,
  is_active,
  frequency_minutes,
  max_articles_per_run
) VALUES (
  '20 Minutes Lyon',
  'https://www.20minutes.fr/feeds/rss-lyon.xml',
  'rss',
  true,
  60,
  10
);

-- 5. METTRE À JOUR FEED_URL SI LA COLONNE EXISTE
UPDATE scraping_sources 
SET feed_url = 'https://www.20minutes.fr/feeds/rss-lyon.xml'
WHERE name = '20 Minutes Lyon';

-- 6. VÉRIFIER LA CONFIGURATION
SELECT 
  name,
  url,
  type,
  is_active,
  frequency_minutes as "Freq (min)",
  max_articles_per_run as "Max/run"
FROM scraping_sources;

-- ============================================
-- RÉSULTAT ATTENDU :
-- ✅ 0 articles dans scraped_articles
-- ✅ 1 source active : 20 Minutes Lyon
-- ✅ Prêt pour un scraping propre
-- ============================================