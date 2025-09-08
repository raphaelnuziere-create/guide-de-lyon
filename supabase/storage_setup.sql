-- CONFIGURATION SUPABASE STORAGE POUR PHOTOS
-- Date: 2025-01-08
-- Description: Crée les buckets et policies pour l'upload de photos

-- 1. CRÉER LE BUCKET PHOTOS (à exécuter dans Supabase Dashboard > Storage)
-- Bucket name: establishment-photos
-- Public: true (pour affichage direct des images)

-- 2. POLICIES DE SÉCURITÉ (à exécuter dans SQL Editor)

-- Policy pour permettre aux users connectés d'uploader leurs photos
CREATE POLICY "Users can upload their establishment photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'establishment-photos' AND
  (SELECT auth.uid()) IN (
    SELECT e.user_id 
    FROM establishments e 
    WHERE e.id::text = (storage.foldername(name))[1]
  )
);

-- Policy pour permettre la lecture publique des photos
CREATE POLICY "Photos are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'establishment-photos');

-- Policy pour permettre aux users de supprimer leurs photos
CREATE POLICY "Users can delete their establishment photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'establishment-photos' AND
  (SELECT auth.uid()) IN (
    SELECT e.user_id 
    FROM establishments e 
    WHERE e.id::text = (storage.foldername(name))[1]
  )
);

-- 3. ACTIVER RLS SUR LE BUCKET
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;