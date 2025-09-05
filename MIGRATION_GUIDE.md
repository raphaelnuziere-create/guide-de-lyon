# 📋 Guide de Migration Supabase - Système d'Abonnement Pro

## ⚠️ IMPORTANT : Exécutez les migrations dans l'ordre !

Les migrations ont été divisées en 4 parties pour éviter les erreurs de dépendances.

## 🚀 Étapes d'exécution

### 1️⃣ Connectez-vous à votre Dashboard Supabase
- Allez sur : https://app.supabase.com
- Sélectionnez votre projet
- Cliquez sur **"SQL Editor"** dans le menu de gauche

### 2️⃣ Exécutez les migrations dans cet ordre exact :

#### Étape 1 : Créer les tables
1. Ouvrez le fichier `001_tables_only.sql`
2. Copiez tout le contenu
3. Collez dans l'éditeur SQL
4. Cliquez sur **"Run"**
5. ✅ Vous devriez voir : "Success. No rows returned"

#### Étape 2 : Insérer les plans d'abonnement
1. Ouvrez le fichier `002_insert_plans.sql`
2. Copiez tout le contenu
3. Collez dans l'éditeur SQL
4. Cliquez sur **"Run"**
5. ✅ Vous devriez voir : "Success. 3 rows affected"

#### Étape 3 : Créer les indexes et politiques RLS
1. Ouvrez le fichier `003_indexes_and_rls.sql`
2. Copiez tout le contenu
3. Collez dans l'éditeur SQL
4. Cliquez sur **"Run"**
5. ✅ Vous devriez voir : "Success. No rows returned"

#### Étape 4 : Créer les fonctions et triggers
1. Ouvrez le fichier `004_functions_and_triggers.sql`
2. Copiez tout le contenu
3. Collez dans l'éditeur SQL
4. Cliquez sur **"Run"**
5. ✅ Vous devriez voir : "Success. No rows returned"

## 🔍 Vérification

### Vérifier que les tables ont été créées :
1. Dans Supabase, allez dans **"Table Editor"**
2. Vous devriez voir ces nouvelles tables :
   - ✅ `subscription_plans` (avec 3 lignes)
   - ✅ `establishments`
   - ✅ `subscriptions`
   - ✅ `establishment_media`
   - ✅ `events`
   - ✅ `establishment_analytics`
   - ✅ `newsletter_preferences`

### Vérifier les 3 plans :
Dans la table `subscription_plans`, vous devriez voir :
- **Basic** : 0€/mois
- **Pro** : 19€/mois
- **Expert** : 49€/mois

## 🎯 Test rapide

Pour vérifier que tout fonctionne, exécutez cette requête dans l'éditeur SQL :

```sql
SELECT name, slug, price_monthly, max_photos, max_events_per_month
FROM subscription_plans
ORDER BY display_order;
```

Vous devriez voir :
```
Basic  | basic  | 0.00  | 1  | 3
Pro    | pro    | 19.00 | 6  | 3
Expert | expert | 49.00 | 10 | 5
```

## ✅ Migration terminée !

Une fois toutes les étapes complétées avec succès, votre système d'abonnement est prêt.

Vous pouvez maintenant tester :
- 🔗 `/pro/inscription` - Formulaire d'inscription professionnelle
- 🔗 `/pro/dashboard` - Dashboard professionnel

## 🚨 En cas d'erreur

Si vous avez une erreur :
1. Notez le message d'erreur exact
2. Vérifiez que vous avez bien exécuté les scripts dans l'ordre
3. Si une table existe déjà, les scripts DROP TABLE CASCADE au début devraient la supprimer

## 💡 Conseil

Faites une sauvegarde de votre base de données avant d'exécuter ces migrations si vous avez déjà des données importantes.