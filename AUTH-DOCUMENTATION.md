# 📚 Documentation Complète du Système d'Authentification

## 🎯 Vue d'ensemble

Le système d'authentification utilise **Supabase Auth** avec une relation entre les utilisateurs (`auth.users`) et les établissements (`businesses`).

## 🗄️ Structure de la Base de Données

### Tables Principales

#### 1. `auth.users` (Table Supabase Auth)
- **id**: UUID - Identifiant unique de l'utilisateur
- **email**: String - Email de connexion
- **created_at**: Timestamp
- **updated_at**: Timestamp

#### 2. `businesses` (Table publique)
- **id**: UUID - Identifiant unique de l'établissement
- **owner_id**: UUID - Référence vers `auth.users.id`
- **name**: String - Nom de l'établissement
- **email**: String - Email de contact (peut différer de l'email de connexion)
- **plan**: Enum('basic', 'pro', 'expert') - Plan d'abonnement
- **verification_status**: Enum - Statut de vérification
- **is_active**: Boolean - Établissement actif ou non
- Autres champs: address, phone, website, opening_hours, gallery, etc.

### Relations
```sql
businesses.owner_id → auth.users.id (1:1)
```

## 🔐 Flux d'Authentification

### 1. Inscription (`/pro/inscription`)
```mermaid
1. Utilisateur remplit le formulaire
2. Création compte dans auth.users via Supabase Auth
3. Création automatique de l'établissement dans businesses
4. Lien owner_id ← user.id
5. Redirection vers dashboard
```

### 2. Connexion (`/auth/pro/connexion`)
```mermaid
1. Email + mot de passe
2. Vérification via Supabase Auth
3. Récupération de la session
4. Chargement des données business
5. Redirection vers dashboard
```

### 3. Dashboard (`/pro/dashboard`)
```mermaid
1. Vérification de la session
2. Récupération user.id
3. Requête businesses WHERE owner_id = user.id
4. Affichage selon le plan (basic/pro/expert)
```

## 🧪 Outils de Test

### 1. **Page de Diagnostic** (`/dev/auth-diagnostic`)
- Test de connexion Supabase
- Vérification des tables
- Test des relations user-business
- Diagnostic complet du système

### 2. **Connexion Rapide** (`/dev/quick-login`)
- 3 comptes de test pré-configurés
- Connexion en 1 clic
- Test par plan (basic/pro/expert)

### 3. **Script SQL de Setup** (`scripts/setup-test-accounts.sql`)
```sql
-- Crée 3 établissements de test
-- Un pour chaque plan
-- Avec données complètes
```

## 🎭 Comptes de Test

### Plan BASIC
```
Email: test.basic@guide-lyon.fr
Mot de passe: TestBasic123!
Fonctionnalités: 1 photo, horaires, infos de base
```

### Plan PRO
```
Email: test.pro@guide-lyon.fr
Mot de passe: TestPro123!
Fonctionnalités: 6 photos, 3 événements/mois, badge vérifié, stats
```

### Plan EXPERT
```
Email: test.expert@guide-lyon.fr
Mot de passe: TestExpert123!
Fonctionnalités: Photos illimitées, 10 événements/mois, mise en avant
```

## ⚙️ Configuration Supabase

### 1. Créer les utilisateurs de test

1. Aller dans **Supabase Dashboard > Authentication > Users**
2. Cliquer sur "Invite user"
3. Créer chaque compte avec les emails ci-dessus
4. Noter les user_id générés

### 2. Exécuter le script SQL

1. Ouvrir **SQL Editor** dans Supabase
2. Copier le contenu de `scripts/setup-test-accounts.sql`
3. Remplacer `REMPLACER_PAR_USER_ID_*` par les vrais IDs
4. Exécuter le script

### 3. Vérifier la configuration

1. Aller sur `/dev/auth-diagnostic`
2. Cliquer sur "Lancer les tests"
3. Vérifier que tous les tests sont verts

## 🔧 Dépannage

### Problème: "Invalid login credentials"
**Solution:**
1. Vérifier que l'utilisateur existe dans auth.users
2. Réinitialiser le mot de passe si nécessaire
3. Vérifier l'email (pas d'espaces, bonne casse)

