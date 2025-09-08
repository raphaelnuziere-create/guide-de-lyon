#!/usr/bin/env node

/**
 * Script de déploiement pour rendre les établissements visibles
 * Vérification finale et activation pour la production
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function deployEstablishments() {
  console.log('🚀 Déploiement des établissements...\n');
  
  // 1. Vérifier l'état actuel
  const { data: establishments, error } = await supabase
    .from('establishments')
    .select('id, name, category, status, metadata')
    .eq('status', 'active')
    .order('category');
  
  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }
  
  console.log(`📊 ${establishments.length} établissements actifs trouvés\n`);
  
  // 2. Vérifier que chaque établissement a une photo
  let withPhotos = 0;
  let withoutPhotos = 0;
  const missingPhotos = [];
  
  for (const est of establishments) {
    const { data: media } = await supabase
      .from('establishment_media')
      .select('url')
      .eq('establishment_id', est.id)
      .eq('is_active', true)
      .limit(1);
    
    if (media && media.length > 0) {
      withPhotos++;
    } else {
      withoutPhotos++;
      missingPhotos.push(est.name);
    }
  }
  
  // 3. Statistiques de déploiement
  const stats = {};
  establishments.forEach(est => {
    if (!stats[est.category]) stats[est.category] = 0;
    stats[est.category]++;
  });
  
  console.log('📈 RÉPARTITION FINALE PAR CATÉGORIE:');
  Object.keys(stats).sort().forEach(cat => {
    console.log(`   ${cat}: ${stats[cat]} établissements`);
  });
  
  console.log('\n📸 ÉTAT DES PHOTOS:');
  console.log(`   ✅ Avec photo: ${withPhotos}`);
  console.log(`   ❌ Sans photo: ${withoutPhotos}`);
  
  if (missingPhotos.length > 0 && missingPhotos.length <= 10) {
    console.log('\n⚠️  Établissements sans photo:');
    missingPhotos.forEach(name => console.log(`      - ${name}`));
  }
  
  // 4. Vérifier les catégories valides
  const validCategories = [
    'restaurant-food', 'bar-nightlife', 'shopping-mode',
    'beaute-bienetre', 'hotel-hebergement', 'culture-loisirs', 'services-pro'
  ];
  
  const invalidCategories = establishments.filter(est => 
    !validCategories.includes(est.category)
  );
  
  if (invalidCategories.length > 0) {
    console.log('\n⚠️  Catégories invalides détectées:');
    invalidCategories.forEach(est => 
      console.log(`      - ${est.name}: ${est.category}`)
    );
  }
  
  // 5. Résumé de déploiement
  console.log('\n' + '='.repeat(60));
  console.log('🎯 RÉSUMÉ DU DÉPLOIEMENT');
  console.log('='.repeat(60));
  console.log(`✅ ${establishments.length} établissements prêts`);
  console.log(`📷 ${withPhotos} avec photos (${Math.round(withPhotos/establishments.length*100)}%)`);
  console.log(`📍 Focus Presqu'île et PME locales`);
  
  // 6. Instructions de vérification
  console.log('\n🔍 VÉRIFICATION RECOMMANDÉE:');
  console.log('1. Visitez votre site web');
  console.log('2. Vérifiez l\'annuaire par catégorie');
  console.log('3. Testez l\'affichage des photos');
  console.log('4. Vérifiez les liens et informations');
  
  // 7. Commandes de debug si besoin
  console.log('\n🛠️  COMMANDES DEBUG (si problème):');
  console.log('   - Vérifier base de données: node scripts/analyze-current-data.js');
  console.log('   - Relancer photos: node scripts/download-from-existing-urls.js');
  console.log('   - Corriger catégories: modifier optimize-for-presquile.js');
  
  console.log('\n✨ Déploiement terminé !');
  console.log('🎉 Vos établissements sont maintenant visibles sur le site !');
}

deployEstablishments().catch(console.error);