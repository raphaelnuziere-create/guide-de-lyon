# ✅ Variables d'environnement OBLIGATOIRES pour Vercel

## 🔴 TRÈS IMPORTANT - À configurer dans Vercel

Allez sur : https://vercel.com/[votre-username]/guide-de-lyon/settings/environment-variables

### Variables Supabase (OBLIGATOIRES)

```
NEXT_PUBLIC_SUPABASE_URL=[VOTRE_URL_SUPABASE]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[VOTRE_CLE_ANON_SUPABASE]
```

### Variables Firebase (optionnelles mais utiles)

```
NEXT_PUBLIC_FIREBASE_API_KEY=(votre clé)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=(votre domaine)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=(votre projet)
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=(votre bucket)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=(votre sender id)
NEXT_PUBLIC_FIREBASE_APP_ID=(votre app id)
```

## 📋 Comment ajouter ces variables dans Vercel

1. Connectez-vous à **Vercel** : https://vercel.com
2. Allez dans votre projet **guide-de-lyon**
3. Cliquez sur **Settings** (en haut)
4. Cliquez sur **Environment Variables** (dans le menu de gauche)
5. Pour chaque variable :
   - **Key** : Le nom de la variable (ex: NEXT_PUBLIC_SUPABASE_URL)
   - **Value** : La valeur (ex: https://gscrocmpqsakzmpvhrir.supabase.co)
   - **Environment** : Cochez les 3 (Production, Preview, Development)
   - Cliquez sur **Add**

## 🔄 Après avoir ajouté les variables

1. Allez dans **Deployments**
2. Cliquez sur les **3 points** (...) à côté du dernier déploiement
3. Cliquez sur **Redeploy**
4. Cochez **Use existing build cache** : NON
5. Cliquez sur **Redeploy**

## ✅ Vérification

Une fois redéployé, testez :
- https://www.guide-de-lyon.fr/connexion/pro
- https://www.guide-de-lyon.fr/connexion/admin

Les comptes de test :
- Admin : admin@guide-de-lyon.fr / Admin2025!
- Pro : merchant@guide-de-lyon.fr / Merchant2025!