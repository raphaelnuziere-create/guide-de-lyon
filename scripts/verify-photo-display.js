#!/usr/bin/env node

/**
 * Script pour vérifier que les photos sont correctement configurées
 * et peuvent être affichées sur le site
 */

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
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyPhotoDisplay() {
  console.log('🔍 VÉRIFICATION DU SYSTÈME D\'AFFICHAGE DES PHOTOS\n');
  console.log('='.repeat(60));
  
  // 1. Vérifier la configuration Next.js
  console.log('\n📋 1. Configuration Next.js:');
  const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  const hasGoogleMaps = nextConfig.includes('maps.googleapis.com');
  const hasGoogleusercontent = nextConfig.includes('googleusercontent.com');
  
  console.log(`   ✅ maps.googleapis.com: ${hasGoogleMaps ? 'Configuré' : '❌ MANQUANT'}`);
  console.log(`   ✅ googleusercontent.com: ${hasGoogleusercontent ? 'Configuré' : '❌ MANQUANT'}`);
  
  // 2. Récupérer un échantillon d'établissements avec photos
  console.log('\n📷 2. Échantillon d\'établissements avec photos:');
  
  const { data: samples } = await supabase
    .from('establishments')
    .select(`
      id,
      name,
      slug,
      category,
      establishment_media (
        url,
        type,
        is_active
      )
    `)
    .eq('status', 'active')
    .limit(5);
  
  if (!samples || samples.length === 0) {
    console.log('   ❌ Aucun établissement trouvé');
    return;
  }
  
  for (const est of samples) {
    const photos = est.establishment_media?.filter(m => m.type === 'image' && m.is_active) || [];
    console.log(`\n   📍 ${est.name}`);
    console.log(`      Slug: ${est.slug}`);
    console.log(`      Catégorie: ${est.category}`);
    console.log(`      Photos: ${photos.length}`);
    
    if (photos.length > 0) {
      const firstPhoto = photos[0];
      console.log(`      URL première photo:`);
      console.log(`      ${firstPhoto.url.substring(0, 100)}...`);
      
      // Vérifier si l'URL contient la clé API
      if (firstPhoto.url.includes('maps.googleapis.com')) {
        const hasKey = firstPhoto.url.includes('key=');
        console.log(`      Clé API: ${hasKey ? '✅ Présente' : '❌ MANQUANTE'}`);
        
        if (!hasKey && envVars.GOOGLE_PLACES_API_KEY) {
          console.log(`      ⚠️ La clé API devrait être ajoutée à l'URL`);
        }
      }
    }
  }
  
  // 3. Vérifier les composants frontend
  console.log('\n🎨 3. Vérification des composants frontend:');
  
  const annuairePage = path.join(__dirname, '..', 'app', 'annuaire', 'page.tsx');
  const annuaireContent = fs.readFileSync(annuairePage, 'utf8');
  
  const hasMediaQuery = annuaireContent.includes('establishment_media');
  const hasImageMapping = annuaireContent.includes('firstImage?.url');
  
  console.log(`   Query establishment_media: ${hasMediaQuery ? '✅ Présent' : '❌ MANQUANT'}`);
  console.log(`   Mapping firstImage: ${hasImageMapping ? '✅ Présent' : '❌ MANQUANT'}`);
  
  // 4. Statistiques globales
  console.log('\n📊 4. Statistiques globales:');
  
  const { count: totalEstablishments } = await supabase
    .from('establishments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
  
  const { count: totalPhotos } = await supabase
    .from('establishment_media')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'image')
    .eq('is_active', true);
  
  console.log(`   Total établissements actifs: ${totalEstablishments}`);
  console.log(`   Total photos actives: ${totalPhotos}`);
  console.log(`   Moyenne photos/établissement: ${(totalPhotos / totalEstablishments).toFixed(2)}`);
  
  // 5. Recommandations
  console.log('\n💡 5. Diagnostic final:');
  
  if (!hasGoogleMaps || !hasGoogleusercontent) {
    console.log('   ❌ Configuration Next.js incomplète pour les images Google');
    console.log('   → Ajouter les domaines Google dans next.config.ts');
  }
  
  if (!hasMediaQuery || !hasImageMapping) {
    console.log('   ❌ Code frontend non optimisé pour establishment_media');
    console.log('   → Mettre à jour les requêtes Supabase dans les pages');
  }
  
  if (totalPhotos < totalEstablishments) {
    console.log(`   ⚠️ ${totalEstablishments - totalPhotos} établissements sans photos`);
    console.log('   → Exécuter: node scripts/fix-establishment-photos.js 1');
  }
  
  if (hasGoogleMaps && hasGoogleusercontent && hasMediaQuery && hasImageMapping && totalPhotos >= totalEstablishments) {
    console.log('   ✅ SYSTÈME DE PHOTOS CORRECTEMENT CONFIGURÉ!');
    console.log('   Les photos devraient s\'afficher correctement sur le site.');
    console.log('\n   Test final: Ouvrir http://localhost:3001/annuaire');
    console.log('   Les images Google Places devraient être visibles.');
  }
}

// Exécuter
verifyPhotoDisplay().catch(console.error);