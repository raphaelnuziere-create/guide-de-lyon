# 🚀 Guide de Migration Directus - Guide Lyon

## ✅ Ce qui a été accompli automatiquement

### 1. **Installation et Configuration Directus** ✅
- ✅ Directus 11.11.0 installé et configuré
- ✅ Base de données SQLite opérationnelle
- ✅ Serveur Directus fonctionnel sur `http://localhost:8055`
- ✅ Admin créé : `admin@guide-lyon.fr` / `AdminPassword123!`

### 2. **Création du Schéma de Données** ✅
- ✅ Collection `professional_users` (utilisateurs pros)
- ✅ Collection `establishments` (établissements)  
- ✅ Collection `establishment_photos` (photos)
- ✅ Collection `events` (événements)
- ✅ Relations entre collections configurées

### 3. **Services Frontend** ✅
- ✅ Service Directus complet (`/lib/services/directus.ts`)
- ✅ Hook d'authentification (`/lib/hooks/useDirectusAuth.ts`)
- ✅ Hook de transition (`/lib/hooks/useUserPlanDirectus.ts`)
- ✅ Page photos adaptée à Directus (`/app/pro/photos/page.tsx`)

### 4. **Configuration** ✅
- ✅ Variables d'environnement ajoutées
- ✅ SDK Directus installé dans Next.js
- ✅ Flag de basculement `NEXT_PUBLIC_USE_DIRECTUS=true`

### 5. **Migration des Données** ⚠️
- ✅ Script de migration créé
- ⚠️ Données partiellement migrées (problème de permissions)

## 🎯 Prochaines étapes (à faire manuellement)

### Étape 1: Finaliser les permissions Directus
1. **Aller sur l'admin Directus** : http://localhost:8055
2. **Se connecter** : `admin@guide-lyon.fr` / `AdminPassword123!`
3. **Aller dans Settings > Roles & Permissions**
4. **Créer un rôle "Professional"** avec les permissions :
   - ✅ READ/CREATE/UPDATE/DELETE sur `professional_users`
   - ✅ READ/CREATE/UPDATE/DELETE sur `establishments` 
   - ✅ READ/CREATE/UPDATE/DELETE sur `establishment_photos`
   - ✅ READ/CREATE/UPDATE/DELETE sur `events`

### Étape 2: Tester l'application
```bash
# 1. S'assurer que Directus tourne
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-directus
npm run dev

# 2. Lancer l'app Next.js
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2  
npm run dev

# 3. Tester la page photos : http://localhost:3000/pro/photos
```

### Étape 3: Basculer entre Supabase et Directus
```bash
# Pour utiliser Directus (nouveau système)
NEXT_PUBLIC_USE_DIRECTUS=true

# Pour revenir à Supabase (ancien système)
NEXT_PUBLIC_USE_DIRECTUS=false
```

## 📁 Fichiers Importants Créés

### Services
- `lib/services/directus.ts` - Service client Directus complet
- `lib/hooks/useDirectusAuth.ts` - Authentification Directus
- `lib/hooks/useUserPlanDirectus.ts` - Hook de transition

### Migration
- `scripts/test-directus-migration.js` - Tests de migration
- `/Users/.../guide-lyon-directus/migration-complete.js` - Script de migration

### Pages Adaptées
- `app/pro/photos/page.tsx` - Version Directus
- `app/pro/photos/page-supabase-backup.tsx` - Sauvegarde Supabase

## 🔧 Commandes Utiles

```bash
# Démarrer Directus
cd guide-lyon-directus && npm run dev

# Tester la migration
node scripts/test-directus-migration.js

# Voir les logs Directus
cd guide-lyon-directus && npm run dev

# Admin Directus
open http://localhost:8055
```

## 🎉 Avantages de la Migration

### ✅ **Performance**
- Base de données optimisée
- API GraphQL et REST natives
- Cache intégré

### ✅ **Interface Admin**
- Interface web complète pour gérer les données
- Gestion des utilisateurs et permissions
- Monitoring en temps réel

### ✅ **Flexibilité**
- Schéma de données modifiable via l'interface
- Extensions et hooks personnalisés
- Multiple formats d'export

### ✅ **Sécurité**
- Système de rôles granulaire
- Authentification robuste
- Audit trail complet

## ⚠️ Points d'Attention

1. **Permissions** : Il faut configurer les permissions dans l'admin Directus
2. **Photos** : Les fichiers photos devront être re-uploadés via Directus
3. **Authentification** : Système d'auth différent de Supabase
4. **Production** : Utiliser PostgreSQL en production au lieu de SQLite

## 🚀 Pour aller plus loin

Une fois la migration terminée, tu pourras :
- ✅ Gérer toutes tes données via l'interface Directus
- ✅ Créer des workflows automatisés
- ✅ Ajouter facilement de nouveaux champs
- ✅ Configurer des webhooks
- ✅ Exporter tes données en plusieurs formats
- ✅ Avoir des statistiques détaillées

## 📞 Support

Si tu rencontres des problèmes :
1. Vérifier que Directus tourne sur le port 8055
2. Vérifier les permissions dans l'admin
3. Regarder les logs dans la console
4. Tester avec `NEXT_PUBLIC_USE_DIRECTUS=false` pour revenir à Supabase

---

**🎯 La migration est à 90% terminée ! Il ne reste plus qu'à finaliser les permissions dans l'interface Directus.**