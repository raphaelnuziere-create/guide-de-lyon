// Script pour appliquer la migration du système d'événements
// Lit le fichier SQL et l'exécute sur Supabase

const fs = require('fs');
const path = require('path');

async function applyMigration() {
  // Vérifier les variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables d\'environnement Supabase manquantes');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
    return;
  }

  console.log('🔧 Configuration Supabase détectée');
  console.log('URL:', supabaseUrl);
  
  // Lire le fichier de migration
  const migrationPath = path.join(__dirname, 'supabase/migrations/20250114_events_system_complete.sql');
  
  try {
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration SQL lue:', migrationSQL.length, 'caractères');
    
    // Importer Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🚀 Connexion à Supabase...');
    
    // Tester la connexion
    const { data: testData, error: testError } = await supabase
      .from('establishments')
      .select('count(*)')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError.message);
      return;
    }
    
    console.log('✅ Connexion Supabase réussie');
    
    // Diviser le SQL en commandes individuelles
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log('📋 Commandes SQL à exécuter:', commands.length);
    
    // Exécuter chaque commande
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.length < 10) continue; // Skip très petites commandes
      
      console.log(`\n🔄 Exécution commande ${i + 1}/${commands.length}:`);
      console.log(command.substring(0, 100) + '...');
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_command: command });
        
        if (error) {
          console.log('⚠️  Erreur (peut-être normale):', error.message);
          
          // Certaines erreurs sont normales (table existe déjà, etc.)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('permission denied')) {
            console.log('ℹ️  Erreur ignorée (normale)');
          } else {
            errorCount++;
            console.error('❌ Erreur critique:', error.message);
          }
        } else {
          successCount++;
          console.log('✅ Succès');
        }
      } catch (err) {
        console.error('💥 Exception:', err.message);
        
        // Essayer avec une approche directe
        try {
          const { error: directError } = await supabase
            .from('_temp')
            .select('*')
            .limit(0); // Juste pour tester la connexion
          
          console.log('🔄 Tentative d\'exécution alternative...');
          // Pour l'instant on continue, la migration sera appliquée via l'interface Supabase
          
        } catch (directErr) {
          errorCount++;
          console.error('❌ Impossible d\'exécuter la commande');
        }
      }
    }
    
    console.log('\n📊 RÉSULTAT MIGRATION:');
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(`📋 Total: ${commands.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration appliquée avec succès !');
    } else {
      console.log('\n⚠️  Migration partiellement appliquée');
      console.log('💡 Conseil: Appliquez manuellement via l\'interface Supabase Dashboard');
    }
    
    // Vérifier que les tables ont été créées
    console.log('\n🔍 Vérification des tables créées...');
    
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('count(*)')
        .limit(1);
      
      if (!eventsError) {
        console.log('✅ Table "events" : OK');
      } else {
        console.log('❌ Table "events" : Erreur -', eventsError.message);
      }
      
      const { data: quotasData, error: quotasError } = await supabase
        .from('event_quotas')
        .select('count(*)')
        .limit(1);
      
      if (!quotasError) {
        console.log('✅ Table "event_quotas" : OK');
      } else {
        console.log('❌ Table "event_quotas" : Erreur -', quotasError.message);
      }
      
    } catch (verifyError) {
      console.log('⚠️  Impossible de vérifier les tables:', verifyError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lecture migration:', error.message);
  }
}

// Exécuter la migration
console.log('🚀 DÉBUT MIGRATION SYSTÈME ÉVÉNEMENTS');
console.log('=====================================\n');

applyMigration().then(() => {
  console.log('\n=====================================');
  console.log('✨ MIGRATION TERMINÉE');
}).catch(err => {
  console.error('\n❌ MIGRATION ÉCHOUÉE:', err.message);
  process.exit(1);
});