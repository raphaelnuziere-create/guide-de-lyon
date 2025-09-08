# Scripts Google Places API

Ce dossier contient les scripts pour extraire des vraies données d'établissements via l'API Google Places.

## Scripts disponibles

### 1. `test-google-places.js`
Script de test qui vérifie que l'API Google Places fonctionne correctement avec seulement 3 établissements.

### 2. `scrape-google-places.js`
Script complet qui scrape tous les établissements définis et les insère dans la base de données Supabase.

## Configuration requise

### 1. Clé API Google Places

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet ou sélectionnez un projet existant
3. Activez les APIs suivantes :
   - **Places API**
   - **Maps JavaScript API**
4. Créez une clé API dans "Credentials"
5. Ajoutez la clé dans votre fichier `.env.local` :

```env
GOOGLE_PLACES_API_KEY=votre_clé_api_ici
```

### 2. Configuration Supabase
Assurez-vous que les variables suivantes sont dans `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Utilisation

### Étape 1 : Test
Lancez d'abord le script de test pour vérifier que tout fonctionne :

```bash
node scripts/test-google-places.js
```

Ce script va :
- Vérifier que la clé API est configurée
- Tester avec 3 établissements connus
- Afficher toutes les données récupérées
- Ne PAS insérer en base de données

### Étape 2 : Scraping complet
Une fois le test réussi, lancez le script complet :

```bash
node scripts/scrape-google-places.js
```

Ce script va :
- Scraper environ 60 établissements réels de Lyon
- Les insérer dans la base de données Supabase
- Gérer les photos dans la table `establishment_media`
- Parser les horaires d'ouverture
- Extraire toutes les métadonnées

### Alternative sans API (Puppeteer)
Si vous ne voulez pas utiliser l'API Google Places :

```bash
# Installer Puppeteer d'abord
npm install puppeteer

# Lancer le scraping avec Puppeteer
node scripts/scrape-google-places.js --puppeteer
```

## Données extraites

Le script récupère :

### Informations de base
- Nom de l'établissement
- Adresse complète + code postal
- Téléphone
- Site web
- Description (si disponible)

### Géolocalisation
- Latitude / Longitude précises
- Arrondissement de Lyon extrait automatiquement

### Médias
- Photos haute qualité (jusqu'à 5 par établissement)
- Stockées dans la table `establishment_media`

### Horaires
- Horaires d'ouverture pour chaque jour
- Format JSON compatible avec l'application

### Métadonnées
- Note Google (rating)
- Nombre d'avis
- ID Google Place (pour référence)
- Types d'établissement Google
- Statut business

## Structure des données

### Table `establishments`
Toutes les infos principales de l'établissement.

### Table `establishment_media`  
Photos et médias associés à chaque établissement.

### Format des horaires
```json
{
  "monday": {
    "open": "09:00",
    "close": "18:00", 
    "closed": false
  },
  "tuesday": {
    "open": null,
    "close": null,
    "closed": true
  }
}
```

## Catégories d'établissements

Le script scrape dans 6 catégories :

1. **restaurant-food** - 10 restaurants renommés
2. **bar-nightlife** - 10 bars et clubs
3. **shopping-mode** - 10 commerces et centres commerciaux
4. **beaute-bienetre** - 10 spas, salons, fitness
5. **hotel-hebergement** - 10 hôtels de différentes gammes
6. **culture-loisirs** - 10 musées, théâtres, attractions

## Limitations

### API Google Places
- Quota gratuit : 1000 requêtes/mois
- Au-delà : ~0.032€ par requête
- Rate limiting : ~1 requête/seconde recommandé

### Script Puppeteer
- Plus lent (2-3 secondes par établissement)
- Gratuit mais peut être bloqué par Google
- Moins fiable que l'API officielle

## Résolution de problèmes

### Erreur "API key not configured"
Vérifiez que `GOOGLE_PLACES_API_KEY` est bien dans `.env.local`

### Erreur "OVER_QUERY_LIMIT"
Vous avez dépassé votre quota gratuit. Attendez le mois suivant ou configurez la facturation.

### Erreur "REQUEST_DENIED"  
Vérifiez que les APIs Places et Maps JavaScript sont bien activées dans Google Cloud Console.

### Erreur de base de données
Vérifiez que les tables `establishments` et `establishment_media` existent dans Supabase.

## Support

Si vous rencontrez des problèmes :
1. Lancez d'abord le script de test
2. Vérifiez les logs d'erreur détaillés
3. Consultez la console Google Cloud pour les quotas API