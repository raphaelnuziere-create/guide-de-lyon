# 🗺️ Mapping des pages d'authentification

## ✅ PAGES CORRECTES (Supabase)

### Pour les professionnels :
- ✅ `/auth/pro/connexion` - **UTILISER CELLE-CI** pour connexion
- ✅ `/auth/pro/inscription` - **UTILISER CELLE-CI** pour inscription
- ✅ `/pro/inscription` - Création d'établissement (après connexion)
- ✅ `/pro/dashboard` - Dashboard professionnel

### Routes API :
- ✅ `/auth/callback` - Callback Supabase
- ✅ `/api/test-auth` - Test configuration
- ✅ `/api/debug-auth` - Debug authentification
- ✅ `/api/auth-pro` - API alternative sans confirmation

## ❌ PAGES OBSOLÈTES (Firebase - NE PAS UTILISER)

Ces pages utilisent Firebase/AuthContext et ne fonctionnent PAS avec Supabase :
- ❌ `/connexion/pro` → Redirige vers `/auth/pro/connexion`
- ❌ `/connexion/admin` → Ancienne page Firebase
- ❌ `/professionnel/connexion` → Ancienne page Firebase
- ❌ `/professionnel/login` → Ancienne page Firebase
- ❌ `/administration/connexion` → Ancienne page Firebase
- ❌ `/administration/login` → Ancienne page Firebase
- ❌ `/login` → Ancienne page Firebase

## 📋 URLs à utiliser :

### Inscription professionnel :
```
https://www.guide-de-lyon.fr/auth/pro/inscription
```

### Connexion professionnel :
```
https://www.guide-de-lyon.fr/auth/pro/connexion
```

### Test/Debug :
```
https://www.guide-de-lyon.fr/test-auth
```

## ⚠️ IMPORTANT

Le système utilise maintenant **Supabase** exclusivement.
Toutes les pages avec `useAuth` ou `AuthContext` sont obsolètes.