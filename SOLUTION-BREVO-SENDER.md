# 🚨 SOLUTION : Erreur "Sender not valid" Brevo

## ❌ Le problème
```
Sending has been rejected because the sender you used 
contact@guide-de-lyon.fr is not valid
```

## ✅ SOLUTION IMMÉDIATE (2 minutes)

### Option 1 : Utiliser votre email Gmail (RECOMMANDÉ)

#### Étape 1 : Modifier .env.local
```bash
# Remplacez cette ligne :
BREVO_SENDER_EMAIL=contact@guide-de-lyon.fr

# Par :
BREVO_SENDER_EMAIL=raphaelnuziere@gmail.com
```

#### Étape 2 : Ajouter votre email dans Brevo

1. Allez sur [app.brevo.com](https://app.brevo.com)
2. **Settings** → **Senders**
3. Cliquez **"Add a new sender"**
4. Remplissez :
   - Email : `raphaelnuziere@gmail.com`
   - Name : `Guide de Lyon`
5. **Save**
6. **Vérifiez votre boîte Gmail** pour confirmer

#### Étape 3 : Mettre à jour sur Vercel

1. [Vercel Dashboard](https://vercel.com/dashboard)
2. Votre projet → **Settings** → **Environment Variables**
3. Modifiez `BREVO_SENDER_EMAIL` → `raphaelnuziere@gmail.com`
4. **Save**

---

## Option 2 : Valider le domaine guide-de-lyon.fr (Plus long)

### SI vous avez accès à contact@guide-de-lyon.fr :

#### Étape 1 : Ajouter l'email dans Brevo
1. **Settings** → **Senders** → **Add sender**
2. Email : `contact@guide-de-lyon.fr`
3. Brevo enverra un email de vérification

#### Étape 2 : Créer l'email dans OVH
1. OVH Manager → **Emails** → **Créer une adresse**
2. Créez : `contact@guide-de-lyon.fr`
3. Récupérez l'email de Brevo
4. Cliquez sur le lien de confirmation

### SI vous N'AVEZ PAS cet email :

#### Authentifier le domaine complet

1. Dans Brevo : **Settings** → **Senders & IP**
2. Cliquez **"Authenticate your domain"**
3. Entrez : `guide-de-lyon.fr`
4. Brevo vous donnera 3 enregistrements DNS

#### Dans OVH Manager :

Ajoutez ces 3 enregistrements TXT :

**Enregistrement 1 (DKIM) :**
```
Type : TXT
Sous-domaine : mail._domainkey
Valeur : k=rsa; p=MIGfMA0GCS... [valeur donnée par Brevo]
```

**Enregistrement 2 (DKIM2) :**
```
Type : TXT
Sous-domaine : mail2._domainkey  
Valeur : k=rsa; p=MIGfMA0GCS... [valeur donnée par Brevo]
```

**Enregistrement 3 (DMARC) :**
```
Type : TXT
Sous-domaine : _dmarc
Valeur : v=DMARC1; p=none; rua=mailto:dmarc@guide-de-lyon.fr
```

**Attendez 24h** puis vérifiez dans Brevo.

---

## 🚀 SOLUTION RAPIDE MAINTENANT

```bash
# 1. Changez dans .env.local
BREVO_SENDER_EMAIL=raphaelnuziere@gmail.com

# 2. Testez localement
npm run dev
# Allez sur http://localhost:3000/admin/emails

# 3. Si ça marche, committez
git add .env.local
git commit -m "Fix: Utilisation email validé pour Brevo"
git push
```

---

## 📝 Script de test avec votre email

Créez `test-email-gmail.js` :

```javascript
const brevo = require('@getbrevo/brevo');

// Configuration
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

async function sendTest() {
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  
  sendSmtpEmail.subject = 'Test Gmail - Guide de Lyon';
  sendSmtpEmail.htmlContent = '<h1>Test réussi !</h1><p>Les emails fonctionnent avec Gmail.</p>';
  sendSmtpEmail.sender = {
    name: 'Guide de Lyon',
    email: 'raphaelnuziere@gmail.com' // VOTRE EMAIL
  };
  sendSmtpEmail.to = [{ 
    email: 'raphaelnuziere@gmail.com',
    name: 'Test'
  }];
  
  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email envoyé !', result);
  } catch (error) {
    console.error('❌ Erreur:', error.response?.text || error.message);
  }
}

sendTest();
```

Exécutez :
```bash
node test-email-gmail.js
```

---

## ✅ Résumé : QUE FAIRE MAINTENANT

### Le plus simple (2 min) :
1. **Changez** `BREVO_SENDER_EMAIL` → votre Gmail
2. **Ajoutez** votre Gmail dans Brevo Senders
3. **Testez** sur /admin/emails

### Alternative :
- Créez vraiment `contact@guide-de-lyon.fr` dans OVH
- Ou authentifiez le domaine complet (24h d'attente)

**L'erreur vient du fait que Brevo ne reconnaît pas `contact@guide-de-lyon.fr` comme validé.**

Utilisez votre Gmail pour l'instant, ça marchera immédiatement ! 🚀