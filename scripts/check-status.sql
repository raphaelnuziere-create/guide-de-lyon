-- ============================================
-- DIAGNOSTIC COMPLET DU SYSTÈME
-- ============================================

-- 1. Configuration de la source
SELECT 
  name,
  url,
  feed_url,
  is_active,
  frequency_minutes,
  max_articles_per_run,
  last_scraped_at,
  last_error,
  consecutive_errors,
  total_articles_scraped
FROM scraping_sources;

-- 2. Derniers articles (tous statuts)
SELECT 
  id,
  original_title,
  status,
  ai_confidence_score,
  created_at,
  published_at
FROM scraped_articles
ORDER BY created_at DESC
LIMIT 10;

-- 3. Articles publiés récemment
SELECT 
  rewritten_title,
  status,
  published_at
FROM scraped_articles
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 5;

-- 4. Statistiques
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
  COUNT(CASE WHEN status = 'scraped' THEN 1 END) as scraped_only,
  COUNT(CASE WHEN status = 'rewritten' THEN 1 END) as rewritten_not_published,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h
FROM scraped_articles;

-- 5. Articles uniques par URL
SELECT COUNT(DISTINCT original_url) as unique_urls FROM scraped_articles;