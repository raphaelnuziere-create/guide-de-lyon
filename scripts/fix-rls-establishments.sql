-- Script pour corriger les politiques RLS de la table establishments
-- Problème : Les nouveaux utilisateurs ne peuvent pas créer d'établissement

-- 1. Désactiver temporairement RLS pour nettoyer
ALTER TABLE establishments DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own establishments" ON establishments;
DROP POLICY IF EXISTS "Users can insert their own establishments" ON establishments;
DROP POLICY IF EXISTS "Users can update their own establishments" ON establishments;
DROP POLICY IF EXISTS "Users can delete their own establishments" ON establishments;
DROP POLICY IF EXISTS "Public can view active establishments" ON establishments;

-- 3. Réactiver RLS
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;

-- 4. Créer les nouvelles politiques

-- Politique pour voir les établissements actifs (public)
CREATE POLICY "Anyone can view active establishments" 
ON establishments 
FOR SELECT 
USING (status = 'active' OR status = 'pending');

-- Politique pour que les utilisateurs authentifiés puissent créer leur établissement
CREATE POLICY "Authenticated users can create establishments" 
ON establishments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent voir leur propre établissement
CREATE POLICY "Users can view own establishments" 
ON establishments 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent modifier leur établissement
CREATE POLICY "Users can update own establishments" 
ON establishments 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent supprimer leur établissement
CREATE POLICY "Users can delete own establishments" 
ON establishments 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- 5. Vérifier que les politiques sont bien appliquées
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
WHERE tablename = 'establishments'
ORDER BY policyname;