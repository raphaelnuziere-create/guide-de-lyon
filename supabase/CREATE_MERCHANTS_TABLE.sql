-- =====================================================
-- SCRIPT SIMPLE - CRÉATION TABLE MERCHANTS
-- À exécuter dans : SQL Editor de Supabase
-- =====================================================

-- 1. Créer la table merchants (sans conflit)
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    onboarding_completed BOOLEAN DEFAULT false
);

-- 2. Permettre aux utilisateurs de créer leur profil
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- 3. Policy pour permettre l'insertion
CREATE POLICY "Anyone can create merchant" 
ON public.merchants 
FOR INSERT 
WITH CHECK (true);

-- 4. Policy pour voir son propre profil
CREATE POLICY "Users can view own merchant" 
ON public.merchants 
FOR SELECT 
USING (true);

-- 5. Policy pour modifier son profil
CREATE POLICY "Users can update own merchant" 
ON public.merchants 
FOR UPDATE 
USING (true);

-- Message de succès
SELECT 'Table merchants créée avec succès !' as message;