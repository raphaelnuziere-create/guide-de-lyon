-- Script pour créer des comptes test pour chaque plan
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Créer un établissement PRO
INSERT INTO establishments (
  name,
  email,
  plan,
  slug,
  description,
  address,
  city,
  postal_code,
  phone,
  website,
  category,
  created_at
) VALUES (
  'Restaurant PRO Test',
  'pro@test.com',
  'pro',
  'restaurant-pro-test',
  'Établissement test pour plan PRO - 3 événements/mois visibles homepage',
  '123 Rue de la Paix',
  'Lyon',
  '69001',
  '04 78 00 00 01',
  'https://pro-test.fr',
  'restaurants',
  NOW()
);

-- 2. Créer un établissement EXPERT  
INSERT INTO establishments (
  name,
  email,
  plan,
  slug,
  description,
  address,
  city,
  postal_code,
  phone,
  website,
  category,
  created_at
) VALUES (
  'Restaurant EXPERT Test',
  'expert@test.com',
  'expert',
  'restaurant-expert-test',
  'Établissement test pour plan EXPERT - 6 événements/mois visibles homepage + newsletter',
  '456 Avenue des Champions',
  'Lyon',
  '69002',
  '04 78 00 00 02',
  'https://expert-test.fr',
  'restaurants',
  NOW()
);

-- 3. Vérifier que les établissements ont été créés
SELECT id, name, email, plan FROM establishments 
WHERE email IN ('pro@test.com', 'expert@test.com')
ORDER BY plan;