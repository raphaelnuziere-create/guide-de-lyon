# 📧 Configuration Brevo - Templates & Automations

## 🚀 Étapes à suivre dans Brevo Dashboard

### 1️⃣ Créer les Templates Transactionnels

Allez sur [app.brevo.com](https://app.brevo.com) → **Transactional** → **Email Templates**

#### Template 1 : Bienvenue
```html
<!-- Nom : Welcome_GuideLyon -->
<!-- Sujet : Bienvenue {{params.name}} sur Guide de Lyon ! -->

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .feature { display: flex; align-items: center; margin: 20px 0; }
    .feature-icon { font-size: 24px; margin-right: 15px; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Bienvenue {{params.name}} ! 🎉</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0;">Votre guide personnel de Lyon</p>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Merci de rejoindre la communauté <strong>Guide de Lyon</strong> !
      </p>
      
      <p style="color: #666; line-height: 1.6;">
        Découvrez tout ce que Lyon a de mieux à offrir :
      </p>
      
      <div class="feature">
        <span class="feature-icon">📍</span>
        <span>Les meilleurs restaurants et bars de la ville</span>
      </div>
      
      <div class="feature">
        <span class="feature-icon">⭐</span>
        <span>Des avis authentiques de la communauté</span>
      </div>
      
      <div class="feature">
        <span class="feature-icon">🎭</span>
        <span>Tous les événements à ne pas manquer</span>
      </div>
      
      <div class="feature">
        <span class="feature-icon">💎</span>
        <span>Les pépites cachées de Lyon</span>
      </div>
      
      <center>
        <a href="https://www.guide-de-lyon.fr/annuaire" class="button">
          Découvrir l'annuaire
        </a>
      </center>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Des questions ? Répondez simplement à cet email, nous sommes là pour vous aider !
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px;">© 2025 Guide de Lyon - Tous droits réservés</p>
      <p style="margin: 5px;">Cet email a été envoyé à {{params.email}}</p>
    </div>
  </div>
</body>
</html>
```

#### Template 2 : Confirmation Commande
```html
<!-- Nom : Order_Confirmation -->
<!-- Sujet : Confirmation de commande #{{params.reference}} -->

<!DOCTYPE html>
<html>
<head>
  <style>
    .invoice-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .invoice-line { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dee2e6; }
    .total { font-size: 24px; color: #28a745; font-weight: bold; }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
    <div style="background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1>✅ Commande confirmée !</h1>
    </div>
    
    <div style="padding: 30px; background: white;">
      <p>Bonjour {{params.customerName}},</p>
      
      <p>Nous avons bien reçu votre commande et votre paiement a été confirmé.</p>
      
      <div class="invoice-box">
        <h3>Détails de la commande</h3>
        <div class="invoice-line">
          <span>Référence :</span>
          <strong>{{params.reference}}</strong>
        </div>
        <div class="invoice-line">
          <span>Date :</span>
          <span>{{params.date}}</span>
        </div>
        <div class="invoice-line">
          <span>Plan :</span>
          <span>{{params.plan}}</span>
        </div>
        <div class="invoice-line" style="border: none; margin-top: 15px;">
          <span><strong>TOTAL :</strong></span>
          <span class="total">{{params.amount}}€</span>
        </div>
      </div>
      
      <p>Votre abonnement est maintenant actif. Vous pouvez accéder à votre espace :</p>
      
      <center>
        <a href="https://www.guide-de-lyon.fr/pro/dashboard" 
           style="display: inline-block; padding: 14px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Accéder à mon espace
        </a>
      </center>
      
      <p style="color: #666; font-size: 14px;">
        Une facture détaillée a été envoyée séparément.<br>
        Pour toute question : contact@guide-de-lyon.fr
      </p>
    </div>
  </div>
</body>
</html>
```

#### Template 3 : Newsletter
```html
<!-- Nom : Newsletter_Weekly -->
<!-- Sujet : 📍 Les nouveautés de Lyon cette semaine -->

<!DOCTYPE html>
<html>
<head>
  <style>
    .article-card { 
      background: white; 
      border-radius: 12px; 
      overflow: hidden; 
      margin-bottom: 25px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    .article-image { 
      width: 100%; 
      height: 200px; 
      object-fit: cover; 
    }
    .article-content { 
      padding: 20px; 
    }
    .read-more { 
      color: #667eea; 
      text-decoration: none; 
      font-weight: 600; 
    }
  </style>
</head>
<body style="background: #f5f5f5; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="margin: 0; font-size: 28px;">📍 Les nouveautés de Lyon</h1>
      <p style="margin: 10px 0; opacity: 0.9;">Votre sélection hebdomadaire</p>
    </div>
    
    <!-- Content -->
    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
      
      {{#each params.articles}}
      <div class="article-card">
        {{#if this.image}}
        <img src="{{this.image}}" alt="{{this.title}}" class="article-image">
        {{/if}}
        <div class="article-content">
          <h3 style="color: #333; margin: 0 0 10px 0;">{{this.title}}</h3>
          <p style="color: #666; line-height: 1.6;">{{this.excerpt}}</p>
          <a href="https://www.guide-de-lyon.fr/blog/{{this.slug}}" class="read-more">
            Lire la suite →
          </a>
        </div>
      </div>
      {{/each}}
      
      <!-- CTA -->
      <div style="text-align: center; margin-top: 30px; padding: 25px; background: white; border-radius: 8px;">
        <h3 style="color: #333; margin-bottom: 15px;">Découvrez encore plus !</h3>
        <a href="https://www.guide-de-lyon.fr/blog" 
           style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px;">
          Voir tous les articles
        </a>
      </div>
      
      <!-- Footer -->
      <p style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
        Vous recevez cet email car vous êtes inscrit à notre newsletter.<br>
        <a href="{{params.unsubscribeUrl}}" style="color: #999;">Se désabonner</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 🤖 Créer les Automations

### Automation 1 : Welcome Series (3 emails)

**Dans Brevo : Automation → Create a new workflow**

1. **Déclencheur** : Contact ajouté à la liste "Nouveaux inscrits"

2. **Email 1** : Immédiat
   - Template : Welcome_GuideLyon
   - Personnalisation avec le prénom

3. **Attendre 3 jours**

4. **Email 2** : Découvrez les meilleures adresses
   - Contenu : Top 10 des restaurants
   - CTA : Voir l'annuaire

5. **Attendre 7 jours**

6. **Email 3** : Offre spéciale Pro
   - Si non-pro : Proposer l'espace Pro
   - Si pro : Tips pour optimiser sa fiche

---

### Automation 2 : Panier abandonné

1. **Déclencheur** : Tag "abandoned_cart"
2. **Attendre 1 heure**
3. **Email rappel** avec le contenu du panier
4. **Attendre 24 heures**
5. **Email avec 10% de réduction**
6. **Attendre 72 heures**
7. **Dernier rappel**

---

### Automation 3 : Réactivation

1. **Déclencheur** : Inactif depuis 30 jours
2. **Email** : "Vous nous manquez !"
3. **Contenu** : Nouveautés du mois
4. **CTA** : Revenir sur le site

---

### Automation 4 : Anniversaire inscription

1. **Déclencheur** : Date anniversaire inscription
2. **Email** : Merci pour 1 an de fidélité
3. **Récompense** : Badge ou avantage

---

## 📊 Segmentation des Listes

Créez ces listes dans Brevo :

1. **all_users** - Tous les utilisateurs
2. **newsletter_subscribers** - Inscrits newsletter
3. **pro_accounts** - Comptes professionnels
4. **premium_members** - Membres premium
5. **inactive_30days** - Inactifs 30 jours
6. **new_signups** - Nouveaux inscrits (7 derniers jours)

---

## 🔧 Configuration DNS/SPF/DKIM avec OVH

### ✅ Bonne nouvelle : Configuration simplifiée !

**Brevo gère l'envoi**, mais pour optimiser la délivrabilité, ajoutez ces enregistrements DNS dans OVH :

#### 1. SPF Record
```
Type : TXT
Nom : @
Valeur : v=spf1 include:spf.sendinblue.com ~all
```

#### 2. DKIM (Brevo vous le fournira)
```
Type : TXT  
Nom : mail._domainkey
Valeur : [Fournie par Brevo dans Settings → Senders & IP]
```

#### 3. DMARC (Optionnel mais recommandé)
```
Type : TXT
Nom : _dmarc
Valeur : v=DMARC1; p=none; rua=mailto:dmarc@guide-de-lyon.fr
```

### 📍 Où configurer dans OVH :
1. Connectez-vous à [OVH Manager](https://www.ovh.com/manager)
2. Allez dans : Domaines → guide-de-lyon.fr → Zone DNS
3. Ajoutez les enregistrements ci-dessus

### 📍 Où trouver les valeurs dans Brevo :
1. [app.brevo.com](https://app.brevo.com)
2. Settings → Senders & IP → Domain Authentication
3. Ajoutez votre domaine
4. Brevo vous donnera les valeurs exactes

---

## 📝 Scripts SQL pour tracking

Créez ces tables dans Supabase pour tracker les emails :

```sql
-- Table de tracking des emails
CREATE TABLE email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'sent',
  message_id VARCHAR(100),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les préférences email
CREATE TABLE email_preferences (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  newsletter BOOLEAN DEFAULT true,
  promotional BOOLEAN DEFAULT true,
  transactional BOOLEAN DEFAULT true,
  frequency VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_email_logs_user ON email_logs(user_id);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
```

---

## ✅ Actions à faire maintenant :

1. **Copier les templates HTML** dans Brevo
2. **Créer les automations** décrites
3. **Configurer DNS dans OVH** (optionnel mais recommandé)
4. **Créer les listes de segmentation**

Tout est préparé pour une configuration professionnelle ! 🚀