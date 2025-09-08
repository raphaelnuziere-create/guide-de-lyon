-- ============================================
-- CONFIGURATION FINALE : 20 MINUTES LYON UNIQUEMENT
-- ============================================
-- Script de production pour le scraping automatique

-- 1. Nettoyer les sources existantes
DELETE FROM scraping_sources;

-- 2. Ajouter uniquement 20 Minutes Lyon
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
  'https://www.20minutes.fr/lyon',
  'https://www.20minutes.fr/feeds/rss-lyon.xml',
  'rss',
  'actualite',
  true,
  60,  -- Toutes les heures
  10   -- Maximum 10 articles par heure
);

-- 3. Vérifier l'insertion
SELECT 
  name as "Source",
  feed_url as "RSS Feed",
  frequency_minutes as "Fréquence (min)",
  max_articles_per_run as "Max articles/run",
  is_active as "Actif"
FROM scraping_sources;

-- 4. Nettoyer les anciens articles de test si nécessaire
-- (Décommenter si vous voulez repartir de zéro)
-- DELETE FROM scraped_articles WHERE source_name != '20 Minutes Lyon';

-- 5. Voir les derniers articles
SELECT 
  rewritten_title as "Titre",
  status,
  published_at,
  ai_confidence_score as "Score IA"
FROM scraped_articles
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 5;

-- ============================================
-- RÉSUMÉ DE LA CONFIGURATION
-- ============================================
-- ✅ Source : 20 Minutes Lyon
-- ✅ Fréquence : Toutes les heures
-- ✅ Articles max : 10 par heure
-- ✅ Publication auto : Si score IA > 0.85
-- ✅ Anti-doublons : Par URL et titre
-- ============================================