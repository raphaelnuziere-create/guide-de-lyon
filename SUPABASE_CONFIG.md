# 🔧 Configuration Supabase pour les emails

## ⚠️ IMPORTANT - À faire dans Supabase Dashboard

### 1. Configurer l'URL du site en production

1. **Connectez-vous à Supabase** : https://supabase.com
2. Allez dans votre projet
3. Cliquez sur **Authentication** (dans le menu de gauche)
4. Cliquez sur **URL Configuration**
5. Modifiez ces champs :

```
Site URL: https://www.guide-de-lyon.fr
Redirect URLs: 
- https://www.guide-de-lyon.fr/auth/confirm
- https://www.guide-de-lyon.fr/professionnel/dashboard
- https://www.guide-de-lyon.fr/connexion/pro
- http://localhost:3000/auth/confirm (pour le dev local)
```

6. Cliquez sur **Save**

### 2. Personnaliser les emails de confirmation

1. Dans **Authentication** > **Email Templates**
2. Modifiez le template **Confirm signup** :

```html
<h2>Confirmez votre inscription sur Guide de Lyon</h2>
<p>Bonjour,</p>
<p>Merci de vous être inscrit sur Guide de Lyon !</p>
<p>Cliquez sur le lien ci-dessous pour confirmer votre email :</p>
<p><a href="{{ .ConfirmationURL }}">Confirmer mon email</a></p>
<p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
<p>Cordialement,<br>L'équipe Guide de Lyon</p>
```

3. **IMPORTANT** : Dans **Email Settings**, vérifiez que :
   - **Enable email confirmations** est activé ✅
   - **Confirmation email redirect URL** : `https://www.guide-de-lyon.fr/auth/confirm`

### 3. Configurer le domaine d'envoi (optionnel mais recommandé)

Pour éviter que les emails arrivent dans les spams :

1. Dans **Authentication** > **SMTP Settings**
2. Configurez votre propre serveur SMTP (SendGrid, Mailgun, etc.)

## 📧 Flow d'inscription actuel

1. L'utilisateur s'inscrit sur `/inscription`
2. Supabase envoie un email de confirmation
3. L'utilisateur clique sur le lien dans l'email
4. Il arrive sur `/auth/confirm` avec le token
5. La page valide automatiquement et redirige vers `/professionnel/dashboard`

## 🔍 Vérification

### Pour tester en local :
1. Inscrivez-vous avec un email valide
2. Vérifiez l'email (attention aux spams)
3. Le lien devrait pointer vers `https://www.guide-de-lyon.fr/auth/confirm#access_token=...`

### Si le lien pointe toujours vers localhost :
1. Vérifiez que vous avez bien sauvegardé dans Supabase
2. Attendez 2-3 minutes (cache)
3. Réessayez une nouvelle inscription

## 🐛 Problèmes courants

### "Site URL not allowed"
→ Ajoutez l'URL dans Redirect URLs dans Supabase

### Email dans les spams
→ Configurez un serveur SMTP personnalisé

### Lien de confirmation expire
→ Par défaut, les liens expirent après 1 heure. Modifiable dans Supabase > Auth > Settings

## ✅ Configuration terminée !

Une fois ces étapes faites, les inscriptions fonctionneront parfaitement avec :
- Email de confirmation envoyé automatiquement
- Lien pointant vers le bon domaine
- Confirmation automatique au clic
- Redirection vers le dashboard