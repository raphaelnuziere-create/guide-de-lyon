-- ============================================
-- SETUP COMPLET DES COMPTES DE TEST
-- ============================================
-- IMPORTANT: Exécuter dans Supabase SQL Editor
-- Cela crée 3 comptes de test avec des établissements

-- ============================================
-- 1. NETTOYER LES DONNÉES DE TEST EXISTANTES
-- ============================================

-- Supprimer les établissements de test existants
DELETE FROM businesses 
WHERE email IN ('test.basic@guide-lyon.fr', 'test.pro@guide-lyon.fr', 'test.expert@guide-lyon.fr');

-- ============================================
-- 2. CRÉER LES UTILISATEURS DE TEST
-- ============================================
-- NOTE: Les utilisateurs doivent être créés via l'interface Supabase Auth
-- ou via l'API. Voici les comptes à créer manuellement:

/*
COMPTES À CRÉER DANS SUPABASE AUTH:

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
-- 3. RÉCUPÉRER LES USER_ID CRÉÉS
-- ============================================
-- Après création des comptes, récupérer les user_id:

SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email IN ('test.basic@guide-lyon.fr', 'test.pro@guide-lyon.fr', 'test.expert@guide-lyon.fr');

-- ============================================
-- 4. CRÉER LES ÉTABLISSEMENTS DE TEST
-- ============================================
-- REMPLACER les user_id par ceux récupérés ci-dessus

-- Plan BASIC
INSERT INTO businesses (
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
  verification_status,
  is_active,
  created_at,
  updated_at
) VALUES (
  'REMPLACER_PAR_USER_ID_BASIC', -- À remplacer par l'ID réel
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
  'pending',
  true,
  NOW(),
  NOW()
);

-- Plan PRO
INSERT INTO businesses (
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
  gallery,
  social_facebook,
  social_instagram,
  verification_status,
  is_active,
  created_at,
  updated_at
) VALUES (
  'REMPLACER_PAR_USER_ID_PRO', -- À remplacer par l'ID réel
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
  ARRAY['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  'https://facebook.com/boutiquepro',
  'https://instagram.com/boutiquepro',
  'verified',
  true,
  NOW(),
  NOW()
);

-- Plan EXPERT
INSERT INTO businesses (
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
  gallery,
  social_facebook,
  social_instagram,
  social_twitter,
  social_linkedin,
  tags,
  verification_status,
  is_active,
  featured,
  created_at,
  updated_at
) VALUES (
  'REMPLACER_PAR_USER_ID_EXPERT', -- À remplacer par l'ID réel
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
  ARRAY[
    'https://example.com/hotel1.jpg',
    'https://example.com/hotel2.jpg',
    'https://example.com/hotel3.jpg',
    'https://example.com/hotel4.jpg',
    'https://example.com/hotel5.jpg'
  ],
  'https://facebook.com/hotelexpert',
  'https://instagram.com/hotelexpert',
  'https://twitter.com/hotelexpert',
  'https://linkedin.com/company/hotelexpert',
  ARRAY['wifi', 'parking', 'spa', 'restaurant', 'bar', 'piscine', 'salle-de-sport'],
  'verified',
  true,
  true, -- Mise en avant
  NOW(),
  NOW()
);

-- ============================================
-- 5. CRÉER LES QUOTAS D'ÉVÉNEMENTS
-- ============================================

-- Quota Basic (0 événements autorisés normalement, mais on met 1 pour test)
INSERT INTO event_quotas (
  business_id,
  month,
  events_limit,
  events_used,
  created_at,
  updated_at
) 
SELECT 
  id,
  TO_CHAR(NOW(), 'YYYY-MM'),
  1,
  0,
  NOW(),
  NOW()
FROM businesses 
WHERE email = 'test.basic@guide-lyon.fr';

-- Quota Pro (3 événements)
INSERT INTO event_quotas (
  business_id,
  month,
  events_limit,
  events_used,
  created_at,
  updated_at
) 
SELECT 
  id,
  TO_CHAR(NOW(), 'YYYY-MM'),
  3,
  0,
  NOW(),
  NOW()
FROM businesses 
WHERE email = 'test.pro@guide-lyon.fr';

-- Quota Expert (10 événements)
INSERT INTO event_quotas (
  business_id,
  month,
  events_limit,
  events_used,
  created_at,
  updated_at
) 
SELECT 
  id,
  TO_CHAR(NOW(), 'YYYY-MM'),
  10,
  0,
  NOW(),
  NOW()
FROM businesses 
WHERE email = 'test.expert@guide-lyon.fr';

-- ============================================
-- 6. VÉRIFIER LES DONNÉES CRÉÉES
-- ============================================

-- Afficher les établissements créés
SELECT 
  b.name,
  b.email,
  b.plan,
  b.verification_status,
  b.is_active,
  b.featured,
  eq.events_limit,
  eq.events_used
FROM businesses b
LEFT JOIN event_quotas eq ON eq.business_id = b.id
WHERE b.email IN ('test.basic@guide-lyon.fr', 'test.pro@guide-lyon.fr', 'test.expert@guide-lyon.fr')
ORDER BY 
  CASE b.plan 
    WHEN 'basic' THEN 1
    WHEN 'pro' THEN 2
    WHEN 'expert' THEN 3
  END;

-- ============================================
-- 7. SCRIPT DE CONNEXION RAPIDE
-- ============================================
-- Pour tester rapidement la connexion avec chaque compte:

/*
Pour vous connecter avec chaque compte:

1. Plan BASIC:
   - Email: test.basic@guide-lyon.fr
   - Mot de passe: TestBasic123!
   - Dashboard: /pro/dashboard
   - Limitations: 1 photo, pas de galerie, pas d'événements sur homepage

2. Plan PRO:
   - Email: test.pro@guide-lyon.fr
   - Mot de passe: TestPro123!
   - Dashboard: /pro/dashboard
   - Avantages: 6 photos, 3 événements/mois, badge vérifié, stats

3. Plan EXPERT:
   - Email: test.expert@guide-lyon.fr
   - Mot de passe: TestExpert123!
   - Dashboard: /pro/dashboard
   - Avantages: Photos illimitées, 10 événements/mois, mise en avant, stats avancées
*/

-- ============================================
-- FIN DU SCRIPT
-- ============================================