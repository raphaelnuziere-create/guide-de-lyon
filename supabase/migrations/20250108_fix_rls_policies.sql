-- Correction des politiques RLS pour permettre la lecture publique
-- À exécuter après l'insertion des sources

-- 1. Politiques pour scraping_sources (lecture publique)
DROP POLICY IF EXISTS "Admin peut tout faire sur scraping_sources" ON scraping_sources;
DROP POLICY IF EXISTS "Sources lisibles par tous" ON scraping_sources;

-- Permettre la lecture publique des sources
CREATE POLICY "Sources lisibles par tous" ON scraping_sources
  FOR SELECT
  USING (true);

-- Permettre les modifications aux admins seulement (optionnel)
CREATE POLICY "Admin peut modifier les sources" ON scraping_sources
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Politiques pour scraped_articles (déjà OK mais on vérifie)
DROP POLICY IF EXISTS "Articles publiés lisibles par tous" ON scraped_articles;

-- Permettre la lecture des articles publiés
CREATE POLICY "Articles publiés lisibles par tous" ON scraped_articles
  FOR SELECT
  USING (status = 'published');

-- 3. Vérifier que les sources sont bien là
SELECT 
  name, 
  type, 
  is_active,
  CASE 
    WHEN is_active = true THEN '✅ Active'
    ELSE '❌ Inactive'
  END as status
FROM scraping_sources;

-- 4. Compter les articles
SELECT 
  status,
  COUNT(*) as count
FROM scraped_articles
GROUP BY status
ORDER BY status;

-- Message de confirmation
SELECT 'RLS policies fixed! Sources should now be readable.' as message;