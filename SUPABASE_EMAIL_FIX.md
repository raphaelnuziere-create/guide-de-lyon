# 🔧 RÉSOLUTION PROBLÈME EMAILS SUPABASE

## ⚠️ PROBLÈME IDENTIFIÉ
Les emails de confirmation ne sont pas envoyés. C'est un problème fréquent avec Supabase en mode gratuit.

## 🚀 SOLUTION IMMÉDIATE

### Option 1 : Confirmer manuellement (RAPIDE)
1. Exécutez `FIX_EMAIL_CONFIRMATION.sql` dans Supabase SQL Editor
2. Votre compte sera confirmé instantanément

### Option 2 : Désactiver la confirmation par email
**Dans Supabase Dashboard :**

1. Allez dans **Authentication** > **Providers** > **Email**
2. **DÉSACTIVEZ** : "Confirm email" ❌
3. Sauvegardez

Maintenant les nouveaux comptes seront confirmés automatiquement !

## 📧 POURQUOI LES EMAILS NE PARTENT PAS ?

### Causes possibles :
1. **Limite gratuite** : Supabase limite à 3 emails/heure en plan gratuit
2. **Configuration SMTP** : Pas de serveur SMTP personnalisé configuré
3. **Domaine non vérifié** : Les emails partent mais arrivent en spam

## 🛠️ SOLUTION DÉFINITIVE : Configurer un serveur SMTP

### Étape 1 : Créer un compte email gratuit
Choisissez une option :
- **Resend** (recommandé) : https://resend.com (gratuit jusqu'à 3000 emails/mois)
- **SendGrid** : https://sendgrid.com (gratuit jusqu'à 100 emails/jour)
- **Brevo** : https://www.brevo.com (gratuit jusqu'à 300 emails/jour)

### Étape 2 : Configurer dans Supabase

1. Dans Supabase, allez dans **Settings** > **Auth**
2. Scrollez jusqu'à **SMTP Settings**
3. Activez **"Enable Custom SMTP"**
4. Remplissez avec vos informations :

#### Pour Resend :
```
Host: smtp.resend.com
Port: 465
Username: resend
Password: [votre API key Resend]
Sender email: noreply@guide-de-lyon.fr
Sender name: Guide de Lyon
```

#### Pour SendGrid :
```
Host: smtp.sendgrid.net
Port: 465
Username: apikey
Password: [votre API key SendGrid]
Sender email: noreply@guide-de-lyon.fr
Sender name: Guide de Lyon
```

5. Cliquez sur **Save**

## 💡 SOLUTION TEMPORAIRE POUR LE DÉVELOPPEMENT

Je vais modifier le code pour auto-confirmer les comptes en développement :