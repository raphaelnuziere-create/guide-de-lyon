-- =============================================
-- SCRIPT AUTOMATISÉ POUR COMPTES TEST
-- =============================================
-- Copiez-collez ce script entier dans Supabase SQL Editor et exécutez !
-- Rien d'autre à faire !

-- 1. Nettoyer d'abord (au cas où ils existent déjà)
DELETE FROM establishments WHERE email IN ('pro@test.com', 'expert@test.com');
DELETE FROM auth.users WHERE email IN ('pro@test.com', 'expert@test.com');

-- 2. Créer les utilisateurs Auth automatiquement
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'pro@test.com',
    crypt('ProTest123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
),
(
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'expert@test.com',
    crypt('ExpertTest123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 3. Créer les établissements automatiquement (récupération auto des user_id)
INSERT INTO establishments (
    user_id,
    name,
    slug,
    plan,
    address,
    city,
    postal_code,
    phone,
    email,
    website,
    description,
    category,
    created_at,
    updated_at
) VALUES 
(
    (SELECT id FROM auth.users WHERE email = 'pro@test.com'),
    'Restaurant Le Gourmet Pro',
    'restaurant-le-gourmet-pro',
    'pro',
    '25 Rue de la République',
    'Lyon',
    '69001',
    '0478567890',
    'pro@test.com',
    'https://restaurant-le-gourmet-pro.fr',
    'Établissement Professionnel avec avantages Pro. Présence renforcée sur le Guide de Lyon.',
    'restaurants',
    NOW(),
    NOW()
),
(
    (SELECT id FROM auth.users WHERE email = 'expert@test.com'),
    'Spa Luxe Expert',
    'spa-luxe-expert',
    'expert',
    '10 Place Bellecour',
    'Lyon',
    '69002',
    '0478901234',
    'expert@test.com',
    'https://spa-luxe-expert.fr',
    'Établissement Premium avec tous les avantages Expert. Visibilité maximale sur le Guide de Lyon.',
    'beaute-bienetre',
    NOW(),
    NOW()
);

-- 4. Vérification automatique
SELECT 
    'COMPTE CRÉÉ:' as type,
    u.email,
    e.name as etablissement,
    e.plan,
    e.slug
FROM auth.users u
JOIN establishments e ON u.id = e.user_id
WHERE u.email IN ('pro@test.com', 'expert@test.com')
ORDER BY e.plan;

-- =============================================
-- VOS COMPTES SONT PRÊTS !
-- =============================================
-- 
-- 🚀 COMPTE PRO:
-- Email: pro@test.com
-- Mot de passe: ProTest123!
-- URL: http://localhost:3000/auth/pro/connexion
-- 
-- ⭐ COMPTE EXPERT:  
-- Email: expert@test.com
-- Mot de passe: ExpertTest123!
-- URL: http://localhost:3000/auth/pro/connexion
-- 
-- =============================================