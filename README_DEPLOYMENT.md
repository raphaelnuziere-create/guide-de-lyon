# 🚀 Guide de Déploiement - Dashboard Pro

## ⚡ Actions Immédiates à Effectuer

### 1️⃣ Appliquer la migration Supabase

1. **Connectez-vous à Supabase Dashboard**
   - https://app.supabase.com/project/ikefyhxelzydaogrnwxi

2. **Allez dans SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche

3. **Exécutez la migration**
   - Copiez tout le contenu de `/supabase/migrations/001_add_plan_system.sql`
   - Collez dans l'éditeur SQL
   - Cliquez sur "Run"

4. **Vérifiez les tables créées**
   - Allez dans "Table Editor"
   - Vérifiez que les nouvelles colonnes sont présentes dans `establishments`
   - Vérifiez que les tables `events`, `establishment_photos`, `subscriptions_history` sont créées

### 2️⃣ Tester le Dashboard

1. **Déployez sur Vercel**
   ```bash
   git add .
   git commit -m "feat: Dashboard Pro avec données réelles"
   git push origin main
   ```

2. **Attendez le déploiement** (2-3 minutes)

3. **Testez la connexion**
   - Allez sur https://www.guide-de-lyon.fr/auth/pro/connexion
   - Connectez-vous avec votre compte
   - Le dashboard devrait s'afficher avec le plan "basic" par défaut

### 3️⃣ Mettre à jour votre établissement pour tester

Dans Supabase SQL Editor, exécutez :

```sql
-- Trouvez votre establishment_id
SELECT id, name, user_id, plan 
FROM establishments 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'votre-email@example.com');

-- Testez avec différents plans
UPDATE establishments 
SET plan = 'pro'  -- ou 'expert' ou 'basic'
WHERE id = 'votre-establishment-id';
```

## 🔍 Vérification du bon fonctionnement

### Points à vérifier :
- [ ] Dashboard s'affiche avec le bon plan
- [ ] Les limites sont correctes (1/6/10 photos, 3/3/6 événements)
- [ ] Les badges de plan sont corrects
- [ ] Les sections verrouillées s'affichent avec le cadenas
- [ ] Les statistiques s'affichent

## 🐛 Dépannage

### Si la migration échoue :
- Vérifiez que vous êtes bien connecté avec les droits admin
- Exécutez la migration partie par partie

### Si le dashboard ne charge pas :
- Vérifiez les logs Vercel : https://vercel.com/dashboard
- Vérifiez la console du navigateur (F12)

### Si les données ne s'affichent pas :
- Vérifiez que l'établissement existe dans la base
- Vérifiez les RLS policies dans Supabase

## 📝 Prochaines étapes

Une fois le dashboard fonctionnel :

1. **Implémenter Stripe** pour les paiements
2. **Créer les pages de gestion** (photos, événements)
3. **Ajouter la vérification TVA**
4. **Mettre en place les cron jobs** pour les resets mensuels

## 💡 Notes importantes

- Les compteurs se réinitialisent automatiquement le 1er de chaque mois
- Les limites sont vérifiées côté base de données (triggers)
- Le plan par défaut est "basic" pour tous les nouveaux établissements
- La vérification TVA est requise pour les plans payants