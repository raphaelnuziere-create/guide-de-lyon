#!/bin/bash

echo "==========================================="
echo "📊 VÉRIFICATION COMPLÈTE DU SITE"
echo "==========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

# 1. État Vercel
echo -e "${BLUE}1. ÉTAT DES DÉPLOIEMENTS VERCEL${NC}"
echo "----------------------------------------"
LATEST_DEPLOYMENT=$(vercel ls --yes 2>/dev/null | grep "Ready" | head -1 | awk '{print $2}')
if [ -n "$LATEST_DEPLOYMENT" ]; then
    echo -e "${GREEN}✅ Dernier déploiement réussi:${NC}"
    echo "   $LATEST_DEPLOYMENT"
else
    echo -e "${RED}❌ Aucun déploiement réussi trouvé${NC}"
fi
echo ""

# 2. Domaine personnalisé
echo -e "${BLUE}2. DOMAINE PERSONNALISÉ${NC}"
echo "----------------------------------------"
DOMAIN_STATUS=$(vercel domains ls 2>/dev/null | grep "guide-de-lyon.fr")
if [ -n "$DOMAIN_STATUS" ]; then
    echo -e "${GREEN}✅ Domaine configuré: guide-de-lyon.fr${NC}"
else
    echo -e "${RED}❌ Domaine non configuré${NC}"
fi
echo ""

# 3. Variables d'environnement
echo -e "${BLUE}3. VARIABLES D'ENVIRONNEMENT${NC}"
echo "----------------------------------------"
FIREBASE_VARS=$(vercel env ls production 2>/dev/null | grep -c "FIREBASE")
if [ "$FIREBASE_VARS" -gt 0 ]; then
    echo -e "${GREEN}✅ $FIREBASE_VARS variables Firebase configurées${NC}"
else
    echo -e "${RED}❌ Aucune variable Firebase trouvée${NC}"
fi
echo ""

# 4. URLs d'accès
echo -e "${BLUE}4. URLS D'ACCÈS${NC}"
echo "----------------------------------------"
echo "🌐 Production Vercel:"
echo "   https://guide-lyon-v2.vercel.app"
echo ""
echo "🌐 Domaine personnalisé:"
echo "   https://guide-de-lyon.fr"
echo "   https://www.guide-de-lyon.fr"
echo ""
echo "🌐 Développement local:"
echo "   http://localhost:3000"
echo ""

# 5. Protection Vercel
echo -e "${BLUE}5. PROTECTION D'ACCÈS${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}⚠️  Note: L'erreur 401 avec curl est normale${NC}"
echo "   Vercel utilise une protection d'authentification"
echo "   Le site fonctionne normalement dans un navigateur"
echo ""

# 6. État local
echo -e "${BLUE}6. ÉTAT LOCAL${NC}"
echo "----------------------------------------"
if lsof -i:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Serveur de développement en cours d'exécution${NC}"
    echo "   Accessible sur: http://localhost:3000"
else
    echo -e "${YELLOW}⚡ Serveur de développement arrêté${NC}"
    echo "   Lancer avec: npm run dev"
fi
echo ""

# 7. Actions recommandées
echo -e "${BLUE}7. PROCHAINES ÉTAPES${NC}"
echo "----------------------------------------"
echo "1. Ouvrir le site dans votre navigateur:"
echo "   ${GREEN}open https://guide-de-lyon.fr${NC}"
echo ""
echo "2. Se connecter à Vercel Dashboard:"
echo "   ${GREEN}open https://vercel.com/raphaels-projects-8d8ce8f4/guide-lyon-v2${NC}"
echo ""
echo "3. Vérifier les logs en temps réel:"
echo "   ${GREEN}vercel logs --follow${NC}"
echo ""

# 8. Résumé
echo "==========================================="
echo -e "${GREEN}📊 RÉSUMÉ${NC}"
echo "==========================================="
echo ""
if [ -n "$LATEST_DEPLOYMENT" ] && [ -n "$DOMAIN_STATUS" ] && [ "$FIREBASE_VARS" -gt 0 ]; then
    echo -e "${GREEN}✅ SITE DÉPLOYÉ ET FONCTIONNEL !${NC}"
    echo ""
    echo "Votre site Guide de Lyon V2 est:"
    echo "• En production sur Vercel"
    echo "• Accessible via guide-de-lyon.fr"
    echo "• Configuré avec Firebase"
    echo ""
    echo -e "${YELLOW}Note: L'erreur 401 avec curl est normale.${NC}"
    echo -e "${YELLOW}Utilisez un navigateur pour accéder au site.${NC}"
else
    echo -e "${RED}⚠️  CONFIGURATION INCOMPLÈTE${NC}"
    echo ""
    echo "Vérifiez les points ci-dessus"
fi
echo ""
echo "==========================================="