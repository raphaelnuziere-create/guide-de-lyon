-- =====================================================
-- GUIDE DE LYON - SCHEMA DE BASE DE DONNÉES
-- =====================================================
-- Version: 1.0
-- Date: 2025-01-09
-- Description: Structure complète pour l'annuaire avec système de monétisation

-- =====================================================
-- 1. TYPES ET ENUMS
-- =====================================================

-- Plans disponibles pour les merchants
CREATE TYPE merchant_plan AS ENUM ('free', 'pro_events', 'pro_boost');

-- Statuts pour la modération
CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');

-- Types de boost pour les événements
CREATE TYPE boost_type AS ENUM ('none', 'newsletter', 'social', 'homepage');

-- Statut des établissements
CREATE TYPE place_status AS ENUM ('draft', 'pending', 'active', 'suspended');

-- =====================================================
-- 2. TABLE: MERCHANTS (Utilisateurs professionnels)
-- =====================================================
CREATE TABLE merchants (
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

-- Index pour les recherches fréquentes
CREATE INDEX idx_merchants_email ON merchants(email);
CREATE INDEX idx_merchants_plan ON merchants(plan);
CREATE INDEX idx_merchants_verified ON merchants(verified);

-- =====================================================
-- 3. TABLE: PLACES (Établissements)
-- =====================================================
CREATE TABLE places (
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
    
    -- Horaires (format JSON pour flexibilité)
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

-- Index pour optimiser les requêtes
CREATE INDEX idx_places_merchant_id ON places(merchant_id);
CREATE INDEX idx_places_slug ON places(slug);
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_coordinates ON places USING gist(coordinates);

-- =====================================================
-- 4. TABLE: EVENTS (Événements)
-- =====================================================
CREATE TABLE events (
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
    
    -- Lieu (peut être différent de l'établissement)
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
CREATE INDEX idx_events_place_id ON events(place_id);
CREATE INDEX idx_events_merchant_id ON events(merchant_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_boost_type ON events(boost_type);

-- =====================================================
-- 5. TABLE: REVIEWS (Avis)
-- =====================================================
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    place_id UUID REFERENCES places(id) ON DELETE CASCADE,
    
    -- Auteur (peut être anonyme)
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
CREATE INDEX idx_reviews_place_id ON reviews(place_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);

-- =====================================================
-- 6. TABLE: MERCHANT_PLANS (Détail des plans)
-- =====================================================
CREATE TABLE merchant_plan_details (
    id TEXT PRIMARY KEY, -- 'free', 'pro_events', 'pro_boost'
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    
    -- Quotas
    events_quota INTEGER DEFAULT 0,
    newsletter_boosts INTEGER DEFAULT 0,
    social_boosts INTEGER DEFAULT 0,
    homepage_boosts INTEGER DEFAULT 0,
    
    -- Features (format JSON pour flexibilité)
    features JSONB DEFAULT '[]'::jsonb,
    
    -- Stripe
    stripe_price_id TEXT,
    
    -- Active
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les plans par défaut
INSERT INTO merchant_plan_details (id, name, price, events_quota, newsletter_boosts, social_boosts, homepage_boosts, features) VALUES
('free', 'Gratuit', 0, 0, 0, 0, 0, '["Fiche établissement basique", "Horaires et contact"]'::jsonb),
('pro_events', 'Pro Events', 19.00, 2, 0, 0, 0, '["Fiche établissement complète", "2 événements par mois", "Statistiques basiques", "Support prioritaire"]'::jsonb),
('pro_boost', 'Pro Boost', 49.00, 5, 2, 5, 1, '["Fiche établissement premium", "5 événements par mois", "2 boosts newsletter", "5 boosts réseaux sociaux", "Mise en avant homepage", "Statistiques avancées", "Support VIP"]'::jsonb);

-- =====================================================
-- 7. TABLE: QUOTAS_USAGE (Suivi des quotas)
-- =====================================================
CREATE TABLE quotas_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- Format YYYY-MM-01
    
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
CREATE INDEX idx_quotas_usage_merchant_month ON quotas_usage(merchant_id, month);

-- =====================================================
-- 8. TABLE: MODERATION_QUEUE (File de modération)
-- =====================================================
CREATE TABLE moderation_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Item à modérer
    item_type TEXT NOT NULL, -- 'place', 'event', 'review'
    item_id UUID NOT NULL,
    
    -- Détails
    content JSONB, -- Snapshot du contenu à modérer
    flags TEXT[], -- Raisons du flag
    ai_score DECIMAL(3, 2), -- Score de confiance IA (0-1)
    
    -- Modération
    status moderation_status DEFAULT 'pending',
    reviewed_by UUID, -- ID de l'admin
    reviewed_at TIMESTAMPTZ,
    decision_notes TEXT,
    
    -- Priorité
    priority INTEGER DEFAULT 0, -- 0 = normal, 1 = urgent (boost)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX idx_moderation_queue_priority ON moderation_queue(priority DESC);
CREATE INDEX idx_moderation_queue_created ON moderation_queue(created_at);

-- =====================================================
-- 9. TABLE: EMAIL_LOGS (Suivi des emails)
-- =====================================================
CREATE TABLE email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Destinataire
    recipient_email TEXT NOT NULL,
    merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
    
    -- Email
    template_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    
    -- Statut
    status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'bounced'
    
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
CREATE INDEX idx_email_logs_merchant ON email_logs(merchant_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

-- =====================================================
-- 10. TABLE: ANALYTICS_EVENTS (Tracking)
-- =====================================================
CREATE TABLE analytics_events (
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
    target_type TEXT, -- 'place', 'event', 'merchant'
    target_id UUID,
    
    -- Métadonnées
    properties JSONB,
    
    -- Device info
    user_agent TEXT,
    ip_address INET,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotas_usage ENABLE ROW LEVEL SECURITY;

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
-- 12. FUNCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à toutes les tables avec updated_at
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour réinitialiser les quotas mensuels
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS void AS $$
BEGIN
    -- Créer les nouvelles entrées pour le mois en cours
    INSERT INTO quotas_usage (merchant_id, month, events_used, newsletter_boosts_used, social_boosts_used, homepage_boosts_used)
    SELECT 
        id,
        date_trunc('month', NOW())::date,
        0, 0, 0, 0
    FROM merchants
    WHERE plan != 'free'
    ON CONFLICT (merchant_id, month) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier les quotas
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
    
    -- Récupérer le plan du merchant
    SELECT plan INTO v_plan FROM merchants WHERE id = p_merchant_id;
    
    -- Récupérer les détails du plan
    SELECT * INTO v_plan_details FROM merchant_plan_details WHERE id = v_plan::text;
    
    -- Récupérer l'usage actuel
    SELECT * INTO v_usage FROM quotas_usage 
    WHERE merchant_id = p_merchant_id AND month = v_current_month;
    
    -- Si pas d'usage, créer l'entrée
    IF v_usage IS NULL THEN
        INSERT INTO quotas_usage (merchant_id, month) 
        VALUES (p_merchant_id, v_current_month)
        RETURNING * INTO v_usage;
    END IF;
    
    -- Vérifier selon le type de quota
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
-- 13. VUES UTILES
-- =====================================================

-- Vue pour les statistiques des merchants
CREATE VIEW merchant_stats AS
SELECT 
    m.id,
    m.company_name,
    m.plan,
    COUNT(DISTINCT p.id) as places_count,
    COUNT(DISTINCT e.id) as events_count,
    COUNT(DISTINCT r.id) as reviews_count,
    AVG(r.rating)::decimal(2,1) as average_rating,
    SUM(p.views_count) as total_views,
    SUM(p.clicks_count) as total_clicks
FROM merchants m
LEFT JOIN places p ON p.merchant_id = m.id
LEFT JOIN events e ON e.merchant_id = m.id
LEFT JOIN reviews r ON r.place_id = p.id AND r.status = 'approved'
GROUP BY m.id;

-- Vue pour le dashboard admin
CREATE VIEW admin_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM merchants WHERE created_at > NOW() - INTERVAL '30 days') as new_merchants_30d,
    (SELECT COUNT(*) FROM merchants WHERE plan != 'free') as paid_merchants,
    (SELECT COUNT(*) FROM places WHERE status = 'active') as active_places,
    (SELECT COUNT(*) FROM events WHERE start_date > NOW()) as upcoming_events,
    (SELECT COUNT(*) FROM moderation_queue WHERE status = 'pending') as pending_moderation,
    (SELECT SUM(price) FROM merchant_plan_details mpd 
     JOIN merchants m ON m.plan::text = mpd.id 
     WHERE m.plan != 'free') as monthly_revenue;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

-- Pour exécuter ce script dans Supabase:
-- 1. Aller dans l'éditeur SQL de Supabase
-- 2. Copier-coller ce script
-- 3. Cliquer sur "Run"