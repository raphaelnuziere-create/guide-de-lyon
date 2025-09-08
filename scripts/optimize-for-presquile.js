#!/usr/bin/env node

/**
 * Script pour optimiser l'annuaire selon vos critères :
 * 1. Privilégier les PME de la Presqu'île (1er, 2e, 3e)
 * 2. Corriger les catégories non-standard
 * 3. Supprimer les grandes chaînes
 * 4. Équilibrer le nombre par catégorie
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

// Mapping des catégories vers les catégories du site
const CATEGORY_MAPPING = {
  'auto-transport': 'services-pro',
  'autre': 'services-pro', 
  'sante-medical': 'beaute-bienetre',
  'immobilier': 'services-pro',
  'services-pro': 'services-pro',
  'sport-fitness': 'beaute-bienetre'
};

// Catégories finales du site (à vérifier avec votre frontend)
const SITE_CATEGORIES = [
  'restaurant-food',
  'bar-nightlife', 
  'shopping-mode',
  'beaute-bienetre',
  'hotel-hebergement',
  'culture-loisirs',
  'services-pro'
];

// Grandes chaînes à supprimer (privilégier PME)
const GRANDES_CHAINES = [
  'ikea', 'apple', 'mercedes', 'bmw', 'tesla', 'norauto', 'midas',
  'decathlon', 'fnac', 'galeries lafayette', 'printemps',
  'sofitel', 'radisson', 'novotel', 'ibis', 'mercure',
  'basic-fit', 'keep cool'
];

async function optimizeForPresquile() {
  console.log('🎯 Optimisation pour Presqu\'île et PME...\n');
  
  // 1. Récupérer tous les établissements
  const { data: establishments } = await supabase
    .from('establishments')
    .select('*');
  
  console.log(`📊 ${establishments.length} établissements à analyser\n`);
  
  let deleted = 0;
  let updated = 0;
  let kept = 0;
  
  for (const est of establishments) {
    const name = est.name.toLowerCase();
    const district = est.metadata?.address_district;
    
    // 2. Supprimer les grandes chaînes
    const isGrandeChaine = GRANDES_CHAINES.some(chain => 
      name.includes(chain) || name.includes(chain.replace('-', ' '))
    );
    
    if (isGrandeChaine) {
      console.log(`❌ Suppression grande chaîne: ${est.name}`);
      
      // Supprimer les médias associés
      await supabase
        .from('establishment_media')
        .delete()
        .eq('establishment_id', est.id);
      
      // Supprimer l'établissement
      await supabase
        .from('establishments')
        .delete()
        .eq('id', est.id);
      
      deleted++;
      continue;
    }
    
    // 3. Privilégier Presqu'île (Lyon 1er, 2e, 3e)
    const isPriorityArea = ['Lyon 1er', 'Lyon 2e', 'Lyon 3e'].includes(district);
    
    // 4. Corriger les catégories
    let newCategory = est.category;
    if (est.category && CATEGORY_MAPPING[est.category]) {
      newCategory = CATEGORY_MAPPING[est.category];
    }
    
    // Si pas de catégorie ou catégorie invalide
    if (!newCategory || !SITE_CATEGORIES.includes(newCategory)) {
      // Deviner la catégorie selon le nom
      if (name.includes('restaurant') || name.includes('brasserie') || name.includes('café')) {
        newCategory = 'restaurant-food';
      } else if (name.includes('bar') || name.includes('club') || name.includes('pub')) {
        newCategory = 'bar-nightlife';
      } else if (name.includes('spa') || name.includes('coiffeur') || name.includes('beauté')) {
        newCategory = 'beaute-bienetre';
      } else if (name.includes('hôtel') || name.includes('hotel')) {
        newCategory = 'hotel-hebergement';
      } else if (name.includes('musée') || name.includes('théâtre') || name.includes('cinéma')) {
        newCategory = 'culture-loisirs';
      } else {
        newCategory = 'services-pro';
      }
    }
    
    // 5. Mettre à jour si nécessaire
    const needsUpdate = newCategory !== est.category;
    
    if (needsUpdate) {
      console.log(`🔄 Mise à jour catégorie: ${est.name} -> ${newCategory}`);
      
      await supabase
        .from('establishments')
        .update({ category: newCategory })
        .eq('id', est.id);
      
      updated++;
    } else {
      kept++;
    }
    
    // Log pour les établissements prioritaires
    if (isPriorityArea && !isGrandeChaine) {
      console.log(`✅ ${district} - ${est.name} (${newCategory})`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DE L\'OPTIMISATION');
  console.log('='.repeat(60));
  console.log(`❌ Grandes chaînes supprimées: ${deleted}`);
  console.log(`🔄 Catégories corrigées: ${updated}`);
  console.log(`✅ Établissements conservés: ${kept}`);
  
  // 6. Analyser le résultat final
  const { data: finalData } = await supabase
    .from('establishments')
    .select('category, metadata')
    .eq('status', 'active');
  
  const finalStats = {};
  const districtStats = {};
  
  finalData.forEach(est => {
    // Stats par catégorie
    if (!finalStats[est.category]) finalStats[est.category] = 0;
    finalStats[est.category]++;
    
    // Stats par arrondissement
    const district = est.metadata?.address_district;
    if (district) {
      if (!districtStats[district]) districtStats[district] = 0;
      districtStats[district]++;
    }
  });
  
  console.log('\n📈 RÉPARTITION FINALE PAR CATÉGORIE:');
  Object.keys(finalStats).sort().forEach(cat => {
    console.log(`   ${cat}: ${finalStats[cat]} établissements`);
  });
  
  console.log('\n🏙️ RÉPARTITION PRESQU\'ÎLE:');
  ['Lyon 1er', 'Lyon 2e', 'Lyon 3e'].forEach(district => {
    const count = districtStats[district] || 0;
    console.log(`   ${district}: ${count} établissements`);
  });
  
  console.log('\n✨ Optimisation terminée !');
  console.log('💡 Vos établissements privilégient maintenant les PME de la Presqu\'île');
}

optimizeForPresquile().catch(console.error);