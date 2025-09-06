-- Backup Schema Base de données Supabase
-- Date: 06 Septembre 2025
-- Projet: Guide de Lyon

-- Table: establishments
-- Description: Établissements des professionnels
CREATE TABLE IF NOT EXISTS establishments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    postal_code VARCHAR(10),
    city VARCHAR(100) DEFAULT 'Lyon',
    facebook_url VARCHAR(255),
    instagram_url VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    vat_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Table: subscription_plans
-- Description: Plans d'abonnement disponibles
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    billing_cycle VARCHAR(20),
    features JSONB,
    max_events INTEGER,
    max_photos INTEGER,
    description_limit INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: subscriptions
-- Description: Abonnements actifs des établissements
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active',
    billing_cycle VARCHAR(20),
    events_used_this_month INTEGER DEFAULT 0,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes pour optimisation
CREATE INDEX idx_establishments_user_id ON establishments(user_id);
CREATE INDEX idx_establishments_status ON establishments(status);
CREATE INDEX idx_establishments_category ON establishments(category);
CREATE INDEX idx_subscriptions_establishment_id ON subscriptions(establishment_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Row Level Security (RLS)
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies establishments
CREATE POLICY "Users can view their own establishment" 
    ON establishments FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own establishment" 
    ON establishments FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own establishment" 
    ON establishments FOR UPDATE 
    USING (auth.uid() = user_id);

-- Policies subscriptions
CREATE POLICY "Users can view their establishment subscription" 
    ON subscriptions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM establishments 
            WHERE establishments.id = subscriptions.establishment_id 
            AND establishments.user_id = auth.uid()
        )
    );

-- Données initiales pour les plans
INSERT INTO subscription_plans (slug, name, price, billing_cycle, max_events, max_photos, description_limit) VALUES
('basic', 'Basic', 0, 'monthly', 1, 3, 200),
('pro', 'Pro', 19, 'monthly', 4, 6, 500),
('expert', 'Expert', 49, 'monthly', NULL, 15, 1500)
ON CONFLICT (slug) DO NOTHING;