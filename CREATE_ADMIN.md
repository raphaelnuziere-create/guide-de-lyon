# 🔐 Guide pour créer votre compte administrateur

## Option 1 : Via Supabase Dashboard (PLUS SIMPLE)

1. **Connectez-vous à Supabase** : https://supabase.com
2. Allez dans votre projet
3. Cliquez sur **Authentication** > **Users**
4. Cliquez sur **Add user** > **Create new user**
5. Remplissez :
   - Email : **votre vraie adresse email**
   - Password : **un mot de passe fort**
   - ✅ Cochez **Auto Confirm Email**
6. Cliquez sur **Create user**

7. **Définir le rôle admin** :
   - Allez dans **Table Editor** > **profiles**
   - Trouvez la ligne avec votre email
   - Cliquez sur **Edit**
   - Changez `role` de `user` à `admin`
   - Sauvegardez

## Option 2 : Via SQL Editor dans Supabase

1. Dans Supabase, allez dans **SQL Editor**
2. Exécutez cette requête (remplacez par vos informations) :

```sql
-- Créer un nouvel admin avec email confirmé
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
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
    'VOTRE_EMAIL@gmail.com',  -- Remplacez par votre email
    crypt('VotreMotDePasse123!', gen_salt('bf')),  -- Remplacez par votre mot de passe
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
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
    'Administrateur',
    NOW(),
    NOW()
  );
END $$;
```

## Option 3 : Confirmer les comptes de test existants

Si vous voulez utiliser les comptes de test (admin@guide-de-lyon.fr), voici comment les confirmer :

1. Dans Supabase, allez dans **Authentication** > **Users**
2. Trouvez le compte `admin@guide-de-lyon.fr`
3. Cliquez sur les **3 points** (...) > **Edit user**
4. Changez **Email confirmed** à **Yes**
5. Sauvegardez

## Après création du compte admin

Une fois votre compte admin créé et confirmé, vous pouvez :
1. Aller sur https://www.guide-de-lyon.fr/connexion/admin
2. Vous connecter avec vos identifiants
3. Accéder au tableau de bord d'administration

## ⚠️ Important

- Utilisez un email auquel vous avez accès pour pouvoir récupérer le mot de passe si besoin
- Choisissez un mot de passe fort et unique
- Notez vos identifiants dans un gestionnaire de mots de passe sécurisé