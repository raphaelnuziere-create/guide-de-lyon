-- =====================================================
-- CRÉATION SIMPLE DE LA TABLE MERCHANTS
-- =====================================================

-- 1. Créer la table merchants (simple)
CREATE TABLE IF NOT EXISTS merchants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT DEFAULT 'Lyon',
    postal_code TEXT,
    siret TEXT,
    
    -- Plan (simple string pour commencer)
    plan TEXT DEFAULT 'free',
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Flags
    verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false
);

-- 2. Créer la table places (établissements)
CREATE TABLE IF NOT EXISTS places (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Infos de base
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    
    -- Adresse
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT DEFAULT 'Lyon',
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Statut
    status TEXT DEFAULT 'draft',
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer la table events
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    
    -- Infos event
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Dates
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    
    -- Statut
    status TEXT DEFAULT 'pending',
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Créer la table quotas_usage
CREATE TABLE IF NOT EXISTS quotas_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    
    -- Compteurs
    events_used INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(merchant_id, month)
);

-- 5. Activer RLS (Row Level Security)
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 6. Créer les policies de base

-- Merchants : peuvent voir et modifier leur propre profil
DROP POLICY IF EXISTS "Users can view own merchant profile" ON merchants;
CREATE POLICY "Users can view own merchant profile" 
    ON merchants FOR SELECT 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own merchant profile" ON merchants;
CREATE POLICY "Users can update own merchant profile" 
    ON merchants FOR UPDATE 
    USING (auth.uid() = id);

-- Permettre l'insertion pour les nouveaux merchants
DROP POLICY IF EXISTS "Users can create merchant profile" ON merchants;
CREATE POLICY "Users can create merchant profile" 
    ON merchants FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Places : public peut voir les actives, merchants peuvent gérer les leurs
DROP POLICY IF EXISTS "Public can view active places" ON places;
CREATE POLICY "Public can view active places" 
    ON places FOR SELECT 
    USING (status = 'active' OR merchant_id = auth.uid());

DROP POLICY IF EXISTS "Merchants can manage own places" ON places;
CREATE POLICY "Merchants can manage own places" 
    ON places FOR ALL 
    USING (merchant_id = auth.uid());

-- Events : similaire aux places
DROP POLICY IF EXISTS "Public can view approved events" ON events;
CREATE POLICY "Public can view approved events" 
    ON events FOR SELECT 
    USING (status = 'approved' OR merchant_id = auth.uid());

DROP POLICY IF EXISTS "Merchants can manage own events" ON events;
CREATE POLICY "Merchants can manage own events" 
    ON events FOR ALL 
    USING (merchant_id = auth.uid());

-- 7. Créer les index
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);
CREATE INDEX IF NOT EXISTS idx_places_merchant_id ON places(merchant_id);
CREATE INDEX IF NOT EXISTS idx_events_merchant_id ON events(merchant_id);

-- 8. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Triggers pour updated_at
DROP TRIGGER IF EXISTS update_merchants_updated_at ON merchants;
CREATE TRIGGER update_merchants_updated_at 
    BEFORE UPDATE ON merchants
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_places_updated_at ON places;
CREATE TRIGGER update_places_updated_at 
    BEFORE UPDATE ON places
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. VÉRIFICATION - Afficher les tables créées
SELECT 
    'Tables créées avec succès !' as message,
    COUNT(*) as nombre_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('merchants', 'places', 'events', 'quotas_usage');

-- Message de succès
DO $$ 
BEGIN
    RAISE NOTICE 'Migration terminée avec succès !';
    RAISE NOTICE 'Tables créées : merchants, places, events, quotas_usage';
    RAISE NOTICE 'Vous pouvez maintenant créer des comptes merchants';
END $$;