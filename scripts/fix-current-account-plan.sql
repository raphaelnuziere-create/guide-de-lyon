-- ============================================
-- SCRIPT SQL - CORRIGER LE PLAN D'UN COMPTE EXISTANT
-- ============================================
-- Pour corriger rapidement un plan sans tout recréer

-- ============================================
-- VOIR LES COMPTES ACTUELS
-- ============================================
SELECT 
  e.id,
  e.name,
  e.email,
  e.plan,
  e.photos_count,
  e.events_this_month,
  u.email as user_email
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE u.email LIKE '%test.com'
ORDER BY e.plan;

-- ============================================
-- CORRIGER LE PLAN (modifiez l'email selon vos besoins)
-- ============================================

-- Pour remettre basic@test.com en plan basic
UPDATE establishments 
SET 
  plan = 'basic',
  photos_count = 0,
  events_this_month = 0
WHERE email = 'basic@test.com';

-- Pour remettre pro@test.com en plan pro  
UPDATE establishments 
SET 
  plan = 'pro',
  photos_count = 0,
  events_this_month = 0
WHERE email = 'pro@test.com';

-- Pour remettre expert@test.com en plan expert
UPDATE establishments 
SET 
  plan = 'expert',
  photos_count = 0,
  events_this_month = 0
WHERE email = 'expert@test.com';

-- ============================================
-- VÉRIFIER APRÈS CORRECTION
-- ============================================
SELECT 
  e.email,
  e.plan,
  e.photos_count,
  e.events_this_month,
  CASE 
    WHEN e.plan = 'basic' THEN '1 photo, 3 événements/mois'
    WHEN e.plan = 'pro' THEN '6 photos, 3 événements/mois'
    WHEN e.plan = 'expert' THEN '999 photos, 10 événements/mois'
  END as limites
FROM establishments e
WHERE e.email LIKE '%test.com'
ORDER BY e.plan;

-- ============================================
-- INFORMATIONS DE CONNEXION
-- ============================================
/*
URL: http://localhost:3002/auth/pro/connexion

COMPTE BASIC:
Email: basic@test.com
Mot de passe: BasicTest123!

COMPTE PRO:
Email: pro@test.com  
Mot de passe: ProTest123!

COMPTE EXPERT:
Email: expert@test.com
Mot de passe: ExpertTest123!
*/