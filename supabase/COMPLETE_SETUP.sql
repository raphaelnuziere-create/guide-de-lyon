-- =====================================================
-- SCRIPT COMPLET - CRÉATION DE TOUTES LES TABLES NÉCESSAIRES
-- =====================================================
-- Ce script crée tout ce dont nous avons besoin pour Guide de Lyon

-- 1. SUPPRESSION DES TABLES EXISTANTES (pour repartir proprement)
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS quotas_usage CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;

-- =====================================================
-- 2. CRÉATION DE LA TABLE MERCHANTS
-- =====================================================
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT DEFAULT 'Lyon',
    postal_code TEXT,
    siret TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro_events', 'pro_boost')),
    stripe_customer_id TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    onboarding_completed BOOLEAN DEFAULT false
);

-- Index pour performance
CREATE INDEX idx_merchants_email ON merchants(email);
CREATE INDEX idx_merchants_plan ON merchants(plan);

-- =====================================================
-- 3. CRÉATION DE LA TABLE PLACES (Établissements)
-- =====================================================
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT DEFAULT 'Lyon',
    phone TEXT,
    email TEXT,
    website TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended')),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_places_merchant_id ON places(merchant_id);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_category ON places(category);

-- =====================================================
-- 4. CRÉATION DE LA TABLE EVENTS (Événements)
-- =====================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_events_merchant_id ON events(merchant_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);

-- =====================================================
-- 5. CRÉATION DE LA TABLE QUOTAS_USAGE
-- =====================================================
CREATE TABLE quotas_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    events_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(merchant_id, month)
);

-- Index
CREATE INDEX idx_quotas_merchant_month ON quotas_usage(merchant_id, month);

-- =====================================================
-- 6. ACTIVATION DU ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotas_usage ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CRÉATION DES POLICIES DE SÉCURITÉ
-- =====================================================

-- MERCHANTS POLICIES
CREATE POLICY "Enable insert for authenticated users only" 
ON merchants FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" 
ON merchants FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" 
ON merchants FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Pour permettre l'inscription publique
CREATE POLICY "Enable insert for anon during signup" 
ON merchants FOR INSERT 
TO anon
WITH CHECK (true);

CREATE POLICY "Enable select for anon during signup" 
ON merchants FOR SELECT
TO anon
USING (true);

-- PLACES POLICIES
CREATE POLICY "Public can view active places" 
ON places FOR SELECT 
USING (status = 'active' OR merchant_id = auth.uid());

CREATE POLICY "Merchants can insert own places" 
ON places FOR INSERT
TO authenticated
WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Merchants can update own places" 
ON places FOR UPDATE
TO authenticated
USING (merchant_id = auth.uid());

CREATE POLICY "Merchants can delete own places" 
ON places FOR DELETE
TO authenticated
USING (merchant_id = auth.uid());

-- EVENTS POLICIES
CREATE POLICY "Public can view approved events" 
ON events FOR SELECT 
USING (status = 'approved' OR merchant_id = auth.uid());

CREATE POLICY "Merchants can manage own events" 
ON events FOR ALL
TO authenticated
USING (merchant_id = auth.uid());

-- QUOTAS POLICIES
CREATE POLICY "Merchants can view own quotas" 
ON quotas_usage FOR SELECT
TO authenticated
USING (merchant_id = auth.uid());

CREATE POLICY "System can manage quotas" 
ON quotas_usage FOR ALL
TO authenticated
USING (true);

-- =====================================================
-- 8. FONCTION POUR METTRE À JOUR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. TRIGGERS POUR AUTO-UPDATE
-- =====================================================
CREATE TRIGGER update_merchants_updated_at 
    BEFORE UPDATE ON merchants
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at 
    BEFORE UPDATE ON places
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotas_updated_at 
    BEFORE UPDATE ON quotas_usage
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. DONNÉES DE TEST (optionnel)
-- =====================================================
-- Créer un merchant de test
INSERT INTO merchants (
    id,
    email,
    company_name,
    phone,
    plan,
    verified,
    onboarding_completed
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'demo@guide-de-lyon.fr',
    'Restaurant Demo Lyon',
    '04 78 00 00 00',
    'pro_events',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 11. VÉRIFICATION FINALE
-- =====================================================
DO $$ 
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('merchants', 'places', 'events', 'quotas_usage');
    
    RAISE NOTICE '✅ SUCCÈS: % tables créées sur 4', table_count;
    RAISE NOTICE 'Tables créées: merchants, places, events, quotas_usage';
    RAISE NOTICE 'Policies de sécurité: Activées';
    RAISE NOTICE 'RLS: Activé sur toutes les tables';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Vous pouvez maintenant créer des comptes merchants !';
END $$;

-- Afficher les tables créées
SELECT 
    tablename as "Table créée",
    CASE 
        WHEN tablename = 'merchants' THEN '✅ Comptes professionnels'
        WHEN tablename = 'places' THEN '✅ Établissements'
        WHEN tablename = 'events' THEN '✅ Événements'
        WHEN tablename = 'quotas_usage' THEN '✅ Gestion des quotas'
        ELSE tablename
    END as "Description"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('merchants', 'places', 'events', 'quotas_usage')
ORDER BY tablename;