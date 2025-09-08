-- ============================================
-- DIAGNOSTIC COMPLET DE CONNEXION
-- ============================================
-- Exécutez ces requêtes dans l'ordre dans Supabase SQL Editor

-- ============================================
-- 1. VÉRIFIER VOTRE COMPTE UTILISATEUR
-- ============================================
SELECT 
  id as user_id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'pro@test.com';

-- Si aucun résultat, le compte n'existe pas dans auth.users
-- Solution: Créer le compte ou vérifier l'email exact

-- ============================================
-- 2. VÉRIFIER VOTRE ÉTABLISSEMENT
-- ============================================
SELECT 
  id as establishment_id,
  name,
  email,
  owner_id,
  plan,
  is_active,
  created_at
FROM establishments 
WHERE email = 'pro@test.com' 
   OR name LIKE '%Gourmet%'
   OR name LIKE '%Restaurant%';

-- Si owner_id est NULL, c'est le problème !

-- ============================================
-- 3. DIAGNOSTIQUER LE PROBLÈME
-- ============================================
WITH user_data AS (
  SELECT id, email 
  FROM auth.users 
  WHERE email = 'pro@test.com'
),
establishment_data AS (
  SELECT id, name, email, owner_id, plan 
  FROM establishments 
  WHERE email = 'pro@test.com'
)
SELECT 
  CASE 
    WHEN u.id IS NULL THEN '❌ PROBLÈME: Compte utilisateur inexistant'
    WHEN e.id IS NULL THEN '❌ PROBLÈME: Établissement inexistant'
    WHEN e.owner_id IS NULL THEN '❌ PROBLÈME: owner_id non défini'
    WHEN e.owner_id != u.id THEN '❌ PROBLÈME: owner_id ne correspond pas'
    ELSE '✅ Tout est OK!'
  END as diagnostic,
  u.id as user_id,
  u.email as user_email,
  e.id as establishment_id,
  e.name as establishment_name,
  e.owner_id as establishment_owner_id,
  e.plan
FROM user_data u
FULL OUTER JOIN establishment_data e ON true;

-- ============================================
-- 4. SOLUTION AUTOMATIQUE
-- ============================================
-- Si vous avez un user_id et un établissement mais pas de lien:

-- D'abord, récupérez votre user_id avec la requête #1
-- Puis exécutez (remplacez USER_ID_ICI):

/*
UPDATE establishments 
SET 
  owner_id = 'USER_ID_ICI',
  plan = COALESCE(plan, 'pro'),
  is_active = true,
  updated_at = NOW()
WHERE email = 'pro@test.com' 
   OR name = 'Restaurant Le Gourmet Pro';
*/

-- ============================================
-- 5. VÉRIFICATION FINALE
-- ============================================
-- Après correction, exécutez ceci pour confirmer:

SELECT 
  e.name as "Établissement",
  e.email as "Email",
  e.plan as "Plan",
  e.is_active as "Actif",
  u.email as "Email Connexion",
  CASE 
    WHEN e.owner_id = u.id THEN '✅ Lien OK'
    ELSE '❌ Problème de lien'
  END as "Statut"
FROM establishments e
LEFT JOIN auth.users u ON u.id = e.owner_id
WHERE e.email = 'pro@test.com';

-- ============================================
-- 6. SI RIEN NE FONCTIONNE - CRÉER TOUT
-- ============================================
-- Option nucléaire: recréer l'établissement avec le bon owner_id

/*
-- 1. D'abord supprimer l'ancien
DELETE FROM establishments WHERE email = 'pro@test.com';

-- 2. Récupérer votre user_id
SELECT id FROM auth.users WHERE email = 'pro@test.com';

-- 3. Créer avec le bon owner_id (remplacez USER_ID_ICI)
INSERT INTO establishments (
  owner_id,
  name,
  email,
  address,
  phone,
  plan,
  is_active,
  created_at,
  updated_at
) VALUES (
  'USER_ID_ICI',
  'Restaurant Le Gourmet Pro',
  'pro@test.com',
  'Adresse du restaurant',
  '0400000000',
  'pro',
  true,
  NOW(),
  NOW()
);
*/

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Après toutes ces corrections, vous devriez voir:
-- ✅ Un utilisateur dans auth.users avec email = pro@test.com
-- ✅ Un établissement dans establishments avec le même email
-- ✅ owner_id de l'établissement = id de l'utilisateur
-- ✅ is_active = true
-- ✅ plan défini (basic, pro ou expert)