// GUIDE DE LYON - CONFIGURATION AUTH UNIFIÉE
// Générée automatiquement le 10/09/2025 23:46:50

/**
 * Configuration centralisée de l'authentification
 * 
 * Systèmes supportés:
 * - Supabase Auth (principal)
 * - Firebase Auth (legacy/compatibilité)
 * - Admin Auth (dashboard admin)
 */

// Supabase Auth (PRINCIPAL)
export { createClient } from './supabase-auth';
export type { UserProfile, AuthState } from './supabase-auth';

// Admin Auth
export { adminAuth, verifyAdminAuth } from './admin-auth';

// Firebase Auth (compatibilité legacy)
export { firebaseAuth } from './firebase-auth';

// Configuration par défaut
export const AUTH_CONFIG = {
  primary: 'supabase',
  fallback: 'firebase',
  admin: 'admin-auth',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24h
} as const;
