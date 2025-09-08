-- Supprimer les articles de 20 Minutes pour refaire le test avec les vraies images
DELETE FROM scraped_articles 
WHERE source_name = '20 Minutes Lyon';