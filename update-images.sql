-- Mettre à jour les images des articles avec de vraies images de Lyon
UPDATE scraped_articles 
SET featured_image_url = CASE 
  WHEN category = 'actualite' THEN 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200'
  WHEN category = 'societe' THEN 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200'
  WHEN category = 'culture' THEN 'https://images.unsplash.com/photo-1582806988429-d451912c0e1f?w=1200'
  WHEN category = 'sport' THEN 'https://images.unsplash.com/photo-1600168985025-38c73e8bc9f1?w=1200'
  WHEN category = 'economie' THEN 'https://images.unsplash.com/photo-1609770231080-e321deccc34c?w=1200'
  WHEN category = 'politique' THEN 'https://images.unsplash.com/photo-1563373960-57e7ce1097d0?w=1200'
  ELSE 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200'
END
WHERE status = 'published';

-- Mettre à jour spécifiquement les 4 articles publiés avec des images variées
UPDATE scraped_articles 
SET featured_image_url = 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200'
WHERE slug = 'metropole-de-lyon-l-accident-n-etait-pas-une-simpl-2025-09-07';

UPDATE scraped_articles 
SET featured_image_url = 'https://images.unsplash.com/photo-1582806988429-d451912c0e1f?w=1200'
WHERE slug = 'lyon-doucet-fait-sa-rentree-aulas-s-allie-a-la-dro-2025-09-07';

UPDATE scraped_articles 
SET featured_image_url = 'https://images.unsplash.com/photo-1609770231080-e321deccc34c?w=1200'
WHERE slug = 'metropole-de-lyon-greve-tcl-tramways-supprimes-lig-2025-09-07';

UPDATE scraped_articles 
SET featured_image_url = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200'
WHERE slug = 'lyon-deux-jeunes-hommes-de-16-et-20-ans-blesses-ap-2025-09-07';