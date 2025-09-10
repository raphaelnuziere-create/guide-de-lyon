# RAPPORT DE BACKUP COMPLET
## Guide de Lyon - 2025-09-10T21-40-10

### 📊 RÉSUMÉ EXÉCUTIF
- **Statut**: SUCCESS
- **Durée**: 0.01 minutes
- **Composants sauvegardés**: 5/5
- **Erreurs**: 0
- **Avertissements**: 0

### 📁 EMPLACEMENT BACKUP
`/Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2/backups/backup-2025-09-10T21-40-10`

### ✅ COMPOSANTS SAUVEGARDÉS
- **Database Backup**: 19 tables sauvegardées
- **Code Source Backup**: Archive créée (19MB)
- **Configurations Backup**: 7 fichiers de config sauvegardés
- **Assets Backup**: 145 fichiers copiés (17MB)
- **Backup Verification**: Intégrité: 3/4 composants vérifiés

### ❌ ERREURS RENCONTRÉES
Aucune erreur

### ⚠️ AVERTISSEMENTS
Aucun avertissement

### 🔄 PROCÉDURE DE RESTORATION
1. Décompresser l'archive du code source
2. Restaurer la base de données avec `schema.sql` puis `data.sql`
3. Copier les fichiers de configuration
4. Restaurer les assets dans `public/`
5. Installer les dépendances avec `npm install`
6. Configurer les variables d'environnement

### 📝 DÉTAILS TECHNIQUES
```json
{
  "timestamp": "2025-09-10T21:40:10.697Z",
  "startTime": 1757540410697,
  "status": "STARTED",
  "components": {
    "Database Backup": {
      "status": "SUCCESS",
      "message": "19 tables sauvegardées",
      "schemaFile": "/Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2/backups/backup-2025-09-10T21-40-10/database/schema.sql",
      "dataFile": "/Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2/backups/backup-2025-09-10T21-40-10/database/data.sql",
      "tablesCount": 19,
      "timestamp": "2025-09-10T21:40:10.700Z"
    },
    "Code Source Backup": {
      "status": "SUCCESS",
      "message": "Archive créée (19MB)",
      "archivePath": "/Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2/backups/backup-2025-09-10T21-40-10/code/guide-lyon-source-2025-09-10T21-40-10.tar.gz",
      "sizeBytes": 19640929,
      "sizeMB": 19,
      "timestamp": "2025-09-10T21:40:11.337Z"
    },
    "Configurations Backup": {
      "status": "SUCCESS",
      "message": "7 fichiers de config sauvegardés",
      "configsCount": 7,
      "envVarsCount": 17,
      "timestamp": "2025-09-10T21:40:11.338Z"
    },
    "Assets Backup": {
      "status": "SUCCESS",
      "message": "145 fichiers copiés (17MB)",
      "filesCount": 145,
      "totalSizeMB": 17,
      "timestamp": "2025-09-10T21:40:11.373Z"
    },
    "Backup Verification": {
      "status": "SUCCESS",
      "message": "Intégrité: 3/4 composants vérifiés",
      "integrityScore": 3,
      "totalChecks": 4,
      "results": {
        "databaseFiles": true,
        "codeArchive": true,
        "configFiles": true,
        "report": false
      },
      "timestamp": "2025-09-10T21:40:11.374Z"
    }
  },
  "errors": [],
  "warnings": [],
  "summary": {
    "totalComponents": 5,
    "successfulComponents": 5,
    "totalErrors": 0,
    "totalWarnings": 0,
    "backupDirectory": "/Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2/backups/backup-2025-09-10T21-40-10",
    "status": "SUCCESS"
  },
  "endTime": 1757540411374,
  "durationMs": 677,
  "durationMinutes": 0.01
}
```

---
*Rapport généré automatiquement le 10/09/2025 23:40:11*
