-- SUPPRESSION ET RECRÉATION DE LA TABLE MERCHANTS
-- Avec toutes les colonnes nécessaires

-- 1. Supprimer l'ancienne table
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS quotas_usage CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;

-- 2. Créer la nouvelle table merchants avec toutes les colonnes
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

-- 3. Créer la table places
CREATE TABLE places (
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
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Créer la table events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Créer la table quotas_usage
CREATE TABLE quotas_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    events_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(merchant_id, month)
);

-- 6. Activer RLS
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotas_usage ENABLE ROW LEVEL SECURITY;

-- 7. Créer les policies temporaires (ouvertes pour test)
CREATE POLICY "Enable all for merchants" ON merchants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for places" ON places FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for quotas_usage" ON quotas_usage FOR ALL USING (true) WITH CHECK (true);

-- 8. Créer des index pour les performances
CREATE INDEX idx_places_merchant_id ON places(merchant_id);
CREATE INDEX idx_events_merchant_id ON events(merchant_id);
CREATE INDEX idx_events_place_id ON events(place_id);
CREATE INDEX idx_quotas_usage_merchant_month ON quotas_usage(merchant_id, month);

-- Message de confirmation
SELECT 
    'SUCCESS' as status,
    'Tables créées avec toutes les colonnes' as message;