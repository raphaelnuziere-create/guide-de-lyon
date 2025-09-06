-- =====================================================
-- TABLES POUR L'AUTHENTIFICATION
-- =====================================================

-- Table profiles (pour tous les utilisateurs)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'merchant', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table merchants (données spécifiques aux professionnels)
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro_visibility', 'pro_boost')),
    verified BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_merchants_plan ON merchants(plan);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;

-- Politique pour profiles
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Les profils sont créés automatiquement"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Politique pour merchants
CREATE POLICY "Les merchants peuvent voir leurs propres données"
    ON merchants FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Les merchants peuvent modifier leurs propres données"
    ON merchants FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Les merchants peuvent créer leur profil"
    ON merchants FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Fonction pour créer automatiquement un profil à la création d'un utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, role)
    VALUES (
        new.id, 
        new.email,
        COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'user')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Ajouter la colonne contact_name à establishments si elle n'existe pas
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Tables d''authentification créées avec succès';
END $$;