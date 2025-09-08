#!/usr/bin/env node

/**
 * Script de collecte d'entreprises indépendantes lyonnaises
 * Objectif : 40 entreprises par secteur (PME et commerces locaux uniquement)
 * Exclut : McDonald's, Starbucks, Zara, H&M, etc.
 */

const { Client } = require('@googlemaps/google-maps-services-js');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = require('fs').readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

const googleClient = new Client({});
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || envVars.GOOGLE_PLACES_API_KEY || envVars.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

// Chaînes à exclure (grandes enseignes)
const EXCLUDED_CHAINS = [
  // Fast food
  'mcdonald', 'mcdo', 'burger king', 'kfc', 'subway', 'quick', 'five guys', 'dominos', 'pizza hut',
  // Cafés chaînes
  'starbucks', 'columbus café', 'costa coffee', 'paul', 'brioche dorée', 'classe croûte',
  // Mode
  'zara', 'h&m', 'h & m', 'uniqlo', 'mango', 'celio', 'jules', 'bershka', 'pull & bear', 'pull and bear',
  'kiabi', 'primark', 'c&a', 'c & a', 'gap', 'forever 21', 'promod', 'camaieu', 'pimkie', 'jennyfer',
  // Sport
  'decathlon', 'intersport', 'go sport', 'nike', 'adidas', 'foot locker', 'jd sports',
  // Beauté
  'sephora', 'nocibé', 'marionnaud', 'yves rocher', 'body shop', 'kiko', 'nyx',
  // Hotels
  'ibis', 'novotel', 'mercure', 'kyriad', 'campanile', 'premiere classe', 'b&b hotel', 'b & b',
  // Supermarchés
  'carrefour', 'auchan', 'leclerc', 'casino', 'monoprix', 'franprix', 'lidl', 'aldi',
  // Autres
  'fnac', 'darty', 'boulanger', 'cultura', 'ikea', 'but', 'conforama', 'maisons du monde'
];

// Configuration des recherches par secteur (termes spécifiques pour PME)
const SECTOR_SEARCHES = {
  'restaurant-food': {
    searches: [
      'restaurant traditionnel lyon',
      'bouchon lyonnais',
      'bistrot lyon',
      'restaurant familial lyon',
      'cuisine maison lyon',
      'table gastronomique lyon',
      'restaurant quartier lyon',
      'brasserie traditionnelle lyon',
      'restaurant italien indépendant lyon',
      'restaurant asiatique familial lyon',
      'pizzeria artisanale lyon',
      'crêperie lyon',
      'restaurant végétarien lyon',
      'restaurant bio lyon',
      'salon de thé lyon'
    ],
    types: ['restaurant', 'cafe', 'meal_takeaway'],
    targetCount: 40
  },
  
  'bar-nightlife': {
    searches: [
      'bar à vin lyon',
      'cave à bière lyon',
      'bar cocktails lyon',
      'pub irlandais lyon',
      'bar de quartier lyon',
      'bar tapas lyon',
      'bar jazz lyon',
      'bar rooftop lyon',
      'bar à champagne lyon',
      'bar speakeasy lyon',
      'bar ambiance lyon',
      'café concert lyon',
      'club privé lyon'
    ],
    types: ['bar', 'night_club'],
    targetCount: 40
  },
  
  'shopping-mode': {
    searches: [
      'boutique créateur lyon',
      'boutique mode indépendante lyon',
      'concept store lyon',
      'boutique vintage lyon',
      'friperie lyon',
      'boutique femme lyon',
      'boutique homme lyon',
      'boutique accessoires lyon',
      'maroquinerie artisanale lyon',
      'bijouterie créateur lyon',
      'chapellerie lyon',
      'mercerie lyon',
      'boutique chaussures lyon',
      'boutique lingerie lyon',
      'boutique enfants lyon'
    ],
    types: ['clothing_store', 'shoe_store', 'jewelry_store'],
    targetCount: 40
  },
  
  'beaute-bienetre': {
    searches: [
      'salon coiffure indépendant lyon',
      'barbier traditionnel lyon',
      'institut beauté lyon',
      'spa privatif lyon',
      'massage bien-être lyon',
      'onglerie lyon',
      'esthéticienne lyon',
      'salon afro lyon',
      'coiffeur bio lyon',
      'hammam lyon',
      'centre yoga lyon',
      'studio pilates lyon',
      'coach sportif lyon',
      'naturopathe lyon',
      'réflexologie lyon'
    ],
    types: ['beauty_salon', 'spa', 'hair_care'],
    targetCount: 40
  },
  
  'hotel-hebergement': {
    searches: [
      'hotel boutique lyon',
      'hotel familial lyon',
      'hotel indépendant lyon',
      'maison hôtes lyon',
      'chambre hôtes lyon',
      'auberge lyon',
      'hotel charme lyon',
      'hotel particulier lyon',
      'appart hotel indépendant lyon',
      'pension famille lyon',
      'gîte urbain lyon',
      'résidence hôtelière lyon'
    ],
    types: ['lodging'],
    targetCount: 40
  },
  
  'culture-loisirs': {
    searches: [
      'galerie art lyon',
      'atelier artiste lyon',
      'librairie indépendante lyon',
      'disquaire lyon',
      'salle spectacle lyon',
      'théâtre indépendant lyon',
      'cinéma art essai lyon',
      'escape game lyon',
      'salle escalade lyon',
      'studio danse lyon',
      'école musique lyon',
      'atelier créatif lyon',
      'musée privé lyon',
      'centre culturel lyon',
      'ludothèque lyon'
    ],
    types: ['art_gallery', 'book_store', 'museum', 'movie_theater'],
    targetCount: 40
  },
  
  'services-pro': {
    searches: [
      'agence immobilière indépendante lyon',
      'architecte lyon',
      'décorateur intérieur lyon',
      'photographe lyon',
      'graphiste freelance lyon',
      'agence communication lyon',
      'cabinet conseil lyon',
      'expert comptable lyon',
      'avocat indépendant lyon',
      'notaire lyon',
      'auto école lyon',
      'garage indépendant lyon',
      'pressing artisanal lyon',
      'cordonnerie lyon',
      'fleuriste indépendant lyon'
    ],
    types: ['real_estate_agency', 'lawyer', 'accounting', 'florist'],
    targetCount: 40
  }
};

