# Flow d'authentification Professionnel - Guide de Lyon

## Structure des pages

### Pages d'authentification (`/app/auth/pro/`)
- **`/auth/pro/inscription`** : Création de compte utilisateur
- **`/auth/pro/connexion`** : Connexion utilisateur existant
- **`/auth/callback`** : Route de callback Supabase

### Pages professionnelles (`/app/pro/`)
- **`/pro/inscription`** : Création d'établissement (après connexion)
- **`/pro/dashboard`** : Tableau de bord (nécessite compte + établissement)

## Flow complet

### 1. Nouvelle inscription
```
1. Utilisateur arrive sur /auth/pro/inscription
2. Remplit le formulaire (email + mot de passe)
3. Supabase envoie un email de confirmation
4. Utilisateur clique sur le lien dans l'email
5. Callback → /auth/pro/connexion?confirmed=true
6. Message de succès affiché
7. Utilisateur se connecte
8. Redirection → /pro/inscription (création établissement)
9. Remplit les infos établissement
10. Redirection → /pro/dashboard
```

### 2. Connexion utilisateur existant AVEC établissement
```
1. Utilisateur arrive sur /auth/pro/connexion
2. Entre ses identifiants
3. Système vérifie : a-t-il un établissement ?
4. OUI → Redirection vers /pro/dashboard
```

### 3. Connexion utilisateur existant SANS établissement
```
1. Utilisateur arrive sur /auth/pro/connexion
2. Entre ses identifiants
3. Système vérifie : a-t-il un établissement ?
4. NON → Redirection vers /pro/inscription
```

## Points clés corrigés

✅ **Pas de boucle infinie** : La page `/auth/pro/inscription` ne redirige plus automatiquement après inscription

✅ **Confirmation email** : L'utilisateur doit confirmer son email avant de pouvoir se connecter

✅ **Séparation claire** :
- `/auth/pro/*` = Gestion compte utilisateur (auth)
- `/pro/*` = Gestion établissement (après auth)

✅ **Client Supabase centralisé** : `/app/lib/supabase/client.ts` avec helpers

## Vérifications Supabase Dashboard

Assurez-vous que dans Supabase Dashboard :

1. **Email Templates** : Le template de confirmation pointe vers `/auth/callback`
2. **URL Configuration** : Site URL = `https://www.guide-de-lyon.fr`
3. **Redirect URLs** : Ajouter `https://www.guide-de-lyon.fr/auth/callback`

## Test du flow

Pour tester :
1. Créer un nouveau compte sur `/auth/pro/inscription`
2. Vérifier l'email de confirmation
3. Cliquer sur le lien
4. Se connecter sur `/auth/pro/connexion`
5. Créer l'établissement sur `/pro/inscription`
6. Accéder au dashboard sur `/pro/dashboard`