-- =====================================================
-- CRÉATION ULTRA SIMPLE - JUSTE LA TABLE MERCHANTS
-- =====================================================

-- Supprimer la table si elle existe (pour recommencer à zéro)
DROP TABLE IF EXISTS merchants CASCADE;

-- Créer la table merchants SIMPLE
CREATE TABLE merchants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT DEFAULT 'Lyon',
    postal_code TEXT,
    siret TEXT,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false
);

-- Vérification
SELECT 'Table merchants créée !' as message;