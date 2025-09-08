# 🚀 Guide de Lancement - Collecte d'Entreprises Indépendantes

## Configuration Requise

### 1. Obtenir une clé Google Maps API
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou sélectionner un existant
3. Activer l'API "Places API"
4. Créer une clé API dans "Identifiants"
5. Restreindre la clé à votre IP pour sécurité

### 2. Ajouter la clé API
```bash
# Option A: Variable d'environnement temporaire
export GOOGLE_MAPS_API_KEY="votre_cle_google_maps"

# Option B: Ajouter dans .env.local
echo 'GOOGLE_MAPS_API_KEY=votre_cle_google_maps' >> .env.local
```

## Lancer la Collecte

```bash
# Lancer le script
node scripts/collect-independent-businesses.js
```

## Ce que fait le script

### ✅ Collecte automatiquement :
- **40 restaurants indépendants** (bouchons, bistrots, tables familiales)
- **40 bars locaux** (caves à vin, bars de quartier, jazz bars)  
- **40 boutiques mode** (créateurs, vintage, concept stores)
- **40 salons beauté** (coiffeurs indépendants, spas, barbiers)
- **40 hôtels boutique** (hôtels familiaux, chambres d'hôtes)
- **40 lieux culturels** (galeries, librairies, théâtres indépendants)
- **40 services pro** (architectes, fleuristes, artisans)

**Total : ~280 entreprises indépendantes**

### ❌ Exclut automatiquement :
- McDonald's, Burger King, KFC, Subway
- Starbucks, Paul, Columbus Café
- Zara, H&M, Uniqlo, Mango
- Sephora, Marionnaud, Yves Rocher
- Ibis, Novotel, Mercure
- Fnac, Darty, Carrefour
- Et 50+ autres chaînes

## Critères de Sélection PME

Le script identifie automatiquement les PME avec ces critères :
- ✅ Moins de 500 avis Google (= entreprise locale)
- ✅ Nom ne contenant pas de marque chaîne
- ✅ Pas de type "supermarket" ou "department_store"
- ✅ Localisation dans Lyon et proche banlieue

## Données Collectées (100% légales)

Pour chaque entreprise :
- Nom et adresse
- Téléphone et site web (si disponibles)
- Note Google et nombre d'avis
- Horaires d'ouverture
- Photos (jusqu'à 3)
- Quartier/zone

## Résultats

### Base de données
Les entreprises sont automatiquement ajoutées à votre base Supabase avec :
- Status : `active` (visibles immédiatement)
- Catégorie appropriée
- Photos Google Places
- Métadonnées complètes

### Fichiers JSON
Sauvegardés dans `data/independent-businesses/` :
- Un fichier par secteur
- Un fichier global avec toutes les entreprises

## Temps Estimé

⏱️ **Durée totale : 30-45 minutes**
- Le script respecte les rate limits Google
- Pauses automatiques entre les requêtes
- ~280 entreprises collectées

## Exemple de Sortie

```
📁 Collecte secteur: restaurant-food
   🔍 Recherche: "bouchon lyonnais"
      ✅ Ajouté: Le Bouchon des Filles
      ✅ Ajouté: Chez Hugon
      ❌ Exclu (chaîne): McDonald's
      ✅ Ajouté: Daniel et Denise
   📊 Résultat: 40/40 entreprises trouvées
      Chaînes exclues: 15

📁 Collecte secteur: shopping-mode
   🔍 Recherche: "boutique créateur lyon"
      ✅ Ajouté: L'Atelier Soie
      ❌ Exclu (chaîne): Zara
      ✅ Ajouté: Rose Bunker
```

## Vérification

Après la collecte, vérifiez sur votre site :
1. Les entreprises apparaissent dans l'annuaire
2. Les photos sont visibles
3. Les catégories sont correctes
4. Aucune chaîne n'est présente

## Prochaine Étape

Une fois les ~280 entreprises ajoutées, vous pourrez dire aux PME :

> "Nous référençons déjà 300+ commerces indépendants lyonnais. 
> Rejoignez gratuitement notre communauté !"

C'est beaucoup plus vendeur que de partir de zéro ! 🚀