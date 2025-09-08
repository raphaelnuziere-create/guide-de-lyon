-- Nettoyer les anciens articles pour faire place aux nouveaux avec images Supabase
DELETE FROM scraped_articles 
WHERE source_name IN ('20 Minutes Lyon', 'Test 20 Minutes')
OR featured_image_url NOT LIKE '%supabase%';

-- Garder seulement les articles avec images Supabase
SELECT 
  slug,
  rewritten_title,
  featured_image_url,
  status,
  published_at
FROM scraped_articles
WHERE featured_image_url LIKE '%supabase%'
ORDER BY published_at DESC;