#!/usr/bin/env node

/**
 * Script pour vérifier le statut des photos et comprendre le problème
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
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPhotosStatus() {
  console.log('🔍 DIAGNOSTIC DES PHOTOS D\'ÉTABLISSEMENTS\n');
  
  // 1. Compter les établissements
  const { count: totalEstablishments } = await supabase
    .from('establishments')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total établissements: ${totalEstablishments}\n`);
  
  // 2. Compter les médias
  const { count: totalMedia } = await supabase
    .from('establishment_media')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'image');
  
  console.log(`📷 Total photos dans establishment_media: ${totalMedia}\n`);
  
  // 3. Analyser quelques établissements récents
  console.log('🔍 Analyse des 10 derniers établissements ajoutés:\n');
  
  const { data: recentEstablishments } = await supabase
    .from('establishments')
    .select('id, name, category, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  for (const est of recentEstablishments) {
    console.log(`\n📍 ${est.name} (${est.category})`);
    console.log(`   ID: ${est.id}`);
    console.log(`   Créé: ${new Date(est.created_at).toLocaleString('fr-FR')}`);
    
    // Vérifier les médias
    const { data: media, error } = await supabase
      .from('establishment_media')
      .select('url, type, is_active')
      .eq('establishment_id', est.id);
    
    if (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    } else if (!media || media.length === 0) {
      console.log(`   ⚠️ AUCUNE PHOTO`);
    } else {
      console.log(`   ✅ ${media.length} photo(s) trouvée(s):`);
      media.forEach((m, i) => {
        console.log(`      ${i+1}. ${m.url.substring(0, 80)}...`);
        console.log(`         Active: ${m.is_active ? 'Oui' : 'Non'}`);
      });
    }
  }
  
  // 4. Statistiques par catégorie
  console.log('\n' + '='.repeat(60));
  console.log('📊 STATISTIQUES PAR CATÉGORIE\n');
  
  const categories = [
    'restaurant-food',
    'bar-nightlife', 
    'shopping-mode',
    'beaute-bienetre',
    'hotel-hebergement',
    'culture-loisirs',
    'services-pro'
  ];
  
  for (const category of categories) {
    // Établissements dans cette catégorie
    const { data: catEstablishments } = await supabase
      .from('establishments')
      .select('id')
      .eq('category', category);
    
    if (!catEstablishments || catEstablishments.length === 0) continue;
    
    const establishmentIds = catEstablishments.map(e => e.id);
    
    // Compter ceux avec photos
    const { data: withPhotos } = await supabase
      .from('establishment_media')
      .select('establishment_id')
      .in('establishment_id', establishmentIds)
      .eq('type', 'image');
    
    const uniqueWithPhotos = new Set(withPhotos?.map(m => m.establishment_id) || []);
    
    console.log(`${category}:`);
    console.log(`   Total: ${catEstablishments.length} établissements`);
    console.log(`   Avec photos: ${uniqueWithPhotos.size}`);
    console.log(`   Sans photos: ${catEstablishments.length - uniqueWithPhotos.size}`);
    console.log(`   Couverture: ${Math.round(uniqueWithPhotos.size / catEstablishments.length * 100)}%\n`);
  }
  
  // 5. Vérifier les URLs
  console.log('='.repeat(60));
  console.log('🔍 ANALYSE DES URLS DE PHOTOS\n');
  
  const { data: sampleMedia } = await supabase
    .from('establishment_media')
    .select('url')
    .eq('type', 'image')
    .limit(5);
  
  if (sampleMedia && sampleMedia.length > 0) {
    console.log('Exemples d\'URLs stockées:');
    sampleMedia.forEach((m, i) => {
      console.log(`${i+1}. ${m.url}`);
      
      // Analyser le type d'URL
      if (m.url.includes('googleapis.com')) {
        console.log('   ✅ URL Google Places valide');
      } else if (m.url.startsWith('/images/')) {
        console.log('   📁 URL locale');
      } else {
        console.log('   ⚠️ Type d\'URL inconnu');
      }
    });
  }
  
  // 6. Recommandations
  console.log('\n' + '='.repeat(60));
  console.log('💡 DIAGNOSTIC ET RECOMMANDATIONS\n');
  
  const percentageWithPhotos = Math.round(totalMedia / totalEstablishments * 100);
  
  if (percentageWithPhotos < 50) {
    console.log('⚠️ PROBLÈME DÉTECTÉ: Moins de 50% des établissements ont des photos\n');
    console.log('Solutions possibles:');
    console.log('1. Le script de collecte n\'a pas ajouté les photos correctement');
    console.log('2. Les URLs Google Places nécessitent une clé API valide');
    console.log('3. Les photos ne s\'affichent pas sur le site (problème frontend)');
    console.log('\nAction recommandée:');
    console.log('→ Relancer: node scripts/fix-establishment-photos.js 1');
  } else if (percentageWithPhotos < 80) {
    console.log('⚠️ Couverture photo partielle (' + percentageWithPhotos + '%)\n');
    console.log('Action recommandée:');
    console.log('→ Compléter avec: node scripts/fix-establishment-photos.js 1');
  } else {
    console.log('✅ Bonne couverture photo (' + percentageWithPhotos + '%)\n');
    console.log('Si les photos ne s\'affichent pas sur le site:');
    console.log('1. Vérifier que les URLs Google Places incluent la clé API');
    console.log('2. Vérifier le composant frontend qui affiche les images');
    console.log('3. Vérifier la console du navigateur pour des erreurs 403');
  }
}

// Lancer
checkPhotosStatus().catch(console.error);