# 🚀 Débloquer Brevo Transactional - Guide Rapide

## ✅ Les emails ont été envoyés !

3 emails de test viennent d'être envoyés à **raphaelnuziere@gmail.com**

### 📋 Actions à faire MAINTENANT :

## 1️⃣ Vérifiez vos emails
Vous devriez avoir reçu 3 emails :
- Test 1 - Activation Brevo
- Test 2 - Newsletter 
- Test 3 - Bienvenue

## 2️⃣ Dans Brevo, allez voir les logs

### Option A : Page SMTP (où vous êtes)
- **Rafraîchissez la page** (F5)
- Les logs devraient apparaître en bas
- Status "Delivered" = ✅

### Option B : Real-time
- Allez sur : [https://app.brevo.com/real-time](https://app.brevo.com/real-time)
- Vous verrez les emails en temps réel

### Option C : Email Logs
- Menu → **Logs** → **Email logs**
- Ou : [https://app.brevo.com/logs/email](https://app.brevo.com/logs/email)

### Option D : Statistics
- Menu → **Statistics** → **Global**
- Ou : [https://app.brevo.com/statistics/email](https://app.brevo.com/statistics/email)

## 3️⃣ Une fois les logs visibles

Brevo va automatiquement :
1. ✅ Valider votre configuration SMTP
2. ✅ Débloquer l'onglet **Transactional**
3. ✅ Activer toutes les fonctionnalités

---

## 🔧 Si les logs n'apparaissent pas

### Vérifier l'email expéditeur

Dans Brevo : **Settings** → **Senders**

Assurez-vous que `contact@guide-de-lyon.fr` est dans la liste.

Si ce n'est pas le cas :
1. Cliquez **"Add a new sender"**
2. Email : `contact@guide-de-lyon.fr`
3. Nom : `Guide de Lyon`
4. Sauvegardez

### Changer l'email expéditeur

Si vous n'avez pas accès à `contact@guide-de-lyon.fr`, utilisez votre email :

1. Dans `.env.local`, changez :
```bash
BREVO_SENDER_EMAIL=votre-email@gmail.com
```

2. Relancez le script :
```bash
node brevo-activate.js
```

### Envoyer plus d'emails

```bash
# Envoyez 10 emails d'un coup
for i in {1..10}; do node brevo-activate.js; done
```

---

## 📊 Où voir les templates après activation

Une fois activé, vous pourrez accéder à :

1. **Transactional** → **Overview** : Vue d'ensemble
2. **Transactional** → **Email Templates** : Créer des templates
3. **Transactional** → **Statistics** : Statistiques détaillées
4. **Transactional** → **Settings** : Configuration avancée

---

## ✅ Confirmation que ça marche

Vous saurez que c'est activé quand :

1. La page SMTP affiche des logs (tableau avec vos emails)
2. L'onglet **Transactional** apparaît dans le menu
3. Vous pouvez créer des templates
4. Les statistiques s'affichent

---

## 🎯 Prochaines étapes

Une fois activé :

1. **Créer les templates** depuis `BREVO-TEMPLATES-AUTOMATIONS.md`
2. **Configurer le webhook** : `https://www.guide-de-lyon.fr/api/webhooks/brevo`
3. **Tester depuis votre dashboard** : `https://www.guide-de-lyon.fr/admin/emails`

---

## 💡 Alternative : Utiliser l'API directement

Si l'interface reste bloquée, vous pouvez quand même utiliser Brevo !

Votre dashboard admin fonctionne déjà :
- https://www.guide-de-lyon.fr/admin/emails

Les emails partent via l'API, même si l'interface Brevo est bloquée.

L'interface Brevo est juste pour :
- Voir les statistiques
- Créer des templates visuels
- Voir les logs

Mais tout fonctionne déjà via votre code ! 🚀