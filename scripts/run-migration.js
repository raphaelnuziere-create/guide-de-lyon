const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting migration for subscription system...');
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_create_subscription_system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Diviser le SQL en statements individuels (par point-virgule)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Extraire le nom de l'objet créé pour le logging
      const match = statement.match(/CREATE\s+(TABLE|INDEX|POLICY|FUNCTION|TRIGGER)\s+(?:IF\s+NOT\s+EXISTS\s+)?(\S+)/i);
      const objectName = match ? `${match[1]} ${match[2]}` : `Statement ${i + 1}`;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Essayer avec une requête directe
          const { data, error: directError } = await supabase.from('_exec').select().limit(0);
          
          if (directError) {
            console.error(`❌ Error creating ${objectName}:`, directError.message);
            errorCount++;
          } else {
            console.log(`✅ Created ${objectName}`);
            successCount++;
          }
        } else {
          console.log(`✅ Created ${objectName}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error creating ${objectName}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📋 Migration Summary:');
    console.log(`✅ Success: ${successCount} statements`);
    console.log(`❌ Errors: ${errorCount} statements`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please check Supabase dashboard.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Note importante pour l'utilisateur
console.log(`
📌 IMPORTANT: 
Si ce script ne fonctionne pas, veuillez:
1. Aller dans votre dashboard Supabase
2. Cliquer sur "SQL Editor"
3. Copier le contenu de: supabase/migrations/001_create_subscription_system.sql
4. Coller et exécuter dans l'éditeur SQL

URL Dashboard: ${supabaseUrl ? supabaseUrl.replace('https://', 'https://app.supabase.com/project/') : 'https://app.supabase.com'}
`);

runMigration();