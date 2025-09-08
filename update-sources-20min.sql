-- Mettre à jour les sources pour utiliser 20 Minutes qui a des images
UPDATE scraping_sources 
SET 
  name = '20 Minutes Lyon',
  url = 'https://www.20minutes.fr/lyon/',
  feed_url = 'https://www.20minutes.fr/feeds/rss-lyon.xml',
  description = 'Actualités de Lyon et sa région depuis 20 Minutes'
WHERE feed_url = 'https://www.leprogres.fr/edition-lyon-villeurbanne/rss';

-- Garder les autres sources
-- Lyon Capitale et BFM Lyon restent inchangés