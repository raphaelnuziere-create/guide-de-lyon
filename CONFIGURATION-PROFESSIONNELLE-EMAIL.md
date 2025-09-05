# 🎯 Configuration Professionnelle Email : contact@guide-de-lyon.fr

## 📋 Vue d'ensemble
Pour utiliser `contact@guide-de-lyon.fr` sans posséder de boîte email, nous allons **authentifier le domaine entier**. Cela permet d'envoyer depuis n'importe quelle adresse @guide-de-lyon.fr via Brevo.

---

## ÉTAPE 1 : Authentification du domaine dans Brevo (5 min)

### 1.1 Accéder à l'authentification

1. Connectez-vous à [app.brevo.com](https://app.brevo.com)
2. Allez dans : **Settings** → **Senders & IP**
3. Cliquez sur **"Authenticate your domain"**
4. Entrez : `guide-de-lyon.fr` (sans www)
5. Cliquez **"Authenticate this domain"**

### 1.2 Récupérer les enregistrements

Brevo va vous donner **4 enregistrements DNS** à ajouter :

#### Enregistrement 1 - DKIM (Signature)
```
Type : TXT
Nom : mail._domainkey
Valeur : k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDeMVIzrCa3T14JGkZ... [longue chaîne]
```

#### Enregistrement 2 - DKIM Backup
```
Type : TXT
Nom : mail2._domainkey
Valeur : k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7vzkcqH... [longue chaîne]
```

#### Enregistrement 3 - SPF (Autorisation Brevo)
```
Type : TXT
Nom : @ (ou laisser vide)
Valeur : v=spf1 include:spf.brevo.com mx ~all
```

#### Enregistrement 4 - Brevo Code (Vérification propriété)
```
Type : TXT
Nom : brevo-code
Valeur : brevo-code:xxxxxxxxxxxxxx [code unique donné par Brevo]
```

⚠️ **IMPORTANT** : Copiez ces valeurs dans un document, vous en aurez besoin !

---

## ÉTAPE 2 : Configuration DNS dans OVH (10 min)

### 2.1 Accéder à la zone DNS

1. Connectez-vous à [OVH Manager](https://www.ovh.com/manager)
2. Dans le menu : **Web Cloud** → **Noms de domaine**
3. Sélectionnez : `guide-de-lyon.fr`
4. Cliquez sur l'onglet : **Zone DNS**

### 2.2 Ajouter les enregistrements

Pour chaque enregistrement, cliquez sur **"Ajouter une entrée"** :

#### 📝 Enregistrement DKIM 1
```
Type : TXT
Sous-domaine : mail._domainkey
TTL : Par défaut
Cible : "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDeMVIzrCa3T14JGkZ..."
```
⚠️ **Mettez la valeur entre guillemets**

#### 📝 Enregistrement DKIM 2
```
Type : TXT
Sous-domaine : mail2._domainkey
TTL : Par défaut
Cible : "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7vzkcqH..."
```

#### 📝 Enregistrement SPF
```
Type : TXT
Sous-domaine : (laisser vide)
TTL : Par défaut
Cible : "v=spf1 include:spf.brevo.com mx ~all"
```

#### 📝 Brevo Code
```
Type : TXT
Sous-domaine : brevo-code
TTL : Par défaut
Cible : "brevo-code:xxxxxxxxxxxxxx"
```

### 2.3 Sauvegarder

Après avoir ajouté les 4 enregistrements :
1. Cliquez sur **"Suivant"**
2. Vérifiez le récapitulatif
3. Cliquez sur **"Valider"**

⏱️ **Propagation DNS** : 5 minutes à 24 heures (généralement 1 heure)

---

## ÉTAPE 3 : Configuration DMARC (Protection anti-phishing) - RECOMMANDÉ

Ajoutez cet enregistrement pour une protection maximale :

```
Type : TXT
Sous-domaine : _dmarc
TTL : Par défaut
Cible : "v=DMARC1; p=none; rua=mailto:dmarc-reports@guide-de-lyon.fr; pct=100; sp=none"
```

Cela permet de :
- Recevoir des rapports sur l'utilisation de votre domaine
- Protéger contre le phishing
- Améliorer la délivrabilité

---

## ÉTAPE 4 : Vérification dans Brevo

### 4.1 Attendre la propagation

Attendez **1 heure minimum** après avoir ajouté les DNS.

### 4.2 Vérifier l'authentification

1. Retournez dans Brevo : **Settings** → **Senders & IP**
2. Votre domaine `guide-de-lyon.fr` devrait avoir :
   - ✅ **Authenticated** en vert
   - ✅ SPF : Valid
   - ✅ DKIM : Valid

Si ❌ rouge, attendez encore ou vérifiez les DNS.

### 4.3 Activer l'expéditeur

Une fois authentifié :
1. **Settings** → **Senders**
2. **Add a new sender**
3. Email : `contact@guide-de-lyon.fr`
4. Name : `Guide de Lyon`
5. **Pas besoin de validation email** car le domaine est authentifié !

---

## ÉTAPE 5 : Mise à jour de la configuration

### 5.1 Dans .env.local

```bash
BREVO_SENDER_EMAIL=contact@guide-de-lyon.fr
BREVO_SENDER_NAME=Guide de Lyon
```

### 5.2 Sur Vercel

1. [Vercel Dashboard](https://vercel.com/dashboard)
2. Votre projet → **Settings** → **Environment Variables**
3. Modifiez `BREVO_SENDER_EMAIL` → `contact@guide-de-lyon.fr`
4. **Save** et **Redeploy**

---

## ÉTAPE 6 : Test final

### Test avec script
```javascript
// test-pro-email.js
const brevo = require('@getbrevo/brevo');

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

async function testPro() {
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  
  sendSmtpEmail.subject = 'Test Email Professionnel - Guide de Lyon';
  sendSmtpEmail.htmlContent = '<h1>Email professionnel configuré !</h1>';
  sendSmtpEmail.sender = {
    name: 'Guide de Lyon',
    email: 'contact@guide-de-lyon.fr' // Email pro !
  };
  sendSmtpEmail.to = [{ 
    email: 'raphael.nuziere@gmail.com' // Votre Gmail pour recevoir
  }];
  
  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email professionnel envoyé !');
  } catch (error) {
    console.error('❌ Erreur:', error.response?.text);
  }
}

testPro();
```

---

## 🎯 Résumé des actions

### ✅ À faire maintenant (15 min) :

1. **Brevo** : Authenticate your domain → Copier les 4 enregistrements
2. **OVH** : Ajouter les 4 enregistrements TXT dans la zone DNS
3. **Attendre** : 1 heure pour la propagation
4. **Brevo** : Vérifier que le domaine est ✅ Authenticated
5. **Ajouter** : contact@guide-de-lyon.fr comme sender
6. **Tester** : Envoyer un email depuis le dashboard

### 📊 Résultat attendu :

- ✅ Emails envoyés depuis `contact@guide-de-lyon.fr`
- ✅ Pas besoin de boîte email OVH
- ✅ Meilleure délivrabilité (SPF + DKIM + DMARC)
- ✅ Look professionnel
- ✅ Protection anti-phishing

---

## 🆘 Dépannage

### "Domain not authenticated" après 24h

**Vérifiez les DNS** avec : https://mxtoolbox.com/SuperTool.aspx
1. Entrez : `guide-de-lyon.fr`
2. Choisissez : TXT Lookup
3. Vérifiez que vous voyez les enregistrements

### "Invalid DKIM"

- Les valeurs DKIM doivent être **entre guillemets** dans OVH
- Pas d'espaces avant/après
- Copier-coller exact depuis Brevo

### "SPF already exists"

Si vous avez déjà un SPF, **fusionnez-les** :
```
v=spf1 include:spf.brevo.com include:autre.service.com mx ~all
```

---

## 💡 Alternative temporaire

En attendant la propagation DNS, utilisez :
```bash
BREVO_SENDER_EMAIL=noreply@guide-de-lyon.fr
# ou
BREVO_SENDER_EMAIL=info@guide-de-lyon.fr
```

Une fois le domaine authentifié, toutes ces adresses fonctionneront !

---

## 📞 Support

- **Brevo Support** : support@brevo.com
- **OVH Support** : Via manager OVH (ticket)
- **Vérification DNS** : https://mxtoolbox.com

Avec cette configuration, vous aurez un système email **100% professionnel** ! 🚀