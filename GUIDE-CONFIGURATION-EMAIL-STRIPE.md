# 📧 GUIDE COMPLET - Configuration Email (Brevo) et Paiements (Stripe)

## 🔒 Analyse de sécurité

D'après l'analyse du commit, **seule la clé API Pexels a été exposée** - ce n'est effectivement pas critique car :
- Pexels est un service gratuit d'images
- La clé ne permet que de télécharger des images
- Pas d'accès à des données sensibles

✅ **Vos clés Supabase et Firebase sont en sécurité**

---

## 💳 Configuration du Webhook Stripe

### Étape 1 : Créer le webhook dans Stripe

1. Connectez-vous à [Stripe Dashboard](https://dashboard.stripe.com)
2. Allez dans **Developers → Webhooks**
3. Cliquez sur **"Add endpoint"**
4. Configuration :
   ```
   Endpoint URL: https://www.guide-de-lyon.fr/api/webhooks/stripe
   Description: Guide de Lyon - Webhook de paiement
   ```

5. Sélectionnez les événements à écouter :
   - ✅ `checkout.session.completed` (paiement réussi)
   - ✅ `payment_intent.succeeded` (paiement confirmé)
   - ✅ `payment_intent.payment_failed` (échec de paiement)
   - ✅ `customer.subscription.created` (abonnement créé)
   - ✅ `customer.subscription.updated` (abonnement modifié)
   - ✅ `customer.subscription.deleted` (abonnement annulé)

6. Cliquez sur **"Add endpoint"**

### Étape 2 : Récupérer la clé secrète

Après création, Stripe affiche :
```
Signing secret: whsec_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
```

**Copiez cette clé dans votre `.env.local` :**
```bash
STRIPE_WEBHOOK_SECRET=whsec_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
```

---

## 📧 Architecture Email avec Brevo

### ✅ Brevo SUFFIT - Pas besoin de Resend !

**Brevo (ex-SendinBlue)** est une solution complète qui remplace Resend. Voici pourquoi :

| Fonctionnalité | Brevo | Resend |
|----------------|-------|--------|
| Emails transactionnels | ✅ | ✅ |
| Templates email | ✅ | ✅ |
| API moderne | ✅ | ✅ |
| Dashboard analytics | ✅ | ✅ |
| **Prix** | **300 emails/jour GRATUIT** | 100 emails/jour gratuit |
| **Marketing automation** | ✅ | ❌ |
| **CRM intégré** | ✅ | ❌ |

### Comment ça fonctionne dans votre app :

```
┌─────────────────┐
│   Votre App     │
│  (Next.js)      │
└────────┬────────┘
         │
         ▼ API Call
┌─────────────────┐
│   Brevo API     │──────► Envoi emails
│                 │        (confirmation, newsletter, etc.)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Dashboard Brevo │──────► Analytics, Templates, Logs
│ (app.brevo.com) │
└─────────────────┘
```

### Où gérer les emails ?

1. **Templates et design** : Dashboard Brevo (app.brevo.com)
2. **Envoi depuis l'app** : Code Next.js (automatique)
3. **Analytics et logs** : Dashboard Brevo
4. **Listes de contacts** : Dashboard Brevo

---

## 🛠️ Installation Brevo dans Next.js

### Étape 1 : Installer le SDK

```bash
npm install @sendinblue/client
```

### Étape 2 : Créer le service email

Créez `/app/services/email.ts` :

```typescript
import * as SibApiV3Sdk from '@sendinblue/client';

// Configuration Brevo
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

export interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, any>;
}

export async function sendEmail(options: EmailOptions) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.htmlContent;
  sendSmtpEmail.sender = {
    name: process.env.BREVO_SENDER_NAME || 'Guide de Lyon',
    email: process.env.BREVO_SENDER_EMAIL || 'contact@guide-de-lyon.fr'
  };
  sendSmtpEmail.to = [{ email: options.to }];
  
  // Si template ID fourni
  if (options.templateId) {
    sendSmtpEmail.templateId = options.templateId;
    sendSmtpEmail.params = options.params;
  }
  
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error };
  }
}

// Exemples d'utilisation
export const emailTemplates = {
  // Email de bienvenue
  async sendWelcome(email: string, name: string) {
    return sendEmail({
      to: email,
      subject: 'Bienvenue sur Guide de Lyon !',
      htmlContent: `
        <h1>Bienvenue ${name} !</h1>
        <p>Merci de vous être inscrit sur Guide de Lyon.</p>
        <p>Découvrez les meilleurs endroits de Lyon !</p>
        <a href="https://www.guide-de-lyon.fr/annuaire">Voir l'annuaire</a>
      `
    });
  },
  
  // Confirmation de commande
  async sendOrderConfirmation(email: string, orderDetails: any) {
    return sendEmail({
      to: email,
      subject: 'Confirmation de votre commande',
      htmlContent: `
        <h1>Commande confirmée !</h1>
        <p>Montant : ${orderDetails.amount}€</p>
        <p>Référence : ${orderDetails.reference}</p>
      `
    });
  },
  
  // Newsletter
  async sendNewsletter(email: string, articles: any[]) {
    return sendEmail({
      to: email,
      subject: 'Les nouveautés de Lyon cette semaine',
      templateId: 1, // ID du template créé dans Brevo
      params: {
        articles: articles,
        unsubscribeUrl: 'https://www.guide-de-lyon.fr/unsubscribe'
      }
    });
  }
};
```

### Étape 3 : Créer une route API

Créez `/app/api/send-email/route.ts` :

```typescript
import { NextResponse } from 'next/server';
import { emailTemplates } from '@/app/services/email';

export async function POST(request: Request) {
  try {
    const { type, email, data } = await request.json();
    
    let result;
    switch(type) {
      case 'welcome':
        result = await emailTemplates.sendWelcome(email, data.name);
        break;
      case 'order':
        result = await emailTemplates.sendOrderConfirmation(email, data);
        break;
      case 'newsletter':
        result = await emailTemplates.sendNewsletter(email, data.articles);
        break;
      default:
        return NextResponse.json({ error: 'Type d\'email inconnu' }, { status: 400 });
    }
    
    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ error: 'Échec envoi email' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

---

## 📊 Dashboard Admin - Gestion des emails

### Option 1 : Dashboard simple dans votre app

Créez `/app/admin/emails/page.tsx` :

```typescript
'use client';

import { useState } from 'react';

export default function EmailDashboard() {
  const [emailType, setEmailType] = useState('welcome');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  
  const sendTestEmail = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          email: testEmail,
          data: {
            name: 'Test User',
            amount: 99.99,
            reference: 'TEST-123',
            articles: []
          }
        })
      });
      
      if (response.ok) {
        alert('Email envoyé !');
      } else {
        alert('Erreur envoi');
      }
    } catch (error) {
      alert('Erreur: ' + error);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Emails</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Tester l'envoi d'email</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Type d'email</label>
            <select 
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="welcome">Bienvenue</option>
              <option value="order">Confirmation commande</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2">Email destinataire</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="test@example.com"
            />
          </div>
          
          <button
            onClick={sendTestEmail}
            disabled={sending || !testEmail}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {sending ? 'Envoi...' : 'Envoyer email test'}
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p className="text-sm">
          Pour voir les statistiques détaillées, templates et logs :
          <a 
            href="https://app.brevo.com" 
            target="_blank"
            className="text-blue-500 ml-2 underline"
          >
            Ouvrir Dashboard Brevo →
          </a>
        </p>
      </div>
    </div>
  );
}
```

### Option 2 : Utiliser uniquement Brevo Dashboard

**Avantages du Dashboard Brevo :**
- Templates visuels drag & drop
- A/B testing intégré
- Analytics détaillés (taux d'ouverture, clics)
- Gestion des bounces automatique
- Listes de contacts segmentées
- Automation workflows

---

## 🚀 Actions à faire maintenant

### 1. Configuration Stripe Webhook
```bash
# Dans Stripe Dashboard
1. Developers → Webhooks → Add endpoint
2. URL: https://www.guide-de-lyon.fr/api/webhooks/stripe
3. Copier la clé whsec_xxx dans .env.local
```

### 2. Installation Brevo
```bash
npm install @sendinblue/client
```

### 3. Test email
```bash
# Créer les fichiers services/email.ts et api/send-email/route.ts
# Tester avec votre email
```

### 4. Variables d'environnement Vercel
```bash
# Ajouter dans Vercel Dashboard → Settings → Environment Variables
BREVO_API_KEY=xkeysib-xxx
BREVO_SENDER_EMAIL=contact@guide-de-lyon.fr
BREVO_SENDER_NAME=Guide de Lyon
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## ✅ Résumé

- **Brevo SEUL suffit** - Pas besoin de Resend
- **Templates** : Créez dans Brevo Dashboard
- **Envoi** : Automatique depuis votre app
- **Analytics** : Dashboard Brevo
- **Stripe Webhook** : Créez dans Stripe Dashboard et copiez la clé

Brevo est une solution complète et GRATUITE jusqu'à 300 emails/jour, parfait pour votre projet !