// Zones de recherche (quartiers de Lyon)
const LYON_ZONES = [
  { lat: 45.7640, lng: 4.8357, name: 'Terreaux' },
  { lat: 45.7562, lng: 4.8320, name: 'Bellecour' },
  { lat: 45.7700, lng: 4.8340, name: 'Croix-Rousse' },
  { lat: 45.7780, lng: 4.8070, name: 'Vieux Lyon' },
  { lat: 45.7485, lng: 4.8373, name: 'Confluence' },
  { lat: 45.7609, lng: 4.8424, name: 'Part-Dieu' },
  { lat: 45.7480, lng: 4.8500, name: 'Jean Macé' },
  { lat: 45.7520, lng: 4.8600, name: 'Monplaisir' },
  { lat: 45.7350, lng: 4.8300, name: 'Gerland' },
  { lat: 45.7850, lng: 4.8550, name: 'Villeurbanne' }
];

class IndependentBusinessCollector {
  constructor() {
    this.results = {};
    this.stats = {
      total: 0,
      byCategory: {},
      excluded: 0
    };
  }

  // Vérifier si c'est une chaîne
  isChain(name) {
    const nameLower = name.toLowerCase();
    return EXCLUDED_CHAINS.some(chain => nameLower.includes(chain));
  }

  // Vérifier si c'est une PME (basé sur le nombre d'avis et autres critères)
  isPME(place) {
    // Critères pour identifier une PME
    if (place.user_ratings_total > 500) return false; // Trop d'avis = probablement une chaîne
    if (place.price_level === 4) return false; // Très cher = peut-être pas notre cible
    if (this.isChain(place.name)) return false;
    
    // Vérifier les types pour exclure les grandes surfaces
    const excludedTypes = ['supermarket', 'department_store', 'shopping_mall'];
    if (place.types?.some(type => excludedTypes.includes(type))) return false;
    
    return true;
  }

