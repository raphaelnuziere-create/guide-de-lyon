#!/bin/bash

# Script d'aide pour configurer Firebase Admin
# Ce script vous guide étape par étape

echo "========================================="
echo "🔥 CONFIGURATION FIREBASE ADMIN"
echo "========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📋 PRÉREQUIS:${NC}"
echo "1. Avoir téléchargé le fichier JSON depuis Firebase Console"
echo "2. Savoir où se trouve ce fichier (probablement dans Téléchargements)"
echo ""

echo -e "${BLUE}Appuyez sur Entrée pour continuer...${NC}"
read

# Étape 1 : Ouvrir Firebase Console
echo -e "\n${GREEN}ÉTAPE 1: Télécharger la clé${NC}"
echo "========================================="
echo "Je vais ouvrir la page Firebase pour vous."
echo ""
echo "Une fois sur la page :"
echo "1. Cliquez sur 'Générer une nouvelle clé privée'"
echo "2. Confirmez et téléchargez le fichier JSON"
echo ""
echo -e "${BLUE}Appuyez sur Entrée pour ouvrir Firebase...${NC}"
read

open "https://console.firebase.google.com/project/guide-de-lyon-b6a38/settings/serviceaccounts/adminsdk"

echo ""
echo -e "${YELLOW}⏳ Attendez d'avoir téléchargé le fichier...${NC}"
echo -e "${BLUE}Une fois téléchargé, appuyez sur Entrée${NC}"
read

# Étape 2 : Trouver le fichier
echo -e "\n${GREEN}ÉTAPE 2: Localiser le fichier${NC}"
echo "========================================="
echo "Recherche du fichier Firebase dans vos Téléchargements..."
echo ""

# Chercher le fichier
DOWNLOADS_DIR="$HOME/Downloads"
FIREBASE_FILE=$(ls -t "$DOWNLOADS_DIR"/guide-de-lyon-b6a38-*.json 2>/dev/null | head -1)

if [ -z "$FIREBASE_FILE" ]; then
    echo -e "${RED}❌ Fichier non trouvé dans Téléchargements${NC}"
    echo ""
    echo "Veuillez entrer le chemin complet du fichier JSON :"
    echo "Exemple: /Users/vous/Downloads/guide-de-lyon-b6a38-xxxxx.json"
    read -p "Chemin: " FIREBASE_FILE
    
    if [ ! -f "$FIREBASE_FILE" ]; then
        echo -e "${RED}❌ Fichier introuvable à cet emplacement${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Fichier trouvé: $(basename "$FIREBASE_FILE")${NC}"
fi

# Étape 3 : Extraire les valeurs
echo -e "\n${GREEN}ÉTAPE 3: Extraction des valeurs${NC}"
echo "========================================="
echo "Lecture du fichier JSON..."
echo ""

# Extraire les valeurs (en utilisant grep et sed pour simplicité)
PROJECT_ID=$(grep '"project_id"' "$FIREBASE_FILE" | sed 's/.*"project_id": *"\([^"]*\)".*/\1/')
CLIENT_EMAIL=$(grep '"client_email"' "$FIREBASE_FILE" | sed 's/.*"client_email": *"\([^"]*\)".*/\1/')

# Pour la private key, c'est plus complexe car elle est multi-ligne
PRIVATE_KEY=$(grep -A 50 '"private_key"' "$FIREBASE_FILE" | sed -n '/"private_key":/,/"client_email":/p' | sed '/"client_email":/d' | sed 's/.*"private_key": *"\(.*\)".*/\1/' | tr -d '\n' | sed 's/\\n/\n/g')

