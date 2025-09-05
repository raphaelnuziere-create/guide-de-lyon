import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialiser Firebase Admin SDK
if (!getApps().length) {
  try {
    // Les clés doivent être dans les variables d'environnement
    const serviceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    initializeApp({
      credential: cert(serviceAccount as any),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    
    // Fallback: utiliser l'app par défaut si déjà configurée
    if (!getApps().length) {
      initializeApp();
    }
  }
}

export const firebaseAdmin = {
  auth: () => getAuth(),
  firestore: () => getFirestore(),
};