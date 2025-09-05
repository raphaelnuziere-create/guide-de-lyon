-- ============================================
-- SOLUTION IMMÉDIATE - Confirmer votre compte manuellement
-- ============================================

-- 1️⃣ CONFIRMER VOTRE COMPTE IMMÉDIATEMENT
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'raphael.nuziere@yahoo.com';

-- 2️⃣ VOIR TOUS LES COMPTES EN ATTENTE
SELECT 
    email,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmé'
        ELSE '⏳ En attente de confirmation'
    END as statut,
    created_at as "Inscrit le",
    email_confirmed_at as "Confirmé le"
FROM auth.users
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 3️⃣ CONFIRMER TOUS LES COMPTES EN ATTENTE (optionnel)
-- Décommentez cette ligne si vous voulez confirmer TOUS les comptes non confirmés
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;