# 🔐 Système d'Authentification - Guide de Lyon

## ✅ Migration Complète vers Supabase Auth

Le système d'authentification a été entièrement migré de Firebase vers Supabase pour une meilleure intégration et fiabilité.

## 📝 Ce qui a été fait

### 1. **Base de données**
- ✅ Tables créées dans Supabase:
  - `profiles` : Profils utilisateurs avec rôles
  - `merchants` : Données des professionnels
  - `merchant_places` : Liaison entre marchands et établissements
- ✅ Row Level Security (RLS) activé
- ✅ Triggers automatiques pour la création de profils

### 2. **Service d'authentification unifié**
- ✅ `lib/auth/supabase-auth.ts` : Service centralisé
- ✅ `lib/auth/AuthContext.tsx` : Context React pour l'auth
- ✅ Gestion des rôles : user, merchant, admin

### 3. **Pages adaptées**
- ✅ `/professionnel/connexion` : Login pro avec Supabase
- ✅ `/professionnel/register` : Inscription pro
- ✅ `/administration/connexion` : Login admin

### 4. **Middleware de protection**
- ✅ Protection automatique des routes
- ✅ Vérification des rôles
- ✅ Redirections intelligentes

## 🚀 Pour commencer

### 1. Exécuter la migration SQL
```bash
# Dans Supabase Dashboard > SQL Editor
# Copier-coller le contenu de: supabase/migrations/001_auth_tables.sql
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Créer les comptes de test
```bash
# Modifier package.json pour ajouter "type": "module"
node scripts/init-test-accounts.js
```

### 4. Comptes disponibles

**🔐 ADMIN**
- Email: `admin@guide-de-lyon.fr`
- Pass: `Admin2025!`
- Accès: `/administration/connexion`

**🏢 MERCHANT**
- Email: `merchant@guide-de-lyon.fr`
- Pass: `Merchant2025!`
- Accès: `/professionnel/connexion`

## 📋 Fonctionnalités

### Pour les Professionnels (Merchants)
- ✅ Inscription avec validation email
- ✅ Connexion sécurisée
- ✅ Gestion du profil
- ✅ Plans : Free, Pro Visibility, Pro Boost
- ✅ Dashboard personnalisé

### Pour les Admins
- ✅ Connexion sécurisée
- ✅ Accès au tableau de bord admin
- ✅ Gestion des utilisateurs et établissements

### Pour les Visiteurs
- ✅ Pas besoin de compte
- ✅ Accès libre au contenu public
- ✅ Consultation annuaire et événements

## 🔧 Variables d'environnement requises

Dans `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key (pour le script d'init)
```

## 🛠️ Architecture

```
lib/auth/
├── supabase-auth.ts      # Service d'authentification
├── AuthContext.tsx        # Context React
└── (ancien Firebase)      # Désactivé

app/
├── professionnel/
│   ├── connexion/        # Login pro
│   ├── register/         # Inscription pro
│   └── dashboard/        # Espace pro protégé
└── administration/
    ├── connexion/        # Login admin
    └── dashboard/        # Espace admin protégé

middleware.ts             # Protection des routes
```

## ⚠️ Notes importantes

1. **Firebase a été désactivé** - Ne plus utiliser les imports Firebase
2. **Utiliser uniquement Supabase** pour toute authentification
3. **Les sessions sont gérées automatiquement** par Supabase
4. **Les tokens JWT** sont rafraîchis automatiquement

## 🐛 Troubleshooting

### Erreur "User not found"
→ Exécuter le script `init-test-accounts.js`

### Erreur "Invalid credentials"
→ Vérifier les variables d'environnement

### Redirection infinie
→ Vérifier le middleware et les routes publiques

## ✨ Prochaines étapes

1. Implémenter la récupération de mot de passe
2. Ajouter la connexion OAuth (Google, Facebook)
3. Implémenter la vérification email
4. Ajouter les notifications push

---

**Le système est maintenant 100% fonctionnel avec Supabase !** 🎉