  // Collecter pour un secteur
  async collectForSector(sector, config) {
    console.log(`\n📁 Collecte secteur: ${sector}`);
    this.results[sector] = [];
    this.stats.byCategory[sector] = { searched: 0, found: 0, excluded: 0 };
    
    const foundPlaceIds = new Set();
    
    for (const searchTerm of config.searches) {
      if (this.results[sector].length >= config.targetCount) break;
      
      console.log(`   🔍 Recherche: "${searchTerm}"`);
      
      for (const zone of LYON_ZONES) {
        if (this.results[sector].length >= config.targetCount) break;
        
        try {
          const response = await googleClient.textSearch({
            params: {
              query: searchTerm,
              location: zone,
              radius: 1000,
              key: GOOGLE_API_KEY,
              language: 'fr',
              type: config.types[0] // Type principal
            }
          });
          
          if (response.data.results) {
            for (const place of response.data.results) {
              if (this.results[sector].length >= config.targetCount) break;
              if (foundPlaceIds.has(place.place_id)) continue;
              
              // Vérifier si c'est une PME indépendante
              if (!this.isPME(place)) {
                this.stats.byCategory[sector].excluded++;
                continue;
              }
              
              // Récupérer les détails
              try {
                const details = await this.getPlaceDetails(place.place_id);
                if (!details) continue;
                
                // Vérifier à nouveau avec les détails complets
                if (this.isChain(details.name)) {
                  console.log(`      ❌ Exclu (chaîne): ${details.name}`);
                  this.stats.byCategory[sector].excluded++;
                  continue;
                }
                
                const businessData = {
                  name: details.name,
                  address: details.formatted_address,
                  phone: details.formatted_phone_number || null,
                  website: details.website || null,
                  rating: details.rating || null,
                  reviews_count: details.user_ratings_total || 0,
                  price_level: details.price_level || null,
                  opening_hours: details.opening_hours?.weekday_text || null,
                  google_place_id: place.place_id,
                  photos: details.photos?.slice(0, 3).map(p => p.photo_reference) || [],
                  zone: zone.name,
                  category: sector
                };
                
                this.results[sector].push(businessData);
                foundPlaceIds.add(place.place_id);
                this.stats.byCategory[sector].found++;
                console.log(`      ✅ Ajouté: ${details.name}`);
                
              } catch (error) {
                console.error(`      ⚠️ Erreur détails: ${error.message}`);
              }
              
              // Rate limiting
              await this.delay(200);
            }
          }
          
          this.stats.byCategory[sector].searched++;
          
        } catch (error) {
          console.error(`   ❌ Erreur recherche: ${error.message}`);
        }
        
        // Pause entre les zones
        await this.delay(500);
      }
    }
    
    console.log(`   📊 Résultat: ${this.results[sector].length}/${config.targetCount} entreprises trouvées`);
    console.log(`      Chaînes exclues: ${this.stats.byCategory[sector].excluded}`);
  }

