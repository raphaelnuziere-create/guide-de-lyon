-- ============================================
-- CRÉER LE COMPTE EXPERT UNIQUEMENT
-- ============================================

-- Vérifier si l'utilisateur expert existe
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email = 'expert@test.com';

-- Si l'utilisateur n'existe pas, créez-le manuellement dans:
-- https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users
-- Email: expert@test.com
-- Mot de passe: ExpertTest123!

-- Supprimer l'établissement expert existant (si il existe)
DELETE FROM establishments WHERE email = 'expert@test.com';

-- Créer l'établissement Expert
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
  '0478901234',
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

-- Vérifier la création
SELECT 
  e.name,
  e.email,
  e.plan,
  e.photos_count,
  e.events_this_month,
  u.email as user_email
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email = 'expert@test.com';

-- ============================================
-- CONNEXION
-- ============================================
-- URL: http://localhost:3002/auth/pro/connexion
-- Email: expert@test.com
-- Mot de passe: ExpertTest123!