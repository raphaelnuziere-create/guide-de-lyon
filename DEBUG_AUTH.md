# 🔍 Debug - Bouton Google sur /pro/login

## Le bouton Google est présent dans le code

Le bouton "Connexion avec Google" est bien implémenté dans `/app/pro/login/page.tsx` :
- Ligne 157-170 : Bouton avec logo Google SVG
- Situé APRÈS le formulaire de connexion
- Entre "Se connecter" et "Créer un compte"

## Structure de la page /pro/login :

```
1. Formulaire de connexion
   - Email
   - Mot de passe  
   - [Bouton: Se connecter]

2. Séparateur "Ou continuer avec"

3. 🔵 [Bouton: Connexion avec Google] ← ICI

4. Séparateur "Nouveau sur Guide de Lyon ?"

5. [Bouton: Créer un compte professionnel]
```

## Si vous ne le voyez pas, vérifiez :

### 1. Scrollez vers le bas
Le bouton Google est APRÈS le bouton "Se connecter", pas à côté.

### 2. Inspectez l'élément (F12)
- Clic droit → Inspecter
- Cherchez : `Connexion avec Google`
- Vérifiez s'il n'est pas masqué par CSS

### 3. Console JavaScript
Ouvrez la console (F12) et vérifiez s'il y a des erreurs.

### 4. Forcer le rechargement
- Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
- Pour vider le cache

## Test rapide du bouton Google

Dans la console du navigateur, tapez :
```javascript
document.querySelector('button[type="button"]')?.click()
```

Cela devrait déclencher la connexion Google.

## Alternative : Activer Firebase Auth Google

Il faut aussi activer Google dans Firebase :
1. https://console.firebase.google.com/project/guide-de-lyon-b6a38/authentication/providers
2. Cliquez sur "Google"
3. Activez-le
4. Ajoutez un email de support
5. Enregistrez

Le bouton est bien dans le code, il devrait apparaître sur la page de login !