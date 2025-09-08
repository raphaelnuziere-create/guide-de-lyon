#!/usr/bin/env node

/**
 * Script pour créer quelques établissements experts de démonstration
 * afin de tester le nouveau design
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

async function createExpertEstablishments() {
  console.log('🏆 Création d\'établissements experts pour démonstration...\n');

  // Convertir quelques établissements existants en experts
  const establishmentsToConvert = [
    // Restaurants
    'Restaurant Paul Bocuse',
    'La Mère Brazier', 
    'Le Neuvième Art',
    
    // Bars
    'Le Sucre',
    'Hot Club de Lyon',
    'L\' Antiquaire',
    
    // Beauté
    'Spa Lyon Plage',
    'L\'instant Spa',
    
    // Culture
    'Musée des Confluences',
    'Institut Lumière',
    
    // Hotels
    'Villa Florentine',
    'InterContinental Lyon',
    
    // Shopping
    'Centre Commercial Part Dieu',
    'Les Ateliers-Boutique de Créateurs'
  ];

  let converted = 0;
  
  for (const name of establishmentsToConvert) {
    try {
      // Trouver l'établissement
      const { data: establishment } = await supabase
        .from('establishments')
        .select('id, name, metadata')
        .ilike('name', `%${name}%`)
        .limit(1)
        .single();

      if (establishment) {
        // Mettre à jour pour en faire un expert
        const newMetadata = {
          ...establishment.metadata,
          plan: 'expert',
          views_count: Math.floor(Math.random() * 2000) + 1000, // Entre 1000-3000 vues
        };

        const { error } = await supabase
          .from('establishments')
          .update({ metadata: newMetadata })
          .eq('id', establishment.id);

        if (!error) {
          console.log(`✅ ${establishment.name} → EXPERT (${newMetadata.views_count} vues)`);
          converted++;
        } else {
          console.log(`❌ Erreur pour ${establishment.name}: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Erreur recherche ${name}: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DE LA CONVERSION');
  console.log('='.repeat(60));
  console.log(`✅ Établissements convertis en EXPERT: ${converted}`);
  console.log('\n🎯 Testez maintenant votre annuaire :');
  console.log('   👉 https://www.guide-de-lyon.fr/annuaire');
  console.log('   👉 https://www.guide-de-lyon.fr/annuaire/restaurants');
  console.log('   👉 https://www.guide-de-lyon.fr/annuaire/bars');
  console.log('\n✨ Conversion terminée !');
}

createExpertEstablishments().catch(console.error);