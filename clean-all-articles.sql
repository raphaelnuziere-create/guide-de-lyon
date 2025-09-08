-- Supprimer TOUS les articles de la table scraped_articles
-- Pour repartir sur une base propre

-- Désactiver temporairement les contraintes
SET session_replication_role = 'replica';

-- Vider complètement la table
TRUNCATE TABLE scraped_articles CASCADE;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- Vérifier que la table est vide
SELECT COUNT(*) as total_articles FROM scraped_articles;