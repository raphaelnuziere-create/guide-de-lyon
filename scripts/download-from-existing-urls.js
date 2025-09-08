#!/usr/bin/env node

/**
 * Script pour télécharger les photos depuis les URLs déjà stockées
 * et les remplacer par des URLs locales
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

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

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'establishments');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
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
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(filePath);
        });
        
        fileStream.on('error', reject);
      } else if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Suivre les redirections
        downloadImage(response.headers.location, filePath).then(resolve).catch(reject);
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function processEstablishment(establishment) {
  console.log(`\n🏢 ${establishment.name}`);
  
  const metadata = establishment.metadata;
  if (!metadata || !metadata.main_image) {
    console.log('   ❌ Pas de main_image trouvée');
    return;
  }
  
  const mainImageUrl = metadata.main_image;
  console.log('   🔍 URL trouvée:', mainImageUrl.substring(0, 100) + '...');
  
  try {
    // Générer nom de fichier
    const establishmentSlug = sanitizeFileName(establishment.name);
    const fileName = `${establishmentSlug}-main.jpg`;
    const filePath = path.join(IMAGES_DIR, fileName);
    const publicUrl = `/images/establishments/${fileName}`;
    
    console.log(`   ⬇️  Téléchargement...`);
    await downloadImage(mainImageUrl, filePath);
    console.log(`   ✅ Sauvegardée: ${fileName}`);
    
    // Supprimer anciens médias
    await supabase
      .from('establishment_media')
      .delete()
      .eq('establishment_id', establishment.id);
    
    // Insérer nouveau média avec URL locale
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
      console.log(`   ❌ Erreur DB: ${error.message}`);
    } else {
      console.log(`   ✅ URL locale mise à jour: ${publicUrl}`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Erreur téléchargement: ${error.message}`);
    return false;
  }
}

async function downloadAllFromExisting() {
  console.log('🚀 Téléchargement depuis les URLs existantes...\n');
  
  try {
    // Récupérer établissements avec main_image dans metadata
    const { data: establishments, error } = await supabase
      .from('establishments')
      .select('id, name, slug, metadata')
      .not('metadata->main_image', 'is', null);
    
    if (error) throw error;
    
    console.log(`🏢 ${establishments.length} établissements avec photos trouvés\n`);
    
    let processed = 0;
    let errors = 0;
    
    for (const establishment of establishments) {
      try {
        const success = await processEstablishment(establishment);
        if (success) {
          processed++;
        } else {
          errors++;
        }
        
        // Pause entre téléchargements
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
    console.log(`📁 Dossier: ${IMAGES_DIR}`);
    console.log('\n✨ Terminé !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

downloadAllFromExisting().catch(console.error);