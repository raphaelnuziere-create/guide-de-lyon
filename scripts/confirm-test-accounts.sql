-- Script pour confirmer les comptes de test dans Supabase
-- À exécuter dans Supabase SQL Editor

-- Confirmer le compte admin de test
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'admin@guide-de-lyon.fr';

-- Confirmer le compte merchant de test  
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'merchant@guide-de-lyon.fr';

-- Vérifier que les comptes sont bien confirmés
SELECT 
    email,
    email_confirmed_at,
    CASE 
        WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmé'
        ELSE '❌ Non confirmé'
    END as statut
FROM auth.users
WHERE email IN ('admin@guide-de-lyon.fr', 'merchant@guide-de-lyon.fr');