# 🚀 DÉPLOIEMENT DIRECTUS RAPIDE

## Option 1: Render.com (RECOMMANDÉ - 5 minutes)

1. **Aller sur** https://render.com et créer un compte
2. **Cliquer "New +"** → **"Web Service"**
3. **Connecter ce repo GitHub** : `raphaelnuziere-create/guide-de-lyon`
4. **Configuration** :
   - **Name** : `guide-lyon-directus`
   - **Root Directory** : `directus-instance`
   - **Environment** : `Docker`
   - **Region** : `Frankfurt` (plus proche)
   - **Instance Type** : `Free` (pour test)

5. **Variables d'environnement** :
   ```
   KEY=255d861b-5ea1-5996-9aa3-922530ec40b1
   SECRET=directus-secret-key-production-guide-lyon
   DB_CLIENT=sqlite3
   DB_FILENAME=/directus/database.db
   ADMIN_EMAIL=admin@guide-lyon.fr
   ADMIN_PASSWORD=AdminPassword123!
   CORS_ENABLED=true
   CORS_ORIGIN=https://www.guide-de-lyon.fr,http://localhost:3000
   STORAGE_LOCATIONS=local
   STORAGE_LOCAL_DRIVER=local
   STORAGE_LOCAL_ROOT=/directus/uploads
   PUBLIC_URL=${{RENDER_EXTERNAL_URL}}
   ```

6. **Cliquer "Deploy"** - Render va créer l'URL automatiquement

## Option 2: Railway.app (Alternative)

1. **Aller sur** https://railway.app
2. **"Deploy from GitHub repo"**
3. **Sélectionner ce repo** et configurer le service

## Une fois déployé :

1. **Noter l'URL** (exemple : `https://guide-lyon-directus.onrender.com`)
2. **Mettre à jour** `.env.local` :
   ```env
   NEXT_PUBLIC_DIRECTUS_URL=https://guide-lyon-directus.onrender.com
   NEXT_PUBLIC_USE_DIRECTUS=true
   ```
3. **Redéployer** l'app principale

L'URL exacte sera générée automatiquement par Render !