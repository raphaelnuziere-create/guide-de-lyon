# 🚀 Guide de Déploiement Firebase - Guide de Lyon

## ✅ Configuration Terminée

### Fichiers créés:
- ✅ `.firebaserc` - Configuration du projet
- ✅ `firebase.json` - Configuration des services  
- ✅ `firestore.rules` - Règles de sécurité Firestore
- ✅ `storage.rules` - Règles de sécurité Storage
- ✅ `firestore.indexes.json` - Index pour optimisation
- ✅ `functions/` - Cloud Functions configurées

### Services configurés:
1. **Firestore** - Base de données temps réel
2. **Storage** - Stockage fichiers/images  
3. **Functions** - Logique serveur
4. **Auth** - Authentification unifiée

## 📋 Commandes de Déploiement

### 1️⃣ Installation des dépendances Functions
```bash
cd functions
npm install
cd ..
```

### 2️⃣ Déploiement Initial Complet
```bash
# Tout déployer
firebase deploy

# Ou par service
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes  
firebase deploy --only storage:rules
firebase deploy --only functions
```

### 3️⃣ Test en Local (Emulators)
```bash
# Démarrer les émulateurs
firebase emulators:start

# Accès:
# - Firestore: http://localhost:8080
# - Auth: http://localhost:9099
# - Storage: http://localhost:9199
# - Functions: http://localhost:5001
# - UI: http://localhost:4000
```

## 🔧 Intégration dans l'Application

### Configuration Firebase (déjà dans le projet)
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
```

## 📊 Structure des Collections Firestore

### events_live (Événements temps réel)
```javascript
{
  merchantId: string,
  title: string,
  description: string,
  startDate: Timestamp,
  endDate: Timestamp,
  category: string,
  location: GeoPoint,
  status: 'draft' | 'pending' | 'published' | 'rejected',
  attendees: string[], // User IDs
  viewsCount: number,
  createdAt: Timestamp
}
```

### calendar_config (Configuration calendrier)
```javascript
{
  merchantId: string,
  availability: {
    monday: { open: string, close: string },
    // ... autres jours
  },
  bookingSettings: {
    slotDuration: number, // minutes
    maxAdvanceBooking: number, // jours
    bufferTime: number // minutes entre RDV
  }
}
```

### chat_rooms (Messagerie)
```javascript
{
  participants: string[], // [merchantId, customerId]
  lastMessage: string,
  lastMessageTime: Timestamp,
  createdAt: Timestamp
}
```

### merchant_settings (Paramètres Firebase)
```javascript
{
  displayName: string,
  photoURL: string,
  notificationPrefs: {
    email: boolean,
    push: boolean,
    sms: boolean
  },
  lastSync: Timestamp
}
```

## 🔄 Migration des Données

### Étape 1: Sync Authentification
```javascript
// Script de migration (à exécuter une fois)
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { supabase } from './lib/supabase';

async function migrateMerchants() {
  const { data: merchants } = await supabase
    .from('merchants')
    .select('*');
    
  for (const merchant of merchants) {
    try {
      // Créer user Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        merchant.email,
        'TempPassword123!' // À changer par le merchant
      );
      
      // Sync data to Firestore
      await setDoc(doc(db, 'merchant_settings', userCredential.user.uid), {
        email: merchant.email,
        companyName: merchant.company_name,
        plan: merchant.plan,
        supabaseId: merchant.id
      });
      
    } catch (error) {
      console.error('Migration error for', merchant.email, error);
    }
  }
}
```

## 🎯 Prochaines Étapes Recommandées

### Phase 1 (Cette semaine)
1. ✅ Configuration terminée
2. ⏳ Déployer les règles et functions
3. ⏳ Créer composant EventCard temps réel
4. ⏳ Implémenter upload d'images

### Phase 2 (Semaine prochaine)
1. Migration authentification
2. Module calendrier/booking
3. Chat temps réel
4. Notifications push

### Phase 3 (Dans 2 semaines)
1. Analytics dashboard
2. Modération automatique
3. Intégration Stripe via Functions
4. Optimisations performance

## 🛡️ Sécurité

### Checklist Sécurité
- ✅ Rules Firestore configurées
- ✅ Rules Storage configurées  
- ✅ Validation côté Functions
- ⏳ Rate limiting à implémenter
- ⏳ Monitoring des coûts Firebase

### Variables d'environnement à ajouter
```env
# Firebase Admin SDK (pour les Functions)
FIREBASE_ADMIN_PROJECT_ID=guide-de-lyon-b6a38
FIREBASE_ADMIN_CLIENT_EMAIL=...
FIREBASE_ADMIN_PRIVATE_KEY=...
```

## 💰 Estimation des Coûts

### Gratuit (Spark Plan)
- 1GB Firestore stockage
- 50K lectures/jour
- 20K écritures/jour
- 5GB Storage
- 125K invocations Functions/mois

### Si dépassement → Blaze Plan
- Firestore: $0.06/100K lectures
- Storage: $0.026/GB
- Functions: $0.40/million invocations

### Recommandation
Commencer avec Spark (gratuit), monitoring via Firebase Console, passage à Blaze si > 10K utilisateurs actifs.

## 📞 Support & Debug

### Debug Commands
```bash
# Logs des Functions
firebase functions:log

# Test une function locale
firebase functions:shell

# Vérifier le déploiement
firebase list
```

### Console Firebase
https://console.firebase.google.com/project/guide-de-lyon-b6a38

## ✨ Features Prêtes à Implémenter

1. **Upload d'images** - Storage configuré
2. **Chat temps réel** - Functions prêtes
3. **Événements live** - Structure Firestore OK
4. **Notifications** - Functions configurées
5. **Modération** - Fonction basique implémentée

---

*Configuration terminée avec succès ! Le système est prêt pour l'intégration Firebase.*