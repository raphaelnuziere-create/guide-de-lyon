#!/bin/bash

echo "🔍 Vérification du déploiement Guide de Lyon"
echo "==========================================="
echo ""

# URLs à tester
URLS=(
  "https://www.guide-de-lyon.fr"
  "https://www.guide-de-lyon.fr/connexion/pro"
  "https://www.guide-de-lyon.fr/connexion/admin"
  "https://www.guide-de-lyon.fr/inscription"
  "https://www.guide-de-lyon.fr/login"
)

# Fonction pour vérifier une URL
check_url() {
  local url=$1
  local status=$(curl -o /dev/null -s -w "%{http_code}" "$url")
  
  if [ "$status" -eq 200 ] || [ "$status" -eq 308 ] || [ "$status" -eq 307 ]; then
    echo "✅ $url - HTTP $status"
  else
    echo "❌ $url - HTTP $status"
  fi
}

echo "📋 Test des URLs principales :"
echo "-------------------------------"
for url in "${URLS[@]}"; do
  check_url "$url"
done

echo ""
echo "📊 Résumé :"
echo "-----------"
echo "Si toutes les URLs retournent ✅, le déploiement est réussi !"
echo ""
echo "🔐 Comptes de test disponibles :"
echo "- Admin : admin@guide-de-lyon.fr / Admin2025!"
echo "- Pro : merchant@guide-de-lyon.fr / Merchant2025!"
echo ""
echo "⚠️  N'oubliez pas de configurer les variables d'environnement dans Vercel !"
echo "Voir le fichier VERCEL_ENV_CHECK.md pour les détails."