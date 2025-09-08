-- ============================================
-- CRÉATION DES COMPTES TEST CORRIGÉS
-- ============================================
-- IMPORTANT: Exécuter dans Supabase SQL Editor
-- Correction: Utilisation de 'user_id' au lieu de 'owner_id'

-- ============================================
-- 1. NETTOYER LES DONNÉES DE TEST EXISTANTES
-- ============================================

-- Supprimer les établissements de test existants
DELETE FROM establishments 
WHERE email IN (
  'basic@test.com', 
  'pro@test.com', 
  'expert@test.com',
  'test.basic@guide-lyon.fr',
  'test.pro@guide-lyon.fr', 
  'test.expert@guide-lyon.fr'
);

-- ============================================
-- 2. VÉRIFIER LES UTILISATEURS AUTH
-- ============================================

SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email IN ('basic@test.com', 'pro@test.com', 'expert@test.com')
ORDER BY email;

-- ============================================
-- 3. CRÉER LES ÉTABLISSEMENTS DE TEST
-- ============================================
-- IMPORTANT: Remplacer les UUIDs par les vrais IDs des utilisateurs

-- Plan BASIC (Fonctionnalités limitées)
INSERT INTO establishments (
  user_id,
  name,
  slug,
  description,
  address,
  phone,
  email,
  website,
  category,
  opening_hours,
  vat_number,
  status,
  metadata
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'basic@test.com' LIMIT 1),
  'Restaurant Test Basic',
  'restaurant-test-basic',
  'Restaurant de test avec plan Basic. Fonctionnalités limitées : 1 photo, infos de base, pas d''événements sur page d''accueil.',
  '10 rue de la République, 69001 Lyon',
  '04 78 00 01 01',
  'basic@test.com',
  'https://restaurant-basic.test',
  'restaurant',
  jsonb_build_object(
    'monday', json_build_array(json_build_object('open', '09:00', 'close', '18:00')),
    'tuesday', json_build_array(json_build_object('open', '09:00', 'close', '18:00')),
    'wednesday', json_build_array(json_build_object('open', '09:00', 'close', '18:00')),
    'thursday', json_build_array(json_build_object('open', '09:00', 'close', '18:00')),
    'friday', json_build_array(json_build_object('open', '09:00', 'close', '20:00'))
  ),
  NULL, -- Pas de numéro TVA pour basic
  'pending',
  jsonb_build_object(
    'plan', 'basic',
    'verified', false,
    'events_this_month', 0,
    'photos_count', 1
  )
);

-- Plan PRO (Fonctionnalités intermédiaires + TVA)
INSERT INTO establishments (
  user_id,
  name,
  slug,
  description,
  address,
  phone,
  email,
  website,
  category,
  opening_hours,
  vat_number,
  status,
  metadata
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'pro@test.com' LIMIT 1),
  'Boutique Test Pro',
  'boutique-test-pro',
  'Boutique de test avec plan Pro. Fonctionnalités avancées : 6 photos, événements sur page d''accueil, badge vérifié, statistiques, numéro TVA obligatoire.',
  '25 rue du Commerce, 69002 Lyon',
  '04 78 00 02 02',
  'pro@test.com',
  'https://boutique-pro.test',
  'boutique',
  jsonb_build_object(
    'monday', json_build_array(json_build_object('open', '10:00', 'close', '19:00')),
    'tuesday', json_build_array(json_build_object('open', '10:00', 'close', '19:00')),
    'wednesday', json_build_array(json_build_object('open', '10:00', 'close', '19:00')),
    'thursday', json_build_array(json_build_object('open', '10:00', 'close', '21:00')),
    'friday', json_build_array(json_build_object('open', '10:00', 'close', '21:00')),
    'saturday', json_build_array(json_build_object('open', '10:00', 'close', '20:00'))
  ),
  'FR12345678901', -- Numéro TVA obligatoire pour PRO
  'pending',
  jsonb_build_object(
    'plan', 'pro',
    'verified', true,
    'events_this_month', 2,
    'photos_count', 4
  )
);

