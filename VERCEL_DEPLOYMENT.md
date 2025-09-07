# Guide de Déploiement sur Vercel

## Variables d'Environnement Requises

Pour que l'application fonctionne correctement sur Vercel, vous devez configurer les variables d'environnement suivantes :

### Variables Obligatoires

Ces variables sont **essentielles** pour le fonctionnement de base :

```bash
# Supabase - Base de données et authentification
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key-ici
```

### Comment Ajouter les Variables sur Vercel

1. **Connectez-vous à Vercel** : https://vercel.com

2. **Accédez aux Settings du projet** :
   - Cliquez sur votre projet "guide-de-lyon"
   - Allez dans l'onglet "Settings"

3. **Ajoutez les Variables d'Environnement** :
   - Dans le menu de gauche, cliquez sur "Environment Variables"
   - Ajoutez chaque variable une par une :
     - Name: `NEXT_PUBLIC_SUPABASE_URL`
     - Value: Votre URL Supabase (trouvable dans Supabase Dashboard > Settings > API)
     - Environment: Cochez Production, Preview, et Development
   - Répétez pour `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Redéployez le Projet** :
   - Après avoir ajouté les variables, allez dans l'onglet "Deployments"
   - Cliquez sur les trois points (...) sur le dernier déploiement
   - Cliquez sur "Redeploy"

## Où Trouver les Valeurs Supabase

1. Connectez-vous à [Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans Settings > API
4. Vous y trouverez :
   - **URL** : Dans la section "Project URL"
   - **Anon Key** : Dans la section "Project API keys" > "anon public"

## Variables Optionnelles

Pour des fonctionnalités avancées, vous pouvez aussi ajouter :

```bash
# Firebase (si utilisé pour l'authentification)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Stripe (pour les paiements)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...

# Google Maps (pour les cartes)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

## Vérification

Après le redéploiement, vérifiez que :
1. La page d'accueil se charge sans erreur
2. Le blog affiche correctement les articles
3. L'authentification fonctionne (si configurée)

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans Vercel (onglet "Functions")
2. Assurez-vous que toutes les variables sont correctement définies
3. Vérifiez que les valeurs ne contiennent pas d'espaces au début/fin