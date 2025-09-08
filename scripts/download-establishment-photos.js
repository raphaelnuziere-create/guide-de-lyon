#!/usr/bin/env node

/**
 * Script pour télécharger les photos des établissements depuis Google Places
 * et les stocker localement pour éviter les problèmes d'URLs longues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Lire les variables d'environnement
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

// Configuration
const GOOGLE_API_KEY = envVars.GOOGLE_PLACES_API_KEY;
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'establishments');

// Créer le dossier d'images s'il n'existe pas
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`📁 Dossier créé: ${IMAGES_DIR}`);
}

// Fonction pour générer un nom de fichier sécurisé
function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Fonction pour télécharger une image
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(filePath);
        });
        
        fileStream.on('error', reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Fonction pour obtenir l'URL d'une photo Google Places
function getPhotoUrl(photoReference, maxWidth = 800) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
}

// Fonction pour traiter les photos d'un établissement
async function processEstablishmentPhotos(establishment) {
  console.log(`\n🏢 ${establishment.name}`);
  console.log(`   ID: ${establishment.id}`);
  
  // Récupérer les détails Google Places depuis les métadonnées
  const googlePlaceId = establishment.metadata?.google_place_id;
  if (!googlePlaceId) {
    console.log(`   ❌ Pas de Google Place ID trouvé`);
    return;
  }
  
  console.log(`   🔍 Récupération des photos Google Places...`);
  
  try {
    // Obtenir les détails avec les photos
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${googlePlaceId}&fields=photos&key=${GOOGLE_API_KEY}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== 'OK' || !detailsData.result?.photos) {
      console.log(`   ❌ Pas de photos disponibles`);
      return;
    }
    
    const photos = detailsData.result.photos;
    console.log(`   📷 ${photos.length} photos trouvées`);
    
    // Télécharger seulement la première photo (photo principale)
    const photo = photos[0];
    const photoUrl = getPhotoUrl(photo.photo_reference, 800);
    
    // Générer un nom de fichier unique
    const establishmentSlug = sanitizeFileName(establishment.name);
    const fileName = `${establishmentSlug}-main.jpg`;
    const filePath = path.join(IMAGES_DIR, fileName);
    const publicUrl = `/images/establishments/${fileName}`;
    
    console.log(`   ⬇️  Téléchargement de la photo principale...`);
    await downloadImage(photoUrl, filePath);
    console.log(`   ✅ Photo sauvegardée: ${fileName}`);
    
    // Supprimer les anciens médias
    await supabase
      .from('establishment_media')
      .delete()
      .eq('establishment_id', establishment.id);
    
    // Insérer le nouveau média avec l'URL locale
    const { error } = await supabase
      .from('establishment_media')
      .insert({
        establishment_id: establishment.id,
        type: 'image',
        url: publicUrl,
        display_order: 0,
        is_active: true
      });
    
    if (error) {
      console.log(`   ❌ Erreur base de données: ${error.message}`);
    } else {
      console.log(`   ✅ URL mise à jour dans la base: ${publicUrl}`);
    }
    
    // Pause pour respecter les limites de l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error(`   ❌ Erreur: ${error.message}`);
  }
}

// Fonction principale
async function downloadAllPhotos() {
  console.log('🚀 Téléchargement des photos des établissements...\n');
  
  if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY non configurée');
    return;
  }
  
  console.log(`📁 Dossier de stockage: ${IMAGES_DIR}`);
  console.log(`🌐 URL publique: /images/establishments/`);
  
  try {
    // Récupérer tous les établissements avec des métadonnées Google
    const { data: establishments, error } = await supabase
      .from('establishments')
      .select('id, name, metadata')
      .not('metadata->google_place_id', 'is', null);
    
    if (error) {
      throw error;
    }
    
    console.log(`\n🏢 ${establishments.length} établissements à traiter\n`);
    
    let processed = 0;
    let errors = 0;
    
    for (const establishment of establishments) {
      try {
        await processEstablishmentPhotos(establishment);
        processed++;
      } catch (error) {
        console.error(`❌ Erreur pour ${establishment.name}: ${error.message}`);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DU TÉLÉCHARGEMENT');
    console.log('='.repeat(60));
    console.log(`✅ Photos téléchargées: ${processed}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📁 Stockées dans: ${IMAGES_DIR}`);
    console.log('\n✨ Téléchargement terminé !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Lancer le téléchargement
downloadAllPhotos().catch(console.error);