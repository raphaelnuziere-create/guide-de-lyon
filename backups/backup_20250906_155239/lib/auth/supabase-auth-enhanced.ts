/**
 * Version améliorée du service d'authentification Supabase
 * Gère automatiquement les problèmes d'envoi d'emails
 */

import { supabase } from '@/lib/supabase';
import { AuthUser, LoginCredentials, SignUpData } from './types';

export class EnhancedSupabaseAuthService {
  /**
   * Inscription d'un merchant avec gestion intelligente de la confirmation
   */
  async signUpMerchant(
    email: string,
    password: string,
    companyName: string,
    phone?: string
  ): Promise<AuthUser & { needsEmailConfirmation: boolean }> {
    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'merchant',
            company_name: companyName,
            phone: phone
          },
          // En production, on laisse Supabase gérer l'email
          // En dev, on peut forcer la confirmation
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

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
      }

      // 3. Vérifier si l'email nécessite une confirmation
      const needsConfirmation = !authData.user.email_confirmed_at;

      // 4. En développement ou si configuré, auto-confirmer
      if (needsConfirmation && this.shouldAutoConfirm()) {
        await this.autoConfirmEmail(authData.user.id);
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
          },
          needsEmailConfirmation: false
        };
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
        },
        needsEmailConfirmation: needsConfirmation
      };
    } catch (error: any) {
      console.error('Erreur inscription merchant:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Auto-confirmer un email (pour dev ou admin)
   */
  private async autoConfirmEmail(userId: string): Promise<void> {
    try {
      // Cette fonction nécessite les droits admin/service_role
      // En production, elle ne fonctionnera que si configurée
      console.log('Auto-confirmation de l\'email pour l\'utilisateur:', userId);
      
      // Note: Cette opération nécessite la clé service_role
      // qui ne doit JAMAIS être exposée côté client
      // C'est pourquoi on utilise une API route pour ça
      
      const response = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        console.warn('Auto-confirmation non disponible');
      }
    } catch (error) {
      console.warn('Auto-confirmation échouée:', error);
    }
  }

  /**
   * Vérifier si on doit auto-confirmer les emails
   */
  private shouldAutoConfirm(): boolean {
    // En développement local
    if (window.location.hostname === 'localhost') {
      return true;
    }
    
    // Si configuré dans l'environnement
    if (process.env.NEXT_PUBLIC_AUTO_CONFIRM_EMAIL === 'true') {
      return true;
    }

    return false;
  }

  /**
   * Connexion avec gestion des comptes non confirmés
   */
  async signIn({ email, password }: LoginCredentials): Promise<AuthUser> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Gérer spécifiquement l'erreur de compte non confirmé
        if (error.message.includes('Email not confirmed')) {
          throw new Error(
            'Votre email n\'est pas encore confirmé. ' +
            'Vérifiez votre boîte de réception (et les spams). ' +
            'Si vous n\'avez pas reçu l\'email, contactez le support.'
          );
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('Erreur de connexion');
      }

      // Récupérer le profil utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, display_name')
        .eq('id', data.user.id)
        .single();

      const role = profile?.role || 'user';

      // Si c'est un merchant, récupérer ses données
      let merchantData = null;
      if (role === 'merchant') {
        const { data: merchant } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        merchantData = merchant;
      }

      return {
        id: data.user.id,
        email: data.user.email!,
        role: role as 'admin' | 'merchant' | 'user',
        displayName: profile?.display_name || data.user.email!.split('@')[0],
        merchantData
      };
    } catch (error: any) {
      console.error('Erreur connexion:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Renvoyer un email de confirmation
   */
  async resendConfirmationEmail(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur renvoi email:', error);
      throw new Error('Impossible de renvoyer l\'email de confirmation');
    }
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleAuthError(error: any): Error {
    const message = error.message || 'Une erreur est survenue';
    
    // Messages d'erreur personnalisés
    const errorMessages: Record<string, string> = {
      'User already registered': 'Cet email est déjà utilisé',
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
      'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères'
    };

    return new Error(errorMessages[message] || message);
  }
}

export const enhancedAuthService = new EnhancedSupabaseAuthService();