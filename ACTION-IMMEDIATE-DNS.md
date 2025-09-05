# 🚨 ACTION IMMÉDIATE - Configuration DNS pour contact@guide-de-lyon.fr

## 📊 État actuel de votre domaine

✅ **Ce qui est déjà configuré :**
- DMARC (protection anti-phishing)
- SPF existe MAIS n'inclut pas Brevo

❌ **Ce qui manque :**
- DKIM (signatures email)
- Brevo Code (vérification propriété)
- SPF doit inclure Brevo

---

## 🎯 ACTIONS À FAIRE MAINTENANT (10 minutes)

### ÉTAPE 1 : Récupérer vos codes dans Brevo

1. **Allez sur** : https://app.brevo.com
2. **Cliquez** : Settings → Senders & IP
3. **Cliquez** : "Authenticate your domain"
4. **Entrez** : `guide-de-lyon.fr`
5. **Cliquez** : "Authenticate this domain"

### ÉTAPE 2 : Brevo va vous donner 4 codes

**COPIEZ CES CODES** (ils ressemblent à ça) :

```
1. DKIM :
   Nom: mail._domainkey
   Valeur: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDeMVIzrCa3T14...

2. DKIM 2 :
   Nom: mail2._domainkey
   Valeur: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7vzkcqH...

3. SPF :
   v=spf1 include:spf.brevo.com mx ~all

4. Brevo Code :
   brevo-code:1a2b3c4d5e6f7g8h9i
```

### ÉTAPE 3 : Modifier dans OVH

#### 3.1 Connectez-vous à OVH
https://www.ovh.com/manager → Web Cloud → Domaines → guide-de-lyon.fr → Zone DNS

#### 3.2 MODIFIER le SPF existant

**TROUVEZ** la ligne avec : `v=spf1 mx include:sendinblue.com include:amazonses.com -all`

**CLIQUEZ** sur l'icône crayon (modifier)

**REMPLACEZ** par :
```
v=spf1 mx include:spf.brevo.com include:sendinblue.com include:amazonses.com ~all
```

⚠️ **Note** : On garde sendinblue.com et amazonses.com s'ils sont utilisés ailleurs

#### 3.3 AJOUTER le DKIM 1

**Cliquez** : Ajouter une entrée → TXT

```
Sous-domaine : mail._domainkey
Cible : "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ..."
```
⚠️ **IMPORTANT** : Mettez la valeur entre guillemets "..."

#### 3.4 AJOUTER le DKIM 2

**Cliquez** : Ajouter une entrée → TXT

```
Sous-domaine : mail2._domainkey
Cible : "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ..."
```

#### 3.5 AJOUTER le Brevo Code

**Cliquez** : Ajouter une entrée → TXT

```
Sous-domaine : brevo-code
Cible : "brevo-code:1a2b3c4d5e6f7g8h9i"
```

### ÉTAPE 4 : Valider et attendre

1. **Validez** tous les changements dans OVH
2. **Attendez** 30 minutes à 1 heure
3. **Retournez** dans Brevo → Settings → Senders & IP
4. Vous devriez voir : ✅ Authenticated

---

## 🧪 Tester la configuration

### Test 1 : Vérifier les DNS (après 30 min)
```bash
node scripts/verify-dns.mjs
```

Vous devriez voir :
- ✅ SPF (avec Brevo)
- ✅ DKIM 1
- ✅ DKIM 2
- ✅ DMARC
- ✅ Brevo Code

### Test 2 : Envoyer un email pro
```javascript
// test-contact-email.js
const brevo = require('@getbrevo/brevo');
const fs = require('fs');

// Lire la clé API
const envContent = fs.readFileSync('.env.local', 'utf8');
const API_KEY = envContent.match(/BREVO_API_KEY=(.*)/)?.[1];

const api = new brevo.TransactionalEmailsApi();
api.authentications['apiKey'].apiKey = API_KEY;

async function test() {
  const email = new brevo.SendSmtpEmail();
  
  email.subject = 'Test depuis contact@guide-de-lyon.fr';
  email.htmlContent = '<h1>Email professionnel configuré !</h1>';
  email.sender = {
    name: 'Guide de Lyon',
    email: 'contact@guide-de-lyon.fr' // ✅ Email pro !
  };
  email.to = [{ email: 'raphael.nuziere@gmail.com' }];
  
  try {
    await api.sendTransacEmail(email);
    console.log('✅ Email envoyé depuis contact@guide-de-lyon.fr !');
  } catch (error) {
    console.error('Erreur:', error.response?.text);
  }
}

test();
```

---

## 📱 Alternative immédiate (en attendant)

Si vous devez envoyer des emails MAINTENANT, utilisez temporairement :

```bash
# Dans .env.local
BREVO_SENDER_EMAIL=raphael.nuziere@gmail.com
```

Puis rechangez vers `contact@guide-de-lyon.fr` une fois authentifié.

---

## ⏱️ Timing

- **Configuration OVH** : 10 minutes
- **Propagation DNS** : 30 min à 2 heures
- **Vérification Brevo** : Automatique après propagation

**Dans 2 heures maximum**, vous pourrez envoyer depuis `contact@guide-de-lyon.fr` !

---

## 🆘 Si ça ne marche pas après 2h

1. **Vérifiez** que les DNS sont bien propagés :
   ```bash
   node scripts/verify-dns.mjs
   ```

2. **Dans Brevo**, cliquez "Refresh" sur la page d'authentification

3. **Vérifiez** les guillemets dans OVH (les valeurs TXT doivent être entre "...")

4. **Contactez** le support Brevo : support@brevo.com avec une capture d'écran

---

## ✅ Une fois configuré

Vous pourrez :
- Envoyer depuis `contact@guide-de-lyon.fr`
- Envoyer depuis `info@guide-de-lyon.fr`
- Envoyer depuis `noreply@guide-de-lyon.fr`
- Envoyer depuis N'IMPORTE QUELLE adresse @guide-de-lyon.fr

Sans avoir de boîte email ! Tout passe par Brevo. 🚀