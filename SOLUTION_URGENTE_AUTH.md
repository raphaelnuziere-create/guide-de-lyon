# 🚨 SOLUTION URGENTE - Problème OTP Expired

## Le problème
Les liens de confirmation Supabase expirent trop vite (erreur `otp_expired`).

## Solution immédiate (5 minutes)

### Option 1: DÉSACTIVER la confirmation email (temporaire)

1. Aller sur : [Supabase Dashboard](https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/providers)
2. Cliquer sur **Email** dans les providers
3. **DÉSACTIVER** "Confirm email" 
4. Sauvegarder

✅ Les utilisateurs pourront s'inscrire et se connecter immédiatement
❌ Moins sécurisé (pas de vérification email)

### Option 2: AUGMENTER la durée du token

1. Aller sur : [Supabase Dashboard - Auth Settings](https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/policies)
2. Dans **JWT Settings** :
   - JWT expiry limit : 3600 (1 heure)
3. Dans **Email Settings** :
   - OTP Expiry : 86400 (24 heures au lieu de 300 secondes)

### Option 3: Utiliser Magic Link au lieu d'OTP

1. Modifier le template email dans Supabase
2. Au lieu de `{{ .ConfirmationURL }}`, utiliser :
   ```
   {{ .SiteURL }}/auth/callback?token={{ .Token }}&type=signup
   ```

## Solution long terme

### Créer un flow custom :

1. **Inscription** → Compte créé mais inactif
2. **Email envoyé** avec token custom (durée 24h)
3. **Validation** via endpoint dédié
4. **Activation** du compte

## Test rapide

Après avoir appliqué Option 1 :

1. Va sur : https://www.guide-de-lyon.fr/test-auth
2. Inscris-toi avec un nouvel email
3. Tu devrais pouvoir te connecter directement

## Code alternatif

Si tu veux contourner temporairement, utilise :
- Endpoint : `/api/auth-pro`
- Méthode : POST
- Body : `{ email, password, action: "signup" }`

Cet endpoint essaie de confirmer automatiquement l'email si possible.