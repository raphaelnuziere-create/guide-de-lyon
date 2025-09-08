-- ============================================
-- SCRIPT COMPLET: CORRIGER LA DB ET CRÉER LES COMPTES TEST
-- ============================================
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new

-- ============================================
-- PARTIE 1: ANALYSER LA STRUCTURE ACTUELLE
-- ============================================
-- Voir les colonnes existantes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'establishments'
ORDER BY ordinal_position;

-- ============================================
-- PARTIE 2: AJOUTER LES COLONNES MANQUANTES
-- ============================================
-- Ajouter les colonnes pour les plans Pro/Expert si elles n'existent pas

-- Colonne plan (free, pro, expert)
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'free';

-- Colonnes pour les quotas
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS max_events INTEGER DEFAULT 1;

ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS max_photos INTEGER DEFAULT 5;

ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS events_this_month INTEGER DEFAULT 0;

ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS photos_this_month INTEGER DEFAULT 0;

-- Colonnes pour les features premium
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS priority_support BOOLEAN DEFAULT false;

ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Colonne status
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Colonnes additionnelles utiles
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS website VARCHAR(255);

ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- ============================================
-- PARTIE 3: VÉRIFIER/CRÉER LES UTILISATEURS
-- ============================================
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email IN ('pro@test.com', 'expert@test.com');

-- Si vide, créez les utilisateurs via:
-- https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users
-- "Add user" → "Create new user"
-- Email: pro@test.com, Password: ProTest123!
-- Email: expert@test.com, Password: ExpertTest123!

-- ============================================
-- PARTIE 4: CRÉER LES ÉTABLISSEMENTS TEST
-- ============================================
-- Supprimer les anciens établissements test
DELETE FROM establishments WHERE email IN ('pro@test.com', 'expert@test.com');

-- Créer l'établissement PRO
INSERT INTO establishments (
  user_id,
  name,
  slug,
  email,
  phone,
  address,
  city,
  postal_code,
  description,
  short_description,
  website,
  plan,
  max_events,
  max_photos,
  events_this_month,
  photos_this_month,
  featured,
  priority_support,
  is_verified,
  status,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'pro@test.com' LIMIT 1),
  'Restaurant Le Gourmet Pro',
  'restaurant-le-gourmet-pro',
  'pro@test.com',
  '0478567890',
  '25 Rue de la République',
  'Lyon',
  '69001',
  'Établissement Professionnel avec avantages Pro. Présence renforcée sur le Guide de Lyon.',
  'Restaurant gastronomique - Plan Pro',
  'https://restaurant-gourmet-pro.fr',
  'pro',
  3,  -- max 3 événements/mois
  10, -- max 10 photos/mois
  0,
  0,
  false, -- pas featured
  false, -- pas de support prioritaire
  false, -- pas vérifié
  'active',
  NOW(),
  NOW()
);

-- Créer l'établissement EXPERT
INSERT INTO establishments (
  user_id,
  name,
  slug,
  email,
  phone,
  address,
  city,
  postal_code,
  description,
  short_description,
  website,
  plan,
  max_events,
  max_photos,
  events_this_month,
  photos_this_month,
  featured,
  priority_support,
  is_verified,
  status,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'expert@test.com' LIMIT 1),
  'Spa Luxe Expert',
  'spa-luxe-expert',
  'expert@test.com',
  '0478901234',
  '10 Place Bellecour',
  'Lyon',
  '69002',
  'Établissement Premium avec tous les avantages Expert. Visibilité maximale sur le Guide de Lyon.',
  'Spa de luxe - Plan Expert Premium',
  'https://spa-luxe-expert.fr',
  'expert',
  6,   -- max 6 événements/mois
  20,  -- max 20 photos/mois
  0,
  0,
  true,  -- featured sur homepage
  true,  -- support prioritaire
  true,  -- badge vérifié
  'active',
  NOW(),
  NOW()
);

-- ============================================
-- PARTIE 5: VÉRIFICATION FINALE
-- ============================================
-- Vérifier que tout est créé correctement
SELECT 
  e.id,
  e.name,
  e.email,
  e.plan,
  e.max_events,
  e.max_photos,
  e.featured,
  e.is_verified,
  e.priority_support,
  e.status,
  u.email as auth_email
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email IN ('pro@test.com', 'expert@test.com');

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Vous devriez voir:
-- 1. Restaurant Le Gourmet Pro
--    - plan: pro
--    - max_events: 3
--    - max_photos: 10
--    - featured: false
--    - is_verified: false
--
-- 2. Spa Luxe Expert
--    - plan: expert
--    - max_events: 6
--    - max_photos: 20
--    - featured: true
--    - is_verified: true
--    - priority_support: true

-- ============================================
-- CONNEXION
-- ============================================
-- URL: http://localhost:3000/auth/pro/connexion
--
-- COMPTE PRO:
-- Email: pro@test.com
-- Mot de passe: ProTest123!
--
-- COMPTE EXPERT:
-- Email: expert@test.com
-- Mot de passe: ExpertTest123!