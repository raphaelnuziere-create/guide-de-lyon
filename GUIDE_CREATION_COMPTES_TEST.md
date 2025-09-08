# 🔧 Guide de Création des Comptes Test Pro et Expert

## 📋 Problème Identifié
Les scripts automatiques ne peuvent pas créer d'utilisateurs dans Supabase Auth en raison de restrictions de sécurité ("Database error creating new user"). La solution est de créer les comptes manuellement via le dashboard Supabase.

## ✅ Solution : Création Manuelle via Dashboard Supabase

### Étape 1 : Accéder au Dashboard Supabase
1. Ouvrir : https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users
2. Se connecter avec vos identifiants Supabase

### Étape 2 : Créer le Compte PRO
1. Cliquer sur le bouton **"Add user"** → **"Create new user"**
2. Remplir les champs :
   - **Email** : `pro@test.com`
   - **Password** : `ProTest123!`
   - **Cocher** : Auto Confirm Email
3. Cliquer sur **"Create user"**
4. **Noter l'User ID** généré (format UUID)

### Étape 3 : Créer le Compte EXPERT
1. Cliquer à nouveau sur **"Add user"** → **"Create new user"**
2. Remplir les champs :
   - **Email** : `expert@test.com`
   - **Password** : `ExpertTest123!`
   - **Cocher** : Auto Confirm Email
3. Cliquer sur **"Create user"**
4. **Noter l'User ID** généré

### Étape 4 : Créer les Établissements dans la Base de Données
1. Aller dans : https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new
2. Ouvrir le fichier `scripts/create-test-accounts.sql`
3. **Remplacer** :
   - `USER_ID_PRO` par l'ID du compte pro noté à l'étape 2
   - `USER_ID_EXPERT` par l'ID du compte expert noté à l'étape 3
4. Exécuter le script SQL

## 🧪 Test de Connexion

### URL de Connexion
- **Local** : http://localhost:3000/auth/pro/connexion
- **Production** : https://www.guide-de-lyon.fr/auth/pro/connexion

### Identifiants de Test

#### 🔐 Compte PRO
- **Email** : pro@test.com
- **Mot de passe** : ProTest123!
- **Fonctionnalités** :
  - 3 événements/mois
  - 10 photos/mois
  - Visibilité sur homepage
  - Dashboard professionnel

#### 👑 Compte EXPERT
- **Email** : expert@test.com
- **Mot de passe** : ExpertTest123!
- **Fonctionnalités** :
  - 6 événements/mois
  - 20 photos/mois
  - Badge vérifié ✓
  - Featured sur homepage
  - Support prioritaire
  - Visibilité maximale

## 🔍 Vérification

### Via SQL Editor
Exécuter cette requête pour vérifier la création :

```sql
-- Vérifier les utilisateurs
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
WHERE email IN ('pro@test.com', 'expert@test.com');

-- Vérifier les établissements
SELECT 
  e.name,
  e.email,
  e.plan,
  e.is_verified,
  e.featured,
  u.email as user_email
FROM establishments e
LEFT JOIN auth.users u ON e.user_id = u.id
WHERE e.email IN ('pro@test.com', 'expert@test.com');
```

### Via l'Application
1. Aller sur la page de connexion
2. Entrer les identifiants de test
3. Vérifier l'accès au dashboard
4. Vérifier les fonctionnalités selon le plan

## ⚠️ Troubleshooting

### Erreur "Invalid login credentials"
- Vérifier que l'email est confirmé dans Supabase
- Vérifier le mot de passe (ProTest123! ou ExpertTest123!)
- Essayer le bouton "Problème de connexion ?" pour nettoyer le cache

### Erreur "User not found"
- S'assurer que l'utilisateur existe dans auth.users
- Vérifier que l'établissement est créé avec le bon user_id

### Dashboard ne charge pas
- Vérifier que l'établissement existe dans la table establishments
- Vérifier que le plan est correctement défini (pro ou expert)

## 📝 Notes Importantes
- Les comptes test sont créés avec auto-confirmation d'email
- Les établissements test ont des données fictives mais réalistes
- Les quotas sont configurés selon les plans (Pro: 3 events, Expert: 6 events)
- Le badge "vérifié" n'est actif que pour le plan Expert