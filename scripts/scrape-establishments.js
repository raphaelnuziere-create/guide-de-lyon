#!/usr/bin/env node

/**
 * Script de scraping d'établissements lyonnais
 * Peuple la base avec 10 établissements par catégorie
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Lire les variables d'environnement depuis .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
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

// Données d'établissements réels de Lyon par catégorie
const ESTABLISHMENTS_DATA = {
  'restaurant-food': [
    {
      name: 'Paul Bocuse',
      description: 'Restaurant gastronomique 3 étoiles Michelin. Une institution lyonnaise mondialement reconnue pour sa cuisine d\'exception.',
      address: '40 Rue de la Plage, 69660 Collonges-au-Mont-d\'Or',
      address_district: 'Collonges-au-Mont-d\'Or',
      phone: '04 72 42 90 90',
      website: 'www.bocuse.fr',
      main_image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      opening_hours: { monday: [{ open: '12:00', close: '14:00' }, { open: '19:30', close: '22:00' }] }
    },
    {
      name: 'Brasserie Georges',
      description: 'Brasserie historique de Lyon depuis 1836. Immense salle Art Déco et cuisine traditionnelle française.',
      address: '30 Cours de Verdun Perrache, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 56 54 54',
      website: 'www.brasseriegeorges.com',
      main_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
    },
    {
      name: 'Les Halles de Lyon Paul Bocuse',
      description: 'Marché couvert avec 48 commerçants. Le temple de la gastronomie lyonnaise avec les meilleurs produits.',
      address: '102 Cours Lafayette, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 78 62 39 33',
      website: 'www.halles-de-lyon-paulbocuse.com',
      main_image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'
    },
    {
      name: 'Daniel et Denise',
      description: 'Bouchon lyonnais authentique. Cuisine traditionnelle dans une ambiance conviviale et chaleureuse.',
      address: '156 Rue de Créqui, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 78 60 66 53',
      website: 'www.daniel-et-denise.fr',
      main_image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800'
    },
    {
      name: 'Le Bouchon des Filles',
      description: 'Bouchon moderne tenu par des femmes. Revisite créative de la cuisine lyonnaise traditionnelle.',
      address: '20 Rue Sergent-Blandan, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 78 30 40 44',
      website: 'www.lebouchondesfilles.com',
      main_image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800'
    },
    {
      name: 'La Mère Brazier',
      description: 'Restaurant gastronomique 2 étoiles Michelin. Histoire et excellence depuis 1921.',
      address: '12 Rue Royale, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 78 23 17 20',
      website: 'www.lamerebrazier.fr',
      main_image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800'
    },
    {
      name: 'Takao Takano',
      description: 'Restaurant gastronomique 2 étoiles Michelin. Fusion créative franco-japonaise.',
      address: '33 Rue Malesherbes, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 82 31 43 39',
      website: 'www.takaotakano.com',
      main_image: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800'
    },
    {
      name: 'Le Kitchen Café',
      description: 'Restaurant gastronomique 1 étoile Michelin. Cuisine créative dans un cadre contemporain.',
      address: '34 Rue Chevreul, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 78 72 46 58',
      website: 'www.lekitchencafe.fr',
      main_image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800'
    },
    {
      name: 'Café Comptoir Abel',
      description: 'Bouchon historique depuis 1928. Authentique cuisine lyonnaise dans un décor d\'époque.',
      address: '25 Rue Guynemer, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 37 46 18',
      website: 'www.cafecomptoirabel.com',
      main_image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800'
    },
    {
      name: 'Le Neuvième Art',
      description: 'Restaurant gastronomique 2 étoiles Michelin. Cuisine moderne et créative.',
      address: '173 Rue Cuvier, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 72 74 12 74',
      website: 'www.leneuviemeart.com',
      main_image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=800'
    }
  ],
  'bar-nightlife': [
    {
      name: 'Le Sucre',
      description: 'Club électro sur le toit de la Sucrière. Programmation pointue et vue panoramique sur Lyon.',
      address: '50 Quai Rambaud, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 37 26 31',
      website: 'www.le-sucre.eu',
      main_image: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800'
    },
    {
      name: 'Ninkasi Gerland',
      description: 'Brasserie artisanale et salle de concert. Bières locales et programmation musicale éclectique.',
      address: '267 Rue Marcel Mérieux, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 72 76 89 00',
      website: 'www.ninkasi.fr',
      main_image: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800'
    },
    {
      name: 'Mama Shelter Lyon',
      description: 'Bar rooftop branché avec vue sur la ville. Cocktails créatifs et ambiance festive.',
      address: '13 Rue Domer, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 78 02 58 58',
      website: 'www.mamashelter.com',
      main_image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800'
    },
    {
      name: 'Le Florian',
      description: 'Bar à cocktails dans le Vieux Lyon. Ambiance intimiste et mixologie créative.',
      address: '2 Rue de la Loge, 69005 Lyon',
      address_district: 'Lyon 5e',
      phone: '04 78 37 42 91',
      website: 'www.leflorian.com',
      main_image: 'https://images.unsplash.com/photo-1571950022379-0e0f6798e746?w=800'
    },
    {
      name: 'L\'Antiquaire',
      description: 'Bar à cocktails vintage. Décoration rétro et cocktails classiques revisités.',
      address: '20 Rue Hippolyte Flandrin, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 78 28 48 84',
      website: 'www.lantiquaire-lyon.com',
      main_image: 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?w=800'
    },
    {
      name: 'Le Comptoir de la Bourse',
      description: 'Bar à vin et tapas. Sélection de vins naturels et petites assiettes gourmandes.',
      address: '2 Rue de la Bourse, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 42 56 78',
      website: 'www.comptoirdelabourse.com',
      main_image: 'https://images.unsplash.com/photo-1569937755654-164261470954?w=800'
    },
    {
      name: 'La Ruche',
      description: 'Bar associatif et culturel. Concerts, expositions et ambiance alternative.',
      address: '22 Rue Gentil, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 37 42 26',
      website: 'www.laruche-lyon.com',
      main_image: 'https://images.unsplash.com/photo-1572116469624-3c99c37baa26?w=800'
    },
    {
      name: 'Le Bootlegger',
      description: 'Bar speakeasy caché. Ambiance prohibition et cocktails d\'époque.',
      address: '23 Rue Bouteille, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '09 83 77 58 46',
      website: 'www.bootlegger-bar.com',
      main_image: 'https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=800'
    },
    {
      name: 'Hot Club de Lyon',
      description: 'Club de jazz historique. Concerts live et jam sessions dans une cave voûtée.',
      address: '26 Rue Lanterne, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 78 39 54 74',
      website: 'www.hotclubelyon.org',
      main_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800'
    },
    {
      name: 'Wallace Bar',
      description: 'Pub écossais authentique. Large sélection de whiskys et bières artisanales.',
      address: '2 Rue Octavio Mey, 69005 Lyon',
      address_district: 'Lyon 5e',
      phone: '04 78 28 00 16',
      website: 'www.wallacebar.fr',
      main_image: 'https://images.unsplash.com/photo-1525947088131-b701cd0f6dc3?w=800'
    }
  ],
  'shopping-mode': [
    {
      name: 'Centre Commercial Part-Dieu',
      description: 'Plus grand centre commercial de Lyon. 260 boutiques, restaurants et services sur 5 niveaux.',
      address: '17 Rue du Docteur Bouchut, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 72 60 60 60',
      website: 'www.centrecommercialpartdieu.com',
      main_image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800'
    },
    {
      name: 'Confluence Shopping Center',
      description: 'Centre commercial moderne et design. Shopping, loisirs et restauration au bord de la Saône.',
      address: '112 Cours Charlemagne, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 28 29 50 00',
      website: 'www.confluence.fr',
      main_image: 'https://images.unsplash.com/photo-1567449303101-d1138b3c1431?w=800'
    },
    {
      name: 'Galeries Lafayette Lyon',
      description: 'Grand magasin historique. Mode, beauté et maison dans un bâtiment Art Déco.',
      address: '6 Place des Cordeliers, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 61 44 44',
      website: 'www.galerieslafayette.com',
      main_image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'
    },
    {
      name: 'Village des Créateurs',
      description: 'Concept store dédié aux jeunes créateurs. Mode et accessoires uniques.',
      address: '19 Rue René Leynaud, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 78 27 37 76',
      website: 'www.villagedescreateurs.com',
      main_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
    },
    {
      name: 'Printemps Lyon',
      description: 'Grand magasin premium. Luxe, mode et beauté dans un cadre élégant.',
      address: '42 Rue de la République, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 41 29 29',
      website: 'www.printemps.com',
      main_image: 'https://images.unsplash.com/photo-1537832816519-689ad163238b?w=800'
    },
    {
      name: 'Marché de la Croix-Rousse',
      description: 'Marché emblématique du quartier. Produits frais, vêtements et ambiance authentique.',
      address: 'Boulevard de la Croix-Rousse, 69004 Lyon',
      address_district: 'Lyon 4e',
      phone: '04 72 98 20 20',
      website: 'www.lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc9e?w=800'
    },
    {
      name: 'Decathlon Lyon Confluence',
      description: 'Magasin de sport géant. Équipements et vêtements pour tous les sports.',
      address: '112 Cours Charlemagne, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 37 50 16 00',
      website: 'www.decathlon.fr',
      main_image: 'https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=800'
    },
    {
      name: 'IKEA Lyon Saint-Priest',
      description: 'Magasin d\'ameublement suédois. Mobilier, décoration et solutions de rangement.',
      address: 'Avenue de l\'Hippodrome, 69800 Saint-Priest',
      address_district: 'Saint-Priest',
      phone: '09 69 36 20 06',
      website: 'www.ikea.fr',
      main_image: 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=800'
    },
    {
      name: 'Fnac Bellecour',
      description: 'Enseigne culturelle et technologique. Livres, musique, high-tech et billetterie.',
      address: '85 Rue de la République, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '08 25 02 00 20',
      website: 'www.fnac.com',
      main_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
    },
    {
      name: 'Apple Store Lyon',
      description: 'Boutique officielle Apple. Produits, services et ateliers créatifs.',
      address: '1 Rue de la République, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 72 10 65 00',
      website: 'www.apple.com/fr',
      main_image: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800'
    }
  ],
  'beaute-bienetre': [
    {
      name: 'Spa Lyon Plage',
      description: 'Spa urbain haut de gamme. Piscine, hammam, sauna et soins personnalisés.',
      address: '8 Quai Augagneur, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 78 54 32 10',
      website: 'www.spa-lyon-plage.fr',
      main_image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800'
    },
    {
      name: 'Institut Nuxe Spa Lyon',
      description: 'Spa de luxe de la marque Nuxe. Soins du visage et du corps dans un cadre raffiné.',
      address: '2 Rue du Président Carnot, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 42 33 00',
      website: 'www.nuxe.com',
      main_image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800'
    },
    {
      name: 'Coiffeur Kraemer',
      description: 'Salon de coiffure haut de gamme. Coupes, couleurs et soins capillaires d\'exception.',
      address: '54 Rue de la République, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 37 33 33',
      website: 'www.kraemer-paris.com',
      main_image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800'
    },
    {
      name: 'L\'Instant Spa',
      description: 'Spa et institut de beauté. Massages du monde et rituels de bien-être.',
      address: '43 Quai Rambaud, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 56 56 56',
      website: 'www.linstant-spa.com',
      main_image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'
    },
    {
      name: 'Sephora Lyon République',
      description: 'Parfumerie et cosmétiques. Toutes les grandes marques de beauté.',
      address: '66 Rue de la République, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 37 67 00',
      website: 'www.sephora.fr',
      main_image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800'
    },
    {
      name: 'Yves Rocher Lyon',
      description: 'Institut de beauté et cosmétiques végétaux. Soins naturels et produits bio.',
      address: '31 Rue de la République, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 42 31 47',
      website: 'www.yves-rocher.fr',
      main_image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800'
    },
    {
      name: 'Passage Bleu',
      description: 'Salon de coiffure et barbier tendance. Coupes modernes dans un cadre vintage.',
      address: '2 Rue de l\'Ancienne Préfecture, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 92 88 77',
      website: 'www.passagebleu.com',
      main_image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800'
    },
    {
      name: 'O Zen Spa',
      description: 'Centre de bien-être asiatique. Massages thaï et soins traditionnels.',
      address: '12 Rue Lanterne, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 78 28 02 09',
      website: 'www.ozen-spa.fr',
      main_image: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800'
    },
    {
      name: 'Marionnaud Lyon',
      description: 'Parfumerie et institut. Grandes marques de parfums et soins esthétiques.',
      address: '5 Place des Jacobins, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 37 45 45',
      website: 'www.marionnaud.fr',
      main_image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=800'
    },
    {
      name: 'Basic Fit Lyon Part-Dieu',
      description: 'Salle de fitness moderne. Musculation, cardio et cours collectifs.',
      address: '14 Rue Servient, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 81 07 60 00',
      website: 'www.basic-fit.com',
      main_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
    }
  ],
  'hotel-hebergement': [
    {
      name: 'InterContinental Lyon - Hotel Dieu',
      description: 'Hôtel 5 étoiles dans l\'ancien Hôtel-Dieu. Luxe historique au cœur de la Presqu\'île.',
      address: '20 Quai Jules Courmont, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 26 99 23 23',
      website: 'www.ihg.com',
      main_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
    },
    {
      name: 'Villa Florentine',
      description: 'Hôtel 5 étoiles sur la colline de Fourvière. Vue panoramique et restaurant étoilé.',
      address: '25 Montée Saint-Barthélémy, 69005 Lyon',
      address_district: 'Lyon 5e',
      phone: '04 72 56 56 56',
      website: 'www.villaflorentine.com',
      main_image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'
    },
    {
      name: 'Sofitel Lyon Bellecour',
      description: 'Hôtel 5 étoiles face au Rhône. Design contemporain et gastronomie raffinée.',
      address: '20 Quai Docteur Gailleton, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 41 20 20',
      website: 'www.sofitel.com',
      main_image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'
    },
    {
      name: 'Mama Shelter Lyon',
      description: 'Hôtel design et branché. Rooftop, restaurant et ambiance festive.',
      address: '13 Rue Domer, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 78 02 58 58',
      website: 'www.mamashelter.com',
      main_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
    },
    {
      name: 'Radisson Blu Hotel Lyon',
      description: 'Hôtel 4 étoiles moderne. Centre de conférences et spa.',
      address: '129 Rue Servient, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 78 63 55 00',
      website: 'www.radissonblu.com',
      main_image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
    },
    {
      name: 'Hotel Carlton Lyon',
      description: 'Hôtel 4 étoiles historique. Architecture Haussmannienne place de la République.',
      address: '4 Rue Jussieu, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 42 56 51',
      website: 'www.carltonlyon.com',
      main_image: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=800'
    },
    {
      name: 'Mercure Lyon Centre Château Perrache',
      description: 'Hôtel 4 étoiles Art Nouveau. Monument historique avec piscine intérieure.',
      address: '12 Cours de Verdun Rambaud, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 77 15 00',
      website: 'www.mercure.com',
      main_image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
    },
    {
      name: 'Ibis Lyon Centre Perrache',
      description: 'Hôtel économique bien situé. Proche gare et centre-ville.',
      address: '28 Cours de Verdun Perrache, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 37 58 19',
      website: 'www.ibis.com',
      main_image: 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800'
    },
    {
      name: 'Novotel Lyon Confluence',
      description: 'Hôtel 4 étoiles moderne. Piscine extérieure et restaurant panoramique.',
      address: '3 Rue Paul Montrochet, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 37 23 64 00',
      website: 'www.novotel.com',
      main_image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800'
    },
    {
      name: 'B&B Hotel Lyon Centre',
      description: 'Hôtel économique moderne. Chambres confortables et petit-déjeuner buffet.',
      address: '175 Avenue Jean Jaurès, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '08 92 70 75 18',
      website: 'www.hotelbb.com',
      main_image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'
    }
  ],
  'culture-loisirs': [
    {
      name: 'Musée des Confluences',
      description: 'Musée des sciences et sociétés. Architecture futuriste et collections exceptionnelles.',
      address: '86 Quai Perrache, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 28 38 11 90',
      website: 'www.museedesconfluences.fr',
      main_image: 'https://images.unsplash.com/photo-1565881606991-789a8dff9dbb?w=800'
    },
    {
      name: 'Musée des Beaux-Arts',
      description: 'L\'un des plus grands musées d\'Europe. Collections de l\'Antiquité à l\'art moderne.',
      address: '20 Place des Terreaux, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 72 10 17 40',
      website: 'www.mba-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800'
    },
    {
      name: 'Opéra de Lyon',
      description: 'Opéra national dans un bâtiment iconique. Opéras, ballets et concerts.',
      address: '1 Place de la Comédie, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 69 85 54 54',
      website: 'www.opera-lyon.com',
      main_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
    },
    {
      name: 'Théâtre des Célestins',
      description: 'Théâtre historique à l\'italienne. Programmation classique et contemporaine.',
      address: '4 Rue Charles Dullin, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 77 40 00',
      website: 'www.celestins-lyon.org',
      main_image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'
    },
    {
      name: 'Aquarium de Lyon',
      description: 'Aquarium tropical avec plus de 300 espèces. Requins, raies et poissons exotiques.',
      address: '7 Rue Stéphane Déchant, 69350 La Mulatière',
      address_district: 'La Mulatière',
      phone: '04 72 66 65 66',
      website: 'www.aquariumlyon.fr',
      main_image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'
    },
    {
      name: 'Parc de la Tête d\'Or',
      description: 'Plus grand parc urbain de France. Lac, zoo gratuit et jardins botaniques.',
      address: 'Place Général Leclerc, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 72 69 47 60',
      website: 'www.lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
    },
    {
      name: 'Institut Lumière',
      description: 'Musée du cinéma dans la maison des frères Lumière. Histoire et patrimoine cinématographique.',
      address: '25 Rue du Premier Film, 69008 Lyon',
      address_district: 'Lyon 8e',
      phone: '04 78 78 18 95',
      website: 'www.institut-lumiere.org',
      main_image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800'
    },
    {
      name: 'MAC Lyon',
      description: 'Musée d\'Art Contemporain. Expositions temporaires d\'artistes internationaux.',
      address: '81 Quai Charles de Gaulle, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 72 69 17 17',
      website: 'www.mac-lyon.com',
      main_image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800'
    },
    {
      name: 'Cinéma Pathé Bellecour',
      description: 'Multiplexe moderne en plein centre. Films en VO et dernières sorties.',
      address: '79 Rue de la République, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '0 892 69 66 96',
      website: 'www.pathe.fr',
      main_image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'
    },
    {
      name: 'Mini World Lyon',
      description: 'Plus grand parc de miniatures animées de France. Mondes miniatures interactifs.',
      address: '3 Avenue de Bohlen, 69120 Vaulx-en-Velin',
      address_district: 'Vaulx-en-Velin',
      phone: '04 28 29 09 19',
      website: 'www.miniworldlyon.com',
      main_image: 'https://images.unsplash.com/photo-1606092195730-5d445b5bac5e?w=800'
    }
  ],
  'sport-fitness': [
    {
      name: 'CMG Sports Club Lyon',
      description: 'Club de sport premium. Équipements haut de gamme, cours collectifs et coaching.',
      address: '16 Rue Childebert, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '01 84 80 80 55',
      website: 'www.cmgsportsclub.com',
      main_image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'
    },
    {
      name: 'L\'Appart Fitness Lyon',
      description: 'Salle de sport moderne et conviviale. Musculation, cardio et cours collectifs.',
      address: '12 Rue Marc-Antoine Petit, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 92 92 00',
      website: 'www.lappartfitness.com',
      main_image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800'
    },
    {
      name: 'Climbing District Lyon',
      description: 'Salle d\'escalade indoor. Blocs et voies pour tous niveaux.',
      address: '22 Rue Lortet, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 78 69 61 61',
      website: 'www.climbing-district.com',
      main_image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800'
    },
    {
      name: 'Piscine Tony Bertrand',
      description: 'Centre nautique moderne. Bassins olympiques, spa et espace fitness.',
      address: '8 Quai Claude Bernard, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 72 72 00 70',
      website: 'www.lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1577053716818-cf68b3247f58?w=800'
    },
    {
      name: 'Crossfit Lyon',
      description: 'Box de CrossFit officielle. Entraînement fonctionnel et communauté motivée.',
      address: '320 Avenue Berthelot, 69008 Lyon',
      address_district: 'Lyon 8e',
      phone: '06 52 46 66 02',
      website: 'www.crossfitlyon.com',
      main_image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'
    },
    {
      name: 'Yoga Bikram Lyon',
      description: 'Studio de yoga chaud. Séances de 90 minutes dans une salle à 40°C.',
      address: '2 Rue de la Martinière, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 78 27 72 77',
      website: 'www.bikramyogalyon.com',
      main_image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800'
    },
    {
      name: 'Keep Cool Lyon',
      description: 'Salle de sport accessible 7j/7. Équipements connectés et coaching virtuel.',
      address: '14 Cours Lafayette, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 78 60 60 60',
      website: 'www.keepcool.fr',
      main_image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800'
    },
    {
      name: 'Patinoire Charlemagne',
      description: 'Patinoire olympique. Patinage public, hockey et spectacles sur glace.',
      address: '100 Cours Charlemagne, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 42 64 55',
      website: 'www.lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc9e?w=800'
    },
    {
      name: 'Salle Mermoz',
      description: 'Centre sportif municipal. Sports collectifs, arts martiaux et fitness.',
      address: '325 Avenue Jean Mermoz, 69008 Lyon',
      address_district: 'Lyon 8e',
      phone: '04 78 74 59 29',
      website: 'www.lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800'
    },
    {
      name: 'Tennis Club de Lyon',
      description: 'Club de tennis historique. Courts couverts et extérieurs, école de tennis.',
      address: '1 Boulevard du 11 Novembre 1918, 69100 Villeurbanne',
      address_district: 'Villeurbanne',
      phone: '04 78 84 04 16',
      website: 'www.tennisclubelyon.com',
      main_image: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=800'
    }
  ],
  'sante-medical': [
    {
      name: 'Hôpital de la Croix-Rousse',
      description: 'Centre hospitalier universitaire. Urgences et spécialités médicales.',
      address: '103 Grande Rue de la Croix-Rousse, 69004 Lyon',
      address_district: 'Lyon 4e',
      phone: '04 26 10 90 00',
      website: 'www.chu-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800'
    },
    {
      name: 'Clinique du Parc',
      description: 'Clinique privée réputée. Chirurgie et médecine de pointe.',
      address: '155 Boulevard de Stalingrad, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 72 44 88 00',
      website: 'www.cliniqueduparclyon.com',
      main_image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'
    },
    {
      name: 'Centre Dentaire Lyon',
      description: 'Centre dentaire moderne. Soins, implants et orthodontie.',
      address: '29 Rue de la République, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 42 42 42',
      website: 'www.centredentairelyon.fr',
      main_image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'
    },
    {
      name: 'Centre Ophtalmologique Lyon',
      description: 'Spécialistes de la vue. Consultations, chirurgie laser et lunetterie.',
      address: '103 Rue Duguesclin, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 78 89 89 89',
      website: 'www.ophtalmolyon.fr',
      main_image: 'https://images.unsplash.com/photo-1583482183669-16762d3badc8?w=800'
    },
    {
      name: 'Laboratoire Mérieux',
      description: 'Laboratoire d\'analyses médicales. Prélèvements et résultats rapides.',
      address: '7 Rue Sala, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 42 18 18',
      website: 'www.laboratoire-merieux.fr',
      main_image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800'
    },
    {
      name: 'Centre de Radiologie Lyon',
      description: 'Imagerie médicale complète. Scanner, IRM et radiologie.',
      address: '14 Rue Childebert, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 40 40 40',
      website: 'www.radiologie-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800'
    },
    {
      name: 'Pharmacie de la Presqu\'île',
      description: 'Pharmacie moderne et conseil. Médicaments et parapharmacie.',
      address: '8 Place Bellecour, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 37 38 39',
      website: 'www.pharmacie-presquile.fr',
      main_image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800'
    },
    {
      name: 'Cabinet de Kinésithérapie Lyon',
      description: 'Kinésithérapeutes diplômés. Rééducation et soins thérapeutiques.',
      address: '45 Cours Franklin Roosevelt, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 78 52 52 52',
      website: 'www.kine-lyon6.fr',
      main_image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800'
    },
    {
      name: 'Centre de Psychologie Lyon',
      description: 'Psychologues et psychothérapeutes. Consultations adultes et enfants.',
      address: '22 Rue de la Part-Dieu, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 78 60 60 61',
      website: 'www.psychologie-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800'
    },
    {
      name: 'SOS Médecins Lyon',
      description: 'Médecins de garde 24h/24. Visites à domicile et urgences.',
      address: '47 Rue Tête d\'Or, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 78 83 51 51',
      website: 'www.sosmedecins-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1631815588090-e4c12e2192f6?w=800'
    }
  ],
  'services-pro': [
    {
      name: 'Regus Lyon Part-Dieu',
      description: 'Espaces de bureaux flexibles. Coworking et salles de réunion.',
      address: '5 Place Charles Béraudier, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 37 23 70 00',
      website: 'www.regus.fr',
      main_image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800'
    },
    {
      name: 'WeWork Lyon',
      description: 'Espaces de coworking design. Communauté d\'entrepreneurs et services premium.',
      address: '3 Place Giovanni da Verrazzano, 69009 Lyon',
      address_district: 'Lyon 9e',
      phone: '08 05 08 50 00',
      website: 'www.wework.com',
      main_image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800'
    },
    {
      name: 'BNP Paribas Lyon',
      description: 'Services bancaires professionnels. Comptes entreprise et financements.',
      address: '6 Place Bellecour, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '0 820 820 001',
      website: 'www.bnpparibas.fr',
      main_image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800'
    },
    {
      name: 'Cabinet KPMG Lyon',
      description: 'Audit et conseil aux entreprises. Expertise comptable et stratégie.',
      address: '2 Avenue Tony Garnier, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 37 64 75 00',
      website: 'www.kpmg.fr',
      main_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'
    },
    {
      name: 'Adecco Lyon',
      description: 'Agence d\'intérim et recrutement. Solutions RH pour entreprises.',
      address: '47 Rue de la République, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 77 90 90',
      website: 'www.adecco.fr',
      main_image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800'
    },
    {
      name: 'Notaire Lyon Centre',
      description: 'Office notarial. Actes immobiliers, successions et conseil juridique.',
      address: '10 Rue de la Charité, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 37 37 37',
      website: 'www.notaires.fr',
      main_image: 'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=800'
    },
    {
      name: 'PwC Lyon',
      description: 'Cabinet de conseil et audit. Transformation digitale et stratégie d\'entreprise.',
      address: '63 Rue de Villiers, 92200 Neuilly-sur-Seine',
      address_district: 'Lyon 3e',
      phone: '01 56 57 58 59',
      website: 'www.pwc.fr',
      main_image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800'
    },
    {
      name: 'Centre d\'affaires Lyon',
      description: 'Domiciliation d\'entreprise. Adresse prestigieuse et services administratifs.',
      address: '4 Rue du Président Carnot, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 42 42 00',
      website: 'www.centre-affaires-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'
    },
    {
      name: 'Manpower Lyon',
      description: 'Solutions de recrutement. Intérim, CDD, CDI pour tous secteurs.',
      address: '94 Rue Servient, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 72 61 61 61',
      website: 'www.manpower.fr',
      main_image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800'
    },
    {
      name: 'Avocat Lyon Affaires',
      description: 'Cabinet d\'avocats d\'affaires. Droit des sociétés et contentieux commercial.',
      address: '15 Quai Jean Moulin, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 92 92 92',
      website: 'www.avocat-lyon-affaires.fr',
      main_image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800'
    }
  ],
  'immobilier': [
    {
      name: 'Century 21 Lyon',
      description: 'Agence immobilière internationale. Vente, location et gestion de biens.',
      address: '71 Rue de la République, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 42 21 21',
      website: 'www.century21.fr',
      main_image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'
    },
    {
      name: 'Orpi Lyon',
      description: 'Réseau d\'agences immobilières. Expertise locale et accompagnement personnalisé.',
      address: '150 Cours Lafayette, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 78 60 90 90',
      website: 'www.orpi.com',
      main_image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
    },
    {
      name: 'Foncia Lyon',
      description: 'Leader de la gestion immobilière. Syndic, location et transaction.',
      address: '140 Rue Garibaldi, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 72 34 34 34',
      website: 'www.foncia.com',
      main_image: 'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=800'
    },
    {
      name: 'Laforêt Lyon',
      description: 'Agence immobilière de proximité. Achat, vente et location.',
      address: '38 Rue de la Charité, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 37 10 10',
      website: 'www.laforet.com',
      main_image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=800'
    },
    {
      name: 'Nexity Lyon',
      description: 'Promoteur immobilier. Programmes neufs et investissement locatif.',
      address: '52 Quai Rambaud, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 77 40 00',
      website: 'www.nexity.fr',
      main_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
    },
    {
      name: 'ERA Immobilier Lyon',
      description: 'Franchise immobilière. Estimation gratuite et vente rapide.',
      address: '25 Avenue Maréchal de Saxe, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 78 24 24 24',
      website: 'www.era-immobilier.fr',
      main_image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800'
    },
    {
      name: 'Guy Hoquet Lyon',
      description: 'Agence immobilière nationale. Accompagnement complet dans vos projets.',
      address: '85 Rue Vendôme, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 78 93 93 93',
      website: 'www.guy-hoquet.com',
      main_image: 'https://images.unsplash.com/photo-1565402170291-8491f14678db?w=800'
    },
    {
      name: 'Citya Immobilier Lyon',
      description: 'Syndic et gestion locative. Administration de biens et copropriétés.',
      address: '46 Avenue Foch, 69006 Lyon',
      address_district: 'Lyon 6e',
      phone: '04 78 89 05 60',
      website: 'www.citya.com',
      main_image: 'https://images.unsplash.com/photo-1554469384-e58cd785fcc6?w=800'
    },
    {
      name: 'Square Habitat Lyon',
      description: 'Crédit Agricole Immobilier. Financement et transaction immobilière.',
      address: '6 Place Bellecour, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 10 10 10',
      website: 'www.squarehabitat.fr',
      main_image: 'https://images.unsplash.com/photo-1560520653-9e0e88c1ac20?w=800'
    },
    {
      name: 'Stéphane Plaza Immobilier',
      description: 'Agence immobilière médiatique. Vente et location avec services premium.',
      address: '33 Rue Franklin, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 78 62 62 62',
      website: 'www.stephaneplazaimmobilier.com',
      main_image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800'
    }
  ],
  'auto-transport': [
    {
      name: 'BMW Lyon',
      description: 'Concession BMW officielle. Vente de véhicules neufs et occasions premium.',
      address: '1 Avenue de l\'Europe, 69140 Rillieux-la-Pape',
      address_district: 'Rillieux-la-Pape',
      phone: '04 72 01 40 40',
      website: 'www.bmw-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'
    },
    {
      name: 'Mercedes-Benz Lyon',
      description: 'Distributeur Mercedes agréé. Véhicules de luxe et services après-vente.',
      address: '95 Route de Grenoble, 69800 Saint-Priest',
      address_district: 'Saint-Priest',
      phone: '04 72 47 81 81',
      website: 'www.mercedes-benz-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800'
    },
    {
      name: 'Peugeot Lyon',
      description: 'Concession Peugeot. Large gamme de véhicules et atelier mécanique.',
      address: '47 Avenue Berthelot, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 72 71 88 88',
      website: 'www.peugeot-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'
    },
    {
      name: 'Norauto Lyon',
      description: 'Centre auto multimarques. Entretien, réparation et équipements automobiles.',
      address: '165 Route de Vienne, 69008 Lyon',
      address_district: 'Lyon 8e',
      phone: '04 78 00 72 75',
      website: 'www.norauto.fr',
      main_image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800'
    },
    {
      name: 'Euromaster Lyon',
      description: 'Spécialiste du pneumatique. Vente et montage de pneus toutes marques.',
      address: '85 Rue de Gerland, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 37 65 65 65',
      website: 'www.euromaster.fr',
      main_image: 'https://images.unsplash.com/photo-1553536645-a6d9f57a7c67?w=800'
    },
    {
      name: 'Hertz Lyon',
      description: 'Location de voitures courte et longue durée. Large flotte de véhicules.',
      address: 'Gare de Lyon Part-Dieu, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 72 34 58 95',
      website: 'www.hertz.fr',
      main_image: 'https://images.unsplash.com/photo-1455641064042-5f5c46027f52?w=800'
    },
    {
      name: 'Midas Lyon',
      description: 'Entretien auto rapide. Vidange, freinage et échappement.',
      address: '234 Avenue Félix Faure, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 78 95 95 95',
      website: 'www.midas.fr',
      main_image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800'
    },
    {
      name: 'Citroën Lyon',
      description: 'Concession Citroën. Véhicules neufs, occasions et atelier agréé.',
      address: '51 Rue de Marseille, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 37 72 36 36',
      website: 'www.citroen-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'
    },
    {
      name: 'Tesla Lyon',
      description: 'Showroom Tesla. Véhicules électriques haut de gamme et superchargeurs.',
      address: '17 Cours Charlemagne, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '09 70 73 08 70',
      website: 'www.tesla.com',
      main_image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800'
    },
    {
      name: 'Auto École Lyon',
      description: 'Formation à la conduite. Permis B, conduite accompagnée et stages.',
      address: '125 Rue Garibaldi, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 78 62 15 15',
      website: 'www.auto-ecole-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'
    }
  ],
  'autre': [
    {
      name: 'La Poste Lyon Bellecour',
      description: 'Bureau de poste principal. Services postaux et bancaires.',
      address: '10 Place Antonin Poncet, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '36 31',
      website: 'www.laposte.fr',
      main_image: 'https://images.unsplash.com/photo-1532629345422-7515f3e15c9c?w=800'
    },
    {
      name: 'Mairie de Lyon',
      description: 'Hôtel de ville. Services administratifs et état civil.',
      address: '1 Place de la Comédie, 69001 Lyon',
      address_district: 'Lyon 1er',
      phone: '04 72 10 30 30',
      website: 'www.lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64fcba0?w=800'
    },
    {
      name: 'Bibliothèque Part-Dieu',
      description: 'Bibliothèque municipale centrale. Plus d\'un million de documents.',
      address: '30 Boulevard Vivier-Merle, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 78 62 18 00',
      website: 'www.bm-lyon.fr',
      main_image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800'
    },
    {
      name: 'Office de Tourisme Lyon',
      description: 'Information touristique. Plans, visites guidées et réservations.',
      address: 'Place Bellecour, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 77 69 69',
      website: 'www.lyon-france.com',
      main_image: 'https://images.unsplash.com/photo-1551867633-194f125bec37?w=800'
    },
    {
      name: 'Préfecture du Rhône',
      description: 'Services de l\'État. Cartes d\'identité, permis de conduire et titres de séjour.',
      address: '106 Rue Pierre Corneille, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '04 72 61 60 60',
      website: 'www.rhone.gouv.fr',
      main_image: 'https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800'
    },
    {
      name: 'CAF de Lyon',
      description: 'Caisse d\'allocations familiales. Prestations sociales et aides.',
      address: '67 Boulevard Vivier Merle, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '32 30',
      website: 'www.caf.fr',
      main_image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800'
    },
    {
      name: 'Pôle Emploi Lyon',
      description: 'Agence pour l\'emploi. Inscription, indemnisation et offres d\'emploi.',
      address: '10 Rue du Dauphiné, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '39 49',
      website: 'www.pole-emploi.fr',
      main_image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800'
    },
    {
      name: 'CPAM de Lyon',
      description: 'Sécurité sociale. Remboursements et droits santé.',
      address: '276 Cours Lafayette, 69003 Lyon',
      address_district: 'Lyon 3e',
      phone: '36 46',
      website: 'www.ameli.fr',
      main_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'
    },
    {
      name: 'Chambre de Commerce Lyon',
      description: 'CCI Lyon Métropole. Accompagnement des entreprises et formations.',
      address: 'Place de la Bourse, 69002 Lyon',
      address_district: 'Lyon 2e',
      phone: '04 72 40 58 58',
      website: 'www.lyon-metropole.cci.fr',
      main_image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800'
    },
    {
      name: 'Université Lyon 2',
      description: 'Université publique. Sciences humaines et sociales.',
      address: '86 Rue Pasteur, 69007 Lyon',
      address_district: 'Lyon 7e',
      phone: '04 78 69 70 00',
      website: 'www.univ-lyon2.fr',
      main_image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800'
    }
  ]
};

// Fonction pour générer un slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Fonction principale de scraping
async function scrapeEstablishments() {
  console.log('🚀 Début du scraping des établissements...\n');

  let totalInserted = 0;
  let totalErrors = 0;

  for (const [sector, establishments] of Object.entries(ESTABLISHMENTS_DATA)) {
    console.log(`\n📍 Secteur: ${sector}`);
    console.log('=' .repeat(40));

    for (const establishment of establishments) {
      try {
        const slug = generateSlug(establishment.name);
        
        // Vérifier si l'établissement existe déjà
        const { data: existing } = await supabase
          .from('establishments')
          .select('id')
          .eq('slug', slug)
          .single();

        if (existing) {
          console.log(`⚠️  ${establishment.name} existe déjà`);
          continue;
        }

        // Insérer l'établissement
        const { data, error } = await supabase
          .from('establishments')
          .insert({
            slug,
            name: establishment.name,
            description: establishment.description,
            short_description: establishment.description.substring(0, 200),
            email: `contact@${slug}.fr`,
            phone: establishment.phone,
            website: establishment.website,
            address: establishment.address,
            city: 'Lyon',
            postal_code: '69000',
            category: sector, // Utiliser category au lieu de sector
            status: 'active',
            
            // Stocker l'image et le district dans metadata
            metadata: {
              main_image: establishment.main_image,
              address_district: establishment.address_district,
              views_count: Math.floor(Math.random() * 500) + 100,
              plan: 'basic' // Stocker le plan ici car il n'y a pas de colonne plan
            },
            
            created_at: new Date().toISOString(),
            opening_hours: establishment.opening_hours || {}
          })
          .select()
          .single();

        if (error) {
          console.error(`❌ Erreur pour ${establishment.name}:`, error.message);
          totalErrors++;
        } else {
          console.log(`✅ ${establishment.name} ajouté avec succès`);
          totalInserted++;
        }

      } catch (error) {
        console.error(`❌ Erreur inattendue pour ${establishment.name}:`, error);
        totalErrors++;
      }
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('📊 RÉSUMÉ DU SCRAPING');
  console.log('=' .repeat(50));
  console.log(`✅ Établissements insérés: ${totalInserted}`);
  console.log(`❌ Erreurs: ${totalErrors}`);
  console.log(`📁 Total traité: ${totalInserted + totalErrors}`);
  console.log('\n✨ Scraping terminé !');
}

// Lancer le scraping
scrapeEstablishments().catch(console.error);