-- Vérifier les articles publiés
SELECT 
  id,
  slug,
  rewritten_title,
  category,
  status,
  ai_confidence_score,
  author_name,
  published_at,
  featured_image_url
FROM scraped_articles
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;