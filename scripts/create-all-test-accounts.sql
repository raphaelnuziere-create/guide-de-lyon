-- ============================================
-- CRÉER TOUS LES COMPTES DE TEST COMPLETS
-- ============================================
-- Ce script crée ou corrige tous les comptes de test

-- ============================================
-- 1. VÉRIFIER LES COMPTES EXISTANTS
-- ============================================
SELECT 'COMPTES UTILISATEURS EXISTANTS:' as info;
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMÉ'
    ELSE 'NON CONFIRMÉ'
  END as statut
FROM auth.users 
WHERE email LIKE '%test.com'
ORDER BY email;

-- ============================================
-- 2. VÉRIFIER LES ÉTABLISSEMENTS EXISTANTS
-- ============================================
SELECT 'ÉTABLISSEMENTS EXISTANTS:' as info;
SELECT 
  e.id,
  e.name,
  e.email,
  e.plan,
  e.photos_count,
  e.events_this_month,
  e.status,
  e.verified,
  u.email as user_email,
  CASE 
    WHEN u.id IS NOT NULL THEN 'USER OK'
    ELSE 'USER MANQUANT'
  END as user_status
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email LIKE '%test.com'
ORDER BY e.plan, e.email;

-- ============================================
-- 3. NETTOYER LES ÉTABLISSEMENTS EXISTANTS
-- ============================================
DELETE FROM establishments WHERE email IN ('basic@test.com', 'pro@test.com', 'expert@test.com');

-- ============================================
-- 4. CRÉER LES ÉTABLISSEMENTS DE TEST
-- ============================================

-- ⚠️ IMPORTANT: Créez d'abord les utilisateurs dans Supabase Dashboard:
-- https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users
-- 
-- COMPTE BASIC:
-- Email: basic@test.com
-- Mot de passe: BasicTest123!
-- Confirmer l'email: OUI
--
-- COMPTE PRO:
-- Email: pro@test.com  
-- Mot de passe: ProTest123!
-- Confirmer l'email: OUI
--
-- COMPTE EXPERT:
-- Email: expert@test.com
-- Mot de passe: ExpertTest123!
-- Confirmer l'email: OUI

-- Créer l'établissement BASIC
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
  plan,
  photos_count,
  events_this_month,
  status,
  verified,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'basic@test.com' LIMIT 1),
  'Café Test Basic',
  'cafe-test-basic',
  'basic@test.com',
  '0123456789',
  '1 Place Bellecour',
  'Lyon',
  '69002',
  'Café de test - Plan Basic (1 photo, 3 événements/mois)',
  'basic',
  0,
  0,
  'active',
  true,
  NOW(),
  NOW()
);

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
  plan,
  photos_count,
  events_this_month,
  status,
  verified,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'pro@test.com' LIMIT 1),
  'Restaurant Test Pro',
  'restaurant-test-pro',
  'pro@test.com',
  '0234567890',
  '5 Rue de la République',
  'Lyon',
  '69001',
  'Restaurant de test - Plan Pro (6 photos, 3 événements/mois)',
  'pro',
  0,
  0,
  'active',
  true,
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
  plan,
  photos_count,
  events_this_month,
  status,
  verified,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'expert@test.com' LIMIT 1),
  'Spa Luxe Premium - Expert',
  'spa-luxe-premium-expert',
  'expert@test.com',
  '0345678901',
  '10 Place Bellecour',
  'Lyon',
  '69003',
  'Spa de luxe - Plan Expert (999 photos, 10 événements/mois)',
  'expert',
  0,
  0,
  'active',
  true,
  NOW(),
  NOW()
);

-- ============================================
-- 5. VÉRIFIER LA CRÉATION
-- ============================================
SELECT 'VÉRIFICATION FINALE:' as info;
SELECT 
  e.email,
  e.name,
  e.plan,
  e.photos_count,
  e.events_this_month,
  e.status,
  e.verified,
  u.email as user_email,
  u.email_confirmed_at,
  CASE 
    WHEN u.id IS NOT NULL AND u.email_confirmed_at IS NOT NULL THEN '✅ PRÊT'
    WHEN u.id IS NOT NULL AND u.email_confirmed_at IS NULL THEN '⚠️ EMAIL NON CONFIRMÉ'
    WHEN u.id IS NULL THEN '❌ USER MANQUANT'
    ELSE '❓ STATUT INCONNU'
  END as statut_final,
  CASE 
    WHEN e.plan = 'basic' THEN '1 photo, 3 événements/mois'
    WHEN e.plan = 'pro' THEN '6 photos, 3 événements/mois'
    WHEN e.plan = 'expert' THEN '999 photos, 10 événements/mois'
  END as limites_plan
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email LIKE '%test.com'
ORDER BY e.plan, e.email;

-- ============================================
-- 6. INSTRUCTIONS DE CONNEXION
-- ============================================
SELECT 'INSTRUCTIONS DE CONNEXION:' as info;
SELECT 
  'URL: https://guide-lyon-v2-b6wyq3tvp-raphaels-projects-8d8ce8f4.vercel.app/auth/pro/connexion' as url_connexion;

SELECT 
  e.email,
  CASE 
    WHEN e.email = 'basic@test.com' THEN 'BasicTest123!'
    WHEN e.email = 'pro@test.com' THEN 'ProTest123!'
    WHEN e.email = 'expert@test.com' THEN 'ExpertTest123!'
  END as mot_de_passe,
  e.plan,
  CASE 
    WHEN e.plan = 'basic' THEN '1 photo, 3 événements/mois'
    WHEN e.plan = 'pro' THEN '6 photos, 3 événements/mois'
    WHEN e.plan = 'expert' THEN '999 photos, 10 événements/mois'
  END as limites
FROM establishments e
WHERE e.email LIKE '%test.com'
ORDER BY e.plan;

-- ============================================
-- 7. DIAGNOSTIC DES PROBLÈMES POTENTIELS
-- ============================================
SELECT 'DIAGNOSTIC DES PROBLÈMES:' as info;

-- Comptes sans utilisateur auth
SELECT 
  'ÉTABLISSEMENTS SANS UTILISATEUR AUTH:' as probleme,
  e.email
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email LIKE '%test.com' AND u.id IS NULL;

-- Utilisateurs sans email confirmé
SELECT 
  'UTILISATEURS EMAIL NON CONFIRMÉ:' as probleme,
  u.email
FROM auth.users u
WHERE u.email LIKE '%test.com' AND u.email_confirmed_at IS NULL;

-- Établissements inactifs
SELECT 
  'ÉTABLISSEMENTS INACTIFS:' as probleme,
  e.email,
  e.status
FROM establishments e
WHERE e.email LIKE '%test.com' AND e.status != 'active';