# 🚀 GUIDE SIMPLE DE CONNEXION

## ✅ Pages qui FONCTIONNENT

### 1. **Page de Test Simple** → `/test-login`
- ✅ **Cette page existe et fonctionne**
- Interface simple pour tester les connexions
- Remplissage automatique des comptes de test

### 2. **Pages de diagnostic** (peuvent avoir des erreurs 404)
- `/dev/auth-diagnostic` - Diagnostic complet
- `/dev/quick-login` - Connexion rapide

## 🔧 PROBLÈME PRINCIPAL

Votre base de données utilise la table `establishments` et non `businesses`.

## 📝 ÉTAPES À SUIVRE

### ÉTAPE 1: Exécuter le script SQL corrigé

1. Ouvrez Supabase SQL Editor
2. Copiez le contenu de `scripts/setup-test-accounts-FIXED.sql`
3. Exécutez les commandes dans l'ordre

### ÉTAPE 2: Tester votre compte existant

**Restaurant Le Gourmet Pro:**
1. Allez sur `/test-login`
2. Cliquez sur "pro@test.com" pour remplir automatiquement
3. Entrez votre mot de passe
4. Cliquez sur "Se connecter"

### ÉTAPE 3: Vérifier la relation user-establishment

Dans Supabase SQL Editor, exécutez:

```sql
-- Trouver votre user_id
SELECT id, email FROM auth.users WHERE email = 'pro@test.com';

-- Vérifier votre établissement
SELECT * FROM establishments WHERE email = 'pro@test.com';

-- Si owner_id est NULL, mettez à jour:
UPDATE establishments 
SET owner_id = 'VOTRE_USER_ID_ICI'
WHERE email = 'pro@test.com';
```

## 🎯 SOLUTION RAPIDE

Si vous êtes perdu, faites ceci:

### 1. Réinitialiser votre compte

```sql
-- Dans Supabase SQL Editor

-- 1. Trouvez votre user_id
SELECT id FROM auth.users WHERE email = 'pro@test.com';

-- 2. Mettez à jour votre établissement (remplacez USER_ID_ICI)
UPDATE establishments 
SET 
  owner_id = 'USER_ID_ICI',
  plan = 'pro',
  is_active = true
WHERE email = 'pro@test.com' OR name = 'Restaurant Le Gourmet Pro';

-- 3. Vérifiez
SELECT 
  e.name,
  e.email,
  e.plan,
  e.owner_id,
  u.email as user_email
FROM establishments e
LEFT JOIN auth.users u ON u.id = e.owner_id
WHERE e.email = 'pro@test.com';
```

### 2. Tester la connexion

1. Allez sur `/test-login`
2. Utilisez pro@test.com avec votre mot de passe
3. Vous devriez voir le dashboard

## 📊 STRUCTURE CORRECTE

```
auth.users (Supabase Auth)
├── id (UUID)
├── email: pro@test.com
└── password: [votre mot de passe]
          ↓
          ↓ owner_id
          ↓
establishments (votre table)
├── id (UUID)
├── owner_id → pointe vers auth.users.id
├── name: Restaurant Le Gourmet Pro
├── email: pro@test.com
├── plan: basic/pro/expert
└── is_active: true
```

## ❌ ERREURS COMMUNES

### "Invalid login credentials"
→ Le compte n'existe pas dans auth.users
→ Solution: Créer le compte ou vérifier l'email/mot de passe

### "No establishment found"
→ owner_id n'est pas défini dans establishments
→ Solution: Exécuter l'UPDATE SQL ci-dessus

### Dashboard vide
→ La relation owner_id est cassée
→ Solution: Vérifier et corriger owner_id

## 🆘 AIDE URGENTE

Si rien ne fonctionne:

1. **Créez un nouveau compte de test:**
   - Allez sur `/pro/inscription`
   - Créez un compte avec un nouvel email
   - Testez la connexion

2. **Vérifiez les tables:**
   ```sql
   -- Voir tous les users
   SELECT id, email FROM auth.users;
   
   -- Voir tous les établissements
   SELECT id, name, email, owner_id FROM establishments;
   ```

3. **Pages de test:**
   - `/test-login` - Page simple qui FONCTIONNE
   - `/auth/pro/connexion` - Page de connexion officielle
   - `/pro/dashboard` - Dashboard (nécessite connexion)

## ✅ SUCCÈS

Vous savez que ça fonctionne quand:
1. Connexion réussie sur `/test-login`
2. Redirection vers `/pro/dashboard`
3. Vous voyez votre nom d'établissement
4. Les fonctionnalités du dashboard sont accessibles

---

**IMPORTANT:** La table s'appelle `establishments` et non `businesses`. C'est la source principale des erreurs!