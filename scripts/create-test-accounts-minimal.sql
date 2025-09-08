-- ============================================
-- SCRIPT SQL MINIMAL POUR CRÉER LES COMPTES TEST
-- ============================================
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new

-- ============================================
-- ÉTAPE 1: VOIR LA STRUCTURE EXACTE DE LA TABLE
-- ============================================
-- Exécutez d'abord cette requête pour voir les colonnes disponibles:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'establishments'
ORDER BY ordinal_position;

-- ============================================
-- ÉTAPE 2: VÉRIFIER LES UTILISATEURS
-- ============================================
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email IN ('pro@test.com', 'expert@test.com');

-- Si les utilisateurs n'existent pas, créez-les via:
-- https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users
-- "Add user" → "Create new user"
-- pro@test.com / ProTest123!
-- expert@test.com / ExpertTest123!

-- ============================================
-- ÉTAPE 3: CRÉER LES ÉTABLISSEMENTS (VERSION MINIMALE)
-- ============================================
-- Version minimale avec seulement les colonnes essentielles

-- Supprimer les établissements existants
DELETE FROM establishments WHERE email IN ('pro@test.com', 'expert@test.com');

-- Créer l'établissement PRO (version minimale)
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
  'Établissement Professionnel - Plan Pro',
  NOW(),
  NOW()
);

-- Créer l'établissement EXPERT (version minimale)
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
  'Établissement Premium - Plan Expert',
  NOW(),
  NOW()
);

-- ============================================
-- ÉTAPE 4: METTRE À JOUR LES COLONNES SI ELLES EXISTENT
-- ============================================
-- Essayez ces updates séparément (ils échoueront si les colonnes n'existent pas)

-- Pour le plan (si la colonne existe)
UPDATE establishments SET plan = 'pro' WHERE email = 'pro@test.com';
UPDATE establishments SET plan = 'expert' WHERE email = 'expert@test.com';

-- Pour les quotas (si les colonnes existent)
UPDATE establishments SET max_events = 3, max_photos = 10 WHERE email = 'pro@test.com';
UPDATE establishments SET max_events = 6, max_photos = 20 WHERE email = 'expert@test.com';

-- Pour le statut (si la colonne existe)
UPDATE establishments SET status = 'active' WHERE email IN ('pro@test.com', 'expert@test.com');

-- Pour les features Expert (si les colonnes existent)
UPDATE establishments SET featured = true WHERE email = 'expert@test.com';
UPDATE establishments SET priority_support = true WHERE email = 'expert@test.com';

-- ============================================
-- ÉTAPE 5: VÉRIFIER LA CRÉATION
-- ============================================
SELECT 
  e.*,
  u.email as user_email
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email IN ('pro@test.com', 'expert@test.com');

-- ============================================
-- INFORMATIONS DE CONNEXION
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