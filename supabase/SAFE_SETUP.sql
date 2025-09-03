-- =====================================================
-- SCRIPT SANS CONFLIT - VERSION SÉCURISÉE
-- =====================================================

-- 1. CRÉER LA TABLE MERCHANTS (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT DEFAULT 'Lyon',
    postal_code TEXT,
    siret TEXT,
    plan TEXT DEFAULT 'free',
    stripe_customer_id TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    onboarding_completed BOOLEAN DEFAULT false
);

-- 2. CRÉER LA TABLE PLACES (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
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
    status TEXT DEFAULT 'draft',
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRÉER LA TABLE EVENTS (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending',
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CRÉER LA TABLE QUOTAS_USAGE (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS quotas_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    events_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter la contrainte unique si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'quotas_usage_merchant_id_month_key'
    ) THEN
        ALTER TABLE quotas_usage 
        ADD CONSTRAINT quotas_usage_merchant_id_month_key 
        UNIQUE (merchant_id, month);
    END IF;
END $$;

-- 5. ACTIVER RLS (sans erreur si déjà activé)
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotas_usage ENABLE ROW LEVEL SECURITY;

-- 6. CRÉER DES POLICIES SIMPLES (supprimer les anciennes d'abord)

-- Pour merchants
DROP POLICY IF EXISTS "Allow all for merchants" ON merchants;
CREATE POLICY "Allow all for merchants" 
ON merchants 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Pour places
DROP POLICY IF EXISTS "Allow all for places" ON places;
CREATE POLICY "Allow all for places" 
ON places 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Pour events
DROP POLICY IF EXISTS "Allow all for events" ON events;
CREATE POLICY "Allow all for events" 
ON events 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Pour quotas_usage
DROP POLICY IF EXISTS "Allow all for quotas" ON quotas_usage;
CREATE POLICY "Allow all for quotas" 
ON quotas_usage 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 7. VÉRIFICATION FINALE
SELECT 
    'SUCCESS' as status,
    COUNT(*) as tables_created,
    STRING_AGG(tablename, ', ') as table_list
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('merchants', 'places', 'events', 'quotas_usage');

-- Message final
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ INSTALLATION TERMINÉE !';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables créées : merchants, places, events, quotas_usage';
    RAISE NOTICE 'Vous pouvez maintenant créer des comptes !';
END $$;