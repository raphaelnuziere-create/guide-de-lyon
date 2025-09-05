# 🏗️ Architecture Supabase - Guide de Lyon

## 📌 Vue d'ensemble
Le site utilise **UNIQUEMENT Supabase** pour l'authentification et la base de données.
Pas de Firebase, pas d'autre système d'auth.

## 🔐 Authentification (Supabase Auth)

### Pages d'authentification :
- **`/pro/inscription`** - Inscription des professionnels
- **`/connexion/pro`** - Connexion des professionnels  
- **`/auth/reset-password`** - Réinitialisation du mot de passe
- **`/pro/dashboard`** - Dashboard après connexion

### Flux d'inscription :
1. Le professionnel va sur `/pro` (page de vente)
2. Il choisit son plan (Basic/Pro/Expert)
3. Il est redirigé vers `/pro/inscription?plan=xxx`
4. Il remplit le formulaire avec :
   - Infos entreprise (nom, TVA, etc.)
   - Contact et adresse
   - **Email et mot de passe pour créer son compte**
5. Supabase crée le compte utilisateur
6. L'établissement est créé dans la DB
7. L'abonnement est créé
8. Redirection vers `/connexion/pro`

### Flux de connexion :
1. Le professionnel va sur `/connexion/pro`
2. Entre son email + mot de passe
3. Supabase vérifie les identifiants
4. Si OK → redirection vers `/pro/dashboard`
5. Si pas d'établissement → redirection vers `/pro/inscription`

## 💾 Base de données (Supabase PostgreSQL)

### Tables principales :
```sql
- subscription_plans     # Les 3 plans (Basic/Pro/Expert)
- establishments        # Les établissements des pros
- subscriptions        # Les abonnements actifs
- events              # Les événements publiés
- establishment_media # Photos et vidéos
- establishment_analytics # Statistiques
- newsletter_preferences # Préférences newsletter
```

### Relations :
```
auth.users (Supabase Auth)
    ↓
establishments (1 user = 1 établissement)
    ↓
subscriptions (1 établissement = 1 abonnement)
    ↓
events, media, analytics
```

## 🛠️ Configuration requise

### Variables d'environnement (.env.local) :
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (optionnel, pour admin)
```

### Configuration Supabase Dashboard :
1. **Authentication > URL Configuration**
   - Site URL : `https://votre-site.vercel.app`
   - Redirect URLs : Ajouter toutes les URLs du site

2. **Authentication > Email Templates**
   - Reset Password : Redirect vers `/auth/reset-password`
   - Confirm Signup : Redirect vers `/auth/confirm`

## 🚀 Commandes utiles

### Backup du projet :
```bash
./scripts/backup.sh
```

### Restaurer un backup :
```bash
./scripts/restore.sh backup_20250906_014446
```

### Tester la connexion Supabase :
Sur la page `/connexion/pro`, cliquez sur "Tester DB"

## 🐛 Debugging

### Si l'inscription charge en boucle :
1. Ouvrez la console du navigateur (F12)
2. Regardez les erreurs en rouge
3. Vérifiez que l'email n'est pas déjà utilisé
4. Vérifiez que le mot de passe fait au moins 6 caractères

### Si la connexion ne fonctionne pas :
1. Cliquez sur "Tester DB" pour vérifier Supabase
2. Vérifiez que le compte existe dans Supabase Auth
3. Vérifiez que l'email est confirmé
4. Essayez "Mot de passe oublié ?"

### Si le reset password ne fonctionne pas :
1. Vérifiez les Redirect URLs dans Supabase
2. Vérifiez que l'email arrive
3. Le lien doit pointer vers `/auth/reset-password#access_token=xxx`

## 📝 Création d'un compte de test

1. Allez sur `/pro`
2. Cliquez sur "Commencer gratuitement" (plan Basic)
3. Remplissez le formulaire :
   - Email : test@example.com
   - Mot de passe : Test123!
   - TVA : FR12345678901
4. Confirmez votre email (vérifiez les spams)
5. Connectez-vous sur `/connexion/pro`

## 🔒 Sécurité

- Tous les mots de passe sont hashés par Supabase
- Row Level Security (RLS) activé sur toutes les tables
- Les utilisateurs ne peuvent voir que leurs propres données
- Validation côté serveur des données

## 📊 Plans et fonctionnalités

| Fonctionnalité | Basic (0€) | Pro (19€) | Expert (49€) |
|----------------|------------|-----------|--------------|
| Photos | 1 | 6 | 10 |
| Événements/mois | 3 (page pro) | 3 (homepage) | 5 (multi-canal) |
| Newsletter | ❌ | ✅ | ✅ |
| Réseaux sociaux | ❌ | ❌ | ✅ |
| Badge | Aucun | Pro Vérifié | Expert ⭐ |
| Statistiques | ❌ | 30 jours | 90 jours |

## ⚠️ IMPORTANT

**CE SITE N'UTILISE QUE SUPABASE**
- Pas de Firebase Auth
- Pas de Firebase Database  
- Pas d'autre système d'authentification

Toute la logique d'auth est dans :
- `/app/connexion/pro/page.tsx` (connexion)
- `/app/pro/inscription/page.tsx` (inscription)
- `/app/auth/reset-password/page.tsx` (reset)