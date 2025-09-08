#!/usr/bin/env node

/**
 * Script pour peupler la base avec les établissements connus de Lyon
 * Phase 1 : Créer de la crédibilité avec les "grandes enseignes"
 * 
 * STRATÉGIE:
 * 1. Ajouter les établissements emblématiques (données publiques uniquement)
 * 2. Utiliser comme vitrine pour attirer les PME
 * 3. Argument de vente : "Rejoignez Paul Bocuse, Brasserie Georges..."
 */

const { createClient } = require('@supabase/supabase-js');
const { Client } = require('@googlemaps/google-maps-services-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration Supabase
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
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// ÉTABLISSEMENTS EMBLÉMATIQUES DE LYON
// Ces établissements servent de "vitrine" pour attirer les PME
const EMBLEMATIC_ESTABLISHMENTS = {
  'restaurant-food': [
    // Restaurants étoilés et historiques
    { name: "Paul Bocuse", address: "40 rue de la Plage, Collonges-au-Mont-d'Or" },
    { name: "Brasserie Georges", address: "30 cours de Verdun, Lyon 2e" },
    { name: "La Mère Brazier", address: "12 rue Royale, Lyon 1er" },
    { name: "Les Halles de Lyon Paul Bocuse", address: "102 cours Lafayette, Lyon 3e" },
    { name: "Le Bouchon Daniel et Denise", address: "156 rue de Créqui, Lyon 3e" },
    { name: "Têtedoie", address: "4 rue du Professeur Pierre Marion, Lyon 5e" },
    { name: "Le Neuvième Art", address: "173 rue Cuvier, Lyon 6e" },
    { name: "Brasserie Le Nord", address: "18 rue Neuve, Lyon 2e" },
    { name: "Le Kitchen Café", address: "34 rue Chevreul, Lyon 7e" },
    { name: "Les Terrasses de Lyon", address: "25 montée Saint-Barthélémy, Lyon 5e" },
    { name: "Le Comptoir de l'Est", address: "Gare des Brotteaux, Lyon 6e" },
    { name: "Prairial", address: "11 rue Chavanne, Lyon 1er" }
  ],
  
  'shopping-mode': [
    // Boutiques iconiques
    { name: "Galeries Lafayette Lyon", address: "6 place des Cordeliers, Lyon 2e" },
    { name: "Printemps Lyon", address: "42 rue de la République, Lyon 2e" },
    { name: "Village des Créateurs", address: "19 rue René Leynaud, Lyon 1er" },
    { name: "Citadium Lyon", address: "29 rue de la République, Lyon 2e" },
    { name: "L'Éclaireur", address: "16 rue des Remparts d'Ainay, Lyon 2e" },
    { name: "Rose Bunker", address: "30 rue de la Charité, Lyon 2e" },
    { name: "Espace Tendance", address: "23 rue de la République, Lyon 2e" },
    { name: "April 77", address: "16 rue Hippolyte Flandrin, Lyon 1er" }
  ],
  
  'culture-loisirs': [
    // Lieux culturels emblématiques
    { name: "Musée des Confluences", address: "86 quai Perrache, Lyon 2e" },
    { name: "Musée des Beaux-Arts", address: "20 place des Terreaux, Lyon 1er" },
    { name: "Opéra de Lyon", address: "1 place de la Comédie, Lyon 1er" },
    { name: "Institut Lumière", address: "25 rue du Premier Film, Lyon 8e" },
    { name: "Le Sucre", address: "50 quai Rambaud, Lyon 2e" },
    { name: "Théâtre des Célestins", address: "4 rue Charles Dullin, Lyon 2e" },
    { name: "Maison de la Danse", address: "8 avenue Jean Mermoz, Lyon 8e" },
    { name: "Musée Gadagne", address: "1 place du Petit Collège, Lyon 5e" }
  ],
  
  'hotel-hebergement': [
    // Hôtels prestigieux
    { name: "Villa Florentine", address: "25 montée Saint-Barthélémy, Lyon 5e" },
    { name: "Sofitel Lyon Bellecour", address: "20 quai Gailleton, Lyon 2e" },
    { name: "InterContinental Lyon - Hotel Dieu", address: "20 quai Jules Courmont, Lyon 2e" },
    { name: "Radisson Blu Hotel Lyon", address: "129 rue Servient, Lyon 3e" },
    { name: "Mama Shelter Lyon", address: "13 rue Domer, Lyon 7e" },
    { name: "Hotel Carlton Lyon", address: "4 rue Jussieu, Lyon 2e" },
    { name: "Villa Maïa", address: "8 rue Pierre Marion, Lyon 5e" },
    { name: "Boscolo Lyon Hotel & Spa", address: "11 rue Grolee, Lyon 2e" }
  ],
  
  'beaute-bienetre': [
    // Spas et salons réputés
    { name: "Spa Lyon Plage", address: "85 quai Joseph Gillet, Lyon 4e" },
    { name: "Les Bains de Marrakech", address: "14 rue du Bat d'Argent, Lyon 1er" },
    { name: "Spa Cinq Mondes Lyon", address: "49 rue Auguste Comte, Lyon 2e" },
    { name: "Institut Carita", address: "73 rue du Président Édouard Herriot, Lyon 2e" },
    { name: "L'Appart Beauté", address: "7 rue Mercière, Lyon 2e" }
  ],
  
  'bar-nightlife': [
    // Bars et clubs emblématiques
    { name: "Le Sucre", address: "50 quai Rambaud, Lyon 2e" },
    { name: "Ninkasi Gerland", address: "267 rue Marcel Mérieux, Lyon 7e" },
    { name: "L'Antiquaire", address: "20 rue Hippolyte Flandrin, Lyon 1er" },
    { name: "Le Florian", address: "4 rue de la Terrasse, Lyon 4e" },
    { name: "Ayers Rock Boat", address: "21 quai Victor Augagneur, Lyon 3e" },
    { name: "La Ruche", address: "22 rue Gentil, Lyon 2e" },
    { name: "Le Petit Paumé", address: "30 rue du Bât d'Argent, Lyon 1er" },
    { name: "Terminal Club", address: "3 rue Terme, Lyon 1er" }
  ]
};

class EstablishmentPopulator {
  constructor() {
    this.stats = {
      total: 0,
      success: 0,
      failed: 0,
      byCategory: {}
    };
  }

  async populate() {
    console.log('🏛️ PHASE 1: Ajout des Établissements Emblématiques de Lyon\n');
    console.log('Stratégie: Créer une vitrine attractive avec les grandes enseignes\n');
    
    for (const [category, establishments] of Object.entries(EMBLEMATIC_ESTABLISHMENTS)) {
      console.log(`\n📁 Catégorie: ${category}`);
      this.stats.byCategory[category] = { total: 0, success: 0 };
      
      for (const establishment of establishments) {
        this.stats.total++;
        this.stats.byCategory[category].total++;
        
        try {
          await this.addEstablishment(establishment, category);
          this.stats.success++;
          this.stats.byCategory[category].success++;
          console.log(`   ✅ ${establishment.name}`);
        } catch (error) {
          this.stats.failed++;
          console.log(`   ❌ ${establishment.name}: ${error.message}`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`   Total: ${this.stats.byCategory[category].success}/${this.stats.byCategory[category].total}`);
    }
    
    await this.generateReport();
  }

  async addEstablishment(establishment, category) {
    // 1. Récupérer les détails via Google Places
    const placeData = await this.fetchGooglePlaceData(establishment.name, establishment.address);
    
    if (!placeData) {
      throw new Error('Impossible de trouver sur Google Places');
    }
    
    // 2. Vérifier si existe déjà
    const { data: existing } = await supabase
      .from('establishments')
      .select('id')
      .eq('google_place_id', placeData.place_id)
      .single();
    
    if (existing) {
      console.log(`   ⏭️ Déjà existant`);
      return;
    }
    
    // 3. Préparer les données
    const establishmentData = {
      name: establishment.name,
      slug: this.generateSlug(establishment.name),
      description: this.generateDescription(establishment.name, category),
      category: category,
      
      // Adresse
      address: placeData.formatted_address || establishment.address,
      postal_code: this.extractPostalCode(placeData.formatted_address),
      city: 'Lyon',
      
      // Contact (données publiques)
      phone: placeData.formatted_phone_number || null,
      website: placeData.website || null,
      
      // Pas d'email - on ne les contacte pas
      email: null,
      
      // Métadonnées
      metadata: {
        google_place_id: placeData.place_id,
        google_rating: placeData.rating || null,
        google_reviews_count: placeData.user_ratings_total || 0,
        price_level: placeData.price_level || null,
        is_emblematic: true, // Marquer comme établissement emblématique
        added_for: 'showcase', // Pour la vitrine
        source: 'google_places_public'
      },
      
      // Status
      status: 'active', // Directement actif pour l'affichage
      featured: true, // Mis en avant
      
      // Pas de user_id - ce sont des fiches "système"
      user_id: null,
      
      // Dates
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 4. Insérer dans Supabase
    const { data, error } = await supabase
      .from('establishments')
      .insert(establishmentData)
      .select()
      .single();
    
    if (error) throw error;
    
    // 5. Ajouter une photo si disponible
    if (placeData.photos && placeData.photos.length > 0) {
      await this.addEstablishmentPhoto(data.id, placeData.photos[0], establishment.name);
    }
    
    return data;
  }

  async fetchGooglePlaceData(name, address) {
    try {
      // Recherche textuelle
      const searchResponse = await googleClient.textSearch({
        params: {
          query: `${name} ${address}`,
          key: GOOGLE_API_KEY,
          language: 'fr'
        }
      });
      
      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        return null;
      }
      
      const place = searchResponse.data.results[0];
      
      // Récupérer les détails
      const detailsResponse = await googleClient.placeDetails({
        params: {
          place_id: place.place_id,
          fields: [
            'name', 'formatted_address', 'formatted_phone_number',
            'website', 'rating', 'user_ratings_total', 'price_level',
            'photos', 'opening_hours', 'geometry'
          ].join(','),
          key: GOOGLE_API_KEY,
          language: 'fr'
        }
      });
      
      return detailsResponse.data.result;
      
    } catch (error) {
      console.error(`Erreur Google Places pour ${name}:`, error.message);
      return null;
    }
  }

  async addEstablishmentPhoto(establishmentId, photoReference, name) {
    try {
      // Construire URL photo Google
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference.photo_reference}&key=${GOOGLE_API_KEY}`;
      
      // Ajouter dans establishment_media
      await supabase
        .from('establishment_media')
        .insert({
          establishment_id: establishmentId,
          type: 'image',
          url: photoUrl,
          display_order: 0,
          is_active: true,
          metadata: {
            source: 'google_places',
            attribution: photoReference.html_attributions
          }
        });
        
    } catch (error) {
      console.error(`Erreur ajout photo pour ${name}:`, error.message);
    }
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  generateDescription(name, category) {
    const descriptions = {
      'restaurant-food': `${name} est un établissement gastronomique emblématique de Lyon, reconnu pour son excellence culinaire et son ambiance unique.`,
      'shopping-mode': `${name} est une adresse incontournable du shopping lyonnais, proposant une sélection unique de produits et de marques.`,
      'culture-loisirs': `${name} est un lieu culturel majeur de Lyon, offrant une programmation riche et diversifiée tout au long de l'année.`,
      'hotel-hebergement': `${name} est un établissement hôtelier de référence à Lyon, alliant confort, service d'excellence et emplacement privilégié.`,
      'beaute-bienetre': `${name} est un espace dédié au bien-être et à la beauté, offrant des prestations haut de gamme dans un cadre raffiné.`,
      'bar-nightlife': `${name} est un lieu incontournable de la vie nocturne lyonnaise, reconnu pour son ambiance unique et sa programmation.`
    };
    
    return descriptions[category] || `${name} est un établissement de référence à Lyon.`;
  }

  extractPostalCode(address) {
    const match = address?.match(/\b69\d{3}\b/);
    return match ? match[0] : '69000';
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT D\'IMPORT');
    console.log('='.repeat(60));
    console.log(`✅ Succès: ${this.stats.success}/${this.stats.total}`);
    console.log(`❌ Échecs: ${this.stats.failed}/${this.stats.total}`);
    
    console.log('\nPar catégorie:');
    for (const [cat, stats] of Object.entries(this.stats.byCategory)) {
      console.log(`   ${cat}: ${stats.success}/${stats.total}`);
    }
    
    // Créer fichier pour la prospection
    await this.createProspectionArguments();
  }

  async createProspectionArguments() {
    const prospectionGuide = `
# 🎯 Arguments de Prospection - Guide Lyon

## Votre Argument Principal
"Rejoignez les plus grands noms de Lyon sur notre annuaire"

## Établissements Vitrines par Catégorie

### Restaurants 🍴
Nous référençons déjà :
- Paul Bocuse
- Brasserie Georges  
- La Mère Brazier
- Les Halles Paul Bocuse
➜ "Votre restaurant mérite d'être aux côtés de ces institutions lyonnaises"

### Shopping & Mode 👗
Présents sur notre guide :
- Galeries Lafayette
- Printemps
- Village des Créateurs
➜ "Votre boutique indépendante a sa place parmi les références shopping de Lyon"

### Culture & Loisirs 🎭
Déjà partenaires :
- Musée des Confluences
- Opéra de Lyon
- Institut Lumière
➜ "Enrichissez l'offre culturelle lyonnaise avec votre établissement"

### Hôtels 🏨
Nous affichons :
- Villa Florentine
- Sofitel Bellecour
- InterContinental
➜ "Complétez l'offre hôtelière premium de Lyon"

## Script Email Type

"Bonjour [Nom],

Je me permets de vous contacter car nous avons lancé Guide Lyon, 
le nouvel annuaire premium des établissements lyonnais.

Nous avons déjà le privilège de référencer des établissements comme 
**Paul Bocuse**, **Brasserie Georges** et les **Galeries Lafayette**.

Votre [type établissement] a parfaitement sa place parmi ces références 
lyonnaises. C'est pourquoi nous vous proposons de rejoindre gratuitement 
notre annuaire.

[CTA: Créer ma page gratuite]

Cordialement,"

## Réponses aux Objections

**"Pourquoi ces grands noms sont sur votre site ?"**
→ "Nous référençons les établissements emblématiques de Lyon avec leurs 
informations publiques pour offrir un annuaire complet aux Lyonnais."

**"Ils ont donné leur accord ?"**
→ "Nous utilisons uniquement des informations publiques disponibles. 
Les établissements peuvent revendiquer et enrichir leur page gratuitement."

**"C'est vraiment gratuit ?"**
→ "Oui, l'inscription de base est 100% gratuite. Des options premium 
existent pour plus de visibilité."
`;

    await fs.writeFile(
      path.join(__dirname, 'data', 'prospection-arguments.md'),
      prospectionGuide
    );
    
    console.log('\n📝 Guide de prospection créé: data/prospection-arguments.md');
  }
}

// Script pour la Phase 2 : Prospection PME
async function createPMEProspectionScript() {
  const script = `#!/usr/bin/env node

/**
 * Phase 2 : Prospection des PME
 * Argument : "Rejoignez Paul Bocuse et Brasserie Georges sur Guide Lyon"
 */

const SibApiV3Sdk = require('sib-api-v3-sdk');

// Template email avec argument "grandes enseignes"
const EMAIL_TEMPLATE = {
  subject: "📍 Votre {{category}} aux côtés de Paul Bocuse sur Guide Lyon",
  html: \`
    <h2>Rejoignez les plus grands noms de Lyon</h2>
    
    <p>Bonjour {{businessName}},</p>
    
    <p>Guide Lyon référence déjà les établissements les plus prestigieux de la ville :</p>
    
    <ul>
      <li><strong>Paul Bocuse</strong></li>
      <li><strong>Brasserie Georges</strong></li>
      <li><strong>Les Halles Paul Bocuse</strong></li>
      <li><strong>Galeries Lafayette</strong></li>
      <li><strong>Musée des Confluences</strong></li>
    </ul>
    
    <p><strong>Votre établissement a sa place parmi ces références lyonnaises.</strong></p>
    
    <p>Inscription 100% GRATUITE - Aucun frais caché</p>
    
    <a href="https://guide-lyon.fr/inscription">Créer ma page gratuite</a>
    
    <p>PS: Les 50 prochains inscrits bénéficient d'un badge "Établissement Premium" offert.</p>
  \`
};

// Envoi avec l'argument "vitrine"
async function sendWithShowcaseArgument(prospect) {
  // Logique d'envoi avec mise en avant des grandes enseignes
  console.log(\`Envoi à \${prospect.name} avec argument vitrine\`);
}

module.exports = { sendWithShowcaseArgument };
`;

  await fs.writeFile(
    path.join(__dirname, 'phase2-pme-prospection.js'),
    script
  );
  
  console.log('📧 Script Phase 2 créé: phase2-pme-prospection.js');
}

// Fonction principale
async function main() {
  console.log('🚀 STRATÉGIE EN 2 PHASES\n');
  console.log('Phase 1: Ajouter les établissements emblématiques (vitrine)');
  console.log('Phase 2: Prospecter les PME avec l\'argument vitrine\n');
  
  const populator = new EstablishmentPopulator();
  
  // Phase 1
  await populator.populate();
  
  // Préparer Phase 2
  await createPMEProspectionScript();
  
  console.log('\n✨ SYSTÈME CONFIGURÉ !');
  console.log('\n🎯 Prochaines étapes:');
  console.log('1. Vérifier les établissements sur votre site');
  console.log('2. Faire des captures d\'écran pour la prospection');
  console.log('3. Enrichir les emails des PME cibles');
  console.log('4. Lancer la prospection avec l\'argument vitrine');
  console.log('\nArgument clé: "Rejoignez Paul Bocuse et Brasserie Georges sur Guide Lyon"');
}

// Exécuter
main().catch(console.error);