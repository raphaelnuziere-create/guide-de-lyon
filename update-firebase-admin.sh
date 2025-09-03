#!/bin/bash

echo "================================================"
echo "🔧 MISE À JOUR DES VARIABLES FIREBASE ADMIN"
echo "================================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📋 CE QUE VOUS DEVEZ FAIRE :${NC}"
echo ""
echo "1. Ouvrez le fichier JSON téléchargé (il est dans Téléchargements)"
echo "2. Copiez les 3 valeurs importantes"
echo "3. Je vais les mettre à jour sur Vercel"
echo ""
echo -e "${BLUE}Appuyez sur Entrée quand vous êtes prêt...${NC}"
read

# Supprimer les anciennes variables
echo -e "\n${YELLOW}Étape 1: Suppression des anciennes valeurs${NC}"
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

echo "Suppression de FIREBASE_ADMIN_PROJECT_ID..."
vercel env rm FIREBASE_ADMIN_PROJECT_ID production -y 2>/dev/null || true

echo "Suppression de FIREBASE_ADMIN_CLIENT_EMAIL..."
vercel env rm FIREBASE_ADMIN_CLIENT_EMAIL production -y 2>/dev/null || true

echo "Suppression de FIREBASE_ADMIN_PRIVATE_KEY..."
vercel env rm FIREBASE_ADMIN_PRIVATE_KEY production -y 2>/dev/null || true

echo -e "${GREEN}✅ Anciennes valeurs supprimées${NC}"

# Ajouter les nouvelles
echo -e "\n${YELLOW}Étape 2: Ajout des nouvelles valeurs${NC}"
echo ""
echo "Je vais vous demander de coller les 3 valeurs du fichier JSON"
echo ""

# PROJECT_ID
echo -e "\n${BLUE}1. PROJECT_ID${NC}"
echo "Dans le fichier JSON, cherchez : \"project_id\": \"...\""
echo "Copiez juste la valeur (probablement: guide-de-lyon-b6a38)"
echo ""
read -p "Collez le PROJECT_ID ici et appuyez sur Entrée: " PROJECT_ID

if [ -n "$PROJECT_ID" ]; then
    echo "$PROJECT_ID" | vercel env add FIREBASE_ADMIN_PROJECT_ID production
    echo -e "${GREEN}✅ PROJECT_ID ajouté${NC}"
else
    echo -e "${RED}❌ PROJECT_ID vide${NC}"
fi

# CLIENT_EMAIL
echo -e "\n${BLUE}2. CLIENT_EMAIL${NC}"
echo "Dans le fichier JSON, cherchez : \"client_email\": \"...\""
echo "Copiez tout l'email (ex: firebase-adminsdk-xxxxx@guide-de-lyon-b6a38.iam.gserviceaccount.com)"
echo ""
read -p "Collez le CLIENT_EMAIL ici et appuyez sur Entrée: " CLIENT_EMAIL

if [ -n "$CLIENT_EMAIL" ]; then
    echo "$CLIENT_EMAIL" | vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production
    echo -e "${GREEN}✅ CLIENT_EMAIL ajouté${NC}"
else
    echo -e "${RED}❌ CLIENT_EMAIL vide${NC}"
fi

# PRIVATE_KEY
echo -e "\n${BLUE}3. PRIVATE_KEY (la plus importante)${NC}"
echo "Dans le fichier JSON, cherchez : \"private_key\": \"...\""
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT :${NC}"
echo "- Copiez TOUT entre les guillemets"
echo "- Ça commence par: -----BEGIN PRIVATE KEY-----"
echo "- Ça finit par: -----END PRIVATE KEY-----"
echo "- C'est TRÈS long (environ 20-30 lignes)"
echo ""
echo "ASTUCE: Dans TextEdit, triple-cliquez sur la ligne pour tout sélectionner"
echo ""
read -p "Collez la PRIVATE_KEY complète ici et appuyez sur Entrée: " PRIVATE_KEY

if [ -n "$PRIVATE_KEY" ]; then
    echo "$PRIVATE_KEY" | vercel env add FIREBASE_ADMIN_PRIVATE_KEY production
    echo -e "${GREEN}✅ PRIVATE_KEY ajoutée${NC}"
else
    echo -e "${RED}❌ PRIVATE_KEY vide${NC}"
fi

# Redéployer
echo -e "\n${YELLOW}Étape 3: Redéploiement${NC}"
echo "Je vais maintenant redéployer le site avec les nouvelles variables..."
echo ""

vercel --prod

echo ""
echo "================================================"
echo -e "${GREEN}🎉 CONFIGURATION TERMINÉE !${NC}"
echo "================================================"
echo ""
echo "Votre site devrait maintenant être accessible :"
echo "👉 https://guide-lyon-v2.vercel.app"
echo ""
echo "Si vous avez toujours une erreur 401, vérifiez que :"
echo "1. Vous avez bien copié TOUTE la private_key"
echo "2. La private_key inclut BEGIN et END"
echo ""