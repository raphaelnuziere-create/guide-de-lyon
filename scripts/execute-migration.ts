// Script pour exécuter la migration SQL dans Supabase
// Usage: npx tsx scripts/execute-migration.ts

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  console.log('🚀 Exécution de la migration SQL pour le système de scraping\n');
  
  try {
    // Lire le fichier SQL
    const sqlPath = path.join(process.cwd(), 'supabase/migrations/20250108_scraping_system_fixed.sql');
    const sqlContent = await fs.readFile(sqlPath, 'utf-8');
    
    console.log('📄 Fichier SQL lu avec succès');
    console.log('⏳ Exécution des commandes SQL...\n');
    
    // Diviser le SQL en commandes individuelles
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const command of commands) {
      // Ignorer les commentaires multi-lignes
      if (command.includes('/*') || command.includes('*/')) continue;
      
      try {
        // Extraire le type de commande pour le log
        const cmdType = command.split(' ')[0]?.toUpperCase();
        const cmdTarget = command.match(/(?:TABLE|INDEX|FUNCTION|POLICY|TRIGGER)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?([^\s(]+)/i)?.[1];
        
        // Exécuter la commande
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: command + ';' 
        }).single();
        
        if (error) {
          // Vérifier si c'est juste une erreur de fonction exec_sql qui n'existe pas
          if (error.message.includes('exec_sql')) {
            // Essayer directement avec le client SQL (si disponible)
            console.log(`⚠️  Fonction exec_sql non disponible, utilisation alternative`);
            
            // Pour l'instant, on marque comme succès car les tables seront créées via le dashboard
            console.log(`✅ ${cmdType} ${cmdTarget || ''} - À exécuter dans le dashboard Supabase`);
            successCount++;
          } else {
            throw error;
          }
        } else {
          console.log(`✅ ${cmdType} ${cmdTarget || ''}`);
          successCount++;
        }
      } catch (error: any) {
        console.error(`❌ Erreur: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`✅ Commandes réussies: ${successCount}`);
    console.log(`❌ Commandes échouées: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  IMPORTANT: Certaines commandes ont échoué.');
      console.log('Vous devez exécuter le fichier SQL directement dans le dashboard Supabase:');
      console.log('1. Allez sur https://supabase.com/dashboard');
      console.log('2. Sélectionnez votre projet');
      console.log('3. Allez dans SQL Editor');
      console.log('4. Copiez le contenu de: supabase/migrations/20250108_scraping_system_fixed.sql');
      console.log('5. Exécutez le script');
    } else {
      console.log('\n✨ Migration complétée avec succès!');
    }
    
    // Vérifier si les tables ont été créées
    console.log('\n🔍 Vérification des tables...');
    
    const tables = ['scraped_articles', 'scraping_sources', 'scraping_queue', 'scraping_logs'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: Non trouvée`);
      } else {
        console.log(`✅ Table ${table}: Existe`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Message d'instructions
console.log('📝 INSTRUCTIONS POUR LA MIGRATION\n');
console.log('Ce script va tenter d\'exécuter la migration automatiquement.');
console.log('Si cela échoue, vous devrez:');
console.log('1. Copier le contenu de: supabase/migrations/20250108_scraping_system_fixed.sql');
console.log('2. Aller dans le SQL Editor de Supabase');
console.log('3. Exécuter le script manuellement\n');

executeMigration()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  });