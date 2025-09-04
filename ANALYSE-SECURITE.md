# 🔒 ANALYSE DE SÉCURITÉ - Repository Public

## ✅ BONNE NOUVELLE : Votre projet est RELATIVEMENT SÉCURISÉ

### ✅ **CE QUI EST PROTÉGÉ :**
1. **.env.local** est dans .gitignore ✅
2. Vos vraies clés API ne sont PAS dans le repository
3. Les clés sensibles (Supabase service, Stripe) sont vides dans les exemples

### ⚠️ **RISQUES ACTUELS (FAIBLES) :**

#### 1. **Clé Firebase API exposée**
- `AIzaSyCx6EvZlp_pX9GaRu_NvCHTa3Tk_k18OU4` est visible
- **MAIS** : C'est une clé publique Firebase (NEXT_PUBLIC_)
- **Risque** : FAIBLE - Firebase a ses propres règles de sécurité
- **Action** : Configurez les règles Firebase pour limiter les domaines autorisés

#### 2. **Comptes de test hardcodés**
- Admin et merchant credentials dans le code
- **Risque** : MOYEN - Quelqu'un peut se connecter avec ces comptes
- **Action** : Changez les mots de passe après les tests

#### 3. **Structure du code visible**
- **Risque** : FAIBLE pour un site vitrine
- Pas de logique métier critique

## 🛡️ MESURES DE PROTECTION RECOMMANDÉES

### IMMÉDIAT (5 minutes) :
```bash
# 1. Vérifiez qu'aucune vraie clé n'est commitée
git log -p | grep -E "sk_live|service_role|SECRET"

# 2. Si vous trouvez des clés, supprimez l'historique Git
# (ATTENTION : cela réécrit l'historique)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

### COURT TERME (après que tout fonctionne) :

1. **Repassez en privé** avec les bonnes permissions Vercel :
```bash
gh repo edit raphaelnuziere-create/guide-de-lyon --visibility private --accept-visibility-change-consequences
```

2. **Dans Firebase Console** (console.firebase.google.com) :
   - Authentication → Settings → Authorized domains
   - Ajoutez SEULEMENT : www.guide-de-lyon.fr

3. **Changez les mots de passe des comptes test**

4. **Ajoutez des règles de sécurité Firestore** :
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'admin';
    }
  }
}
```

## 📊 ÉVALUATION DU RISQUE

### Pour votre projet Guide de Lyon :
- **Risque global : FAIBLE à MOYEN** ⚠️
- C'est un site vitrine, pas une banque
- Pas de données sensibles critiques
- Pas de paiements en ligne (pour l'instant)

### ✅ VOUS POUVEZ :
- Laisser PUBLIC temporairement pour résoudre les problèmes
- Repasser en PRIVÉ une fois que tout fonctionne

### ❌ NE PAS :
- Commiter des vraies clés API (Stripe live, etc.)
- Mettre des mots de passe réels dans le code
- Stocker des données clients dans le code

## 🔄 PLAN D'ACTION RECOMMANDÉ

1. **MAINTENANT** : Gardez PUBLIC pour faire fonctionner le site
2. **UNE FOIS FONCTIONNEL** : 
   - Changez les mots de passe test
   - Configurez Firebase security rules
   - Repassez en privé si vous préférez
3. **LONG TERME** : 
   - Utilisez des variables d'environnement pour TOUT
   - Mettez en place un CI/CD sécurisé
   - Audit de sécurité régulier

## 💡 CONSEIL DE DEV SENIOR

Pour un site comme le vôtre, avoir le repo public n'est pas dramatique SI :
- ✅ Les vraies clés sont dans Vercel (pas dans Git)
- ✅ Vous utilisez les règles de sécurité Firebase
- ✅ Vous changez les mots de passe test

Beaucoup de sites professionnels ont leur code en public (ex: freeCodeCamp, MDN, etc.).

La sécurité ne vient pas du fait de cacher le code, mais de :
- Bonnes pratiques (variables d'environnement)
- Authentification forte
- Validation côté serveur
- Règles de sécurité database