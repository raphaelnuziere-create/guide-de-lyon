-- ============================================
-- SETUP COMPLET DES COMPTES DE TEST (VERSION CORRIGÉE)
-- ============================================
-- IMPORTANT: Exécuter dans Supabase SQL Editor
-- Table corrigée: establishments (pas businesses)

-- ============================================
-- 1. VÉRIFIER LA STRUCTURE DE LA TABLE
-- ============================================
-- D'abord, vérifions quelles colonnes existent

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'establishments'
ORDER BY ordinal_position;

-- ============================================
-- 2. NETTOYER LES DONNÉES DE TEST EXISTANTES
-- ============================================

-- Supprimer les établissements de test existants
DELETE FROM establishments 
WHERE email IN ('test.basic@guide-lyon.fr', 'test.pro@guide-lyon.fr', 'test.expert@guide-lyon.fr');

-- ============================================
-- 3. CRÉER LES UTILISATEURS DE TEST
-- ============================================
-- NOTE: Les utilisateurs doivent être créés via l'interface Supabase Auth

/*
ÉTAPE 1: Dans Supabase Dashboard > Authentication > Users
Créer ces 3 comptes:

1. PLAN BASIC:
   Email: test.basic@guide-lyon.fr
   Mot de passe: TestBasic123!
   
2. PLAN PRO:
   Email: test.pro@guide-lyon.fr
   Mot de passe: TestPro123!
   
3. PLAN EXPERT:
   Email: test.expert@guide-lyon.fr
   Mot de passe: TestExpert123!
*/

-- ============================================
-- 4. RÉCUPÉRER LES USER_ID CRÉÉS
-- ============================================
-- Après création des comptes, récupérer les user_id:

SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email IN ('test.basic@guide-lyon.fr', 'test.pro@guide-lyon.fr', 'test.expert@guide-lyon.fr', 'pro@test.com');

-- ============================================
-- 5. VÉRIFIER L'ÉTABLISSEMENT EXISTANT
-- ============================================
-- Vérifions l'état de votre Restaurant Le Gourmet Pro

SELECT 
  id,
  name,
  email,
  owner_id,
  plan,
  is_active
FROM establishments 
WHERE email = 'pro@test.com' OR name LIKE '%Gourmet%';

-- ============================================
-- 6. CRÉER LES ÉTABLISSEMENTS DE TEST
-- ============================================
-- REMPLACER les user_id par ceux récupérés ci-dessus

-- Plan BASIC
INSERT INTO establishments (
  owner_id,
  name,
  description,
  address,
  phone,
  email,
  website,
  category,
  plan,
  opening_hours,
  is_active,
  created_at,
  updated_at
) VALUES (
  'REMPLACER_PAR_USER_ID_BASIC', -- À remplacer par l'ID réel de test.basic@guide-lyon.fr
  'Restaurant Test Basic',
  'Un restaurant de test avec le plan Basic. Fonctionnalités limitées mais essentielles.',
  '10 rue de la République, 69001 Lyon',
  '04 78 00 00 01',
  'test.basic@guide-lyon.fr',
  'https://restaurant-basic.test',
  'restaurant',
  'basic',
  jsonb_build_object(
    'monday', json_build_array(json_build_object('open', '09:00', 'close', '18:00')),
    'tuesday', json_build_array(json_build_object('open', '09:00', 'close', '18:00')),
    'wednesday', json_build_array(json_build_object('open', '09:00', 'close', '18:00')),
    'thursday', json_build_array(json_build_object('open', '09:00', 'close', '18:00')),
    'friday', json_build_array(json_build_object('open', '09:00', 'close', '20:00'))
  ),
  true,
  NOW(),
  NOW()
);

-- Plan PRO
INSERT INTO establishments (
  owner_id,
  name,
  description,
  address,
  phone,
  email,
  website,
  category,
  plan,
  opening_hours,
  is_active,
  created_at,
  updated_at
) VALUES (
  'REMPLACER_PAR_USER_ID_PRO', -- À remplacer par l'ID réel de test.pro@guide-lyon.fr
  'Boutique Test Pro',
  'Une boutique de test avec le plan Pro. Accès aux fonctionnalités avancées, galerie photo, événements et statistiques.',
  '25 rue du Commerce, 69002 Lyon',
  '04 78 00 00 02',
  'test.pro@guide-lyon.fr',
  'https://boutique-pro.test',
  'boutique',
  'pro',
  jsonb_build_object(
    'monday', json_build_array(json_build_object('open', '10:00', 'close', '19:00')),
    'tuesday', json_build_array(json_build_object('open', '10:00', 'close', '19:00')),
    'wednesday', json_build_array(json_build_object('open', '10:00', 'close', '19:00')),
    'thursday', json_build_array(json_build_object('open', '10:00', 'close', '21:00')),
    'friday', json_build_array(json_build_object('open', '10:00', 'close', '21:00')),
    'saturday', json_build_array(json_build_object('open', '10:00', 'close', '20:00'))
  ),
  true,
  NOW(),
  NOW()
);

