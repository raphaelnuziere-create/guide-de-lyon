# Configuration Supabase à vérifier

## 1. Dashboard Supabase → Authentication → URL Configuration

### Site URL
Doit être : `https://www.guide-de-lyon.fr`

### Redirect URLs (TRÈS IMPORTANT)
Ajouter TOUTES ces URLs :
```
https://www.guide-de-lyon.fr/auth/callback
https://guide-de-lyon.fr/auth/callback
http://localhost:3000/auth/callback
http://localhost:3001/auth/callback
```

## 2. Email Templates → Confirm signup

Vérifier que le template contient :
```html
<a href="{{ .ConfirmationURL }}">Confirmer mon email</a>
```

Le `ConfirmationURL` devrait automatiquement pointer vers `/auth/callback`

## 3. Auth Settings

- **Enable Email Confirmations** : ✅ Activé
- **Auto-confirm Users** : ❌ Désactivé (pour forcer la confirmation)

## 4. Test de debug

Pour tester le problème :

1. Aller dans Supabase Dashboard → Authentication → Users
2. Supprimer l'utilisateur test
3. Réessayer l'inscription
4. Vérifier les logs dans : Dashboard → Logs → Auth

## 5. Solution temporaire

Si le problème persiste, dans Supabase Dashboard :
- Authentication → Providers → Email
- Désactiver temporairement "Confirm email"
- Tester si la connexion fonctionne
- Si oui, le problème vient de la configuration des URLs

## 6. Variables d'environnement à vérifier

Dans `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=https://ikefyhxelzydaogrnwxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Ces valeurs doivent correspondre EXACTEMENT à celles du Dashboard Supabase.