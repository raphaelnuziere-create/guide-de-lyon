-- =====================================================
-- DEBUG RLS PHOTOS - DIAGNOSTIC COMPLET
-- =====================================================

-- 1. VÉRIFIER LA STRUCTURE DE LA TABLE
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'establishment_photos';

-- 2. VÉRIFIER SI RLS EST ACTIVÉ
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'establishment_photos';

-- 3. LISTER TOUTES LES POLICIES ACTUELLES
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
WHERE tablename = 'establishment_photos';

-- 4. VÉRIFIER LA RELATION AVEC ESTABLISHMENTS
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'establishment_photos';

-- 5. TESTER LA SÉCURITÉ AVEC UN UTILISATEUR
-- (Remplacez USER_ID par l'ID réel de l'utilisateur connecté)
SELECT 
  e.id as establishment_id,
  e.user_id,
  e.name
FROM establishments e 
WHERE e.user_id = auth.uid()
LIMIT 5;