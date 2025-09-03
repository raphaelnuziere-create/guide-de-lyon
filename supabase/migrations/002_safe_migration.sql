-- =====================================================
-- GUIDE DE LYON - MIGRATION SÉCURISÉE (évite les conflits)
-- =====================================================
-- Version: 2.0 - Safe migration
-- Date: 2025-01-09

-- =====================================================
-- 1. SUPPRESSION DES POLICIES EXISTANTES (si elles existent)
-- =====================================================
DROP POLICY IF EXISTS "Public read access" ON original_blog_posts;
DROP POLICY IF EXISTS "Merchants can view own profile" ON merchants;
DROP POLICY IF EXISTS "Merchants can update own profile" ON merchants;
DROP POLICY IF EXISTS "Public can view active places" ON places;
DROP POLICY IF EXISTS "Merchants can manage own places" ON places;
DROP POLICY IF EXISTS "Public can view approved events" ON events;
DROP POLICY IF EXISTS "Merchants can manage own events" ON events;
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Public can create reviews" ON reviews;

-- =====================================================
-- 2. CRÉATION DES TYPES (seulement si n'existent pas)
-- =====================================================
DO $$ 
BEGIN
    -- Type merchant_plan
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'merchant_plan') THEN
        CREATE TYPE merchant_plan AS ENUM ('free', 'pro_events', 'pro_boost');
    END IF;
    
    -- Type moderation_status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderation_status') THEN
        CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
    END IF;
    
    -- Type boost_type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'boost_type') THEN
        CREATE TYPE boost_type AS ENUM ('none', 'newsletter', 'social', 'homepage');
    END IF;
    
    -- Type place_status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'place_status') THEN
        CREATE TYPE place_status AS ENUM ('draft', 'pending', 'active', 'suspended');
    END IF;
END $$;

-- =====================================================
-- 3. TABLE: MERCHANTS
-- =====================================================
CREATE TABLE IF NOT EXISTS merchants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    siret TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT DEFAULT 'Lyon',
    postal_code TEXT,
    
    -- Informations de plan
    plan merchant_plan DEFAULT 'free',
    plan_started_at TIMESTAMPTZ,
    plan_expires_at TIMESTAMPTZ,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    
    -- Vérification
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verification_documents JSONB,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    onboarding_completed BOOLEAN DEFAULT false,
    
    -- Préférences
    preferences JSONB DEFAULT '{
        "notifications": {
            "email": true,
            "sms": false,
            "newsletter": true
        }
    }'::jsonb
);

-- Index
CREATE INDEX IF NOT EXISTS idx_merchants_email ON merchants(email);
CREATE INDEX IF NOT EXISTS idx_merchants_plan ON merchants(plan);
CREATE INDEX IF NOT EXISTS idx_merchants_verified ON merchants(verified);

-- =====================================================
-- 4. TABLE: PLACES
-- =====================================================
CREATE TABLE IF NOT EXISTS places (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Informations de base
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    
    -- Catégorie et tags
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[],
    
    -- Localisation
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT DEFAULT 'Lyon',
    district TEXT,
    coordinates POINT,
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Réseaux sociaux
    social_links JSONB DEFAULT '{
        "facebook": null,
        "instagram": null,
        "twitter": null,
        "linkedin": null
    }'::jsonb,
    
    -- Horaires
    hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "18:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
        "thursday": {"open": "09:00", "close": "18:00", "closed": false},
        "friday": {"open": "09:00", "close": "18:00", "closed": false},
        "saturday": {"open": "09:00", "close": "18:00", "closed": false},
        "sunday": {"closed": true}
    }'::jsonb,
    
    -- Médias
    logo_url TEXT,
    cover_image_url TEXT,
    images TEXT[],
    video_url TEXT,
    
    -- Statut et modération
    status place_status DEFAULT 'draft',
    moderation_notes TEXT,
    featured BOOLEAN DEFAULT false,
    
    -- Statistiques
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Index
CREATE INDEX IF NOT EXISTS idx_places_merchant_id ON places(merchant_id);
CREATE INDEX IF NOT EXISTS idx_places_slug ON places(slug);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_places_status ON places(status);

