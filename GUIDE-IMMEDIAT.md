# 🚨 GUIDE IMMÉDIAT - CE QUI FONCTIONNE MAINTENANT

## ✅ Pages qui FONCTIONNENT DÉJÀ

### 1. **Connexion Officielle** (FONCTIONNE)
**URL:** https://www.guide-de-lyon.fr/auth/pro/connexion
- Cette page existe et fonctionne
- Utilisez `pro@test.com` et votre mot de passe

### 2. **Dashboard** (après connexion)
**URL:** https://www.guide-de-lyon.fr/pro/dashboard
- Accessible après connexion réussie

### 3. **Inscription** (pour créer un nouveau compte)
**URL:** https://www.guide-de-lyon.fr/pro/inscription
- Pour créer un compte de test neuf

## 🔧 RÉSOUDRE VOTRE PROBLÈME EN 2 MINUTES

### ÉTAPE 1: Diagnostic dans Supabase

Copiez et exécutez cette requête SQL dans Supabase:

```sql
-- DIAGNOSTIC RAPIDE
SELECT 
  CASE 
    WHEN u.id IS NULL THEN '❌ CRÉEZ LE COMPTE dans Auth > Users'
    WHEN e.id IS NULL THEN '❌ ÉTABLISSEMENT inexistant'
    WHEN e.owner_id IS NULL THEN '❌ EXÉCUTEZ UPDATE ci-dessous'
    WHEN e.owner_id != u.id THEN '❌ owner_id incorrect'
    ELSE '✅ TOUT EST OK - Essayez de vous connecter'
  END as "QUE FAIRE",
  u.id as "user_id à copier",
  e.owner_id as "owner_id actuel"
FROM 
  (SELECT id FROM auth.users WHERE email = 'pro@test.com') u
  FULL OUTER JOIN 
  (SELECT id, owner_id FROM establishments WHERE email = 'pro@test.com') e ON true;
```

### ÉTAPE 2: Selon le résultat

#### Si "CRÉEZ LE COMPTE":
1. Dans Supabase > Authentication > Users
2. Cliquez "Invite user"
3. Email: `pro@test.com`
4. Créez un mot de passe

#### Si "EXÉCUTEZ UPDATE":
Copiez le user_id du résultat et:
```sql
UPDATE establishments 
SET owner_id = 'COLLEZ_LE_USER_ID_ICI'
WHERE email = 'pro@test.com';
```

### ÉTAPE 3: Connectez-vous
1. Allez sur https://www.guide-de-lyon.fr/auth/pro/connexion
2. Email: `pro@test.com`
3. Mot de passe: celui que vous avez défini
4. Cliquez "Se connecter"

## 🆘 SI RIEN NE MARCHE

### Option A: Créer un nouveau compte
1. https://www.guide-de-lyon.fr/pro/inscription
2. Utilisez un nouvel email (ex: `test@test.com`)
3. Créez le compte
4. Connectez-vous

### Option B: Reset complet
```sql
-- 1. Supprimer l'ancien
DELETE FROM establishments WHERE email = 'pro@test.com';

-- 2. Récupérer le user_id
SELECT id FROM auth.users WHERE email = 'pro@test.com';

-- 3. Recréer (remplacez USER_ID)
INSERT INTO establishments (
  owner_id, name, email, plan, is_active
) VALUES (
  'USER_ID_ICI',
  'Restaurant Test',
  'pro@test.com',
  'pro',
  true
);
```

## 📱 PAGES DE TEST (après déploiement ~3min)
- `/connexion-test` - Page simple (en cours de déploiement)
- `/test-login` - Page avec interface

## ⚡ SOLUTION LA PLUS RAPIDE

**Si vous êtes pressé:**
1. Créez un NOUVEAU compte: https://www.guide-de-lyon.fr/pro/inscription
2. Utilisez un email différent
3. Testez avec ce nouveau compte

---

**Le problème principal:** La table s'appelle `establishments` (avec un S) et non `businesses`.