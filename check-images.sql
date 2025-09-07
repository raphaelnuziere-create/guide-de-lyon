-- Vérifier les URLs des images dans les articles publiés
SELECT 
  id,
  slug,
  rewritten_title,
  featured_image_url,
  original_image_url,
  status
FROM scraped_articles
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;