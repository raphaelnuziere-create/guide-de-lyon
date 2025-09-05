-- ============================================
-- SCRIPT SIMPLE POUR CRÉER VOTRE COMPTE ADMIN
-- ============================================
-- 
-- 📋 INSTRUCTIONS :
-- 1. Connectez-vous à Supabase : https://supabase.com
-- 2. Allez dans votre projet
-- 3. Cliquez sur "SQL Editor" (dans le menu de gauche)
-- 4. Copiez tout ce code
-- 5. MODIFIEZ les 3 lignes ci-dessous avec VOS informations
-- 6. Cliquez sur "Run" (bouton vert)

-- ⚠️ CHANGEZ CES 3 VALEURS AVANT D'EXÉCUTER ⚠️
DO $$
DECLARE
  mon_email TEXT := 'VOTRE_EMAIL@gmail.com';  -- 👈 Mettez VOTRE email ici
  mon_password TEXT := 'VotreMotDePasse123!'; -- 👈 Mettez VOTRE mot de passe ici (min 8 caractères)
  mon_nom TEXT := 'Votre Nom';                -- 👈 Mettez VOTRE nom ici
  new_user_id UUID;
BEGIN
  -- Créer l'utilisateur admin avec email confirmé
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    mon_email,
    crypt(mon_password, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('display_name', mon_nom),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Créer le profil admin
  INSERT INTO public.profiles (id, role, display_name, created_at, updated_at)
  VALUES (
    new_user_id,
    'admin',
    mon_nom,
    NOW(),
    NOW()
  );

  RAISE NOTICE '✅ Compte admin créé avec succès!';
  RAISE NOTICE 'Email: %', mon_email;
  RAISE NOTICE 'Rôle: Administrateur';
END $$;

-- Confirmer aussi les comptes de test existants
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email IN ('admin@guide-de-lyon.fr', 'merchant@guide-de-lyon.fr')
  AND email_confirmed_at IS NULL;

-- Afficher tous les comptes admin
SELECT 
    u.email,
    p.role,
    p.display_name,
    CASE 
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email confirmé'
        ELSE '❌ Email non confirmé'
    END as statut,
    u.created_at as "Créé le"
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.role IN ('admin', 'merchant')
ORDER BY u.created_at DESC;