-- =====================================================
-- FIX RLS ESTABLISHMENT_PHOTOS - SOLUTION DÉFINITIVE
-- =====================================================
-- Ce script résout définitivement le problème RLS

-- 1. DÉSACTIVER TEMPORAIREMENT RLS POUR DÉBUGGER
ALTER TABLE establishment_photos DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES POLICIES EXISTANTES
DROP POLICY IF EXISTS "Users can view their establishment photos" ON establishment_photos;
DROP POLICY IF EXISTS "Users can insert their establishment photos" ON establishment_photos;
DROP POLICY IF EXISTS "Users can update their establishment photos" ON establishment_photos;
DROP POLICY IF EXISTS "Users can delete their establishment photos" ON establishment_photos;
DROP POLICY IF EXISTS "Enable read access for own photos" ON establishment_photos;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON establishment_photos;
DROP POLICY IF EXISTS "Enable update for users based on establishment ownership" ON establishment_photos;
DROP POLICY IF EXISTS "Enable delete for users based on establishment ownership" ON establishment_photos;

-- 3. CRÉER LES NOUVELLES POLICIES CORRIGÉES
-- Policy SELECT - Voir ses photos
CREATE POLICY "photos_select_policy" ON establishment_photos
  FOR SELECT USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- Policy INSERT - Insérer des photos pour ses établissements
CREATE POLICY "photos_insert_policy" ON establishment_photos
  FOR INSERT WITH CHECK (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- Policy UPDATE - Modifier ses photos
CREATE POLICY "photos_update_policy" ON establishment_photos
  FOR UPDATE USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- Policy DELETE - Supprimer ses photos
CREATE POLICY "photos_delete_policy" ON establishment_photos
  FOR DELETE USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- 4. RÉACTIVER RLS
ALTER TABLE establishment_photos ENABLE ROW LEVEL SECURITY;

-- 5. TESTER LES POLICIES
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'establishment_photos'
ORDER BY policyname;

-- 6. VÉRIFICATION FINALE
SELECT 'RLS configuré correctement pour establishment_photos' as status;