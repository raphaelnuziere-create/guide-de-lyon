-- ============================================
-- CORRIGER LE COMPTE PRO
-- ============================================

-- Activer le compte pro@test.com
UPDATE establishments 
SET 
  status = 'active',
  verified = true
WHERE email = 'pro@test.com';

-- Vérifier la correction
SELECT 
  email,
  plan,
  status,
  verified,
  CASE 
    WHEN status = 'active' AND verified = true THEN '✅ PRÊT'
    ELSE '❌ PROBLÈME'
  END as statut_final
FROM establishments
WHERE email = 'pro@test.com';