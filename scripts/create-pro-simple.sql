-- Script pour créer le compte PRO de test
-- À exécuter dans le SQL Editor de Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new

-- Supprimer l'ancien établissement pro s'il existe
DELETE FROM establishments WHERE email = 'pro@test.com';

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
  short_description,
  website,
  plan,
  max_events,
  max_photos,
  events_this_month,
  photos_this_month,
  featured,
  priority_support,
  is_verified,
  status,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'expert@test.com' LIMIT 1), -- Temporaire
  'Restaurant Le Gourmet Pro',
  'restaurant-le-gourmet-pro',
  'pro@test.com',
  '0478567890',
  '25 Rue de la République',
  'Lyon',
  '69001',
  'Établissement Professionnel avec avantages Pro. Présence renforcée sur le Guide de Lyon.',
  'Restaurant gastronomique - Plan Pro',
  'https://restaurant-gourmet-pro.fr',
  'pro',
  3,  -- max 3 événements/mois
  6,  -- max 6 photos/mois
  0,
  0,
  false, -- pas featured (contrairement à expert)
  false, -- pas de support prioritaire (contrairement à expert)
  true,  -- vérifié (avantage pro)
  'active',
  NOW(),
  NOW()
);

-- Vérifier la création
SELECT 
  e.id,
  e.name,
  e.email,
  e.plan,
  e.max_events,
  e.max_photos,
  e.featured,
  e.is_verified,
  e.priority_support,
  e.status,
  u.email as auth_email
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email = 'pro@test.com';

-- ============================================
-- RÉSULTAT ATTENDU POUR LE PLAN PRO:
-- ============================================
-- - plan: pro
-- - max_events: 3
-- - max_photos: 6
-- - featured: false (pas de mise en avant)
-- - is_verified: true (badge vérifié)
-- - priority_support: false (pas de support prioritaire)

-- ============================================
-- CONNEXION
-- ============================================
-- URL: https://www.guide-de-lyon.fr/auth/pro/connexion
--
-- COMPTE PRO:
-- Email: pro@test.com
-- Mot de passe: ProTest123!
-- (à créer manuellement via Supabase Auth Dashboard)