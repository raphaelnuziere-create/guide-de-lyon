-- Migration pour créer les tables d'authentification
-- Supprimer les tables existantes si elles existent
DROP TABLE IF EXISTS merchant_places CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Créer la table profiles pour étendre auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'merchant', 'admin')),
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Créer la table merchants pour les professionnels
CREATE TABLE merchants (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    phone TEXT,
    email TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro_visibility', 'pro_boost')),
    plan_expires_at TIMESTAMP WITH TIME ZONE,
    verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    settings JSONB DEFAULT '{
        "notifications": {
            "email": true,
            "sms": false,
            "push": true
        },
        "business_hours": {
            "monday": {"open": "09:00", "close": "18:00", "closed": false},
            "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
            "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
            "thursday": {"open": "09:00", "close": "18:00", "closed": false},
            "friday": {"open": "09:00", "close": "18:00", "closed": false},
            "saturday": {"open": "10:00", "close": "17:00", "closed": false},
            "sunday": {"open": null, "close": null, "closed": true}
        }
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table de liaison entre merchants et places (établissements)
CREATE TABLE merchant_places (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    place_id TEXT NOT NULL,
    is_owner BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(merchant_id, place_id)
);

-- Créer les index pour les performances
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_merchants_plan ON merchants(plan);
CREATE INDEX idx_merchants_verified ON merchants(verified);
CREATE INDEX idx_merchant_places_merchant ON merchant_places(merchant_id);
CREATE INDEX idx_merchant_places_place ON merchant_places(place_id);

-- Activer Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_places ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Les profils publics sont visibles par tous" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Les profils sont créés automatiquement" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies pour merchants
CREATE POLICY "Les infos merchants sont visibles par tous" ON merchants
    FOR SELECT USING (true);

CREATE POLICY "Les merchants peuvent modifier leurs propres infos" ON merchants
    FOR ALL USING (auth.uid() = id);

-- Policies pour merchant_places
CREATE POLICY "Les relations merchant-places sont visibles" ON merchant_places
    FOR SELECT USING (true);

CREATE POLICY "Les merchants peuvent gérer leurs établissements" ON merchant_places
    FOR ALL USING (auth.uid() = merchant_id);

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, role)
    VALUES (new.id, new.raw_user_meta_data->>'display_name', COALESCE(new.raw_user_meta_data->>'role', 'user'));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON merchants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer des données de test

-- 1. Créer un admin (utilise auth.users directement via Supabase)
-- Note: Les utilisateurs doivent être créés via Supabase Auth, pas directement en SQL

-- Fonction pour promouvoir un utilisateur en admin (à exécuter manuellement)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET role = 'admin' 
    WHERE id = (SELECT id FROM auth.users WHERE email = user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pour créer un admin, utiliser: SELECT promote_to_admin('admin@guide-de-lyon.fr');

COMMENT ON TABLE profiles IS 'Profils étendus des utilisateurs avec leurs rôles';
COMMENT ON TABLE merchants IS 'Informations des comptes professionnels';
COMMENT ON TABLE merchant_places IS 'Association entre marchands et établissements';