import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase-client';
import { supabase } from '@/lib/supabase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role: 'user' | 'merchant' | 'admin';
  merchantId?: string;
  plan?: 'free' | 'pro_visibility' | 'pro_boost';
}

class AuthService {
  private currentUser: AuthUser | null = null;

  // Initialiser l'écouteur d'auth
  init(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        this.currentUser = await this.enrichUserData(firebaseUser);
        callback(this.currentUser);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  // Enrichir les données utilisateur avec Firestore
  private async enrichUserData(firebaseUser: User): Promise<AuthUser> {
    const userDoc = await getDoc(doc(firebaseDb, 'users', firebaseUser.uid));
    const userData = userDoc.data();

    // Vérifier si c'est un merchant
    let merchantData = null;
    if (userData?.role === 'merchant' || userData?.isMerchant) {
      try {
        // Récupérer depuis Supabase pour l'instant (migration progressive)
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', firebaseUser.uid)
          .single();
        merchantData = data;
      } catch (error) {
        console.log('Merchant data not found in Supabase');
      }
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || userData?.displayName,
      photoURL: firebaseUser.photoURL || userData?.photoURL,
      emailVerified: firebaseUser.emailVerified,
      role: userData?.role || 'user',
      merchantId: merchantData?.id,
      plan: merchantData?.plan
    };
  }

  // Inscription merchant
  async registerMerchant(
    email: string, 
    password: string, 
    companyName: string, 
    phone?: string
  ): Promise<AuthUser> {
    try {
      // 1. Créer compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      // 2. Mettre à jour le profil
      await updateProfile(user, { displayName: companyName });

      // 3. Envoyer email de vérification
      await sendEmailVerification(user);

      // 4. Créer profil dans Firestore
      await setDoc(doc(firebaseDb, 'users', user.uid), {
        uid: user.uid,
        email: email,
        displayName: companyName,
        phone: phone,
        role: 'merchant',
        plan: 'free',
        createdAt: serverTimestamp(),
        emailVerified: false,
        onboardingCompleted: false
      });

      // 5. Créer aussi dans Supabase (migration progressive)
      await supabase.from('merchants').insert({
        id: user.uid,
        email: email,
        company_name: companyName,
        phone: phone,
        plan: 'free',
        created_at: new Date().toISOString()
      });

      // 6. Créer les settings merchant dans Firestore
      await setDoc(doc(firebaseDb, 'merchant_settings', user.uid), {
        companyName: companyName,
        email: email,
        phone: phone,
        notificationPrefs: {
          email: true,
          push: true,
          sms: false
        },
        businessHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '17:00', closed: false },
          sunday: { open: null, close: null, closed: true }
        },
        createdAt: serverTimestamp()
      });

      return await this.enrichUserData(user);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Inscription utilisateur standard
  async registerUser(email: string, password: string, displayName?: string): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      await sendEmailVerification(user);

      await setDoc(doc(firebaseDb, 'users', user.uid), {
        uid: user.uid,
        email: email,
        displayName: displayName || '',
        role: 'user',
        createdAt: serverTimestamp(),
        emailVerified: false
      });

      return await this.enrichUserData(user);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Connexion email/password
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      
      // Mettre à jour dernière connexion
      await setDoc(doc(firebaseDb, 'users', userCredential.user.uid), {
        lastLogin: serverTimestamp()
      }, { merge: true });

      return await this.enrichUserData(userCredential.user);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Connexion Google
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      // Vérifier si l'utilisateur existe déjà
      const userDoc = await getDoc(doc(firebaseDb, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Créer le profil s'il n'existe pas
        await setDoc(doc(firebaseDb, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: 'user',
          createdAt: serverTimestamp(),
          emailVerified: true,
          provider: 'google'
        });
      } else {
        // Mettre à jour dernière connexion
        await setDoc(doc(firebaseDb, 'users', user.uid), {
          lastLogin: serverTimestamp()
        }, { merge: true });
      }

      return await this.enrichUserData(user);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Déconnexion
  async signOut(): Promise<void> {
    try {
      await signOut(firebaseAuth);
      
      // Aussi déconnecter de Supabase
      await supabase.auth.signOut();
      
      this.currentUser = null;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Réinitialisation mot de passe
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Vérifier le rôle
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  // Vérifier si merchant
  isMerchant(): boolean {
    return this.currentUser?.role === 'merchant';
  }

  // Vérifier si admin
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  // Gestion des erreurs Firebase Auth
  private handleAuthError(error: any): Error {
    const errorMessages: { [key: string]: string } = {
      'auth/email-already-in-use': 'Cette adresse email est déjà utilisée',
      'auth/invalid-email': 'Adresse email invalide',
      'auth/operation-not-allowed': 'Opération non autorisée',
      'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
      'auth/user-disabled': 'Ce compte a été désactivé',
      'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard',
      'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion',
      'auth/popup-closed-by-user': 'La fenêtre de connexion a été fermée',
      'auth/cancelled-popup-request': 'Une autre fenêtre de connexion est déjà ouverte',
      'auth/popup-blocked': 'La fenêtre de connexion a été bloquée par le navigateur'
    };

    const message = errorMessages[error.code] || error.message || 'Une erreur est survenue';
    return new Error(message);
  }
}

// Export singleton
export const authService = new AuthService();