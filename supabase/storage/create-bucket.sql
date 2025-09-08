-- Créer le bucket pour les images d'articles
-- À exécuter dans Supabase Dashboard > SQL Editor

-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images',
  'article-images', 
  true, -- Public pour que les images soient accessibles
  10485760, -- 10MB max par image
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- Créer les politiques RLS pour le bucket
-- Permettre la lecture publique
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'article-images');

-- Permettre l'upload public (pour le scraping)
CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'article-images');

-- Permettre la mise à jour
CREATE POLICY "Public update access" ON storage.objects
FOR UPDATE WITH CHECK (bucket_id = 'article-images');

-- Permettre la suppression (pour le nettoyage)
CREATE POLICY "Public delete access" ON storage.objects
FOR DELETE USING (bucket_id = 'article-images');

-- Vérifier que le bucket est créé
SELECT * FROM storage.buckets WHERE id = 'article-images';