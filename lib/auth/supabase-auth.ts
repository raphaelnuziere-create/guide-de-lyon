import { supabase } from '@/lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'merchant' | 'admin';
  displayName?: string;
  avatarUrl?: string;
  merchantData?: {
    companyName: string;
    phone?: string;
    plan: 'free' | 'pro_visibility' | 'pro_boost';
    verified: boolean;
    settings?: any;
  };
}

class SupabaseAuthService {
  /**
   * Inscription d'un professionnel (merchant)
   */
  async signUpMerchant(
    email: string,
    password: string,
    companyName: string,
    phone?: string
  ): Promise<AuthUser> {
    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: companyName,
            role: 'merchant'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      // 1.5 IMPORTANT: Se connecter automatiquement après inscription
      console.log('🔐 Connexion automatique après inscription...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('⚠️ Connexion automatique échouée:', signInError);
      } else {
        console.log('✅ Connexion automatique réussie');
      }

      // 2. Créer le profil merchant
      const { error: merchantError } = await supabase
        .from('merchants')
        .insert({
          id: authData.user.id,
          company_name: companyName,
          email,
          phone,
          plan: 'free',
          verified: false
        });

      if (merchantError) {
        console.error('Erreur création merchant:', merchantError);
        // On continue quand même, le profil sera créé plus tard si besoin
      }

      return {
        id: authData.user.id,
        email: authData.user.email!,
        role: 'merchant',
        displayName: companyName,
        merchantData: {
          companyName,
          phone,
          plan: 'free',
          verified: false
        }
      };
    } catch (error: any) {
      console.error('Erreur inscription merchant:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Inscription d'un utilisateur standard
   */
  async signUpUser(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
            role: 'user'
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Erreur lors de la création du compte');

      return {
        id: data.user.id,
        email: data.user.email!,
        role: 'user',
        displayName: displayName || email.split('@')[0]
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Connexion email/password
   */
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('Erreur de connexion');

      // Récupérer le profil complet
      const profile = await this.getProfile(data.user.id);
      return profile;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Récupérer le profil complet d'un utilisateur
   */
  async getProfile(userId: string): Promise<AuthUser> {
    try {
      // Récupérer le profil de base
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Erreur récupération profil:', profileError);
        // Retourner des données minimales
        const { data: { user } } = await supabase.auth.getUser();
        return {
          id: userId,
          email: user?.email || '',
          role: 'user'
        };
      }

      // Si c'est un merchant, récupérer ses données
      let merchantData = undefined;
      if (profile.role === 'merchant') {
        const { data: merchant } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', userId)
          .single();

        if (merchant) {
          merchantData = {
            companyName: merchant.company_name,
            phone: merchant.phone,
            plan: merchant.plan,
            verified: merchant.verified,
            settings: merchant.settings
          };
        }
      }

      return {
        id: profile.id,
        email: profile.email || '',
        role: profile.role,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        merchantData
      };
    } catch (error: any) {
      console.error('Erreur getProfile:', error);
      throw error;
    }
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      return await this.getProfile(user.id);
    } catch (error) {
      console.error('Erreur getCurrentUser:', error);
      return null;
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  /**
   * Réinitialiser le mot de passe
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw this.handleAuthError(error);
  }

  /**
   * Mettre à jour le mot de passe
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw this.handleAuthError(error);
  }

  /**
   * Gestion des erreurs Supabase Auth
   */
  private handleAuthError(error: any): Error {
    const errorMessages: { [key: string]: string } = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
      'User already registered': 'Un compte existe déjà avec cet email',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
      'Invalid email': 'Adresse email invalide',
      'User not found': 'Aucun compte trouvé avec cet email',
      'Email rate limit exceeded': 'Trop de tentatives. Veuillez réessayer plus tard'
    };

    const message = errorMessages[error.message] || error.message || 'Une erreur est survenue';
    return new Error(message);
  }

  /**
   * Créer les comptes de test (pour le développement)
   */
  async createTestAccounts() {
    try {
      // Créer le compte admin
      const adminEmail = 'admin@guide-de-lyon.fr';
      const adminPassword = 'Admin2025!';
      
      // Vérifier si le compte existe déjà
      const { data: adminExists } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', (await supabase.auth.signInWithPassword({ 
          email: adminEmail, 
          password: adminPassword 
        })).data?.user?.id || '')
        .single();

      if (!adminExists) {
        const { data: adminData } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: {
            data: {
              display_name: 'Administrateur',
              role: 'admin'
            }
          }
        });

        if (adminData.user) {
          // Mettre à jour le rôle en admin
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', adminData.user.id);
        }
      }

      // Créer le compte merchant de test
      const merchantEmail = 'merchant@guide-de-lyon.fr';
      const merchantPassword = 'Merchant2025!';
      
      const { data: merchantExists } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', (await supabase.auth.signInWithPassword({ 
          email: merchantEmail, 
          password: merchantPassword 
        })).data?.user?.id || '')
        .single();

      if (!merchantExists) {
        await this.signUpMerchant(
          merchantEmail,
          merchantPassword,
          'Restaurant Test Lyon',
          '04 78 12 34 56'
        );
      }

      console.log('Comptes de test créés avec succès');
    } catch (error) {
      console.error('Erreur création comptes test:', error);
    }
  }
}

// Export singleton
export const supabaseAuth = new SupabaseAuthService();