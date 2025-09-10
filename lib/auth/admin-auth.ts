/**
 * Système d'authentification admin sécurisé
 * Utilise des identifiants en dur dans les variables d'environnement
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AdminUser {
  email: string;
  role: 'admin';
  loginAt: string;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET || 'guide-lyon-admin-secret-key-2024';
const COOKIE_NAME = 'admin-session';

/**
 * Vérifie les identifiants admin
 */
export function validateAdminCredentials(email: string, password: string): boolean {
  // Identifiants de fallback si les variables d'env ne sont pas configurées
  const FALLBACK_EMAIL = 'raphael.nuziere@yahoo.com';
  const FALLBACK_PASSWORD = 'Admin20?';
  
  // Utiliser les variables d'environnement ou fallback
  const adminEmail = ADMIN_EMAIL || FALLBACK_EMAIL;
  const adminPassword = ADMIN_PASSWORD || FALLBACK_PASSWORD;
  
  console.log(`[AUTH] Variables env: ADMIN_EMAIL=${!!ADMIN_EMAIL}, ADMIN_PASSWORD=${!!ADMIN_PASSWORD}`);
  console.log(`[AUTH] Credentials: ${adminEmail} / ${adminPassword?.slice(0,3)}***`);
  console.log(`[AUTH] Tentative connexion: "${email}" vs "${adminEmail}"`);
  console.log(`[AUTH] Password match: ${password === adminPassword}`);
  
  const emailMatch = email.trim().toLowerCase() === adminEmail.toLowerCase();
  const passwordMatch = password === adminPassword;
  
  console.log(`[AUTH] Email match: ${emailMatch}, Password match: ${passwordMatch}`);
  
  return emailMatch && passwordMatch;
}

/**
 * Crée une session admin sécurisée
 */
export function createAdminSession(email: string): string {
  const adminUser: AdminUser = {
    email: email.trim().toLowerCase(),
    role: 'admin',
    loginAt: new Date().toISOString()
  };

  return jwt.sign(adminUser, JWT_SECRET, { 
    expiresIn: '24h' // Session expire après 24h
  });
}

/**
 * Vérifie la session admin depuis un cookie
 */
export function verifyAdminSession(): AdminUser | null {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const decoded = jwt.verify(sessionToken, JWT_SECRET) as AdminUser;
    
    // Vérifier que c'est bien un admin
    const adminEmail = ADMIN_EMAIL || 'raphael.nuziere@yahoo.com';
    if (decoded.role !== 'admin' || decoded.email !== adminEmail?.toLowerCase()) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Erreur vérification session admin:', error);
    return null;
  }
}

/**
 * Vérifie la session admin depuis un token Bearer (pour API)
 */
export function verifyAdminFromRequest(request: NextRequest): AdminUser | null {
  try {
    // Vérifier cookie d'abord
    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
    if (sessionCookie) {
      const decoded = jwt.verify(sessionCookie, JWT_SECRET) as AdminUser;
      const adminEmail = ADMIN_EMAIL || 'raphael.nuziere@yahoo.com';
      if (decoded.role === 'admin' && decoded.email === adminEmail?.toLowerCase()) {
        return decoded;
      }
    }

    // Vérifier header Authorization en backup
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as AdminUser;
      
      const adminEmail = ADMIN_EMAIL || 'raphael.nuziere@yahoo.com';
      if (decoded.role === 'admin' && decoded.email === adminEmail?.toLowerCase()) {
        return decoded;
      }
    }

    return null;
  } catch (error) {
    console.error('Erreur vérification admin request:', error);
    return null;
  }
}

/**
 * Middleware pour protéger les routes admin
 */
export function requireAdmin(request: NextRequest): Response | null {
  const admin = verifyAdminFromRequest(request);
  
  if (!admin) {
    return new Response(
      JSON.stringify({ error: 'Accès non autorisé - Admin requis' }), 
      { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
  
  return null; // OK, continuer
}

/**
 * Vérifie si les variables d'environnement admin sont configurées
 */
export function isAdminConfigured(): boolean {
  return !!(ADMIN_EMAIL && ADMIN_PASSWORD);
}

/**
 * Génère un token admin pour les requêtes côté client
 */
export function getAdminToken(): string | null {
  try {
    const cookieStore = cookies();
    return cookieStore.get(COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}