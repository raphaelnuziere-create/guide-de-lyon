-- ============================================
-- SCRIPT POUR TRANSFORMER VOTRE COMPTE EN ADMIN
-- ============================================
-- 
-- Votre email existe déjà ! On va juste :
-- 1. Confirmer votre email
-- 2. Vous donner le rôle admin
-- 3. Réinitialiser votre mot de passe

-- ⚠️ CHANGEZ SEULEMENT LE MOT DE PASSE CI-DESSOUS ⚠️
DO $$
DECLARE
  mon_email TEXT := 'raphael.nuziere@yahoo.com';  -- Votre email existant
  nouveau_password TEXT := 'Admin2025!';          -- 👈 CHANGEZ CECI - Votre nouveau mot de passe
  mon_nom TEXT := 'Raphaël';                      -- Votre nom d'affichage
  user_id UUID;
BEGIN
  -- Récupérer l'ID de l'utilisateur existant
  SELECT id INTO user_id FROM auth.users WHERE email = mon_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non trouvé avec l''email %', mon_email;
  END IF;

  -- Mettre à jour le mot de passe et confirmer l'email
  UPDATE auth.users 
  SET 
    encrypted_password = crypt(nouveau_password, gen_salt('bf')),
    email_confirmed_at = CASE 
      WHEN email_confirmed_at IS NULL THEN NOW() 
      ELSE email_confirmed_at 
    END,
    updated_at = NOW()
  WHERE id = user_id;

  -- Vérifier si un profil existe déjà
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    -- Mettre à jour le profil existant
    UPDATE public.profiles 
    SET 
      role = 'admin',
      display_name = mon_nom,
      updated_at = NOW()
    WHERE id = user_id;
    RAISE NOTICE '✅ Profil existant mis à jour en admin!';
  ELSE
    -- Créer un nouveau profil admin
    INSERT INTO public.profiles (id, role, display_name, created_at, updated_at)
    VALUES (user_id, 'admin', mon_nom, NOW(), NOW());
    RAISE NOTICE '✅ Nouveau profil admin créé!';
  END IF;

  RAISE NOTICE '🎉 SUCCÈS! Votre compte est maintenant administrateur!';
  RAISE NOTICE '📧 Email: %', mon_email;
  RAISE NOTICE '🔑 Utilisez le nouveau mot de passe que vous avez défini';
  RAISE NOTICE '🔗 Connectez-vous: https://www.guide-de-lyon.fr/connexion/admin';
END $$;

-- Confirmer aussi tous les comptes de test
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email IN ('admin@guide-de-lyon.fr', 'merchant@guide-de-lyon.fr', 'raphael.nuziere@yahoo.com')
  AND email_confirmed_at IS NULL;

-- Afficher le statut de votre compte
SELECT 
    u.email,
    p.role,
    p.display_name,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email confirmé'
        ELSE '❌ Email non confirmé'
    END as "Statut email",
    CASE 
        WHEN p.role = 'admin' THEN '👑 Administrateur'
        WHEN p.role = 'merchant' THEN '🏪 Professionnel'
        ELSE '👤 Utilisateur'
    END as "Type de compte",
    u.created_at as "Créé le"
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'raphael.nuziere@yahoo.com';