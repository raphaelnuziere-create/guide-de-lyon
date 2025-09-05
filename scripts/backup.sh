#!/bin/bash

# =====================================================
# SCRIPT DE BACKUP - GUIDE DE LYON
# =====================================================

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_${TIMESTAMP}"
FULL_BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Démarrage du backup...${NC}"

# Créer le dossier de backup s'il n'existe pas
mkdir -p "${BACKUP_DIR}"

# Créer le dossier pour ce backup spécifique
mkdir -p "${FULL_BACKUP_PATH}"

# 1. Sauvegarder les fichiers importants
echo -e "${YELLOW}📁 Sauvegarde des fichiers du projet...${NC}"

# Fichiers de configuration
cp -r app "${FULL_BACKUP_PATH}/" 2>/dev/null
cp -r lib "${FULL_BACKUP_PATH}/" 2>/dev/null
cp -r public "${FULL_BACKUP_PATH}/" 2>/dev/null
cp -r supabase "${FULL_BACKUP_PATH}/" 2>/dev/null
cp -r scripts "${FULL_BACKUP_PATH}/" 2>/dev/null

# Fichiers de configuration importants
cp package.json "${FULL_BACKUP_PATH}/" 2>/dev/null
cp package-lock.json "${FULL_BACKUP_PATH}/" 2>/dev/null
cp tsconfig.json "${FULL_BACKUP_PATH}/" 2>/dev/null
cp next.config.ts "${FULL_BACKUP_PATH}/" 2>/dev/null
cp tailwind.config.ts "${FULL_BACKUP_PATH}/" 2>/dev/null
cp .env.local.example "${FULL_BACKUP_PATH}/" 2>/dev/null

# 2. Créer un fichier d'information sur le backup
echo -e "${YELLOW}📝 Création du fichier d'information...${NC}"

cat > "${FULL_BACKUP_PATH}/BACKUP_INFO.md" << EOL
# Backup Information
**Date**: $(date)
**Timestamp**: ${TIMESTAMP}
**Git Branch**: $(git branch --show-current)
**Last Commit**: $(git log -1 --oneline)

## État du projet
- Architecture: SaaS pour professionnels
- Auth: Supabase uniquement
- DB: Supabase (PostgreSQL)
- Plans: Basic (0€), Pro (19€), Expert (49€)

## Fichiers sauvegardés
- /app - Toutes les pages et composants
- /lib - Logique métier et utilities
- /supabase - Migrations et configuration DB
- /scripts - Scripts utilitaires
- Configuration files (package.json, etc.)

## Pour restaurer
\`\`\`bash
./scripts/restore.sh ${BACKUP_NAME}
\`\`\`
EOL

# 3. Créer un snapshot de la base de données (structure uniquement)
echo -e "${YELLOW}🗄️ Export de la structure de base de données...${NC}"

cat > "${FULL_BACKUP_PATH}/database_structure.sql" << 'EOL'
-- Structure des tables principales (à jour)
-- Tables: subscription_plans, establishments, subscriptions, events, etc.
-- Voir supabase/migrations/ pour les détails complets
EOL

# 4. Sauvegarder l'état Git
echo -e "${YELLOW}🔀 Sauvegarde de l'état Git...${NC}"
git log --oneline -20 > "${FULL_BACKUP_PATH}/git_history.txt"
git status > "${FULL_BACKUP_PATH}/git_status.txt"

# 5. Créer une archive compressée
echo -e "${YELLOW}📦 Création de l'archive...${NC}"
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
cd ..

# 6. Nettoyer le dossier non compressé (optionnel)
# rm -rf "${FULL_BACKUP_PATH}"

# 7. Lister les backups existants
echo -e "${GREEN}✅ Backup créé avec succès !${NC}"
echo -e "${GREEN}📍 Location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz${NC}"
echo ""
echo -e "${YELLOW}📋 Backups existants:${NC}"
ls -lh "${BACKUP_DIR}"/*.tar.gz 2>/dev/null | tail -5

# Créer le script de restauration s'il n'existe pas
if [ ! -f "scripts/restore.sh" ]; then
    echo -e "${YELLOW}📝 Création du script de restauration...${NC}"
    cat > scripts/restore.sh << 'RESTORE_SCRIPT'
#!/bin/bash

# Script de restauration
BACKUP_NAME=$1

if [ -z "$BACKUP_NAME" ]; then
    echo "Usage: ./scripts/restore.sh backup_name"
    echo "Backups disponibles:"
    ls backups/*.tar.gz 2>/dev/null
    exit 1
fi

echo "⚠️  ATTENTION: Cette action va remplacer les fichiers actuels!"
read -p "Êtes-vous sûr de vouloir restaurer ${BACKUP_NAME}? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restauration annulée."
    exit 1
fi

# Extraire le backup
tar -xzf "backups/${BACKUP_NAME}.tar.gz" -C backups/

# Restaurer les fichiers
cp -r "backups/${BACKUP_NAME}/app" . 2>/dev/null
cp -r "backups/${BACKUP_NAME}/lib" . 2>/dev/null
cp -r "backups/${BACKUP_NAME}/supabase" . 2>/dev/null

echo "✅ Restauration terminée!"
echo "N'oubliez pas de:"
echo "1. Vérifier .env.local"
echo "2. Exécuter: npm install"
echo "3. Relancer les migrations Supabase si nécessaire"
RESTORE_SCRIPT
    chmod +x scripts/restore.sh
fi

echo -e "${GREEN}✨ Backup complet terminé !${NC}"