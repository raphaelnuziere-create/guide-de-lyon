# 🔧 RÉSOUDRE L'ERREUR 401 - Guide de Lyon

## 🚨 Problème actuel
Le site renvoie une erreur 401 (Unauthorized) même après la configuration Firebase.

## 🎯 SOLUTION RAPIDE

### Option 1 : Vérifier dans Vercel Dashboard (Recommandé)

1. **Allez sur Vercel Dashboard** :
   ```
   https://vercel.com/raphaels-projects-8d8ce8f4/guide-lyon-v2/settings
   ```

2. **Vérifiez ces paramètres** :
   - Onglet **"Security"** → Désactivez "Password Protection" si activé
   - Onglet **"Environment Variables"** → Vérifiez que toutes les variables Firebase sont bien là
   - Onglet **"Functions"** → Vérifiez qu'il n'y a pas de restriction

### Option 2 : Accès direct via navigateur

Essayez d'accéder directement dans votre navigateur :
1. Ouvrez Chrome/Safari
2. Allez sur : `https://guide-de-lyon.fr`
3. Si une page de connexion Vercel apparaît, connectez-vous avec votre compte Vercel

### Option 3 : Désactiver la protection par commande

```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

# Vérifier les protections
vercel env ls production | grep VERCEL_PROTECTION

# Si une protection existe, la supprimer
vercel env rm VERCEL_PROTECTION_BYPASS production
```

## 📝 VÉRIFICATIONS IMPORTANTES

### 1. Variables Firebase
Vérifiez que ces 3 variables existent et ont les bonnes valeurs :
```bash
vercel env ls production | grep FIREBASE_ADMIN
```

Vous devriez voir :
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL  
- FIREBASE_ADMIN_PRIVATE_KEY

### 2. Test local
Testez d'abord en local pour vérifier que tout fonctionne :
```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2
npm run dev
```

Puis allez sur : http://localhost:3000

### 3. Logs Vercel
Vérifiez s'il y a des erreurs dans les logs :
```bash
vercel logs --follow
```

## 🔑 ACCÈS PUBLIC

Pour rendre le site accessible publiquement :

### Étape 1 : Dashboard Vercel
1. Connectez-vous sur https://vercel.com
2. Allez dans votre projet `guide-lyon-v2`
3. Settings → Security
4. Désactivez toutes les protections

### Étape 2 : Vérification
```bash
# Tester l'accès
curl -I https://guide-de-lyon.fr

# Vous devriez obtenir HTTP 200 ou 308 (redirection)
```

## 🚀 SOLUTION ALTERNATIVE

Si le problème persiste, créez un nouveau déploiement sans protection :

```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

# Créer une branche publique
git checkout -b public-release
git add .
git commit -m "Release public version"
git push origin public-release

# Déployer cette branche
vercel --prod
```

## 📊 STATUT ACTUEL

✅ **Ce qui fonctionne** :
- Firebase Admin configuré avec les bonnes clés
- Déploiement réussi sur Vercel
- Domaine guide-de-lyon.fr lié au projet

❌ **Ce qui bloque** :
- Protection d'accès Vercel (401)
- Nécessite une authentification Vercel

## 🎯 ACTION IMMÉDIATE

**Allez sur le Dashboard Vercel maintenant** :
```
https://vercel.com/raphaels-projects-8d8ce8f4/guide-lyon-v2/settings/security
```

Et **désactivez toutes les protections** pour rendre le site public.

---

Une fois fait, votre site sera accessible à tous sur https://guide-de-lyon.fr ! 🎉