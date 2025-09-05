// Script pour créer des comptes test
// À exécuter une seule fois pour initialiser les comptes

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

// Configuration Firebase depuis les variables d'environnement
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validation des variables d'environnement Firebase
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ ERREUR: Variables d\'environnement Firebase manquantes dans .env.local');
  console.error('Vérifiez que toutes les variables NEXT_PUBLIC_FIREBASE_* sont définies');
  process.exit(1);
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestAccounts() {
  console.log('🚀 Création des comptes test...\n');

  // Comptes à créer
  const accounts = [
    {
      email: 'admin@guide-de-lyon.fr',
      password: 'Admin2025!',
      role: 'admin',
      displayName: 'Administrateur',
      description: '🔴 Compte administrateur avec accès complet'
    },
    {
      email: 'merchant@guide-de-lyon.fr',
      password: 'Merchant2025!',
      role: 'merchant',
      displayName: 'Restaurant Test',
      companyName: 'Restaurant Paul Bocuse',
      plan: 'pro_visibility',
      description: '🟢 Compte merchant Pro Visibilité'
    },
    {
      email: 'test@guide-de-lyon.fr',
      password: 'Test2025!',
      role: 'user',
      displayName: 'Utilisateur Test',
      description: '🔵 Compte utilisateur standard'
    }
  ];

  for (const account of accounts) {
    try {
      console.log(`\nCréation du compte: ${account.email}`);
      
      // Essayer de se connecter d'abord (au cas où le compte existe déjà)
      try {
        await signInWithEmailAndPassword(auth, account.email, account.password);
        console.log(`✅ Le compte existe déjà: ${account.email}`);
      } catch (error) {
        // Le compte n'existe pas, le créer
        const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password);
        const user = userCredential.user;
        
        // Ajouter les métadonnées dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: account.email,
          displayName: account.displayName,
          role: account.role,
          companyName: account.companyName || null,
          plan: account.plan || 'free',
          createdAt: new Date().toISOString(),
          isTestAccount: true
        });

        // Si c'est un merchant, créer aussi un document merchant_settings
        if (account.role === 'merchant') {
          await setDoc(doc(db, 'merchant_settings', user.uid), {
            companyName: account.companyName,
            plan: account.plan,
            eventsThisMonth: 0,
            maxEventsPerMonth: account.plan === 'pro_boost' ? 6 : 3,
            createdAt: new Date().toISOString()
          });
        }

        console.log(`✅ Compte créé avec succès: ${account.email}`);
      }
      
      console.log(`   ${account.description}`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Mot de passe: ${account.password}`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${account.email}:`, error.message);
    }
  }

  console.log('\n========================================');
  console.log('📝 RÉCAPITULATIF DES COMPTES TEST');
  console.log('========================================\n');
  
  console.log('COMPTE ADMIN:');
  console.log('  Email: admin@guide-de-lyon.fr');
  console.log('  Password: Admin2025!');
  console.log('  Accès: /admin/login\n');
  
  console.log('COMPTE MERCHANT (Pro):');
  console.log('  Email: merchant@guide-de-lyon.fr');
  console.log('  Password: Merchant2025!');
  console.log('  Accès: /pro/login\n');
  
  console.log('COMPTE UTILISATEUR:');
  console.log('  Email: test@guide-de-lyon.fr');
  console.log('  Password: Test2025!');
  console.log('  Accès: /login\n');
  
  console.log('========================================');
  console.log('✨ Script terminé!');
  process.exit(0);
}

// Exécuter le script
createTestAccounts().catch((error) => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});