-- Plan EXPERT (Toutes les fonctionnalités + Analytics)
INSERT INTO establishments (
  user_id,
  name,
  slug,
  description,
  address,
  phone,
  email,
  website,
  category,
  opening_hours,
  vat_number,
  status,
  metadata
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'expert@test.com' LIMIT 1),
  'Hôtel Test Expert',
  'hotel-test-expert',
  'Hôtel premium avec plan Expert. Toutes les fonctionnalités : photos illimitées, 10 événements/mois, newsletter, statistiques avancées, support prioritaire, accès API.',
  '100 avenue des Experts, 69003 Lyon',
  '04 78 00 03 03',
  'expert@test.com',
  'https://hotel-expert.test',
  'hotel',
  jsonb_build_object(
    'monday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'tuesday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'wednesday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'thursday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'friday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'saturday', json_build_array(json_build_object('open', '00:00', 'close', '23:59')),
    'sunday', json_build_array(json_build_object('open', '00:00', 'close', '23:59'))
  ),
  'FR98765432109', -- Numéro TVA obligatoire pour EXPERT
  'pending',
  jsonb_build_object(
    'plan', 'expert',
    'verified', true,
    'events_this_month', 6,
    'photos_count', 15
  )
);

-- ============================================
-- 4. VÉRIFIER LES DONNÉES CRÉÉES
-- ============================================

SELECT 
  e.id,
  e.name,
  e.email,
  e.status,
  e.vat_number,
  e.metadata->>'plan' as plan,
  e.metadata->>'verified' as verified,
  e.metadata->>'events_this_month' as events_this_month,
  e.metadata->>'photos_count' as photos_count,
  u.email as user_email
FROM establishments e
LEFT JOIN auth.users u ON u.id = e.user_id
WHERE e.email IN ('basic@test.com', 'pro@test.com', 'expert@test.com')
ORDER BY 
  CASE e.metadata->>'plan'
    WHEN 'basic' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'expert' THEN 3
  END;

-- ============================================
-- 5. COMPTES DE CONNEXION
-- ============================================

/*
POUR TESTER LES DIFFÉRENTS PLANS:

1. PLAN BASIC:
   - Email: basic@test.com
   - Mot de passe: TestBasic123!
   - Limites: 1 photo, pas d'événements homepage, pas de TVA
   
2. PLAN PRO:
   - Email: pro@test.com
   - Mot de passe: TestPro123!
   - Limites: 6 photos, événements homepage, TVA obligatoire, badge vérifié
   
3. PLAN EXPERT:
   - Email: expert@test.com
   - Mot de passe: TestExpert123!
   - Limites: Photos illimitées, 10 événements, newsletter, stats avancées

PAGES DE TEST:
- Connexion: /auth/pro/connexion
- Dashboard: /pro/dashboard
- Settings: /pro/horaires (maintenant fonctionnel)
- Événements: /pro/evenements
- Upload Photos: Vérifier les limites selon le plan
*/

-- ============================================
-- 6. DIAGNOSTIC FINAL
-- ============================================

-- Vérifier la cohérence des données
SELECT 
  'Total établissements test' as check_type,
  COUNT(*) as count
FROM establishments 
WHERE email IN ('basic@test.com', 'pro@test.com', 'expert@test.com')
UNION ALL
SELECT 
  'Établissements avec user_id valide' as check_type,
  COUNT(*) as count
FROM establishments e
JOIN auth.users u ON u.id = e.user_id
WHERE e.email IN ('basic@test.com', 'pro@test.com', 'expert@test.com')
UNION ALL
SELECT 
  'Plans PRO/EXPERT avec TVA' as check_type,
  COUNT(*) as count
FROM establishments 
WHERE email IN ('pro@test.com', 'expert@test.com') 
AND vat_number IS NOT NULL;

-- Fin du script