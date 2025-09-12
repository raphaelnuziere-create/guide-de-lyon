-- =============================================
-- MÉTHODE MANUELLE SIMPLE - FONCTIONNE À 100%
-- =============================================

-- ÉTAPE 1: Allez dans Supabase Dashboard → Authentication → Users
-- Cliquez sur "Invite user" et créez ces 2 comptes :

-- COMPTE PRO:
-- Email: pro@test.com  
-- Password: ProTest123!
-- (Cliquez "Invite user", remplissez email + password)

-- COMPTE EXPERT:
-- Email: expert@test.com
-- Password: ExpertTest123!  
-- (Cliquez "Invite user", remplissez email + password)

-- =============================================
-- ÉTAPE 2: EXÉCUTEZ CE SCRIPT (après avoir créé les comptes)
-- =============================================

-- Nettoyer les établissements existants
DELETE FROM establishments WHERE email IN ('pro@test.com', 'expert@test.com');

-- Créer l'établissement PRO (utilise l'email pour trouver l'user_id automatiquement)
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
) 
SELECT 
    u.id,
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
FROM auth.users u 
WHERE u.email = 'pro@test.com';

-- Créer l'établissement EXPERT  
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
) 
SELECT 
    u.id,
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
FROM auth.users u 
WHERE u.email = 'expert@test.com';

-- Vérification
SELECT 
    '✅ SUCCÈS' as status,
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
-- Connectez-vous sur: http://localhost:3000/auth/pro/connexion
-- 
-- 🚀 PRO: pro@test.com / ProTest123!
-- ⭐ EXPERT: expert@test.com / ExpertTest123!
-- =============================================