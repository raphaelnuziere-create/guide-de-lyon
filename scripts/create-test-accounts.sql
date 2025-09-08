-- ============================================
-- SCRIPT SQL POUR CRÉER LES COMPTES TEST
-- ============================================
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new

-- IMPORTANT: Les utilisateurs Auth doivent être créés via le Dashboard Supabase
-- Allez dans Authentication > Users > Invite user

-- ============================================
-- ÉTAPE 1: Créer les utilisateurs dans Supabase Dashboard
-- ============================================
-- 1. Aller sur: https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users
-- 2. Cliquer sur "Invite user"
-- 3. Créer les comptes suivants:
--    
--    COMPTE PRO:
--    Email: pro@test.com
--    Password: ProTest123!
--    
--    COMPTE EXPERT:
--    Email: expert@test.com
--    Password: ExpertTest123!
--
-- 4. Noter les User IDs générés pour chaque compte
-- 5. Remplacer les UUID ci-dessous par les vrais IDs

-- ============================================
-- ÉTAPE 2: Récupérer les IDs des utilisateurs créés
-- ============================================
-- Exécutez cette requête pour obtenir les IDs:
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email IN ('pro@test.com', 'expert@test.com');

-- ============================================
-- ÉTAPE 3: Créer les établissements
-- ============================================
-- Remplacez 'USER_ID_PRO' et 'USER_ID_EXPERT' par les vrais IDs récupérés

-- Supprimer les établissements existants pour ces emails (si nécessaire)
DELETE FROM establishments WHERE email IN ('pro@test.com', 'expert@test.com');

-- Créer l'établissement PRO
INSERT INTO establishments (
  user_id,
  name,
  slug,
  plan,
  sector,
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
  vat_number,
  opening_hours,
  social_media,
  status,
  created_at,
  updated_at
) VALUES (
  'USER_ID_PRO', -- REMPLACER PAR LE VRAI ID
  'Restaurant Le Gourmet Pro',
  'restaurant-le-gourmet-pro',
  'pro',
  'restaurant-food',
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
  'FR98765432109',
  '{"monday": {"open": "09:00", "close": "19:00"}, "tuesday": {"open": "09:00", "close": "19:00"}, "wednesday": {"open": "09:00", "close": "19:00"}, "thursday": {"open": "09:00", "close": "19:00"}, "friday": {"open": "09:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "18:00"}, "sunday": {"open": "closed", "close": "closed"}}'::jsonb,
  '{"facebook": "https://facebook.com/restaurantlegourmetpro", "instagram": "@restaurantlegourmetpro", "linkedin": null}'::jsonb,
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
  sector,
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
  vat_number,
  opening_hours,
  social_media,
  status,
  created_at,
  updated_at
) VALUES (
  'USER_ID_EXPERT', -- REMPLACER PAR LE VRAI ID
  'Spa Luxe Expert',
  'spa-luxe-expert',
  'expert',
  'beaute-bienetre',
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
  'FR12345678901',
  '{"monday": {"open": "09:00", "close": "19:00"}, "tuesday": {"open": "09:00", "close": "19:00"}, "wednesday": {"open": "09:00", "close": "19:00"}, "thursday": {"open": "09:00", "close": "19:00"}, "friday": {"open": "09:00", "close": "20:00"}, "saturday": {"open": "10:00", "close": "18:00"}, "sunday": {"open": "closed", "close": "closed"}}'::jsonb,
  '{"facebook": "https://facebook.com/spaluxeexpert", "instagram": "@spaluxeexpert", "linkedin": "https://linkedin.com/company/spa-luxe-expert"}'::jsonb,
  'active',
  NOW(),
  NOW()
);

-- ============================================
-- ÉTAPE 4: Vérifier la création
-- ============================================
-- Vérifier les utilisateurs
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email IN ('pro@test.com', 'expert@test.com');

-- Vérifier les établissements
SELECT 
  e.id,
  e.name,
  e.email,
  e.plan,
  e.is_verified,
  e.featured,
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