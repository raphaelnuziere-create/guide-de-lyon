# Configuration Cron Externe pour Scraping Horaire

## Problème
Vercel Hobby ne permet qu'un cron par jour. Pour scraper toutes les heures, utilisez un service externe gratuit.

## Solution 1 : cron-job.org (Gratuit)

1. Créez un compte sur https://cron-job.org
2. Créez un nouveau job :
   - **URL** : `https://www.guide-de-lyon.fr/api/scraping/run-full`
   - **Schedule** : Every hour at minute 0
   - **Method** : GET

## Solution 2 : UptimeRobot (Gratuit)

1. Créez un compte sur https://uptimerobot.com
2. Ajoutez un nouveau monitor :
   - **Monitor Type** : HTTP(s)
   - **URL** : `https://www.guide-de-lyon.fr/api/scraping/run-full`
   - **Monitoring Interval** : 60 minutes

## Solution 3 : GitHub Actions (Gratuit)

Créez `.github/workflows/hourly-scrape.yml` :

```yaml
name: Hourly Scraping
on:
  schedule:
    - cron: '0 * * * *'  # Toutes les heures
  workflow_dispatch:  # Permet le déclenchement manuel

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scraping
        run: |
          curl -X GET https://www.guide-de-lyon.fr/api/scraping/run-full
```

## Solution 4 : Upgrade Vercel

- Passez au plan Pro (20$/mois) pour des crons illimités
- Puis rechangez dans vercel.json : `"schedule": "0 * * * *"`

## Recommandation

**Utilisez cron-job.org** - C'est gratuit, fiable et fait exactement ce dont vous avez besoin.