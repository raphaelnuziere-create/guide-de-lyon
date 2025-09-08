-- ============================================
-- SCRIPT POUR RÉINITIALISER LES MOTS DE PASSE
-- ============================================
-- À exécuter dans le SQL Editor de Supabase Dashboard

-- ============================================
-- ÉTAPE 1: VÉRIFIER QUE LES COMPTES EXISTENT
-- ============================================
SELECT 
  id, 
  email, 
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email IN ('pro@test.com', 'expert@test.com');

-- ============================================
-- ÉTAPE 2: VÉRIFIER LES ÉTABLISSEMENTS
-- ============================================
SELECT 
  e.id,
  e.name,
  e.email,
  e.plan,
  e.max_events,
  e.max_photos,
  e.featured,
  e.is_verified,
  u.email as user_email,
  u.id as user_id
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email IN ('pro@test.com', 'expert@test.com');

-- ============================================
-- SOLUTION : RÉINITIALISER LES MOTS DE PASSE
-- ============================================
-- Puisque nous ne pouvons pas changer les mots de passe via SQL,
-- vous devez faire l'une de ces actions :

-- OPTION 1: Via le Dashboard Supabase (RECOMMANDÉ)
-- 1. Aller sur: https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users
-- 2. Trouver l'utilisateur pro@test.com
-- 3. Cliquer sur les 3 points (...) → "Send password reset"
-- 4. Faire pareil pour expert@test.com
-- 5. Vérifier les emails ou utiliser l'option "Reset password" directement

-- OPTION 2: Supprimer et recréer les utilisateurs
-- 1. Dans le dashboard, supprimer les utilisateurs pro@test.com et expert@test.com
-- 2. Les recréer avec "Add user" → "Create new user"
--    Email: pro@test.com, Password: ProTest123!
--    Email: expert@test.com, Password: ExpertTest123!
-- 3. Cocher "Auto Confirm Email"

-- ============================================
-- ÉTAPE 3: METTRE À JOUR LES USER_ID SI NÉCESSAIRE
-- ============================================
-- Si vous avez recréé les utilisateurs, mettez à jour les establishments:

-- Pour le compte PRO
UPDATE establishments 
SET user_id = (SELECT id FROM auth.users WHERE email = 'pro@test.com' LIMIT 1)
WHERE email = 'pro@test.com';

-- Pour le compte EXPERT
UPDATE establishments 
SET user_id = (SELECT id FROM auth.users WHERE email = 'expert@test.com' LIMIT 1)
WHERE email = 'expert@test.com';

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================
SELECT 
  e.name as establishment,
  e.email,
  e.plan,
  CASE 
    WHEN u.id IS NOT NULL THEN '✅ User lié'
    ELSE '❌ User manquant'
  END as user_status,
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email confirmé'
    ELSE '❌ Email non confirmé'
  END as email_status
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email IN ('pro@test.com', 'expert@test.com');