# 🧪 Guide de Test - Système d'Authentification Firebase

## 📋 Prérequis

### 1. Variables d'environnement Firebase Admin
Ajoutez ces variables dans `.env.local` pour que l'API fonctionne :

```env
# Firebase Admin SDK (nécessaire pour /api/auth/verify)
FIREBASE_ADMIN_PROJECT_ID=guide-de-lyon-b6a38
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@guide-de-lyon-b6a38.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Où les trouver :**
1. Allez sur : https://console.firebase.google.com/project/guide-de-lyon-b6a38/settings/serviceaccounts/adminsdk
2. Cliquez sur "Générer une nouvelle clé privée"
3. Téléchargez le fichier JSON
4. Copiez les valeurs dans `.env.local`

## 🚀 Lancer l'Application

```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2
npm run dev
```

L'application sera accessible sur : http://localhost:3000

## ✅ Tests à Effectuer

### Test 1 : Inscription Merchant (Firebase Auth)

1. **Ouvrir** : http://localhost:3000/pro/register
2. **Remplir le formulaire** :
   - Email : test@example.com
   - Société : Ma Boutique Test
   - Téléphone : 0612345678
   - Mot de passe : Test1234!
   - Confirmer : Test1234!
   - ✅ Accepter les conditions

3. **Cliquer** : "Créer mon compte"

**Résultat attendu** :
- ✅ Compte créé dans Firebase Auth
- ✅ Profil créé dans Firestore
- ✅ Sync avec Supabase (table merchants)
- ✅ Redirection vers /pro/dashboard

### Test 2 : Connexion Email/Password

1. **Ouvrir** : http://localhost:3000/pro/login
2. **Se connecter avec** :
   - Email : test@example.com
   - Mot de passe : Test1234!

**Résultat attendu** :
- ✅ Connexion réussie
- ✅ Token stocké dans cookie
- ✅ Redirection vers dashboard

### Test 3 : Connexion Google OAuth

1. **Ouvrir** : http://localhost:3000/pro/login
2. **Cliquer** : "Connexion avec Google"
3. **Choisir** un compte Google

**Résultat attendu** :
- ✅ Popup Google OAuth
- ✅ Création automatique du profil
- ✅ Redirection vers dashboard

### Test 4 : Protection des Routes

**Sans connexion**, essayez d'accéder à :
- http://localhost:3000/pro/dashboard
- http://localhost:3000/pro/settings

**Résultat attendu** :
- ❌ Accès refusé
- ✅ Redirection vers /pro/login

### Test 5 : Déconnexion

1. **Sur le dashboard**, cliquer sur l'icône déconnexion
2. **Vérifier** la redirection vers la page d'accueil

**Résultat attendu** :
- ✅ Session fermée
- ✅ Cookie supprimé
- ✅ Redirection vers /

## 🔍 Vérification dans Firebase Console

### 1. Utilisateurs créés
https://console.firebase.google.com/project/guide-de-lyon-b6a38/authentication/users

Vous devriez voir :
- Les comptes créés par email
- Les comptes Google OAuth

### 2. Données Firestore
https://console.firebase.google.com/project/guide-de-lyon-b6a38/firestore/data

Collections à vérifier :
- `users` → Profils utilisateurs
- `merchant_settings` → Paramètres merchants

### 3. Vérification Supabase
https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/editor

Table `merchants` devrait contenir :
- Les merchants synchronisés depuis Firebase

## 🐛 Debug & Troubleshooting

### Erreur : "Firebase admin initialization error"

**Solution** : Ajoutez les variables d'environnement Firebase Admin dans `.env.local`

### Erreur : "auth/popup-blocked"

**Solution** : Autorisez les popups pour localhost:3000 dans votre navigateur

### Erreur : "Token invalide" sur /pro/dashboard

**Solution** : 
1. Vérifiez que le cookie `auth-token` est présent (DevTools > Application > Cookies)
2. Déconnectez-vous et reconnectez-vous

### Console JavaScript

Ouvrez la console du navigateur (F12) pour voir :
- Les logs d'authentification
- Les erreurs Firebase
- Les requêtes API

## 📊 Flux d'Authentification

```
1. User → /pro/register
2. Firebase Auth → Création compte
3. Firestore → Création profil /users/{uid}
4. Firestore → Settings /merchant_settings/{uid}
5. Supabase → Sync table merchants
6. Cookie → Token JWT
7. Redirect → /pro/dashboard
```

## 🎯 Points de Test Critiques

| Fonctionnalité | URL | Status |
|----------------|-----|--------|
| Inscription | /pro/register | ⏳ À tester |
| Connexion | /pro/login | ⏳ À tester |
| Google OAuth | /pro/login | ⏳ À tester |
| Dashboard | /pro/dashboard | ⏳ À tester |
| Déconnexion | Logout button | ⏳ À tester |
| Protection routes | /pro/* | ⏳ À tester |

## 🚨 Test de Sécurité

1. **Token expiré** : Attendez 1h, le token devrait se rafraîchir automatiquement
2. **Accès non autorisé** : Essayez d'accéder à /admin sans être admin
3. **XSS** : Les inputs sont sanitizés automatiquement par React
4. **CSRF** : Protection via SameSite cookies

## 📝 Checklist Finale

- [ ] Inscription merchant fonctionne
- [ ] Login email/password fonctionne  
- [ ] Login Google OAuth fonctionne
- [ ] Dashboard merchant accessible
- [ ] Déconnexion fonctionne
- [ ] Routes protégées fonctionnent
- [ ] Données dans Firebase Console
- [ ] Sync avec Supabase OK

---

**Support** : Si vous rencontrez des problèmes, vérifiez :
1. La console du navigateur (F12)
2. Les logs du terminal Next.js
3. Firebase Console pour les erreurs