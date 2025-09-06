# 🚨 ACTION REQUISE : CONFIGURER LES VARIABLES SUR VERCEL

## ❌ PROBLÈME IDENTIFIÉ

Le chargement infini sur www.guide-de-lyon.fr est causé par l'**ABSENCE des variables d'environnement Supabase sur Vercel**.

## ✅ SOLUTION IMMÉDIATE

### 📱 Étapes à suivre MAINTENANT :

### 1️⃣ **Aller sur Vercel Dashboard**
   👉 https://vercel.com/dashboard

### 2️⃣ **Sélectionner le projet "guide-de-lyon"**

### 3️⃣ **Cliquer sur "Settings" puis "Environment Variables"**

### 4️⃣ **Ajouter ces 3 variables OBLIGATOIRES :**

Copier-coller EXACTEMENT ces valeurs :

```
Nom : NEXT_PUBLIC_SUPABASE_URL
Valeur : https://ikefyhxelzydaogrnwxi.supabase.co
```

```
Nom : NEXT_PUBLIC_SUPABASE_ANON_KEY
Valeur : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTY3NTQsImV4cCI6MjA3MTI3Mjc1NH0.vJHDlWKUK0xUoXB_CCxNkVNnWhb7Wpq-mA097blKmzc
```

```
Nom : SUPABASE_SERVICE_ROLE_KEY
Valeur : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5Njc1NCwiZXhwIjoyMDcxMjcyNzU0fQ.Ink48F4a18sn-nbcKBbxwBCRA9Yur1z1_vmrR_Ku47Y
```

### 5️⃣ **Cliquer sur "Save"**

### 6️⃣ **IMPORTANT : Redéployer**
   - Aller dans l'onglet "Deployments"
   - Cliquer sur les 3 points "..." du dernier déploiement
   - Cliquer sur "Redeploy"
   - Attendre 2-3 minutes

## ✅ VÉRIFICATION

Après le redéploiement, tester :
1. https://www.guide-de-lyon.fr/api/check-config
   - Doit montrer `"status": "configured"`

2. https://www.guide-de-lyon.fr/connexion/pro
   - La page doit se charger sans boucle infinie
   - Le compte test doit fonctionner :
     - Email : merchant@guide-de-lyon.fr
     - Mot de passe : Merchant2025!

## 💡 EXPLICATION

Le code a été modifié pour :
- ✅ Détecter l'absence de configuration
- ✅ Éviter le chargement infini
- ✅ Afficher un message d'erreur clair

Mais pour que la connexion fonctionne, **les variables DOIVENT être ajoutées sur Vercel**.

## 📞 BESOIN D'AIDE ?

Si vous ne trouvez pas où ajouter les variables :
1. Connectez-vous à Vercel avec votre compte GitHub
2. Le projet devrait apparaître automatiquement
3. Les variables se trouvent dans Settings > Environment Variables

## ⏱️ TEMPS NÉCESSAIRE

- Ajouter les variables : 2 minutes
- Redéploiement : 2-3 minutes
- **Total : 5 minutes maximum**

## 🎯 RÉSULTAT ATTENDU

Une fois les variables ajoutées et le site redéployé :
- ✅ Plus de chargement infini
- ✅ Connexion professionnelle fonctionnelle
- ✅ Dashboard accessible
- ✅ Compte test utilisable