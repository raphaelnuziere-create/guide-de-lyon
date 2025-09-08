-- ============================================
-- SCRIPT DE RÉPARATION URGENT
-- ============================================

-- 1. DIAGNOSTIC SIMPLE (copiez et exécutez)
SELECT 
  CASE 
    WHEN u.id IS NULL THEN 'Créez le compte dans Authentication'
    WHEN e.owner_id IS NULL THEN 'Faites UPDATE avec user_id'
    ELSE 'Tout est OK'
  END as action_requise,
  u.id as user_id_a_copier,
  u.email as user_email,
  e.id as establishment_id,
  e.name as establishment_name,
  e.owner_id as owner_actuel
FROM auth.users u
FULL OUTER JOIN establishments e ON e.email = u.email
WHERE u.email = 'pro@test.com';

-- 2. SI VOUS VOYEZ UN USER_ID, COPIEZ-LE ET EXÉCUTEZ:
-- (Remplacez XXXXX par le user_id du résultat ci-dessus)

UPDATE establishments 
SET owner_id = 'XXXXX'
WHERE email = 'pro@test.com';

-- ============================================
-- PROBLÈME: ÉTABLISSEMENT NON SAUVEGARDÉ
-- ============================================

-- 3. VÉRIFIER LES ÉTABLISSEMENTS ORPHELINS (sans owner_id)
SELECT 
  id,
  name,
  email,
  owner_id,
  created_at,
  plan
FROM establishments 
WHERE owner_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- 4. TROUVER VOTRE COMPTE UTILISATEUR
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email LIKE '%@%'  -- Remplacez par votre email
ORDER BY created_at DESC
LIMIT 5;

-- 5. LIER UN ÉTABLISSEMENT ORPHELIN À VOTRE COMPTE
-- Si vous trouvez votre établissement sans owner_id:

UPDATE establishments 
SET owner_id = 'VOTRE_USER_ID_ICI'
WHERE id = 'ID_ETABLISSEMENT_ICI';

-- ============================================
-- SOLUTION COMPLÈTE POUR UN COMPTE
-- ============================================

-- 6. Pour réparer complètement votre compte pro@test.com:

-- Étape 1: Récupérer l'ID utilisateur
WITH user_info AS (
  SELECT id, email 
  FROM auth.users 
  WHERE email = 'pro@test.com'
)
SELECT 
  'Votre user_id est:' as info,
  id as user_id_a_copier
FROM user_info;

-- Étape 2: Mettre à jour l'établissement (remplacez USER_ID)
UPDATE establishments 
SET 
  owner_id = 'USER_ID_ICI',
  plan = 'pro',
  is_active = true,
  updated_at = NOW()
WHERE email = 'pro@test.com' 
   OR name LIKE '%Gourmet%';

-- Étape 3: Vérifier que c'est réparé
SELECT 
  e.name,
  e.email,
  e.plan,
  u.email as compte_connexion,
  CASE 
    WHEN e.owner_id = u.id THEN 'CONNEXION OK'
    ELSE 'PROBLEME'
  END as statut
FROM establishments e
LEFT JOIN auth.users u ON u.id = e.owner_id
WHERE e.email = 'pro@test.com';