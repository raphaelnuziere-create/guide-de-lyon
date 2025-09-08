# 🚨 GUIDE DE CRÉATION MANUELLE DES COMPTES TEST

## ❌ Problème Actuel
- **user_ok: ❌** = Les utilisateurs n'existent pas dans auth.users
- **email_ok: ❌** = Les emails ne sont pas confirmés

## ✅ Solution Étape par Étape

### ÉTAPE 1: Créer les Utilisateurs dans Supabase

1. **Ouvrir**: https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users

2. **Créer le compte PRO**:
   - Cliquer sur **"Add user"** → **"Create new user"**
   - Remplir:
     ```
     Email: pro@test.com
     Password: ProTest123!
     ```
   - ✅ **IMPORTANT: Cocher "Auto Confirm Email"**
   - Cliquer **"Create user"**
   - **COPIER L'ID** qui apparaît (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

3. **Créer le compte EXPERT**:
   - Cliquer sur **"Add user"** → **"Create new user"**
   - Remplir:
     ```
     Email: expert@test.com
     Password: ExpertTest123!
     ```
   - ✅ **IMPORTANT: Cocher "Auto Confirm Email"**
   - Cliquer **"Create user"**
   - **COPIER L'ID** qui apparaît

### ÉTAPE 2: Lier les Établissements aux Utilisateurs

Retourner dans SQL Editor: https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new

Exécuter ce SQL en remplaçant les IDs:

```sql
-- Remplacer les XXX par les vrais IDs copiés à l'étape 1

-- Mettre à jour l'établissement PRO
UPDATE establishments 
SET user_id = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'  -- ID du compte pro@test.com
WHERE email = 'pro@test.com';

-- Mettre à jour l'établissement EXPERT  
UPDATE establishments 
SET user_id = 'YYYYYYYY-YYYY-YYYY-YYYY-YYYYYYYYYYYY'  -- ID du compte expert@test.com
WHERE email = 'expert@test.com';

-- Vérifier que tout est OK
SELECT 
  e.email,
  e.plan,
  CASE WHEN u.id IS NOT NULL THEN '✅ User lié' ELSE '❌ User manquant' END as user_ok,
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Email confirmé' ELSE '❌ Non confirmé' END as email_ok
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email IN ('pro@test.com', 'expert@test.com');
```

### ÉTAPE 3: Test de Connexion

1. Aller sur: http://localhost:3000/auth/pro/connexion
2. Tester avec:
   - **pro@test.com** / **ProTest123!**
   - **expert@test.com** / **ExpertTest123!**

## 📝 Checklist de Vérification

- [ ] Les utilisateurs sont créés dans Supabase Auth
- [ ] "Auto Confirm Email" était coché lors de la création
- [ ] Les IDs ont été copiés correctement
- [ ] Les establishments ont été mis à jour avec les bons user_id
- [ ] La requête de vérification montre ✅ partout
- [ ] La connexion fonctionne sur l'application

## 🆘 Si ça ne marche toujours pas

Exécutez ce diagnostic complet:

```sql
-- 1. Voir tous les utilisateurs test
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email LIKE '%@test.com';

-- 2. Voir les établissements test
SELECT id, user_id, email, plan, name 
FROM establishments 
WHERE email IN ('pro@test.com', 'expert@test.com');

-- 3. Si les user_id sont NULL, c'est le problème
```

Partagez-moi le résultat de ces requêtes si ça ne fonctionne pas!