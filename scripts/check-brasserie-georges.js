#!/usr/bin/env node

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

async function checkBrasserieGeorges() {
  const { data: establishment } = await supabase
    .from('establishments')
    .select('*')
    .eq('name', 'Brasserie Georges')
    .single();
  
  console.log('🏢 Brasserie Georges:');
  console.log('Métadonnées complètes:', JSON.stringify(establishment.metadata, null, 2));
  
  // Vérifier ses médias
  const { data: media } = await supabase
    .from('establishment_media')
    .select('*')
    .eq('establishment_id', establishment.id);
  
  console.log(`\n📷 ${media.length} médias trouvés:`);
  media.forEach((m, i) => {
    console.log(`${i + 1}. Type: ${m.type}, URL: ${m.url.substring(0, 50)}...`);
  });
}

checkBrasserieGeorges().catch(console.error);