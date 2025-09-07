-- Permettre l'insertion publique d'articles pour le scraping
-- IMPORTANT: À exécuter pour que le scraping fonctionne

-- Désactiver temporairement RLS pour corriger les politiques
ALTER TABLE scraped_articles DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Articles publiés lisibles par tous" ON scraped_articles;
DROP POLICY IF EXISTS "Admin peut tout faire sur scraped_articles" ON scraped_articles;

-- Réactiver RLS
ALTER TABLE scraped_articles ENABLE ROW LEVEL SECURITY;

-- Créer des politiques plus permissives pour le scraping

-- 1. Lecture: tout le monde peut lire les articles publiés
CREATE POLICY "Lecture articles publiés" ON scraped_articles
  FOR SELECT
  USING (status = 'published');

-- 2. Insertion: permettre l'insertion publique (pour le scraping)
CREATE POLICY "Insertion publique pour scraping" ON scraped_articles
  FOR INSERT
  WITH CHECK (true);

-- 3. Mise à jour: permettre la mise à jour publique (pour la réécriture)
CREATE POLICY "Mise à jour publique pour scraping" ON scraped_articles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. Pour scraping_sources, vérifier que c'est OK
DROP POLICY IF EXISTS "Sources lisibles par tous" ON scraping_sources;
DROP POLICY IF EXISTS "Admin peut modifier les sources" ON scraping_sources;

CREATE POLICY "Lecture publique des sources" ON scraping_sources
  FOR SELECT
  USING (true);

-- Message de confirmation
SELECT 'RLS configuré pour permettre le scraping public!' as message;

-- Vérifier les sources
SELECT COUNT(*) as total_sources FROM scraping_sources WHERE is_active = true;

-- Vérifier s'il y a déjà des articles
SELECT 
  COALESCE(status, 'Aucun') as status,
  COUNT(*) as count
FROM scraped_articles
GROUP BY status
ORDER BY status;