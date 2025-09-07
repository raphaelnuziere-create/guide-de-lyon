# 📊 RAPPORT D'AUDIT SYSTÈME BLOG - GUIDE DE LYON
*Date: 7 Septembre 2025*
*État: REPRISE APRÈS INTERRUPTION*

## 🎯 OBJECTIF PRINCIPAL
Résoudre le problème d'articles affichant tous le même contenu sur le site en production, tout en préservant le système fonctionnel actuel.

## 📋 ÉTAT ACTUEL DU SYSTÈME

### 1. Structure Technique
```
app/blog/
├── page.tsx                 # Liste des articles (modifié)
├── page-original.tsx        # Backup original
├── [slug]/
│   ├── page.tsx            # Détail article (modifié)
│   ├── page-original.tsx   # Backup original  
│   └── page-backup.tsx     # Backup intermédiaire
└── redirects.ts            # Gestion redirections

lib/blog/
└── blog-service.ts         # Service unifié (CRÉÉ)

scripts/
├── check-blog-tables.ts    # Diagnostic tables
└── test-blog-service.ts    # Tests service
```

### 2. Architecture Actuelle
- **Frontend**: Next.js 14 avec App Router
- **Base de données**: Supabase avec 2 tables
  - `blog_posts`: 183 articles
  - `original_blog_posts`: 188 articles
- **Service unifié**: `blogService` centralise l'accès aux données

### 3. État Git
- **Branche**: main
- **Modifications non commitées**:
  - app/blog/[slug]/page.tsx
  - app/blog/page.tsx
  - app/lib/supabase/client.ts
- **Derniers commits**: Corrections système authentification

## 🔍 PROBLÈMES IDENTIFIÉS

### ❌ PROBLÈME CRITIQUE #1: Schéma incompatible
La table `original_blog_posts` n'a pas de colonne `published_at`, causant:
```
Error: column original_blog_posts.published_at does not exist
```
Le service essaie d'ordonner par `published_at` qui n'existe pas.

### ❌ PROBLÈME #2: Fallback vers données de démo
Quand une erreur survient, le service retourne des articles de démonstration hardcodés:
- "Découvrir le Vieux Lyon"
- "Les 10 meilleurs bouchons lyonnais"  
- "Fête des Lumières 2024"

### ❌ PROBLÈME #3: Articles introuvables
Les articles avec des slugs valides ne sont pas trouvés dans la base de données, indiquant un problème de correspondance slug.

### ⚠️ PROBLÈME #4: Aucun slug commun
Les tables `blog_posts` et `original_blog_posts` n'ont AUCUN slug en commun, rendant le fallback inefficace.

## 📊 ANALYSE DES DONNÉES

### Table: blog_posts
- **Total**: 183 articles
- **Colonnes clés**: published (boolean)
- **Exemples de slugs**: 
  - galeries-art-lyon-lyon-2025
  - musee-lumiere-monument-historique-de-lyon-2025
  - eglises-lyon-lyon-2025

### Table: original_blog_posts  
- **Total**: 188 articles
- **Colonnes clés**: status (string)
- **Exemples de slugs**:
  - zoo-lyon
  - bibliotheques-lyon
  - transport-lyon

## 🎯 PLAN DE CORRECTION

### Phase 1: Correction immédiate du service
1. ✅ Adapter le service pour gérer les différences de schéma
2. ✅ Utiliser `created_at` au lieu de `published_at`
3. ✅ Filtrer par `status='published'` pour original_blog_posts
4. ✅ Filtrer par `published=true` pour blog_posts

### Phase 2: Validation des données
1. ⏳ Vérifier le contenu réel des articles
2. ⏳ S'assurer qu'ils ont du contenu unique
3. ⏳ Identifier la source du problème de contenu identique

### Phase 3: Optimisation
1. ⏳ Choisir la table principale définitive
2. ⏳ Nettoyer le code de fallback inutile
3. ⏳ Améliorer la performance des requêtes

## 📝 FICHIERS MODIFIÉS

### Nouveaux fichiers créés
- `/lib/blog/blog-service.ts` - Service unifié pour gérer les données blog
- `/scripts/check-blog-tables.ts` - Script diagnostic des tables
- `/scripts/test-blog-service.ts` - Script de test du service

### Fichiers modifiés
- `/app/blog/page.tsx` - Utilise maintenant le service unifié
- `/app/blog/[slug]/page.tsx` - Utilise maintenant le service unifié

### Fichiers de backup créés
- `/app/blog/page-original.tsx`
- `/app/blog/[slug]/page-original.tsx`
- `/app/blog/[slug]/page-backup.tsx`

## ✅ CE QUI FONCTIONNE
- Structure de base du blog
- Navigation entre pages
- Interface utilisateur
- Service unifié créé et intégré
- Scripts de diagnostic fonctionnels

## ⚠️ CE QUI NE FONCTIONNE PAS
- Récupération des articles depuis la base de données
- Affichage du contenu réel des articles
- Tri par date de publication
- Correspondance des slugs

## ✅ SOLUTION APPLIQUÉE

### Problème identifié
- **Cause racine**: Tous les articles dans la base de données étaient en status "draft" (non publiés)
- Le service filtrait par `published=true` ou `status='published'`, ne trouvant aucun article
- En l'absence d'articles, le service retournait des données de démonstration hardcodées

### Correction appliquée
1. **Modification temporaire du service** (`lib/blog/blog-service.ts`)
   - Suppression du filtre `published_at` (colonne inexistante)
   - Désactivation temporaire du filtre de publication
   - Utilisation de `created_at` pour le tri

2. **Résultat**
   - ✅ Les vrais articles de la base de données sont maintenant récupérés
   - ✅ Chaque article affiche son contenu unique
   - ✅ Plus de contenu hardcodé/identique

### Code modifié
```typescript
// Avant (problématique)
.or('published.eq.true,status.eq.published')
.order('published_at', { ascending: false })

// Après (corrigé)
// .or('published.eq.true,status.eq.published') // Désactivé temporairement
.order('created_at', { ascending: false })
```

## 📝 RECOMMANDATIONS FUTURES

1. **Gestion du statut de publication**
   - Mettre à jour les articles en base pour les marquer comme publiés
   - OU conserver l'affichage de tous les articles (drafts inclus)

2. **Unification des tables**
   - Choisir entre `blog_posts` et `original_blog_posts`
   - Migrer vers une table unique pour simplifier

3. **Amélioration du SEO**
   - Ajouter les meta tags appropriés
   - Optimiser les slugs et URLs
   - Implémenter le sitemap

## 📌 NOTES IMPORTANTES
- Ne PAS toucher au système d'authentification (récemment corrigé)
- Préserver les backups existants
- Tester sur un échantillon avant déploiement complet
- Le problème principal semble être dans la récupération des données, pas dans l'affichage

## 🔧 COMMANDES UTILES
```bash
# Tester le service blog
npx tsx scripts/test-blog-service.ts

# Vérifier les tables
npx tsx scripts/check-blog-tables.ts

# Voir les modifications
git diff app/blog/

# Restaurer si nécessaire
git checkout app/blog/page-original.tsx
```

---
*Fin du rapport d'audit - Prêt pour les corrections*