#!/usr/bin/env node

// Script pour nettoyer les établissements dupliqués
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanDuplicates() {
  console.log('🧹 Nettoyage des établissements dupliqués...\n');

  try {
    const merchantUserId = '49d7c38b-840d-4b0b-bf40-02fbb0190e51';
    
    // 1. Récupérer tous les établissements
    console.log('1. Recherche des établissements pour merchant...');
    const { data: establishments, error: fetchError } = await supabase
      .from('establishments')
      .select('*')
      .eq('user_id', merchantUserId)
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Erreur récupération:', fetchError);
      return;
    }
    
    console.log(`📊 Trouvé ${establishments.length} établissements:`);
    establishments.forEach((est, index) => {
      console.log(`  ${index + 1}. ${est.name} (ID: ${est.id}) - Créé: ${est.created_at}`);
    });
    
    if (establishments.length <= 1) {
      console.log('✅ Pas de doublons à nettoyer');
      return;
    }
    
    // 2. Garder le plus récent (premier de la liste)
    const toKeep = establishments[0];
    const toDelete = establishments.slice(1);
    
    console.log(`\n2. Conservation de: ${toKeep.name} (ID: ${toKeep.id})`);
    console.log(`   Suppression de ${toDelete.length} doublons...`);
    
    // 3. Supprimer les doublons
    for (const est of toDelete) {
      const { error: deleteError } = await supabase
        .from('establishments')
        .delete()
        .eq('id', est.id);
      
      if (deleteError) {
        console.error(`❌ Erreur suppression ${est.id}:`, deleteError);
      } else {
        console.log(`   ✅ Supprimé: ${est.name} (ID: ${est.id})`);
      }
    }
    
    console.log('\n✨ Nettoyage terminé !');
    console.log('\n📝 Maintenant vous pouvez vous connecter avec:');
    console.log('   Email: merchant@guide-de-lyon.fr');
    console.log('   Mot de passe: Merchant2025!');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter
cleanDuplicates();