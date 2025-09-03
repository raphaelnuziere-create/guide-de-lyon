# 🚀 INSTRUCTIONS POUR CRÉER LES TABLES

## Option 1 : Via le SQL Editor (RECOMMANDÉ)

1. **Cliquez sur ce lien pour un NOUVEL éditeur :**
   https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql

2. **Cliquez sur "New query"** (bouton en haut)

3. **Copiez et collez CE script :**

```sql
-- CRÉATION DES TABLES POUR GUIDE DE LYON
-- Script vérifié et testé

-- Table 1: MERCHANTS
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    onboarding_completed BOOLEAN DEFAULT false
);

-- Table 2: PLACES
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: EVENTS
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer la sécurité
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies ouvertes pour test
DROP POLICY IF EXISTS "open_merchants" ON merchants;
CREATE POLICY "open_merchants" ON merchants FOR ALL USING (true);

DROP POLICY IF EXISTS "open_places" ON places;
CREATE POLICY "open_places" ON places FOR ALL USING (true);

DROP POLICY IF EXISTS "open_events" ON events;
CREATE POLICY "open_events" ON events FOR ALL USING (true);

-- Vérification
SELECT 'Tables créées avec succès !' as message;
```

4. **Cliquez sur RUN**

## Option 2 : Via le Table Editor

1. Allez sur : https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/editor

2. Cliquez sur **"Create a new table"**

3. Créez la table `merchants` avec ces colonnes :
   - id (UUID, primary key)
   - email (text, unique)
   - company_name (text)
   - phone (text)
   - plan (text, default 'free')
   - created_at (timestamptz, default now())
   - onboarding_completed (boolean, default false)

## ✅ Pour vérifier que ça marche

Après avoir créé les tables, allez sur :
https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/editor

Vous devriez voir dans la liste :
- merchants ✅
- places ✅
- events ✅
- businesses (déjà existant)
- original_blog_posts (déjà existant)