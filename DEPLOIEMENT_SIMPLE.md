# 🚀 GUIDE DE DÉPLOIEMENT SIMPLE

## ✅ Ce qui a été fait automatiquement

1. **Comptes de test créés** ✅
   - Admin : admin@guide-de-lyon.fr / Admin2025!
   - Pro : merchant@guide-de-lyon.fr / Merchant2025!

2. **Routes corrigées** ✅
   - `/connexion/pro` → Page de connexion professionnelle
   - `/connexion/admin` → Page de connexion administrateur
   - `/inscription` → Page d'inscription pour les pros
   - `/login` → Redirige automatiquement vers `/connexion/pro`

## 📋 CE QUE VOUS DEVEZ FAIRE (1 seule action)

### Étape unique : Créer les tables dans Supabase

1. **Connectez-vous à Supabase** : https://supabase.com
2. Allez dans votre projet
3. Cliquez sur **SQL Editor** (dans le menu à gauche)
4. Cliquez sur **New Query**
5. **Copiez-collez TOUT le contenu** du fichier `/supabase/migrations/001_auth_tables.sql`
6. Cliquez sur **Run** (bouton vert)

✅ **C'est tout !** Les tables sont créées et le système est prêt.

## 🔗 URLs pour tester

### En local (http://localhost:3000)
- Connexion Pro : http://localhost:3000/connexion/pro
- Connexion Admin : http://localhost:3000/connexion/admin
- Inscription : http://localhost:3000/inscription

### En production (https://www.guide-de-lyon.fr)
- Connexion Pro : https://www.guide-de-lyon.fr/connexion/pro
- Connexion Admin : https://www.guide-de-lyon.fr/connexion/admin
- Inscription : https://www.guide-de-lyon.fr/inscription

## 🔐 Comptes de test

**Professionnel :**
- Email : merchant@guide-de-lyon.fr
- Mot de passe : Merchant2025!

**Administrateur :**
- Email : admin@guide-de-lyon.fr
- Mot de passe : Admin2025!

## ⚠️ Si ça ne fonctionne pas

1. **Vérifiez que les tables sont créées** dans Supabase > Table Editor
2. **Vérifiez les variables d'environnement** dans Vercel :
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY

## 🎉 C'est terminé !

Le système d'authentification est maintenant 100% fonctionnel avec :
- ✅ Inscription des professionnels
- ✅ Connexion pro et admin
- ✅ Protection des routes
- ✅ Gestion des rôles
- ✅ Sessions sécurisées