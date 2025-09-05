// Authentification simplifiée pour résoudre les problèmes de production
// Cette version utilise localStorage au lieu de Firebase temporairement

export const simpleAuth = {
  // Comptes de test hardcodés
  testAccounts: {
    admin: {
      email: 'admin@guide-de-lyon.fr',
      password: 'Admin2025!',
      role: 'admin',
      displayName: 'Administrateur'
    },
    merchant: {
      email: 'merchant@guide-de-lyon.fr',
      password: 'Merchant2025!',
      role: 'merchant',
      displayName: 'Restaurant Test'
    }
  },

  // Connexion simplifiée
  async signIn(email: string, password: string) {
    console.log('[SimpleAuth] Tentative de connexion:', email);
    
    // Vérifier les comptes de test
    for (const [key, account] of Object.entries(this.testAccounts)) {
      if (account.email === email && account.password === password) {
        console.log('[SimpleAuth] Connexion réussie avec compte test:', key);
        
        // Sauvegarder dans localStorage
        const user = {
          uid: key,
          email: account.email,
          role: account.role,
          displayName: account.displayName
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-user', JSON.stringify(user));
          localStorage.setItem('auth-token', 'test-token-' + key);
        }
        
        return user;
      }
    }
    
    throw new Error('Email ou mot de passe incorrect');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('auth-user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('[SimpleAuth] Erreur parsing user:', error);
      return null;
    }
  },

  // Déconnexion
  async signOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-token');
    }
  },

  // Vérifier si connecté
  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  // Vérifier le rôle
  hasRole(role: string) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
};