### Problème: "No business found"
**Solution:**
1. Vérifier que businesses.owner_id = auth.users.id
2. Exécuter le script SQL de setup
3. Vérifier dans Supabase que l'établissement existe

### Problème: "Session expired"
**Solution:**
1. Se déconnecter complètement
2. Vider le cache du navigateur
3. Se reconnecter

### Problème: Dashboard vide
**Solution:**
1. Vérifier la relation owner_id
2. Vérifier que is_active = true
3. Vérifier le plan de l'établissement

## 📁 Fichiers Importants

### Pages d'authentification
- `/app/auth/pro/connexion/page.tsx` - Page de connexion pro
- `/app/auth/pro/inscription/page.tsx` - Page d'inscription pro
- `/app/pro/dashboard/page.tsx` - Dashboard principal

### Services
- `/app/lib/supabase/client.ts` - Client Supabase
- `/app/lib/services/establishmentService.ts` - Service établissements
- `/app/lib/utils/auth-persistence.ts` - Gestion de session

### Outils de développement
- `/app/dev/auth-diagnostic/page.tsx` - Page de diagnostic
- `/app/dev/quick-login/page.tsx` - Connexion rapide
- `/scripts/setup-test-accounts.sql` - Script de setup

## 🚀 Pour Tester Rapidement

### Option 1: Connexion Rapide
1. Aller sur `/dev/quick-login`
2. Cliquer sur un des 3 comptes de test
3. Vous êtes connecté et redirigé vers le dashboard

### Option 2: Votre Compte Existant
Pour `pro@test.com` (Restaurant Le Gourmet Pro):
1. Aller sur `/dev/quick-login`
2. Section "Connexion Personnalisée"
3. Email: `pro@test.com`
4. Mot de passe: (celui que vous avez défini)
5. Cliquer sur "Se connecter"

### Option 3: Diagnostic Complet
1. Aller sur `/dev/auth-diagnostic`
2. Lancer les tests de diagnostic
3. Utiliser les comptes de test
4. Vérifier que tout fonctionne

## 🔄 Workflow de Développement

### Pour créer un nouveau compte de test:
```sql
-- 1. Créer l'utilisateur dans Supabase Auth
-- 2. Récupérer son ID
-- 3. Insérer dans businesses
INSERT INTO businesses (owner_id, name, email, plan, ...) 
VALUES ('user-id-here', 'Nom Test', 'email@test.com', 'pro', ...);
```

### Pour réinitialiser un mot de passe:
```javascript
// Via Supabase
await supabase.auth.resetPasswordForEmail('email@test.com')
```

### Pour changer de plan:
```sql
UPDATE businesses 
SET plan = 'expert' 
WHERE email = 'test@example.com';
```

## 📊 Limitations par Plan

### BASIC
- 1 photo principale
- Pas d'événements sur homepage
- Pas de galerie
- Pas de statistiques avancées

### PRO
- 6 photos maximum
- 3 événements par mois
- Badge vérifié disponible
- Statistiques de base

### EXPERT
- Photos illimitées
- 10 événements par mois
- Mise en avant prioritaire
- Statistiques avancées
- Support prioritaire

## ✅ Checklist de Configuration

- [ ] Supabase configuré avec URL et ANON_KEY
- [ ] Table businesses créée avec owner_id
- [ ] Utilisateurs de test créés dans Auth
- [ ] Script SQL exécuté avec les bons IDs
- [ ] Page de diagnostic accessible
- [ ] Tests de connexion fonctionnels
- [ ] Dashboard affiche les bonnes données
- [ ] Limitations par plan respectées

## 🆘 Support

Si vous rencontrez des problèmes:
1. Vérifiez d'abord `/dev/auth-diagnostic`
2. Consultez les logs Supabase
3. Vérifiez les relations dans la base
4. Testez avec les comptes prédéfinis

---

**Note:** Les pages `/dev/*` sont uniquement pour le développement et ne doivent pas être déployées en production.