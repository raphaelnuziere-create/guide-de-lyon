-- =====================================================
-- PARTIE 1 : CRÉATION DES TABLES UNIQUEMENT
-- =====================================================

-- 1. TABLE DES PLANS D'ABONNEMENT
-- =====================================================
DROP TABLE IF EXISTS subscription_plans CASCADE;
CREATE TABLE subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  max_photos INTEGER NOT NULL DEFAULT 1,
  max_events_per_month INTEGER NOT NULL DEFAULT 0,
  max_description_length INTEGER NOT NULL DEFAULT 200,
  events_on_homepage BOOLEAN DEFAULT FALSE,
  events_in_newsletter BOOLEAN DEFAULT FALSE,
  events_on_social BOOLEAN DEFAULT FALSE,
  has_carousel BOOLEAN DEFAULT FALSE,
  has_video BOOLEAN DEFAULT FALSE,
  has_pdf_menu BOOLEAN DEFAULT FALSE,
  has_reservation_link BOOLEAN DEFAULT FALSE,
  has_statistics BOOLEAN DEFAULT FALSE,
  statistics_days INTEGER DEFAULT 0,
  directory_boost INTEGER DEFAULT 0,
  badge_type VARCHAR(20),
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE DES ÉTABLISSEMENTS
-- =====================================================
DROP TABLE IF EXISTS establishments CASCADE;
CREATE TABLE establishments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(20),
  hide_email BOOLEAN DEFAULT FALSE,
  hide_phone BOOLEAN DEFAULT FALSE,
  website VARCHAR(255),
  address VARCHAR(500),
  postal_code VARCHAR(10),
  city VARCHAR(100) DEFAULT 'Lyon',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  vat_number VARCHAR(50),
  siret VARCHAR(20),
  opening_hours JSONB DEFAULT '{}',
  reservation_link VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  category VARCHAR(100),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE DES ABONNEMENTS
-- =====================================================
DROP TABLE IF EXISTS subscriptions CASCADE;
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'trialing',
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  events_used_this_month INTEGER DEFAULT 0,
  last_quota_reset TIMESTAMPTZ DEFAULT NOW(),
  trial_event_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE DES MÉDIAS
-- =====================================================
DROP TABLE IF EXISTS establishment_media CASCADE;
CREATE TABLE establishment_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  caption VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE DES ÉVÉNEMENTS
-- =====================================================
DROP TABLE IF EXISTS events CASCADE;
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  image_url VARCHAR(500),
  show_on_homepage BOOLEAN DEFAULT FALSE,
  show_in_newsletter BOOLEAN DEFAULT FALSE,
  publish_to_social BOOLEAN DEFAULT FALSE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  booking_link VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  facebook_posted BOOLEAN DEFAULT FALSE,
  instagram_posted BOOLEAN DEFAULT FALSE,
  social_posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLE DES STATISTIQUES
-- =====================================================
DROP TABLE IF EXISTS establishment_analytics CASCADE;
CREATE TABLE establishment_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  profile_views INTEGER DEFAULT 0,
  phone_clicks INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  direction_clicks INTEGER DEFAULT 0,
  event_views INTEGER DEFAULT 0,
  reservation_clicks INTEGER DEFAULT 0,
  traffic_sources JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(establishment_id, date)
);

-- 7. TABLE DES PRÉFÉRENCES NEWSLETTER
-- =====================================================
DROP TABLE IF EXISTS newsletter_preferences CASCADE;
CREATE TABLE newsletter_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  frequency VARCHAR(20) DEFAULT 'weekly',
  receive_events BOOLEAN DEFAULT TRUE,
  receive_news BOOLEAN DEFAULT TRUE,
  receive_blog BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  total_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);