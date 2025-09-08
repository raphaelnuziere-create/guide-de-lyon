# Audit Dashboard - Fonctionnalités Manquantes

## ❌ ERREURS 404 IDENTIFIÉES

### Routes manquantes dans /app/pro/
- [ ] `/pro/horaires` → Gestion des horaires d'ouverture
- [ ] `/pro/events` → Gestion des événements (lien différent de `/pro/evenements`)  
- [ ] `/pro/upgrade` → Page de mise à niveau du plan
- [ ] `/pro/verification` → Processus de vérification établissement
- [ ] `/pro/etablissement/edit` → Édition complète de l'établissement
- [ ] `/pro/settings` → Paramètres du compte pro

## 🖼️ UPLOADS MANQUANTS
- [ ] Photo de profil établissement - Pas de composant drag & drop
- [ ] Carousel photos (Plan Pro/Expert) - Page `/pro/photos` existe mais incomplète
- [ ] Upload logo - Fonctionnalité absente
- [ ] Galerie avec gestion (supprimer, réordonner) - Pas de composant dédié

## 📝 FORMULAIRES INCOMPLETS
- [ ] Horaires d'ouverture - Interface manquante (route `/pro/horaires` 404)
- [ ] Informations contact - Validation absente
- [ ] Description établissement - Éditeur rich text absent
- [ ] Liens sociaux - Champs non sauvegardés

## 📅 SYSTÈME ÉVÉNEMENTS
- [ ] Confusion entre `/pro/evenements` et `/pro/events` - Unifier les routes
- [ ] Création événement - Formulaire incomplet
- [ ] Calendrier de sélection date - Component absent
- [ ] Quota visualisation - Non implémenté
- [ ] Liste événements - Pas d'actions (edit/delete)

## 🔧 ACTIONS DASHBOARD
- [ ] Bouton "Gérer les horaires" → Route 404
- [ ] Bouton "Vérification" → Route 404
- [ ] Bouton "Upgrade" → Route 404  
- [ ] Badge vérification - Logique absente
- [ ] Statistiques - Données mockées

## 📁 STRUCTURE ACTUELLE
```
app/pro/
├── dashboard/
│   └── page.tsx (33KB - complexe mais incomplet)
├── evenements/
│   └── page.tsx (existe)
├── photos/
│   └── page.tsx (existe)
├── inscription/
│   └── page.tsx (existe)
└── page.tsx (page principale)
```

## 🚨 PRIORITÉS CRITIQUES

### 1. Routes manquantes (404)
- Créer `/pro/horaires`
- Créer `/pro/upgrade`
- Créer `/pro/verification`
- Créer `/pro/etablissement/edit`
- Créer `/pro/settings`
- Unifier `/pro/events` avec `/pro/evenements`

### 2. Composants essentiels manquants
- `ImageUpload.tsx` - Upload avec drag & drop
- `OpeningHours.tsx` - Gestion des horaires
- `EventForm.tsx` - Formulaire événements complet
- `GalleryManager.tsx` - Gestion galerie photos
- `QuotaIndicator.tsx` - Indicateur de quota

### 3. API Routes manquantes
- `/api/pro/upload` - Upload images
- `/api/pro/hours` - Sauvegarde horaires
- `/api/pro/events` - CRUD événements
- `/api/pro/verification` - Process vérification

## 📊 RÉSUMÉ
- **6 routes 404** à créer
- **5 composants majeurs** manquants
- **4 API endpoints** absents
- **Nombreux handlers** non implémentés

## ✅ PLAN D'ACTION

1. **Phase 1 - Routes critiques** (Priorité maximale)
   - Créer toutes les pages manquantes pour éliminer les 404
   
2. **Phase 2 - Composants réutilisables**
   - ImageUpload avec drag & drop
   - OpeningHours complet
   - EventForm avec calendrier
   
3. **Phase 3 - API et logique métier**
   - Routes API pour persistence
   - Validation et sécurité
   
4. **Phase 4 - Tests et validation**
   - Test de chaque fonctionnalité
   - Vérification des quotas par plan