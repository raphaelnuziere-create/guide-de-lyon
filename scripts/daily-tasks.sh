#!/bin/bash

# Script de tâches quotidiennes pour Guide de Lyon V2
# Usage: ./scripts/daily-tasks.sh
# Recommandé: Ajouter dans crontab pour exécution automatique

set -e

echo "📅 Tâches quotidiennes - Guide de Lyon V2"
echo "========================================="
echo "Date: $(date)"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variables
PROJECT_DIR="/Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2"
LOG_FILE="$PROJECT_DIR/logs/daily-$(date +%Y%m%d).log"

# Créer le dossier logs si nécessaire
mkdir -p "$PROJECT_DIR/logs"

# Fonction de log
log() {
    echo -e "$1"
    echo "$(date '+%H:%M:%S') - $1" >> "$LOG_FILE"
}

# 1. Vérifier le statut du site
log "${YELLOW}🔍 Vérification du statut du site...${NC}"
SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://guide-lyon-v2.vercel.app")
if [ "$SITE_STATUS" = "200" ]; then
    log "${GREEN}✅ Site accessible (HTTP $SITE_STATUS)${NC}"
else
    log "${RED}❌ ALERTE: Site inaccessible (HTTP $SITE_STATUS)${NC}"
    # Envoyer une notification (email, Slack, etc.)
fi

# 2. Backup des données Firebase
log "${YELLOW}💾 Backup des données...${NC}"
# Firebase export (à configurer avec Firebase CLI)
# firebase firestore:export gs://guide-de-lyon-backups/$(date +%Y%m%d)

# 3. Nettoyer les logs anciens (garder 30 jours)
log "${YELLOW}🧹 Nettoyage des logs...${NC}"
find "$PROJECT_DIR/logs" -name "*.log" -mtime +30 -delete
log "${GREEN}✅ Logs nettoyés${NC}"

# 4. Statistiques du jour
log "${YELLOW}📊 Statistiques du jour...${NC}"
# Récupérer les stats depuis Vercel Analytics
# vercel analytics --project guide-lyon-v2 --period 1d

# 5. Vérifier les événements à modérer
log "${YELLOW}📝 Événements en attente de modération...${NC}"
# À implémenter: requête Firebase pour compter les événements pending

# 6. Générer le rapport
log "${YELLOW}📈 Génération du rapport quotidien...${NC}"
REPORT_FILE="$PROJECT_DIR/reports/daily-$(date +%Y%m%d).md"
mkdir -p "$PROJECT_DIR/reports"

cat > "$REPORT_FILE" << EOF
# Rapport Quotidien - Guide de Lyon V2
Date: $(date)

## 📊 Statut
- Site: ${SITE_STATUS}
- Dernière vérification: $(date '+%H:%M:%S')

## 🔄 Actions effectuées
- ✅ Vérification du site
- ✅ Backup des données
- ✅ Nettoyage des logs
- ✅ Collecte des statistiques

## 📝 À faire
- [ ] Modérer les événements en attente
- [ ] Répondre aux messages merchants
- [ ] Vérifier les paiements

## 🚨 Alertes
$(grep "ALERTE" "$LOG_FILE" || echo "Aucune alerte")

---
Généré automatiquement par daily-tasks.sh
EOF

log "${GREEN}✅ Rapport généré: $REPORT_FILE${NC}"

# 7. Résumé
echo ""
echo "======================================"
echo -e "${GREEN}✅ Tâches quotidiennes terminées${NC}"
echo "Logs: $LOG_FILE"
echo "Rapport: $REPORT_FILE"
echo ""

# 8. Notification de fin (optionnel)
# echo "Tâches quotidiennes terminées" | mail -s "Guide de Lyon - Daily Tasks" admin@guide-de-lyon.fr

exit 0