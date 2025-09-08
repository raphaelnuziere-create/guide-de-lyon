#!/usr/bin/env node

/**
 * Script pour corriger/ajouter les photos Google Places aux établissements
 * Récupère les VRAIES photos de chaque établissement depuis Google Places
 */

const { Client } = require('@googlemaps/google-maps-services-js');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
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

const googleClient = new Client({});
const GOOGLE_API_KEY = envVars.GOOGLE_PLACES_API_KEY;

async function fixEstablishmentPhotos() {
  console.log('🖼️ Correction des Photos d\'Établissements\n');
  console.log('Ce script va récupérer les VRAIES photos Google Places\n');
  
  // 1. Récupérer tous les établissements avec google_place_id
  const { data: establishments, error } = await supabase
    .from('establishments')
    .select('id, name, metadata')
    .not('metadata->google_place_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(300); // Les 300 derniers ajoutés
  
  if (error) {
    console.error('❌ Erreur récupération établissements:', error);
    return;
  }
  
  console.log(`📊 ${establishments.length} établissements à traiter\n`);
  
  let stats = {
    processed: 0,
    withPhotos: 0,
    noPhotos: 0,
    errors: 0
  };
  
  for (const establishment of establishments) {
    const googlePlaceId = establishment.metadata?.google_place_id;
    
    if (!googlePlaceId) {
      console.log(`⚠️ ${establishment.name}: Pas de Google Place ID`);
      continue;
    }
    
    console.log(`\n🏢 ${establishment.name}`);
    
    try {
      // Vérifier si a déjà des photos
      const { data: existingMedia } = await supabase
        .from('establishment_media')
        .select('id')
        .eq('establishment_id', establishment.id)
        .eq('type', 'image')
        .limit(1);
      
      if (existingMedia && existingMedia.length > 0) {
        console.log('   ✓ A déjà des photos');
        stats.withPhotos++;
        continue;
      }
      
      // Récupérer les détails avec photos depuis Google Places
      console.log(`   🔍 Recherche photos Google Places...`);
      
      const detailsResponse = await googleClient.placeDetails({
        params: {
          place_id: googlePlaceId,
          fields: 'photos,name',
          key: GOOGLE_API_KEY,
          language: 'fr'
        }
      });
      
      const placeDetails = detailsResponse.data.result;
      
      if (!placeDetails.photos || placeDetails.photos.length === 0) {
        console.log('   ❌ Aucune photo disponible sur Google');
        stats.noPhotos++;
        continue;
      }
      
      console.log(`   📷 ${placeDetails.photos.length} photos trouvées`);
      
      // Ajouter les 3 premières photos
      const photosToAdd = placeDetails.photos.slice(0, 3);
      let photosAdded = 0;
      
      for (let i = 0; i < photosToAdd.length; i++) {
        const photo = photosToAdd[i];
        
        // Construire l'URL de la photo Google Places
        // IMPORTANT: Ces URLs sont les VRAIES photos de l'établissement
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`;
        
        // Ajouter dans establishment_media
        const { error: insertError } = await supabase
          .from('establishment_media')
          .insert({
            establishment_id: establishment.id,
            type: 'image',
            url: photoUrl,
            display_order: i,
            is_active: true,
            metadata: {
              source: 'google_places',
              width: photo.width,
              height: photo.height,
              attributions: photo.html_attributions || []
            }
          });
        
        if (!insertError) {
          photosAdded++;
        } else {
          console.error(`   ⚠️ Erreur ajout photo ${i+1}:`, insertError.message);
        }
      }
      
      if (photosAdded > 0) {
        console.log(`   ✅ ${photosAdded} photos ajoutées`);
        stats.withPhotos++;
        
        // Optionnel: Mettre à jour metadata pour indiquer que les photos sont ajoutées
        await supabase
          .from('establishments')
          .update({ 
            metadata: {
              ...establishment.metadata,
              has_photos: true,
              photos_count: photosAdded,
              photos_updated_at: new Date().toISOString()
            }
          })
          .eq('id', establishment.id);
      }
      
      stats.processed++;
      
      // Rate limiting pour respecter les quotas Google
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      stats.errors++;
    }
  }
  
  // Rapport final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RAPPORT FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Établissements traités: ${stats.processed}`);
  console.log(`📷 Avec photos ajoutées: ${stats.withPhotos}`);
  console.log(`⚠️ Sans photos disponibles: ${stats.noPhotos}`);
  console.log(`❌ Erreurs: ${stats.errors}`);
  console.log('\n✨ Correction terminée !');
  console.log('Les photos sont maintenant visibles sur votre site.');
}

// Alternative: Télécharger et stocker localement les photos
async function downloadPhotosLocally() {
  console.log('\n📥 Option: Téléchargement local des photos\n');
  
  const https = require('https');
  const publicDir = path.join(__dirname, '..', 'public', 'images', 'establishments');
  
  // Créer le dossier si nécessaire
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Fonction pour télécharger une image
  function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filepath);
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      }).on('error', reject);
    });
  }
  
  // Récupérer les établissements
  const { data: establishments } = await supabase
    .from('establishments')
    .select('id, name, slug')
    .limit(50); // Commencer avec 50 pour test
  
  for (const est of establishments) {
    const { data: media } = await supabase
      .from('establishment_media')
      .select('url')
      .eq('establishment_id', est.id)
      .eq('type', 'image')
      .limit(1);
    
    if (media && media[0]) {
      const filename = `${est.slug}-main.jpg`;
      const filepath = path.join(publicDir, filename);
      
      try {
        await downloadImage(media[0].url, filepath);
        console.log(`✅ Téléchargé: ${filename}`);
        
        // Mettre à jour l'URL en local
        await supabase
          .from('establishment_media')
          .update({ url: `/images/establishments/${filename}` })
          .eq('establishment_id', est.id)
          .eq('url', media[0].url);
          
      } catch (error) {
        console.error(`❌ Erreur téléchargement ${est.name}:`, error.message);
      }
    }
  }
}

// Menu principal
async function main() {
  console.log('🖼️ GESTIONNAIRE DE PHOTOS D\'ÉTABLISSEMENTS\n');
  console.log('Que voulez-vous faire ?');
  console.log('1. Ajouter les photos Google Places manquantes (recommandé)');
  console.log('2. Télécharger les photos localement');
  console.log('3. Les deux\n');
  
  const args = process.argv.slice(2);
  const choice = args[0] || '1';
  
  switch(choice) {
    case '1':
      await fixEstablishmentPhotos();
      break;
    case '2':
      await downloadPhotosLocally();
      break;
    case '3':
      await fixEstablishmentPhotos();
      await downloadPhotosLocally();
      break;
    default:
      console.log('Choix invalide. Utilisation: node fix-establishment-photos.js [1|2|3]');
  }
}

// Vérifier la clé API
if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_API_KEY_HERE') {
  console.error('❌ ERREUR: Clé Google Places API manquante');
  console.error('Ajoutez GOOGLE_PLACES_API_KEY dans .env.local');
  process.exit(1);
}

// Lancer
main().catch(console.error);