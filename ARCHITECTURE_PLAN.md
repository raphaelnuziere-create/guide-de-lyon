# 🏗️ Plan d'Architecture Guide de Lyon - Intégration Firebase

## 📊 État Actuel
- **Frontend**: Next.js 14 (App Router) déployé sur Vercel ✅
- **Auth**: Supabase Auth (merchants) 
- **Database**: Supabase PostgreSQL (merchants, places, events, blog_posts)
- **Firebase**: Configuré mais non utilisé activement

## 🎯 Architecture Cible Hybride

### 1️⃣ **Firebase** (Temps réel & Documents)
```
┌─────────────────────────────────────────┐
│            FIREBASE SERVICES            │
├─────────────────────────────────────────┤
│ • Authentication (tous les users)       │
│ • Firestore (données temps réel)        │
│   - events_live (événements)            │
│   - calendar_config (configuration)     │
│   - chat_messages (messaging)           │
│   - notifications                       │
│ • Storage (médias)                      │
│   - images événements/lieux             │
│   - documents merchants                 │
│ • Functions (logique métier)            │
│   - webhooks Stripe                     │
│   - notifications push                  │
│   - modération automatique              │
│ • Hosting (assets statiques)            │
└─────────────────────────────────────────┘
```

### 2️⃣ **Supabase** (Données structurées)
```
┌─────────────────────────────────────────┐
│            SUPABASE SERVICES            │
├─────────────────────────────────────────┤
│ • PostgreSQL (données relationnelles)   │
│   - merchants (profils business)        │
│   - places (établissements)             │
│   - original_blog_posts (articles)      │
│   - analytics (statistiques)            │
│   - billing_history                     │
│ • PostGIS (données géospatiales)        │
│   - recherche par proximité             │
│   - zones de livraison                  │
└─────────────────────────────────────────┘
```

## 📋 Plan de Migration Par Phases

### **Phase 1: Configuration Firebase** (Immédiat)
- [x] Firebase CLI installé
- [ ] Initialiser Firebase dans le projet
- [ ] Configurer Firestore
- [ ] Configurer Storage 
- [ ] Configurer Functions
- [ ] Configurer les règles de sécurité

### **Phase 2: Migration Auth** (Priorité haute)
```javascript
// Migration progressive
1. Firebase Auth pour nouveaux users
2. Sync Supabase → Firebase pour existants  
3. Single Sign-On unifié
4. Suppression Supabase Auth
```

### **Phase 3: Gestion Événements** (Priorité haute)
```javascript
// Structure Firestore
events_live/
  ├── {eventId}/
  │   ├── details (titre, description, dates)
  │   ├── attendees (participants)
  │   ├── real_time (compteur live, likes)
  │   └── comments (sous-collection)
```

### **Phase 4: Système de Calendrier**
```javascript
calendar_config/
  ├── merchants/{merchantId}/
  │   ├── availability (disponibilités)
  │   ├── bookings (réservations)
  │   └── settings (préférences)
```

### **Phase 5: Upload & Media**
```javascript
// Firebase Storage
/merchants/{merchantId}/
  ├── logo/
  ├── places/{placeId}/
  │   ├── photos/
  │   └── documents/
  └── events/{eventId}/
      └── images/
```

## 🛠️ Outils à Développer

### 1. **Dashboard Hybride**
- Vue temps réel des événements (Firestore)
- Analytics et rapports (Supabase)
- Gestion médias (Firebase Storage)

### 2. **Système de Notifications**
- Push notifications (Firebase Cloud Messaging)
- Email transactionnels (Brevo + Functions)
- Notifications in-app (Firestore)

### 3. **Chat & Messaging**
- Chat temps réel merchants/clients (Firestore)
- Support client intégré
- Historique des conversations

### 4. **Modération Intelligente**
- Cloud Functions pour modération auto
- Détection contenu inapproprié (Cloud Vision API)
- Workflow d'approbation

### 5. **Analytics Avancé**
- Real-time dashboard (Firestore)
- Heatmaps interactions (Analytics)
- Conversion tracking (Functions)

## 🔧 Configuration Firebase CLI

### Commandes à exécuter:
```bash
# 1. Initialisation
firebase init

# Services à activer:
✅ Firestore
✅ Functions (TypeScript)
✅ Storage
✅ Hosting
✅ Emulators

# 2. Configuration Firestore
firebase firestore:indexes:create
firebase deploy --only firestore:rules

# 3. Configuration Functions
cd functions && npm install
firebase deploy --only functions

# 4. Configuration Storage
firebase deploy --only storage:rules
```

## 📊 Répartition des Données

| Type de Donnée | Firebase | Supabase | Raison |
|----------------|----------|----------|---------|
| Authentification | ✅ | ❌ | Unification, SSO |
| Profils merchants | ❌ | ✅ | Requêtes SQL complexes |
| Événements temps réel | ✅ | ❌ | Updates live, compteurs |
| Articles blog | ❌ | ✅ | SEO, recherche full-text |
| Chat/Messages | ✅ | ❌ | Temps réel natif |
| Analytics | ✅ | ✅ | Temps réel + historique |
| Médias | ✅ | ❌ | CDN Firebase optimisé |
| Facturation | ❌ | ✅ | Transactions, audit trail |

## 🔐 Sécurité

### Firebase Security Rules:
```javascript
// Firestore Rules
service cloud.firestore {
  match /databases/{database}/documents {
    // Events: lecture publique, écriture merchants
    match /events_live/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.merchantId;
    }
    
    // Calendar: privé merchant
    match /calendar_config/{merchantId}/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == merchantId;
    }
  }
}
```

### Storage Rules:
```javascript
service firebase.storage {
  match /b/{bucket}/o {
    match /merchants/{merchantId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == merchantId;
    }
  }
}
```

## 📈 Avantages de l'Architecture Hybride

1. **Performance**: 
   - Temps réel natif (Firebase)
   - Requêtes SQL optimisées (Supabase)

2. **Coûts optimisés**:
   - Firebase: facturation par usage
   - Supabase: forfait fixe

3. **Scalabilité**:
   - Auto-scaling Firebase Functions
   - PostgreSQL pour données volumineuses

4. **Developer Experience**:
   - SDK Firebase unifié
   - ORM Supabase pour requêtes complexes

## 🚀 Prochaines Étapes

1. **Immédiat**: 
   - Initialiser Firebase dans le projet
   - Créer structure Firestore
   - Configurer les règles de sécurité

2. **Cette semaine**:
   - Migration auth
   - Module événements temps réel
   - Upload images

3. **Semaine prochaine**:
   - Calendar system
   - Chat/messaging
   - Dashboard analytics

## 💡 Recommandations Dev Senior

1. **Garder les deux systèmes** pour exploiter leurs forces respectives
2. **Migration progressive** sans interruption de service
3. **Monitoring des coûts** Firebase (usage-based)
4. **Cache strategy** pour optimiser les lectures Firestore
5. **Offline-first** avec Firebase SDK pour meilleure UX

---

*Architecture conçue pour supporter 100K+ utilisateurs avec possibilité de scale horizontal*