  // Récupérer les détails d'un lieu
  async getPlaceDetails(placeId) {
    try {
      const response = await googleClient.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name', 'formatted_address', 'formatted_phone_number', 'website',
            'rating', 'user_ratings_total', 'price_level', 'photos',
            'opening_hours', 'types'
          ].join(','),
          key: GOOGLE_API_KEY,
          language: 'fr'
        }
      });
      
      return response.data.result;
    } catch (error) {
      return null;
    }
  }

  // Sauvegarder dans la base de données
  async saveToDatabase() {
    console.log('\n💾 Sauvegarde dans la base de données...\n');
    
    for (const [sector, businesses] of Object.entries(this.results)) {
      console.log(`   Secteur ${sector}: ${businesses.length} entreprises`);
      
      for (const business of businesses) {
        try {
          // Vérifier si existe déjà
          const { data: existing } = await supabase
            .from('establishments')
            .select('id')
            .eq('google_place_id', business.google_place_id)
            .single();
          
          if (existing) {
            console.log(`      ⏭️ Déjà existant: ${business.name}`);
            continue;
          }
          
          // Préparer les données
          const establishmentData = {
            name: business.name,
            slug: this.generateSlug(business.name),
            description: `${business.name} est un établissement indépendant situé dans le quartier ${business.zone} à Lyon.`,
            category: business.category,
            address: business.address,
            postal_code: this.extractPostalCode(business.address),
            city: 'Lyon',
            phone: business.phone,
            website: business.website,
            email: null, // Pas d'email pour l'instant
            status: 'active',
            featured: false,
            metadata: {
              google_place_id: business.google_place_id,
              google_rating: business.rating,
              google_reviews_count: business.reviews_count,
              price_level: business.price_level,
              zone: business.zone,
              opening_hours: business.opening_hours,
              is_independent: true,
              source: 'google_places_public'
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Insérer
          const { data, error } = await supabase
            .from('establishments')
            .insert(establishmentData)
            .select()
            .single();
          
          if (error) {
            console.error(`      ❌ Erreur insertion ${business.name}:`, error.message);
          } else {
            console.log(`      ✅ Ajouté: ${business.name}`);
            
            // Ajouter les photos
            if (business.photos.length > 0 && data) {
              for (let i = 0; i < business.photos.length; i++) {
                const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${business.photos[i]}&key=${GOOGLE_API_KEY}`;
                
                await supabase
                  .from('establishment_media')
                  .insert({
                    establishment_id: data.id,
                    type: 'image',
                    url: photoUrl,
                    display_order: i,
                    is_active: true
                  });
              }
            }
          }
          
        } catch (error) {
          console.error(`      ❌ Erreur: ${error.message}`);
        }
        
        // Rate limiting
        await this.delay(100);
      }
    }
  }

  // Générer un slug
  generateSlug(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Extraire le code postal
  extractPostalCode(address) {
    const match = address?.match(/\b69\d{3}\b/);
    return match ? match[0] : '69000';
  }

  // Sauvegarder en JSON
  async saveToJSON() {
    const timestamp = new Date().toISOString().split('T')[0];
    const outputDir = path.join(__dirname, 'data', 'independent-businesses');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Sauvegarder par secteur
    for (const [sector, businesses] of Object.entries(this.results)) {
      const fileName = `${sector}-${timestamp}.json`;
      const filePath = path.join(outputDir, fileName);
      
      await fs.writeFile(filePath, JSON.stringify({
        sector,
        count: businesses.length,
        collectedAt: new Date().toISOString(),
        businesses
      }, null, 2));
      
      console.log(`   📄 Fichier sauvegardé: ${fileName}`);
    }
    
    // Créer un fichier global
    const globalFile = path.join(outputDir, `all-businesses-${timestamp}.json`);
    await fs.writeFile(globalFile, JSON.stringify({
      totalCount: Object.values(this.results).flat().length,
      byCategory: Object.fromEntries(
        Object.entries(this.results).map(([k, v]) => [k, v.length])
      ),
      collectedAt: new Date().toISOString(),
      data: this.results
    }, null, 2));
    
    console.log(`   📄 Fichier global: all-businesses-${timestamp}.json`);
  }

  // Générer un rapport
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT DE COLLECTE');
    console.log('='.repeat(60));
    
    let totalFound = 0;
    let totalExcluded = 0;
    
    for (const [sector, stats] of Object.entries(this.stats.byCategory)) {
      console.log(`\n${sector}:`);
      console.log(`   Trouvées: ${stats.found}`);
      console.log(`   Chaînes exclues: ${stats.excluded}`);
      totalFound += stats.found;
      totalExcluded += stats.excluded;
    }
    
    console.log('\n' + '-'.repeat(60));
    console.log(`TOTAL ENTREPRISES INDÉPENDANTES: ${totalFound}`);
    console.log(`TOTAL CHAÎNES EXCLUES: ${totalExcluded}`);
    console.log('='.repeat(60));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Collecte d\'Entreprises Indépendantes Lyonnaises');
  console.log('Objectif: 40 entreprises par secteur (PME uniquement)\n');
  
  const collector = new IndependentBusinessCollector();
  
  // Collecter pour chaque secteur
  for (const [sector, config] of Object.entries(SECTOR_SEARCHES)) {
    await collector.collectForSector(sector, config);
  }
  
  // Sauvegarder
  await collector.saveToJSON();
  await collector.saveToDatabase();
  
  // Rapport
  collector.generateReport();
  
  console.log('\n✨ Collecte terminée !');
  console.log('Les entreprises sont maintenant dans votre base de données.');
  console.log('Fichiers JSON sauvegardés dans: data/independent-businesses/');
}

// Vérifier la clé API
if (GOOGLE_API_KEY === 'YOUR_API_KEY_HERE') {
  console.error('⚠️  ATTENTION: Ajoutez votre clé Google Maps API');
  console.error('   export GOOGLE_MAPS_API_KEY=votre_cle');
  process.exit(1);
}

// Lancer
main().catch(console.error);