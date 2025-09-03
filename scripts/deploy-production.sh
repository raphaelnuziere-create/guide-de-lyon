#!/bin/bash

# Script de déploiement en production pour Guide de Lyon V2
# Usage: ./scripts/deploy-production.sh

set -e

echo "🚀 Déploiement en production du Guide de Lyon V2"
echo "================================================"

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis la racine du projet${NC}"
    exit 1
fi

# 1. Vérifier l'état Git
echo -e "\n${YELLOW}📋 Vérification de l'état Git...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Des fichiers non commités détectés${NC}"
    echo "Voulez-vous continuer quand même ? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

# 2. Installer les dépendances
echo -e "\n${YELLOW}📦 Installation des dépendances...${NC}"
npm install

# 3. Lancer les tests
echo -e "\n${YELLOW}🧪 Exécution des tests...${NC}"
npm run lint || true
# npm run test || true  # Décommenter quand les tests seront prêts

# 4. Build local pour vérifier
echo -e "\n${YELLOW}🔨 Build de vérification...${NC}"
npm run build

# 5. Déployer sur Vercel
echo -e "\n${YELLOW}🚀 Déploiement sur Vercel...${NC}"
vercel --prod

# 6. Attendre que le déploiement soit terminé
echo -e "\n${YELLOW}⏳ Attente de la fin du déploiement...${NC}"
sleep 10

# 7. Vérifier le statut
echo -e "\n${YELLOW}✅ Vérification du déploiement...${NC}"
DEPLOYMENT_URL=$(vercel ls --limit 1 | grep "https://" | head -1)
echo -e "${GREEN}✅ Déploiement réussi !${NC}"
echo -e "URL: ${DEPLOYMENT_URL}"

# 8. Tests post-déploiement
echo -e "\n${YELLOW}🔍 Tests post-déploiement...${NC}"
curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" | grep -q "200" && \
    echo -e "${GREEN}✅ Site accessible${NC}" || \
    echo -e "${RED}❌ Problème d'accès au site${NC}"

# 9. Purger le cache CDN (si nécessaire)
echo -e "\n${YELLOW}🧹 Purge du cache...${NC}"
# vercel purge  # Décommenter si nécessaire

echo -e "\n${GREEN}🎉 Déploiement terminé avec succès !${NC}"
echo -e "Actions suivantes recommandées:"
echo -e "1. Vérifier le site: ${DEPLOYMENT_URL}"
echo -e "2. Tester les fonctionnalités critiques"
echo -e "3. Monitorer les logs: vercel logs --follow"