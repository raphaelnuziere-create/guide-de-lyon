-- =====================================================
-- DEBUG COMPLET RLS ESTABLISHMENT_PHOTOS
-- =====================================================

-- 1. VÉRIFIER L'ÉTAT DU RLS SUR LA TABLE
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'establishment_photos';

-- 2. LISTER TOUTES LES POLICIES ACTUELLES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'establishment_photos'
ORDER BY cmd;

-- 3. VÉRIFIER L'UTILISATEUR ACTUEL
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_user_email;

-- 4. VÉRIFIER LES ÉTABLISSEMENTS DE L'UTILISATEUR
SELECT 
  id,
  name,
  user_id,
  created_at
FROM establishments 
WHERE user_id = auth.uid();

-- 5. TESTER LA POLICY INSERT MANUELLEMENT
-- (Remplacez les valeurs par les vraies)
SELECT EXISTS (
  SELECT 1 FROM establishments 
  WHERE id = 'VOTRE_ESTABLISHMENT_ID' 
  AND user_id = auth.uid()
) as "Can insert photo for this establishment";

-- 6. INFORMATION SUR LA TABLE
\d establishment_photos;