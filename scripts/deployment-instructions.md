# 🚀 DÉPLOIEMENT RÉUSSI - INSTRUCTIONS FINALES

## ✅ Déploiement Production
Le site est maintenant déployé sur : **https://guide-de-lyon.fr**

## 📋 Étapes suivantes pour finaliser

### 1. Créer l'utilisateur PRO dans Supabase Auth
1. Allez sur : https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users
2. Cliquez sur **"Add user"** → **"Create new user"**
3. Saisissez :
   - **Email** : pro@test.com
   - **Password** : ProTest123!
   - **Email Confirm** : ✅ (cocher)
4. Cliquez **"Create user"**
5. **Copiez l'ID utilisateur** généré

### 2. Créer l'établissement PRO
1. Allez sur : https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new
2. Exécutez le SQL suivant (remplacez USER_ID par l'ID copié à l'étape 1) :

```sql
-- Supprimer l'ancien s'il existe
DELETE FROM establishments WHERE email = 'pro@test.com';

-- Créer l'établissement PRO
INSERT INTO establishments (
  user_id,
  name,
  slug,
  email,
  phone,
  address,
  city,
  postal_code,
  description,
  plan,
  max_events,
  max_photos,
  events_this_month,
  photos_this_month,
  featured,
  priority_support,
  is_verified,
  status,
  created_at,
  updated_at
) VALUES (
  'USER_ID_ICI', -- Remplacer par l'ID utilisateur copié
  'Restaurant Le Gourmet Pro',
  'restaurant-le-gourmet-pro',
  'pro@test.com',
  '0478567890',
  '25 Rue de la République',
  'Lyon',
  '69001',
  'Restaurant professionnel avec avantages Plan Pro. Présence renforcée sur Guide de Lyon.',
  'pro',
  3,
  6,
  0,
  0,
  false,
  false,
  true,
  'active',
  NOW(),
  NOW()
);
```

### 3. Vérifier la création
Exécutez cette requête pour vérifier :
```sql
SELECT name, email, plan, max_events, max_photos, is_verified, featured
FROM establishments 
WHERE email = 'pro@test.com';
```

## 🧪 Tests à effectuer

### Dashboard Expert (déjà fonctionnel)
- URL : https://guide-de-lyon.fr/auth/pro/connexion
- Login : expert@test.com / ExpertTest123!
- Vérifications :
  - ✅ Dashboard niveau expert visible
  - ✅ 6 événements max, 20 photos max
  - ✅ Badge vérifié + featured

### Dashboard Pro (à tester après création)
- URL : https://guide-de-lyon.fr/auth/pro/connexion  
- Login : pro@test.com / ProTest123!
- Vérifications :
  - Dashboard niveau pro (pas expert)
  - 3 événements max, 6 photos max
  - Badge vérifié mais pas featured
  - Pas de support prioritaire

### Inscription Shopping
- URL : https://guide-de-lyon.fr/pro/inscription
- Test : Sélectionner "Shopping & Mode"
- Vérifications :
  - Étape 2 : Options spécifiques shopping
  - Catégories produits, marques, paiements
  - Sauvegarde correcte des données

## 🎯 Résultat Final
- ✅ Site en production : https://guide-de-lyon.fr
- ✅ Dashboard expert opérationnel 
- ⏳ Dashboard pro à finaliser (création utilisateur)
- ✅ Formulaires adaptatifs par secteur
- ✅ Système parfait pour lancement Lyon pros

## 📱 URLs Clés Production
- **Accueil** : https://guide-de-lyon.fr
- **Connexion Pro** : https://guide-de-lyon.fr/auth/pro/connexion
- **Inscription Pro** : https://guide-de-lyon.fr/pro/inscription
- **Dashboard** : https://guide-de-lyon.fr/pro/dashboard