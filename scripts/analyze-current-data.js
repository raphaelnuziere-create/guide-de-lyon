#!/usr/bin/env node

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

async function analyzeCurrentData() {
  console.log('🔍 Analyse des données actuelles...\n');
  
  // 1. Analyser par catégorie
  const { data: establishments } = await supabase
    .from('establishments')
    .select('id, name, category, status, address, metadata')
    .order('category');
  
  const categories = {};
  const arrondissements = {};
  const grandes_entreprises = [];
  const pme = [];
  
  establishments.forEach(est => {
    // Compter par catégorie
    if (!categories[est.category]) categories[est.category] = [];
    categories[est.category].push(est);
    
    // Analyser les arrondissements
    const district = est.metadata?.address_district;
    if (district) {
      if (!arrondissements[district]) arrondissements[district] = [];
      arrondissements[district].push(est);
    }
    
    // Classifier taille entreprise (approximatif)
    const name = est.name.toLowerCase();
    if (name.includes('ikea') || name.includes('apple') || name.includes('mercedes') || 
        name.includes('bmw') || name.includes('tesla') || name.includes('sofitel') ||
        name.includes('radisson') || name.includes('novotel') || name.includes('ibis')) {
      grandes_entreprises.push(est);
    } else {
      pme.push(est);
    }
  });
  
  console.log('📊 RÉPARTITION PAR CATÉGORIE:');
  Object.keys(categories).forEach(cat => {
    console.log(`   ${cat}: ${categories[cat].length} établissements`);
    if (categories[cat].length <= 5) {
      categories[cat].forEach(est => console.log(`      - ${est.name}`));
    }
  });
  
  console.log('\n🏙️ RÉPARTITION PAR ARRONDISSEMENT:');
  Object.keys(arrondissements).sort().forEach(arr => {
    console.log(`   ${arr}: ${arrondissements[arr].length} établissements`);
  });
  
  console.log('\n🏢 TAILLE DES ENTREPRISES:');
  console.log(`   Grandes entreprises: ${grandes_entreprises.length}`);
  console.log(`   PME/Commerces locaux: ${pme.length}`);
  
  console.log('\n🎯 RECOMMANDATIONS:');
  console.log('1. Privilégier les PME et commerces de proximité');
  console.log('2. Se concentrer sur Lyon 1er, 2e, 3e (Presqu\'île + centre)');
  console.log('3. Équilibrer les catégories selon les besoins du site');
  console.log('4. Marquer les établissements comme "active" pour les afficher');
  
  // Vérifier le statut des établissements
  const { count: activeCount } = await supabase
    .from('establishments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');
  
  const { count: pendingCount } = await supabase
    .from('establishments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  
  console.log('\n📋 STATUTS ACTUELS:');
  console.log(`   Actifs (visibles): ${activeCount}`);
  console.log(`   En attente: ${pendingCount}`);
  
  if (activeCount === 0) {
    console.log('\n⚠️  PROBLÈME: Aucun établissement n\'est marqué comme "active"');
    console.log('   C\'est pourquoi ils n\'apparaissent pas sur le site !');
  }
}

analyzeCurrentData().catch(console.error);