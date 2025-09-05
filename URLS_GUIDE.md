# 📍 Guide des URLs - Système d'Authentification

## ✅ NOUVELLES URLS OFFICIELLES

### 🔐 Connexion
- **Professionnels** : `/connexion/pro`
- **Administrateurs** : `/connexion/admin`

### 📝 Inscription
- **Professionnels** : `/inscription`
- Pas d'inscription pour admin (création manuelle)

### 📊 Espaces protégés
- **Dashboard Pro** : `/professionnel/dashboard`
- **Dashboard Admin** : `/administration/dashboard`

## 🔄 Redirections automatiques

Les anciennes URLs redirigent automatiquement :
- `/professionnel/login` → `/connexion/pro`
- `/professionnel/connexion` → `/connexion/pro`
- `/administration/login` → `/connexion/admin`
- `/administration/connexion` → `/connexion/admin`
- `/professionnel/register` → `/inscription`

## 🎯 Comment lancer le script d'initialisation

### Dans VSCode :
1. **Ouvrir le terminal** : `View > Terminal` ou `Ctrl+ù` (Mac: `Cmd+ù`)
2. **Sélectionner Bash** : Cliquer sur le `+` puis choisir "bash" ou "zsh"
3. **Lancer le script** :
```bash
node scripts/init-test-accounts.mjs
```

### Comptes de test créés :
- **Admin** : admin@guide-de-lyon.fr / Admin2025!
- **Merchant** : merchant@guide-de-lyon.fr / Merchant2025!

## 🚀 URLs de test rapide

Pour tester rapidement :
1. **Connexion Pro** : http://localhost:3000/connexion/pro
2. **Connexion Admin** : http://localhost:3000/connexion/admin
3. **Inscription** : http://localhost:3000/inscription

## 🛡️ Protection des routes

Le middleware protège automatiquement :
- `/professionnel/*` → Nécessite rôle "merchant"
- `/administration/*` → Nécessite rôle "admin"
- Pages publiques accessibles sans connexion

## ❌ URLs supprimées

Ces routes n'existent plus :
- ~~`/login`~~ 
- ~~`/login-admin`~~
- ~~`/login-pro`~~
- ~~`/connexion`~~ (page générique)

---

**Tout est maintenant unifié et fonctionnel !** 🎉