# Configuration Supabase Auth

## ⚠️ IMPORTANT : Configuration des URLs de redirection

Pour que l'authentification fonctionne correctement, vous devez configurer les URLs dans Supabase :

### 1. Allez dans votre dashboard Supabase
- URL : https://app.supabase.com
- Sélectionnez votre projet

### 2. Allez dans Authentication > URL Configuration

### 3. Configurez les URLs suivantes :

#### Site URL (URL de base)
```
https://votre-domaine.vercel.app
```
ou en local :
```
http://localhost:3000
```

#### Redirect URLs (URLs autorisées)
Ajoutez toutes ces URLs :
```
http://localhost:3000/**
https://votre-domaine.vercel.app/**
https://votre-domaine.vercel.app/auth/callback
https://votre-domaine.vercel.app/auth/reset-password
https://votre-domaine.vercel.app/connexion/pro
https://votre-domaine.vercel.app/pro/dashboard
```

### 4. Email Templates
Dans Authentication > Email Templates :

#### Pour "Reset Password" :
- Changez l'URL de redirection dans le template :
```html
<h2>Réinitialiser votre mot de passe</h2>
<p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
<p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>
```

- Dans les settings du template, assurez-vous que la Redirect URL est :
```
https://votre-domaine.vercel.app/auth/reset-password
```

#### Pour "Confirm signup" :
- Redirect URL :
```
https://votre-domaine.vercel.app/auth/confirm
```

### 5. Auth Providers
Si vous utilisez OAuth (Google, Facebook, etc.), configurez les callback URLs :
```
https://votre-domaine.vercel.app/auth/callback
```

## 🔐 Pages d'authentification disponibles

- **Connexion Pro** : `/connexion/pro`
- **Inscription Pro** : `/pro/inscription`
- **Réinitialisation** : `/auth/reset-password`
- **Dashboard Pro** : `/pro/dashboard`
- **Page de vente** : `/pro`

## 🐛 Debug

Si la connexion charge indéfiniment :
1. Vérifiez les logs dans la console du navigateur
2. Cliquez sur "Tester DB" dans la page de connexion
3. Vérifiez que les URLs sont bien configurées dans Supabase

## 📝 Comptes de test

Pour créer un compte de test :
1. Allez sur `/pro/inscription`
2. Choisissez le plan Basic (gratuit)
3. Remplissez le formulaire
4. Confirmez votre email
5. Connectez-vous sur `/connexion/pro`