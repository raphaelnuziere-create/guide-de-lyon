-- Créer le bucket pour stocker les images des articles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'articles-images',
  'articles-images',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Créer une politique pour permettre l'upload public
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'articles-images');

-- Créer une politique pour permettre la lecture publique
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'articles-images');

-- Créer une politique pour permettre la mise à jour
CREATE POLICY "Allow public update" ON storage.objects
FOR UPDATE WITH CHECK (bucket_id = 'articles-images');