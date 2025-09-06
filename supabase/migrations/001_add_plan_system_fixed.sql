-- Migration: Ajout du système de plans pour les établissements
-- Date: 2024
-- Version: Fixed

-- 1. Ajouter les colonnes pour le système de plans
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'expert')),
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS plan_billing_cycle VARCHAR(20) CHECK (plan_billing_cycle IN ('monthly', 'yearly')),

-- Compteurs et limites
ADD COLUMN IF NOT EXISTS photos_count INTEGER DEFAULT 0 CHECK (photos_count >= 0),
ADD COLUMN IF NOT EXISTS events_this_month INTEGER DEFAULT 0 CHECK (events_this_month >= 0),
ADD COLUMN IF NOT EXISTS events_reset_date DATE DEFAULT CURRENT_DATE,

-- Vérification TVA
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,

-- Statistiques mensuelles
ADD COLUMN IF NOT EXISTS views_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_phone INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_website INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stats_reset_date DATE DEFAULT CURRENT_DATE,

-- Intégration Stripe
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),

-- Bonus annuel
ADD COLUMN IF NOT EXISTS blog_articles_remaining INTEGER DEFAULT 0;

-- 2. Créer la table des photos d'établissement
CREATE TABLE IF NOT EXISTS establishment_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption VARCHAR(255),
  position INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_establishment_photos_establishment ON establishment_photos(establishment_id);
CREATE INDEX IF NOT EXISTS idx_establishment_photos_position ON establishment_photos(position);

-- 3. Créer la table des événements (utilisons la structure existante si elle existe)
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,  -- Changé de date_start à start_date
  end_date TIMESTAMPTZ,             -- Changé de date_end à end_date
  location VARCHAR(255),
  image_url TEXT,
  
  -- Canaux de diffusion selon le plan
  show_on_establishment_page BOOLEAN DEFAULT TRUE,
  show_on_homepage BOOLEAN DEFAULT FALSE,
  show_in_newsletter BOOLEAN DEFAULT FALSE,
  show_on_social BOOLEAN DEFAULT FALSE,
  
  -- Métadonnées
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_events_establishment ON events(establishment_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- 4. Créer la table d'historique des abonnements
CREATE TABLE IF NOT EXISTS subscriptions_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL,
  previous_plan VARCHAR(20),
  billing_cycle VARCHAR(20),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  stripe_payment_intent_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_history_establishment ON subscriptions_history(establishment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_history_status ON subscriptions_history(status);