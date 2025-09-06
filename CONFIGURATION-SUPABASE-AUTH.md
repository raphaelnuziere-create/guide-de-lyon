# 🔧 Configuration Supabase Authentication

## ⚠️ ACTION REQUISE : Configurer les URLs de redirection

### 1️⃣ Aller sur Supabase Dashboard
👉 https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/url-configuration

### 2️⃣ Modifier les Redirect URLs

Dans la section **Redirect URLs**, ajouter ces URLs :

```
https://www.guide-de-lyon.fr/auth/callback
http://localhost:3000/auth/callback
```

### 3️⃣ Modifier le Site URL

Dans **Site URL**, mettre :
```
https://www.guide-de-lyon.fr
```

### 4️⃣ Email Templates (optionnel mais recommandé)

Aller dans **Email Templates** et modifier le template "Confirm signup" :

Remplacer le lien :
```
{{ .ConfirmationURL }}
```

Par :
```
https://www.guide-de-lyon.fr/auth/callback?token={{ .Token }}&type=signup
```

## 📝 Explication

Les emails de confirmation utilisent actuellement l'URL Supabase par défaut qui ne gère pas correctement la redirection. Notre nouvelle route `/auth/callback` va :

1. Recevoir le token de confirmation
2. Valider le token avec Supabase
3. Rediriger vers `/pro/dashboard` après succès

## ✅ Résultat attendu

Après ces changements :
- Les nouveaux inscrits recevront un email
- Le clic sur le lien confirmera leur compte
- Ils seront automatiquement redirigés vers leur dashboard

## 🚀 Déploiement

Les modifications du code sont déjà déployées. Il faut juste configurer Supabase.