#!/bin/bash

echo "🚀 Déploiement Firebase - Guide de Lyon"
echo "======================================="

# Couleurs pour l'affichage
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI n'est pas installé${NC}"
    echo "Installez-le avec: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✓ Firebase CLI détecté${NC}"

# Se positionner dans le bon répertoire
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

# 1. Installer les dépendances des Functions
echo -e "\n${YELLOW}📦 Installation des dépendances Functions...${NC}"
cd functions
npm install
cd ..
echo -e "${GREEN}✓ Dépendances installées${NC}"

# 2. Compiler les Functions TypeScript
echo -e "\n${YELLOW}🔨 Compilation des Functions...${NC}"
cd functions
npm run build
cd ..
echo -e "${GREEN}✓ Functions compilées${NC}"

# 3. Déployer les règles Firestore
echo -e "\n${YELLOW}📜 Déploiement des règles Firestore...${NC}"
firebase deploy --only firestore:rules --project guide-de-lyon-b6a38
echo -e "${GREEN}✓ Règles Firestore déployées${NC}"

# 4. Déployer les index Firestore
echo -e "\n${YELLOW}📊 Déploiement des index Firestore...${NC}"
firebase deploy --only firestore:indexes --project guide-de-lyon-b6a38
echo -e "${GREEN}✓ Index Firestore déployés${NC}"

# 5. Déployer les règles Storage
echo -e "\n${YELLOW}🗂️ Déploiement des règles Storage...${NC}"
firebase deploy --only storage:rules --project guide-de-lyon-b6a38
echo -e "${GREEN}✓ Règles Storage déployées${NC}"

# 6. Déployer les Functions
echo -e "\n${YELLOW}⚡ Déploiement des Cloud Functions...${NC}"
firebase deploy --only functions --project guide-de-lyon-b6a38
echo -e "${GREEN}✓ Functions déployées${NC}"

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Déploiement terminé avec succès !${NC}"
echo -e "${GREEN}================================${NC}"

echo -e "\n📋 Résumé:"
echo "  • Firestore Rules ✓"
echo "  • Firestore Indexes ✓"
echo "  • Storage Rules ✓"
echo "  • Cloud Functions ✓"

echo -e "\n🔗 Liens utiles:"
echo "  • Console Firebase: https://console.firebase.google.com/project/guide-de-lyon-b6a38"
echo "  • Firestore: https://console.firebase.google.com/project/guide-de-lyon-b6a38/firestore"
echo "  • Functions: https://console.firebase.google.com/project/guide-de-lyon-b6a38/functions"
echo "  • Storage: https://console.firebase.google.com/project/guide-de-lyon-b6a38/storage"

echo -e "\n💡 Prochaine étape:"
echo "  Testez les fonctionnalités sur https://www.guide-de-lyon.fr"