-- =====================================================
-- 5. TABLE: EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    
    -- Informations de l'événement
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    
    -- Dates et horaires
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    
    -- Lieu
    venue_name TEXT,
    venue_address TEXT,
    
    -- Prix et réservation
    price_info TEXT,
    is_free BOOLEAN DEFAULT false,
    booking_url TEXT,
    max_participants INTEGER,
    
    -- Médias
    image_url TEXT,
    
    -- Boost et promotion
    boost_type boost_type DEFAULT 'none',
    boost_expires_at TIMESTAMPTZ,
    
    -- Statut
    status moderation_status DEFAULT 'pending',
    moderation_notes TEXT,
    
    -- Statistiques
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    registrations_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Index
CREATE INDEX IF NOT EXISTS idx_events_place_id ON events(place_id);
CREATE INDEX IF NOT EXISTS idx_events_merchant_id ON events(merchant_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- =====================================================
-- 6. TABLE: REVIEWS
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    
    -- Auteur
    author_name TEXT NOT NULL,
    author_email TEXT,
    
    -- Contenu
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title TEXT,
    comment TEXT NOT NULL,
    
    -- Réponse du merchant
    merchant_response TEXT,
    merchant_response_at TIMESTAMPTZ,
    
    -- Photos
    images TEXT[],
    
    -- Modération
    status moderation_status DEFAULT 'pending',
    flagged_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- =====================================================
-- 7. TABLE: MERCHANT_PLAN_DETAILS
-- =====================================================
CREATE TABLE IF NOT EXISTS merchant_plan_details (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    
    -- Quotas
    events_quota INTEGER DEFAULT 0,
    newsletter_boosts INTEGER DEFAULT 0,
    social_boosts INTEGER DEFAULT 0,
    homepage_boosts INTEGER DEFAULT 0,
    
    -- Features
    features JSONB DEFAULT '[]'::jsonb,
    
    -- Stripe
    stripe_price_id TEXT,
    
    -- Active
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les plans (avec gestion des conflits)
INSERT INTO merchant_plan_details (id, name, price, events_quota, newsletter_boosts, social_boosts, homepage_boosts, features) 
VALUES
    ('free', 'Gratuit', 0, 0, 0, 0, 0, '["Fiche établissement basique", "Horaires et contact"]'::jsonb),
    ('pro_events', 'Pro Events', 19.00, 2, 0, 0, 0, '["Fiche établissement complète", "2 événements par mois", "Statistiques basiques", "Support prioritaire"]'::jsonb),
    ('pro_boost', 'Pro Boost', 49.00, 5, 2, 5, 1, '["Fiche établissement premium", "5 événements par mois", "2 boosts newsletter", "5 boosts réseaux sociaux", "Mise en avant homepage", "Statistiques avancées", "Support VIP"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    events_quota = EXCLUDED.events_quota,
    newsletter_boosts = EXCLUDED.newsletter_boosts,
    social_boosts = EXCLUDED.social_boosts,
    homepage_boosts = EXCLUDED.homepage_boosts,
    features = EXCLUDED.features,
    updated_at = NOW();

-- =====================================================
-- 8. TABLE: QUOTAS_USAGE
-- =====================================================
CREATE TABLE IF NOT EXISTS quotas_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    
    -- Compteurs
    events_used INTEGER DEFAULT 0,
    newsletter_boosts_used INTEGER DEFAULT 0,
    social_boosts_used INTEGER DEFAULT 0,
    homepage_boosts_used INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(merchant_id, month)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_quotas_usage_merchant_month ON quotas_usage(merchant_id, month);

-- =====================================================
-- 9. TABLE: MODERATION_QUEUE
-- =====================================================
CREATE TABLE IF NOT EXISTS moderation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Item à modérer
    item_type TEXT NOT NULL,
    item_id UUID NOT NULL,
    
    -- Détails
    content JSONB,
    flags TEXT[],
    ai_score DECIMAL(3, 2),
    
    -- Modération
    status moderation_status DEFAULT 'pending',
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    decision_notes TEXT,
    
    -- Priorité
    priority INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON moderation_queue(priority DESC);

-- =====================================================
-- 10. TABLE: EMAIL_LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Destinataire
    recipient_email TEXT NOT NULL,
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    
    -- Email
    template_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    
    -- Statut
    status TEXT DEFAULT 'sent',
    
    -- Métadonnées
    provider TEXT DEFAULT 'brevo',
    provider_message_id TEXT,
    metadata JSONB,
    
    -- Timestamps
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ
);

-- Index
CREATE INDEX IF NOT EXISTS idx_email_logs_merchant ON email_logs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- =====================================================
-- 11. TABLE: ANALYTICS_EVENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Session
    session_id TEXT NOT NULL,
    user_id UUID,
    
    -- Event
    event_name TEXT NOT NULL,
    event_category TEXT,
    
    -- Context
    page_url TEXT,
    referrer TEXT,
    
    -- Cible
    target_type TEXT,
    target_id UUID,
    
    -- Métadonnées
    properties JSONB,
    
    -- Device info
    user_agent TEXT,
    ip_address INET,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);

-- =====================================================
-- 12. ACTIVER RLS (Row Level Security)
-- =====================================================
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotas_usage ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 13. CRÉER LES POLICIES (après suppression)
-- =====================================================

-- Policies pour MERCHANTS
CREATE POLICY "Merchants can view own profile" 
    ON merchants FOR SELECT 
    USING (auth.uid()::text = id::text);

CREATE POLICY "Merchants can update own profile" 
    ON merchants FOR UPDATE 
    USING (auth.uid()::text = id::text);

-- Policies pour PLACES
CREATE POLICY "Public can view active places" 
    ON places FOR SELECT 
    USING (status = 'active');

CREATE POLICY "Merchants can manage own places" 
    ON places FOR ALL 
    USING (merchant_id::text = auth.uid()::text);

-- Policies pour EVENTS
CREATE POLICY "Public can view approved events" 
    ON events FOR SELECT 
    USING (status = 'approved' AND start_date > NOW());

CREATE POLICY "Merchants can manage own events" 
    ON events FOR ALL 
    USING (merchant_id::text = auth.uid()::text);

-- Policies pour REVIEWS
CREATE POLICY "Public can view approved reviews" 
    ON reviews FOR SELECT 
    USING (status = 'approved');

CREATE POLICY "Public can create reviews" 
    ON reviews FOR INSERT 
    WITH CHECK (true);

-- =====================================================
-- 14. FUNCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour update_at (si n'existe pas)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer les triggers (DROP puis CREATE pour éviter les conflits)
DROP TRIGGER IF EXISTS update_merchants_updated_at ON merchants;
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_places_updated_at ON places;
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 15. FONCTION POUR VÉRIFIER LES QUOTAS
-- =====================================================
CREATE OR REPLACE FUNCTION check_quota(
    p_merchant_id UUID,
    p_quota_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_plan merchant_plan;
    v_plan_details merchant_plan_details%ROWTYPE;
    v_usage quotas_usage%ROWTYPE;
    v_current_month DATE;
BEGIN
    v_current_month := date_trunc('month', NOW())::date;
    
    SELECT plan INTO v_plan FROM merchants WHERE id = p_merchant_id;
    SELECT * INTO v_plan_details FROM merchant_plan_details WHERE id = v_plan::text;
    SELECT * INTO v_usage FROM quotas_usage 
    WHERE merchant_id = p_merchant_id AND month = v_current_month;
    
    IF v_usage IS NULL THEN
        INSERT INTO quotas_usage (merchant_id, month) 
        VALUES (p_merchant_id, v_current_month)
        RETURNING * INTO v_usage;
    END IF;
    
    CASE p_quota_type
        WHEN 'event' THEN
            RETURN v_usage.events_used < v_plan_details.events_quota;
        WHEN 'newsletter' THEN
            RETURN v_usage.newsletter_boosts_used < v_plan_details.newsletter_boosts;
        WHEN 'social' THEN
            RETURN v_usage.social_boosts_used < v_plan_details.social_boosts;
        WHEN 'homepage' THEN
            RETURN v_usage.homepage_boosts_used < v_plan_details.homepage_boosts;
        ELSE
            RETURN false;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIN - AFFICHER LE RÉSUMÉ
-- =====================================================
SELECT 
    'Tables créées' as status,
    COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN (
    'merchants', 'places', 'events', 'reviews',
    'merchant_plan_details', 'quotas_usage',
    'moderation_queue', 'email_logs', 'analytics_events'
);

-- Afficher les plans créés
SELECT * FROM merchant_plan_details ORDER BY price;