#!/bin/bash

# Script de configuration du domaine personnalisé
# Usage: ./scripts/setup-domain.sh

set -e

echo "🌐 Configuration du domaine Guide de Lyon"
echo "========================================="

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Domaines à configurer
DOMAIN="guide-de-lyon.fr"
WWW_DOMAIN="www.guide-de-lyon.fr"

echo -e "\n${YELLOW}1️⃣ Ajout des domaines sur Vercel...${NC}"

# Ajouter le domaine principal
echo -e "${BLUE}→ Ajout de ${DOMAIN}${NC}"
vercel domains add $DOMAIN || echo "Domaine peut-être déjà ajouté"

# Ajouter le sous-domaine www
echo -e "${BLUE}→ Ajout de ${WWW_DOMAIN}${NC}"
vercel domains add $WWW_DOMAIN || echo "Domaine peut-être déjà ajouté"

echo -e "\n${YELLOW}2️⃣ Configuration DNS requise chez votre registrar (OVH)${NC}"
echo "=================================================="
echo -e "${GREEN}Ajoutez ces enregistrements DNS:${NC}"
echo ""
echo "Type    Nom    Valeur"
echo "-----   ----   ------"
echo "A       @      76.76.21.21"
echo "A       @      76.76.21.98"
echo "CNAME   www    cname.vercel-dns.com."
echo ""

echo -e "\n${YELLOW}3️⃣ Lien du domaine au projet${NC}"
vercel alias set guide-lyon-v2.vercel.app $DOMAIN
vercel alias set guide-lyon-v2.vercel.app $WWW_DOMAIN

echo -e "\n${YELLOW}4️⃣ Vérification de la configuration${NC}"
echo -e "${BLUE}Vérification DNS...${NC}"
nslookup $DOMAIN || true
nslookup $WWW_DOMAIN || true

echo -e "\n${GREEN}✅ Configuration terminée !${NC}"
echo ""
echo "Actions suivantes:"
echo "1. Connectez-vous à votre compte OVH"
echo "2. Allez dans la gestion DNS du domaine"
echo "3. Ajoutez les enregistrements DNS ci-dessus"
echo "4. Attendez 2-24h pour la propagation DNS"
echo "5. Vérifiez avec: curl -I https://${DOMAIN}"
echo ""
echo "Pour vérifier le statut:"
echo "  vercel domains inspect $DOMAIN"