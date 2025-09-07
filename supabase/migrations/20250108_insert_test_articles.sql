-- Insertion d'articles de test pour vérifier le système
-- À exécuter pour avoir des articles visibles immédiatement

-- Désactiver RLS temporairement pour l'insertion
ALTER TABLE scraped_articles DISABLE ROW LEVEL SECURITY;

-- Insérer quelques articles de test déjà réécrits et publiés
INSERT INTO scraped_articles (
  source_name,
  source_url,
  original_url,
  original_title,
  original_content,
  rewritten_title,
  rewritten_content,
  rewritten_excerpt,
  rewritten_meta_description,
  featured_image_url,
  author_name,
  author_bio,
  slug,
  keywords,
  category,
  status,
  ai_confidence_score,
  published_at,
  views_count
) VALUES
(
  'Le Progrès Lyon RSS',
  'https://www.leprogres.fr/edition-lyon-villeurbanne/rss',
  'https://test1.com',
  'Original: Nouveau tramway à Lyon',
  'Article original sur le tramway',
  'Lyon Inaugure la Ligne T10: Une Révolution pour les Transports',
  '<h2>Un nouveau chapitre pour la mobilité lyonnaise</h2><p>La métropole de Lyon franchit une étape majeure dans son développement des transports en commun avec l''inauguration de la ligne T10. Cette nouvelle infrastructure, attendue depuis des années par les habitants de l''est lyonnais, promet de transformer les déplacements quotidiens de milliers de Lyonnais.</p><h2>Des connexions stratégiques</h2><p>La ligne T10 relie désormais Villeurbanne à Vénissieux en passant par des zones clés de l''agglomération. Avec ses 15 stations réparties sur 8 kilomètres, elle dessert des quartiers densément peuplés qui étaient jusqu''à présent mal connectés au réseau de transport.</p><h2>Impact sur la vie quotidienne</h2><p>Les premiers usagers témoignent déjà d''un gain de temps considérable. Cette nouvelle ligne permet de réduire de 20 minutes en moyenne les trajets entre l''est et le sud de la métropole, tout en offrant une alternative écologique à la voiture individuelle.</p>',
  'La métropole de Lyon révolutionne ses transports avec l''inauguration de la ligne T10, reliant Villeurbanne à Vénissieux et promettant de transformer les déplacements de milliers d''habitants.',
  'Découvrez comment la nouvelle ligne T10 va transformer les déplacements dans l''est lyonnais',
  'https://images.unsplash.com/photo-1581262208435-41726149a759?w=1200',
  'Raphael',
  'Rédacteur en chef du Guide de Lyon',
  'lyon-ligne-t10-revolution-transports-2025-01-08',
  ARRAY['lyon', 'tramway', 'T10', 'transport', 'mobilité', 'villeurbanne', 'vénissieux'],
  'actualite',
  'published',
  0.92,
  NOW() - INTERVAL '2 hours',
  127
),
(
  'Lyon Capitale RSS',
  'https://www.lyoncapitale.fr/feed/',
  'https://test2.com',
  'Original: Festival Lumières 2025',
  'Article sur la Fête des Lumières',
  'Fête des Lumières 2025: Lyon Prépare un Spectacle Époustouflant',
  '<h2>Une édition exceptionnelle en préparation</h2><p>La Fête des Lumières 2025 s''annonce comme l''une des plus ambitieuses de l''histoire lyonnaise. Les organisateurs dévoilent progressivement un programme qui promet d''émerveiller les millions de visiteurs attendus dans la capitale des Gaules.</p><h2>Innovations technologiques et artistiques</h2><p>Cette année, les installations mêleront technologies de pointe et créativité artistique. Des projections 3D monumentales sur la Cathédrale Saint-Jean aux installations interactives place Bellecour, chaque site emblématique de Lyon sera transformé en œuvre d''art lumineuse.</p><h2>Retombées économiques majeures</h2><p>Au-delà de l''aspect culturel, l''événement représente un enjeu économique crucial pour la métropole. Les hôteliers, restaurateurs et commerçants se préparent à accueillir près de 2 millions de visiteurs sur quatre jours, générant des retombées estimées à plus de 60 millions d''euros.</p>',
  'Lyon se prépare à éblouir le monde avec une Fête des Lumières 2025 mêlant innovations technologiques et créations artistiques monumentales.',
  'La Fête des Lumières 2025 promet d''être l''édition la plus spectaculaire jamais organisée à Lyon',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
  'Raphael',
  'Rédacteur en chef du Guide de Lyon',
  'fete-lumieres-2025-lyon-spectacle-2025-01-08',
  ARRAY['lyon', 'fête des lumières', 'culture', 'tourisme', 'événement'],
  'culture',
  'published',
  0.88,
  NOW() - INTERVAL '4 hours',
  342
),
(
  'Tribune de Lyon RSS',
  'https://tribunedelyon.fr/feed/',
  'https://test3.com',
  'Original: Nouveau parc urbain Confluence',
  'Inauguration d''un espace vert',
  'Confluence: Un Nouveau Poumon Vert de 5 Hectares pour Lyon',
  '<h2>Un projet écologique ambitieux</h2><p>Le quartier de la Confluence continue sa transformation avec l''inauguration d''un parc urbain de 5 hectares. Cet espace vert, conçu selon les principes du développement durable, offre aux Lyonnais un nouveau lieu de respiration en plein cœur de la ville.</p><h2>Biodiversité et innovation</h2><p>Le parc intègre des zones humides artificielles, des prairies fleuries et plus de 200 arbres d''essences locales. Les concepteurs ont privilégié la biodiversité urbaine en créant des corridors écologiques qui permettront à la faune locale de s''épanouir.</p><h2>Espaces de vie partagés</h2><p>Au-delà de son rôle environnemental, le parc propose des équipements pour tous les âges: aires de jeux innovantes, parcours sportifs, jardins partagés et espaces de détente. Les premiers visiteurs saluent déjà cette bouffée d''oxygène dans un quartier en pleine densification.</p>',
  'Le quartier Confluence accueille un nouveau parc urbain de 5 hectares, véritable poumon vert alliant biodiversité et espaces de vie pour les Lyonnais.',
  'Découvrez le nouveau parc urbain de la Confluence, 5 hectares dédiés à la biodiversité et au bien-être',
  'https://images.unsplash.com/photo-1567283638193-adbf1f435c19?w=1200',
  'Raphael',
  'Rédacteur en chef du Guide de Lyon',
  'confluence-nouveau-parc-urbain-lyon-2025-01-08',
  ARRAY['lyon', 'confluence', 'parc', 'écologie', 'urbanisme', 'environnement'],
  'societe',
  'published',
  0.90,
  NOW() - INTERVAL '6 hours',
  215
);

-- Réactiver RLS
ALTER TABLE scraped_articles ENABLE ROW LEVEL SECURITY;

-- Vérifier l'insertion
SELECT 
  rewritten_title as titre,
  status,
  author_name as auteur,
  views_count as vues
FROM scraped_articles 
WHERE status = 'published'
ORDER BY published_at DESC;

-- Message de confirmation
SELECT 'Articles de test insérés avec succès! Visitez /actualites pour les voir.' as message;