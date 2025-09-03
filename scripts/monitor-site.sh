#!/bin/bash

# Script de monitoring automatique pour Guide de Lyon V2
# À exécuter toutes les 5 minutes via cron

set -e

# Configuration
SITE_URL="https://guide-de-lyon.fr"
BACKUP_URL="https://guide-lyon-v2.vercel.app"
LOG_DIR="/Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2/logs/monitoring"
ALERT_EMAIL="admin@guide-de-lyon.fr"
SLACK_WEBHOOK="" # À configurer si vous utilisez Slack

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Créer le dossier de logs si nécessaire
mkdir -p "$LOG_DIR"

# Fichier de log
LOG_FILE="$LOG_DIR/monitor-$(date +%Y%m%d).log"

# Fonction de log
log_message() {
    local level=$1
    local message=$2
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> "$LOG_FILE"
    
    case $level in
        ERROR)
            echo -e "${RED}❌ $message${NC}"
            ;;
        WARNING)
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        SUCCESS)
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        *)
            echo "$message"
            ;;
    esac
}

# Fonction d'alerte
send_alert() {
    local message=$1
    local severity=$2
    
    # Log l'alerte
    log_message "ALERT" "$message"
    
    # Envoyer email (si configuré)
    if [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "🚨 Guide de Lyon - Alerte $severity" "$ALERT_EMAIL" 2>/dev/null || true
    fi
    
    # Envoyer sur Slack (si configuré)
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 **Alerte $severity** - Guide de Lyon\n$message\"}" \
            "$SLACK_WEBHOOK" 2>/dev/null || true
    fi
}

# 1. Test de disponibilité du site principal
log_message "INFO" "Démarrage du monitoring..."

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" --max-time 10)

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    log_message "SUCCESS" "Site principal accessible (HTTP $HTTP_STATUS)"
    SITE_UP=true
else
    log_message "ERROR" "Site principal inaccessible (HTTP $HTTP_STATUS)"
    SITE_UP=false
    send_alert "Site principal DOWN - HTTP $HTTP_STATUS" "CRITICAL"
fi

# 2. Test de performance
if [ "$SITE_UP" = true ]; then
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$SITE_URL" --max-time 10)
    RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)
    
    log_message "INFO" "Temps de réponse: ${RESPONSE_TIME_MS}ms"
    
    if [ "$RESPONSE_TIME_MS" -gt 3000 ]; then
        log_message "WARNING" "Site lent (${RESPONSE_TIME_MS}ms > 3000ms)"
        send_alert "Performance dégradée - Temps de réponse: ${RESPONSE_TIME_MS}ms" "WARNING"
    elif [ "$RESPONSE_TIME_MS" -gt 1000 ]; then
        log_message "INFO" "Performance acceptable (${RESPONSE_TIME_MS}ms)"
    else
        log_message "SUCCESS" "Performance excellente (${RESPONSE_TIME_MS}ms)"
    fi
fi

# 3. Test SSL/TLS
SSL_EXPIRY=$(echo | openssl s_client -servername guide-de-lyon.fr -connect guide-de-lyon.fr:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)

if [ -n "$SSL_EXPIRY" ]; then
    EXPIRY_EPOCH=$(date -j -f "%b %d %H:%M:%S %Y %Z" "$SSL_EXPIRY" +%s 2>/dev/null || date -d "$SSL_EXPIRY" +%s 2>/dev/null)
    CURRENT_EPOCH=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    log_message "INFO" "Certificat SSL expire dans $DAYS_UNTIL_EXPIRY jours"
    
    if [ "$DAYS_UNTIL_EXPIRY" -lt 7 ]; then
        send_alert "Certificat SSL expire dans $DAYS_UNTIL_EXPIRY jours !" "CRITICAL"
    elif [ "$DAYS_UNTIL_EXPIRY" -lt 30 ]; then
        log_message "WARNING" "Certificat SSL expire bientôt ($DAYS_UNTIL_EXPIRY jours)"
    else
        log_message "SUCCESS" "Certificat SSL valide ($DAYS_UNTIL_EXPIRY jours restants)"
    fi
fi

# 4. Vérifier les endpoints critiques
ENDPOINTS=(
    "/api/health"
    "/annuaire"
    "/evenements"
    "/pro/login"
)

for endpoint in "${ENDPOINTS[@]}"; do
    ENDPOINT_URL="${SITE_URL}${endpoint}"
    ENDPOINT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT_URL" --max-time 5)
    
    if [ "$ENDPOINT_STATUS" = "200" ] || [ "$ENDPOINT_STATUS" = "301" ] || [ "$ENDPOINT_STATUS" = "302" ]; then
        log_message "SUCCESS" "Endpoint $endpoint accessible"
    else
        log_message "ERROR" "Endpoint $endpoint inaccessible (HTTP $ENDPOINT_STATUS)"
        send_alert "Endpoint critique DOWN: $endpoint" "HIGH"
    fi
done

# 5. Vérifier l'espace disque (si on a accès au serveur)
if [ -d "/Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2" ]; then
    DISK_USAGE=$(df -h /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2 | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$DISK_USAGE" -gt 90 ]; then
        send_alert "Espace disque critique: ${DISK_USAGE}%" "CRITICAL"
    elif [ "$DISK_USAGE" -gt 80 ]; then
        log_message "WARNING" "Espace disque: ${DISK_USAGE}%"
    else
        log_message "INFO" "Espace disque: ${DISK_USAGE}%"
    fi
fi

# 6. Statistiques quotidiennes (une fois par jour à minuit)
CURRENT_HOUR=$(date +%H)
if [ "$CURRENT_HOUR" = "00" ]; then
    # Compter les incidents du jour
    ERRORS_TODAY=$(grep -c "ERROR" "$LOG_FILE" 2>/dev/null || echo "0")
    WARNINGS_TODAY=$(grep -c "WARNING" "$LOG_FILE" 2>/dev/null || echo "0")
    
    log_message "INFO" "=== RAPPORT QUOTIDIEN ==="
    log_message "INFO" "Erreurs: $ERRORS_TODAY"
    log_message "INFO" "Avertissements: $WARNINGS_TODAY"
    
    # Créer un rapport
    REPORT_FILE="$LOG_DIR/report-$(date +%Y%m%d).txt"
    cat > "$REPORT_FILE" << EOF
RAPPORT DE MONITORING - $(date)
================================

Site: $SITE_URL
Statut: $([ "$SITE_UP" = true ] && echo "EN LIGNE" || echo "HORS LIGNE")

Incidents aujourd'hui:
- Erreurs: $ERRORS_TODAY
- Avertissements: $WARNINGS_TODAY

Performance moyenne: ${RESPONSE_TIME_MS}ms
Certificat SSL: $DAYS_UNTIL_EXPIRY jours restants

================================
Généré automatiquement par monitor-site.sh
EOF

    log_message "SUCCESS" "Rapport quotidien généré: $REPORT_FILE"
fi

# 7. Nettoyage des vieux logs (garder 30 jours)
find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null || true
find "$LOG_DIR" -name "*.txt" -mtime +30 -delete 2>/dev/null || true

# Résumé final
if [ "$SITE_UP" = true ]; then
    log_message "SUCCESS" "Monitoring terminé - Site opérationnel"
    exit 0
else
    log_message "ERROR" "Monitoring terminé - SITE DOWN"
    exit 1
fi