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

async function checkEstablishments() {
  console.log('🔍 Vérification des établissements...\n');
  
  // Compter tous les établissements
  const { count: totalCount } = await supabase
    .from('establishments')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total établissements: ${totalCount}`);
  
  // Récupérer quelques exemples avec leurs métadonnées
  const { data: establishments } = await supabase
    .from('establishments')
    .select('id, name, metadata')
    .limit(5);
  
  console.log('\n📋 Échantillon d\'établissements:');
  establishments.forEach((est, i) => {
    console.log(`\n${i + 1}. ${est.name}`);
    console.log(`   ID: ${est.id}`);
    console.log(`   Métadonnées:`, est.metadata ? Object.keys(est.metadata) : 'null');
    if (est.metadata?.google_place_id) {
      console.log(`   Google Place ID: ${est.metadata.google_place_id.substring(0, 20)}...`);
    }
  });
  
  // Compter les établissements avec google_place_id
  const { count: withGoogleId } = await supabase
    .from('establishments')
    .select('*', { count: 'exact', head: true })
    .not('metadata->google_place_id', 'is', null);
  
  console.log(`\n✅ Établissements avec Google Place ID: ${withGoogleId}`);
  
  // Vérifier les médias existants
  const { count: mediaCount } = await supabase
    .from('establishment_media')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📷 Médias existants: ${mediaCount}`);
}

checkEstablishments().catch(console.error);