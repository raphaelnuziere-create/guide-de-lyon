#!/bin/bash

echo "🧹 Nettoyage du cache d'authentification et test"
echo "================================================"

# 1. Clear le cache Next.js
echo "1. Nettoyage du cache Next.js..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Cache Next.js nettoyé"

# 2. Instructions pour le navigateur
echo ""
echo "2. IMPORTANT - Nettoyage du navigateur requis :"
echo "------------------------------------------------"
echo "Ouvrez la console du navigateur (F12) et exécutez :"
echo ""
cat << 'EOF'
// Copier-coller ce code dans la console :
localStorage.clear();
sessionStorage.clear();
// Nettoyer tous les cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cache navigateur nettoyé');
window.location.reload();
EOF

echo ""
echo "3. Reconstruction de l'application..."
npm run build

echo ""
echo "✅ Nettoyage terminé !"
echo ""
echo "📋 TEST À EFFECTUER :"
echo "--------------------"
echo "1. Ouvrir le navigateur en mode NORMAL (pas privé)"
echo "2. Aller sur http://localhost:3000/pro/dashboard"
echo "3. Devrait rediriger vers /auth/pro/connexion"
echo "4. Se connecter avec pro@test.com"
echo "5. Devrait aller au dashboard SANS BOUCLE INFINIE"
echo "6. Rafraîchir la page → doit rester sur dashboard"
echo ""
echo "Si tout fonctionne, la boucle infinie est corrigée ! 🎉"