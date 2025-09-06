# 🔧 CONFIGURATION DES VARIABLES D'ENVIRONNEMENT SUR VERCEL

## ⚠️ PROBLÈME IDENTIFIÉ

Le chargement infini sur www.guide-de-lyon.fr est causé par l'absence des variables d'environnement Supabase sur Vercel.

## ✅ SOLUTION : Ajouter les variables sur Vercel

### 📝 Étapes à suivre :

1. **Aller sur Vercel Dashboard**
   - URL : https://vercel.com/dashboard
   - Sélectionner le projet "guide-de-lyon"

2. **Aller dans Settings > Environment Variables**
   - URL directe : https://vercel.com/[votre-equipe]/guide-de-lyon/settings/environment-variables

3. **Ajouter les variables suivantes :**

```bash
# Variables Supabase (OBLIGATOIRES)
NEXT_PUBLIC_SUPABASE_URL = https://ikefyhxelzydaogrnwxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTY3NTQsImV4cCI6MjA3MTI3Mjc1NH0.vJHDlWKUK0xUoXB_CCxNkVNnWhb7Wpq-mA097blKmzc
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5Njc1NCwiZXhwIjoyMDcxMjcyNzU0fQ.Ink48F4a18sn-nbcKBbxwBCRA9Yur1z1_vmrR_Ku47Y

# Variables App
NEXT_PUBLIC_APP_URL = https://www.guide-de-lyon.fr
NODE_ENV = production
```

4. **Cliquer sur "Save"**

5. **Redéployer le site**
   - Après avoir ajouté les variables, cliquer sur "Redeploy"
   - OU attendre le prochain push Git

## 🚀 SOLUTION RAPIDE PAR CODE

En attendant, je vais ajouter une vérification et un fallback dans le code :