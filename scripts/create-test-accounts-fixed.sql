-- ============================================
-- SCRIPT SQL CORRIGÉ POUR CRÉER LES COMPTES TEST
-- ============================================
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new

-- ============================================
-- ÉTAPE 1: Récupérer les IDs des utilisateurs
-- ============================================
-- D'abord, vérifier si les utilisateurs existent déjà
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email IN ('pro@test.com', 'expert@test.com');

-- Si les utilisateurs n'existent pas, les créer manuellement via:
-- https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users
-- Cliquer "Add user" → "Create new user"
-- Email: pro@test.com, Password: ProTest123!
-- Email: expert@test.com, Password: ExpertTest123!

-- ============================================
-- ÉTAPE 2: Voir la structure de la table establishments
-- ============================================
-- Vérifier les colonnes disponibles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'establishments'
ORDER BY ordinal_position;

-- ============================================
-- ÉTAPE 3: Créer les établissements (version simplifiée)
-- ============================================
-- IMPORTANT: Remplacez les USER_ID par les vrais IDs récupérés à l'étape 1

-- Supprimer les établissements existants pour ces emails
DELETE FROM establishments WHERE email IN ('pro@test.com', 'expert@test.com');

-- Créer l'établissement PRO
INSERT INTO establishments (
  user_id,
  name,
  slug,
  plan,
  address,
  city,
  postal_code,
  phone,
  email,
  website,
  description,
  short_description,
  is_verified,
  featured,
  priority_support,
  events_this_month,
  photos_this_month,
  max_events,
  max_photos,
  status,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'pro@test.com' LIMIT 1), -- Récupère automatiquement l'ID
  'Restaurant Le Gourmet Pro',
  'restaurant-le-gourmet-pro',
  'pro',
  '25 Rue de la République',
  'Lyon',
  '69001',
  '0478567890',
  'pro@test.com',
  'https://restaurant-le-gourmet-pro.fr',
  'Établissement Professionnel avec avantages Pro. Présence renforcée sur le Guide de Lyon.',
  'Établissement de qualité - Plan Pro',
  false,
  false,
  false,
  0,
  0,
  3,
  10,
  'active',
  NOW(),
  NOW()
);

-- Créer l'établissement EXPERT
INSERT INTO establishments (
  user_id,
  name,
  slug,
  plan,
  address,
  city,
  postal_code,
  phone,
  email,
  website,
  description,
  short_description,
  is_verified,
  featured,
  priority_support,
  events_this_month,
  photos_this_month,
  max_events,
  max_photos,
  status,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'expert@test.com' LIMIT 1), -- Récupère automatiquement l'ID
  'Spa Luxe Expert',
  'spa-luxe-expert',
  'expert',
  '10 Place Bellecour',
  'Lyon',
  '69002',
  '0478901234',
  'expert@test.com',
  'https://spa-luxe-expert.fr',
  'Établissement Premium avec tous les avantages Expert. Visibilité maximale sur le Guide de Lyon.',
  'Le meilleur de Lyon - Plan Expert',
  true,
  true,
  true,
  0,
  0,
  6,
  20,
  'active',
  NOW(),
  NOW()
);

-- ============================================
-- ÉTAPE 4: Vérifier la création
-- ============================================
-- Vérifier les établissements créés
SELECT 
  e.id,
  e.name,
  e.email,
  e.plan,
  e.is_verified,
  e.featured,
  e.max_events,
  e.max_photos,
  u.email as user_email
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email IN ('pro@test.com', 'expert@test.com');

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Vous devriez voir 2 établissements:
-- 1. Restaurant Le Gourmet Pro (plan: pro, max_events: 3, max_photos: 10)
-- 2. Spa Luxe Expert (plan: expert, max_events: 6, max_photos: 20, verified: true)

-- ============================================
-- TEST DE CONNEXION
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