-- Plan EXPERT
INSERT INTO establishments (
  owner_id,
  name,
  description,
  address,
  phone,
  email,
  website,
  category,
  plan,
  opening_hours,
  is_active,
  created_at,
  updated_at
) VALUES (
  'REMPLACER_PAR_USER_ID_EXPERT', -- À remplacer par l'ID réel de test.expert@guide-lyon.fr
  'Hôtel Test Expert',
  'Un hôtel premium avec le plan Expert. Toutes les fonctionnalités débloquées: galerie illimitée, événements prioritaires, statistiques avancées, mise en avant.',
  '100 avenue des Experts, 69003 Lyon',
  '04 78 00 00 03',
  'test.expert@guide-lyon.fr',
  'https://hotel-expert.test',
  'hotel',
  'expert',
  jsonb_build_object(
    'monday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'tuesday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'wednesday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'thursday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'friday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'saturday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'sunday', json_build_array(json_build_object('open', '00:00', 'close', '23:59'))
  ),
  true,
  NOW(),
  NOW()
);

-- ============================================
-- 7. METTRE À JOUR VOTRE ÉTABLISSEMENT EXISTANT
-- ============================================
-- Pour votre Restaurant Le Gourmet Pro

-- D'abord, récupérer l'owner_id de pro@test.com
SELECT 
  id as user_id,
  email
FROM auth.users 
WHERE email = 'pro@test.com';

-- Puis mettre à jour l'établissement avec le bon owner_id
UPDATE establishments 
SET 
  owner_id = 'REMPLACER_PAR_USER_ID_DE_PRO@TEST.COM', -- Mettre l'ID réel ici
  plan = 'pro', -- ou 'basic' ou 'expert' selon votre choix
  is_active = true,
  updated_at = NOW()
WHERE email = 'pro@test.com' OR name = 'Restaurant Le Gourmet Pro';

-- ============================================
-- 8. VÉRIFIER LES DONNÉES CRÉÉES
-- ============================================

-- Afficher tous les établissements de test
SELECT 
  e.id,
  e.name,
  e.email,
  e.plan,
  e.is_active,
  e.owner_id,
  u.email as user_email
FROM establishments e
LEFT JOIN auth.users u ON u.id = e.owner_id
WHERE e.email IN ('test.basic@guide-lyon.fr', 'test.pro@guide-lyon.fr', 'test.expert@guide-lyon.fr', 'pro@test.com')
ORDER BY 
  CASE e.plan 
    WHEN 'basic' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'expert' THEN 3
  END;

-- ============================================
-- 9. SCRIPT DE DIAGNOSTIC
-- ============================================

-- Vérifier les problèmes potentiels
SELECT 
  'Établissements sans owner_id' as probleme,
  COUNT(*) as nombre
FROM establishments
WHERE owner_id IS NULL
UNION ALL
SELECT 
  'Utilisateurs sans établissement' as probleme,
  COUNT(*) as nombre
FROM auth.users u
LEFT JOIN establishments e ON e.owner_id = u.id
WHERE e.id IS NULL
  AND u.email IN ('test.basic@guide-lyon.fr', 'test.pro@guide-lyon.fr', 'test.expert@guide-lyon.fr', 'pro@test.com');

-- ============================================
-- 10. CONNEXION RAPIDE - INFORMATIONS
-- ============================================

/*
POUR TESTER LES CONNEXIONS:

1. Votre compte existant:
   - Email: pro@test.com
   - Mot de passe: [celui que vous avez défini]
   - Dashboard: /pro/dashboard

2. Plan BASIC:
   - Email: test.basic@guide-lyon.fr
   - Mot de passe: TestBasic123!
   - Dashboard: /pro/dashboard

3. Plan PRO:
   - Email: test.pro@guide-lyon.fr
   - Mot de passe: TestPro123!
   - Dashboard: /pro/dashboard

4. Plan EXPERT:
   - Email: test.expert@guide-lyon.fr
   - Mot de passe: TestExpert123!
   - Dashboard: /pro/dashboard

PAGES DE TEST:
- Connexion: /auth/pro/connexion
- Dashboard: /pro/dashboard
- Diagnostic: /dev/auth-diagnostic (créé mais peut avoir une erreur 404)
- Quick Login: /dev/quick-login (créé mais peut avoir une erreur 404)
*/

-- ============================================
-- FIN DU SCRIPT
-- ============================================