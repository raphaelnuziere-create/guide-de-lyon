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