if [ -z "$PROJECT_ID" ] || [ -z "$CLIENT_EMAIL" ] || [ -z "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ Impossible d'extraire toutes les valeurs${NC}"
    echo "Vous devrez les copier manuellement depuis le fichier."
    echo ""
    echo "Ouvrir le fichier ?"
    echo "1) Oui, ouvrir avec TextEdit"
    echo "2) Non, je vais le faire moi-même"
    read -p "Choix (1 ou 2): " choice
    
    if [ "$choice" = "1" ]; then
        open -a TextEdit "$FIREBASE_FILE"
    fi
    
    echo ""
    echo "Une fois que vous avez les valeurs, continuez avec les commandes manuelles ci-dessous."
else
    echo -e "${GREEN}✅ Valeurs extraites avec succès !${NC}"
    echo ""
    echo -e "${BLUE}Résumé :${NC}"
    echo "PROJECT_ID: $PROJECT_ID"
    echo "CLIENT_EMAIL: $CLIENT_EMAIL"
    echo "PRIVATE_KEY: [Masquée - ${#PRIVATE_KEY} caractères]"
fi

# Étape 4 : Ajouter sur Vercel
echo -e "\n${GREEN}ÉTAPE 4: Configuration Vercel${NC}"
echo "========================================="

if [ -n "$PROJECT_ID" ] && [ -n "$CLIENT_EMAIL" ] && [ -n "$PRIVATE_KEY" ]; then
    echo "Je vais maintenant ajouter ces variables sur Vercel."
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Les commandes vont s'exécuter automatiquement${NC}"
    echo -e "${BLUE}Appuyez sur Entrée pour continuer ou Ctrl+C pour annuler${NC}"
    read
    
    cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2
    
    # Project ID
    echo -e "\n${BLUE}Ajout de FIREBASE_ADMIN_PROJECT_ID...${NC}"
    echo "$PROJECT_ID" | vercel env add FIREBASE_ADMIN_PROJECT_ID production --force
    
    # Client Email
    echo -e "\n${BLUE}Ajout de FIREBASE_ADMIN_CLIENT_EMAIL...${NC}"
    echo "$CLIENT_EMAIL" | vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production --force
    
    # Private Key
    echo -e "\n${BLUE}Ajout de FIREBASE_ADMIN_PRIVATE_KEY...${NC}"
    echo "$PRIVATE_KEY" | vercel env add FIREBASE_ADMIN_PRIVATE_KEY production --force
    
    echo -e "\n${GREEN}✅ Variables ajoutées avec succès !${NC}"
    
    # Étape 5 : Redéployer
    echo -e "\n${GREEN}ÉTAPE 5: Redéploiement${NC}"
    echo "========================================="
    echo "Je vais maintenant redéployer le site..."
    echo ""
    
    vercel --prod
    
    echo -e "\n${GREEN}🎉 CONFIGURATION TERMINÉE !${NC}"
    echo ""
    echo "Votre site devrait maintenant être accessible sans erreur 401."
    echo "URL: https://guide-lyon-v2.vercel.app"
    
else
    echo -e "\n${YELLOW}Configuration manuelle requise${NC}"
    echo "========================================="
    echo ""
    echo "Copiez ces commandes et exécutez-les une par une :"
    echo ""
    echo -e "${BLUE}# 1. Aller dans le projet${NC}"
    echo "cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2"
    echo ""
    echo -e "${BLUE}# 2. Ajouter PROJECT_ID${NC}"
    echo "vercel env add FIREBASE_ADMIN_PROJECT_ID production"
    echo "# Collez: guide-de-lyon-b6a38"
    echo ""
    echo -e "${BLUE}# 3. Ajouter CLIENT_EMAIL${NC}"
    echo "vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production"
    echo "# Collez l'email du fichier JSON"
    echo ""
    echo -e "${BLUE}# 4. Ajouter PRIVATE_KEY${NC}"
    echo "vercel env add FIREBASE_ADMIN_PRIVATE_KEY production"
    echo "# Collez TOUTE la private_key du fichier JSON"
    echo ""
    echo -e "${BLUE}# 5. Redéployer${NC}"
    echo "vercel --prod"
fi

echo ""
echo "========================================="
echo -e "${GREEN}📚 Documentation${NC}"
echo "========================================="
echo "Guide détaillé: GUIDE-FIREBASE-ADMIN-DETAILLE.md"
echo "En cas de problème: Capturez l'erreur et je vous aiderai"
echo ""