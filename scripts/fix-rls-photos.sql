-- =====================================================
-- FIX RLS POLICIES POUR ESTABLISHMENT_PHOTOS
-- =====================================================
-- Résout l'erreur "new row violates row-level security policy"

-- 1. VÉRIFIER SI LA TABLE EXISTE
-- =====================================================
CREATE TABLE IF NOT EXISTS establishment_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ACTIVER RLS SUR LA TABLE
-- =====================================================
ALTER TABLE establishment_photos ENABLE ROW LEVEL SECURITY;

-- 3. SUPPRIMER LES ANCIENNES POLITIQUES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their establishment photos" ON establishment_photos;
DROP POLICY IF EXISTS "Users can insert their establishment photos" ON establishment_photos;
DROP POLICY IF EXISTS "Users can update their establishment photos" ON establishment_photos;
DROP POLICY IF EXISTS "Users can delete their establishment photos" ON establishment_photos;

-- 4. CRÉER LES NOUVELLES POLITIQUES RLS
-- =====================================================

-- SELECT: Voir ses propres photos d'établissement
CREATE POLICY "Users can view their establishment photos" ON establishment_photos
  FOR SELECT USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: Insérer des photos pour ses établissements
CREATE POLICY "Users can insert their establishment photos" ON establishment_photos
  FOR INSERT WITH CHECK (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Modifier ses photos d'établissement
CREATE POLICY "Users can update their establishment photos" ON establishment_photos
  FOR UPDATE USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: Supprimer ses photos d'établissement
CREATE POLICY "Users can delete their establishment photos" ON establishment_photos
  FOR DELETE USING (
    establishment_id IN (
      SELECT id FROM establishments 
      WHERE user_id = auth.uid()
    )
  );

-- 5. CRÉER INDEX POUR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_establishment_photos_establishment_id 
  ON establishment_photos(establishment_id);

CREATE INDEX IF NOT EXISTS idx_establishment_photos_position 
  ON establishment_photos(establishment_id, position);

-- 6. FONCTION TRIGGER POUR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. TRIGGER POUR AUTO-UPDATE updated_at
-- =====================================================
DROP TRIGGER IF EXISTS update_establishment_photos_updated_at ON establishment_photos;
CREATE TRIGGER update_establishment_photos_updated_at
    BEFORE UPDATE ON establishment_photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. VÉRIFICATION FINALE
-- =====================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'establishment_photos';