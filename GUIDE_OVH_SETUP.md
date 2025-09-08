# 📦 Guide de Configuration OVH Object Storage pour Guide de Lyon

## Étape 1 : Se connecter à OVH

1. Allez sur https://www.ovh.com/manager/
2. Connectez-vous avec vos identifiants OVH
3. Une fois connecté, cliquez sur "Public Cloud" dans le menu

## Étape 2 : Créer un projet Public Cloud (si pas déjà fait)

1. Cliquez sur "Créer un projet"
2. Donnez-lui un nom : "Guide-Lyon-Images"
3. Choisissez le mode de paiement
4. Validez la création

## Étape 3 : Créer un conteneur Object Storage

1. Dans votre projet, cliquez sur "Storage" > "Object Storage"
2. Cliquez sur "Créer un conteneur"
3. Choisissez :
   - **Région** : GRA (Gravelines) ou SBG (Strasbourg) pour la France
   - **Type** : Standard
   - **Nom** : `guide-lyon-articles`
4. Cliquez sur "Créer le conteneur"

## Étape 4 : Créer un utilisateur OpenStack

1. Dans le menu de gauche, cliquez sur "Users & Roles"
2. Cliquez sur "Créer un utilisateur"
3. Donnez-lui un nom : "guide-lyon-api"
4. Choisissez "Tous les rôles"
5. **IMPORTANT** : Notez bien le mot de passe qui s'affiche (il ne sera plus visible après)

## Étape 5 : Récupérer les identifiants S3

1. Toujours dans "Users & Roles"
2. Cliquez sur votre utilisateur "guide-lyon-api"
3. Cliquez sur "Générer des clés S3"
4. Notez :
   - **Access Key** : (ressemble à : 5f7a8b9c2d3e4f5g)
   - **Secret Key** : (ressemble à : a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6)

## Étape 6 : Récupérer l'endpoint S3

Pour la région GRA (Gravelines) : `https://s3.gra.io.cloud.ovh.net/`
Pour la région SBG (Strasbourg) : `https://s3.sbg.io.cloud.ovh.net/`

## 📝 Vos identifiants à conserver

Copiez ces informations dans un fichier sécurisé :

```
OVH_S3_ACCESS_KEY=votre_access_key_ici
OVH_S3_SECRET_KEY=votre_secret_key_ici
OVH_S3_ENDPOINT=https://s3.gra.io.cloud.ovh.net/
OVH_S3_REGION=gra
OVH_S3_BUCKET=guide-lyon-articles
```

## ✅ Vérification

Pour vérifier que tout fonctionne :
1. Dans OVH Manager, allez dans "Object Storage"
2. Vous devriez voir votre conteneur "guide-lyon-articles"
3. Il devrait être vide pour l'instant

## 🎯 Prochaine étape

Une fois que vous avez ces informations, dites-moi :
- Quelle région vous avez choisie (GRA ou SBG)
- Si vous avez bien récupéré tous les identifiants
- Je configurerai alors le code pour utiliser OVH automatiquement

## ⚠️ Sécurité

- Ne partagez JAMAIS vos clés secrètes publiquement
- Ne les committez pas dans Git
- Utilisez toujours des variables d'environnement