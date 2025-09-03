#!/bin/bash

echo "========================================="
echo "🔍 TEST DES ROUTES - Guide de Lyon V2"
echo "========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Base URL - peut être changée pour tester différents environnements
BASE_URL="https://guide-de-lyon.fr"

# Si argument fourni, utiliser comme base URL
if [ -n "$1" ]; then
    BASE_URL="$1"
fi

echo "Test sur: $BASE_URL"
echo ""

# Liste des routes à tester
routes=(
    "/"
    "/a-propos"
    "/contact"
    "/mentions-legales"
    "/annuaire"
    "/evenements"
    "/etablissement/1"
    "/evenement/1"
    "/pro/login"
    "/pro/register"
    "/pro/upgrade"
)

echo "Test des routes publiques..."
echo "----------------------------------------"

# Tester chaque route
for route in "${routes[@]}"; do
    url="${BASE_URL}${route}"
    
    # Faire la requête et capturer le code HTTP et le temps de réponse
    response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" "$url")
    http_code=$(echo $response | cut -d'|' -f1)
    time_taken=$(echo $response | cut -d'|' -f2)
    
    # Afficher le résultat avec couleur selon le code
    if [[ "$http_code" == "200" ]] || [[ "$http_code" == "308" ]] || [[ "$http_code" == "307" ]]; then
        echo -e "${GREEN}✅${NC} $route → HTTP $http_code (${time_taken}s)"
    elif [[ "$http_code" == "401" ]]; then
        echo -e "${YELLOW}🔒${NC} $route → HTTP $http_code - Protection auth (${time_taken}s)"
    elif [[ "$http_code" == "404" ]]; then
        echo -e "${RED}❌${NC} $route → HTTP $http_code - Page non trouvée (${time_taken}s)"
    else
        echo -e "${RED}⚠️${NC} $route → HTTP $http_code (${time_taken}s)"
    fi
done

echo ""
echo "Test des routes protégées (doivent rediriger)..."
echo "----------------------------------------"

protected_routes=(
    "/pro"
    "/pro/dashboard"
    "/pro/events"
    "/admin"
    "/admin/events"
)

for route in "${protected_routes[@]}"; do
    url="${BASE_URL}${route}"
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [[ "$response" == "307" ]] || [[ "$response" == "401" ]]; then
        echo -e "${GREEN}✅${NC} $route → Protégé (HTTP $response)"
    else
        echo -e "${YELLOW}⚠️${NC} $route → HTTP $response (devrait être protégé)"
    fi
done

echo ""
echo "========================================="
echo "📊 RÉSUMÉ"
echo "========================================="

# Test du domaine principal
echo ""
echo "🌐 Test de guide-de-lyon.fr..."
domain_check=$(curl -s -o /dev/null -w "%{http_code}" "https://guide-de-lyon.fr")
if [[ "$domain_check" == "200" ]] || [[ "$domain_check" == "308" ]] || [[ "$domain_check" == "401" ]]; then
    echo -e "${GREEN}✅ Le domaine guide-de-lyon.fr est actif (HTTP $domain_check)${NC}"
else
    echo -e "${RED}❌ Problème avec guide-de-lyon.fr (HTTP $domain_check)${NC}"
fi

# Test du domaine Vercel
echo ""
echo "🔗 Test du domaine Vercel..."
vercel_check=$(curl -s -o /dev/null -w "%{http_code}" "https://guide-lyon-v2.vercel.app")
if [[ "$vercel_check" == "200" ]] || [[ "$vercel_check" == "308" ]] || [[ "$vercel_check" == "401" ]]; then
    echo -e "${GREEN}✅ guide-lyon-v2.vercel.app est actif (HTTP $vercel_check)${NC}"
else
    echo -e "${RED}❌ Problème avec le domaine Vercel (HTTP $vercel_check)${NC}"
fi

echo ""
echo "========================================="

# Instructions finales
if [[ "$domain_check" == "401" ]] || [[ "$vercel_check" == "401" ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  Note: Les codes 401 indiquent une protection Vercel.${NC}"
    echo -e "${YELLOW}   Utilisez un navigateur pour accéder au site.${NC}"
fi

echo ""
echo "Test terminé !"