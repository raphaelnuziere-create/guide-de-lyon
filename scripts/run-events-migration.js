const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🔧 Running events table migration...');
  
  try {
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250108_fix_events_add_address.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and filter out comments and empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement === 'SELECT \'events table columns after fix:\' as info') continue;
      
      console.log(`⏳ Executing statement ${i + 1}...`);
      console.log(`   ${statement.substring(0, 80)}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      });
      
      if (error) {
        // Try direct query method
        const { error: directError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .limit(1);
          
        if (directError) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          continue;
        }
        
        // If it's a DDL statement, try a different approach
        try {
          if (statement.toUpperCase().includes('ALTER TABLE')) {
            console.log('   🔄 Trying alternative method for DDL...');
            // For DDL statements, we might need to use a different approach
            // This is a limitation - Supabase doesn't expose DDL through RPC easily
            console.log('   ⚠️ DDL statement needs to be run manually in Supabase SQL editor');
            console.log(`   📋 Statement: ${statement}`);
          }
        } catch (altError) {
          console.error('   ❌ Alternative method failed:', altError);
        }
      } else {
        console.log(`   ✅ Statement ${i + 1} completed successfully`);
        if (data) {
          console.log('   📊 Data:', data);
        }
      }
    }
    
    // Verify the migration worked
    console.log('\n🔍 Verifying migration...');
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'events')
      .in('column_name', ['location', 'address']);
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('✅ Events table structure:');
      console.table(columns);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative: Print SQL for manual execution
async function printMigrationSQL() {
  console.log('\n📋 MANUAL MIGRATION INSTRUCTIONS:');
  console.log('If automatic migration fails, copy and paste this SQL in Supabase SQL Editor:');
  console.log('=' .repeat(80));
  
  const migrationPath = path.join(__dirname, '../supabase/migrations/20250108_fix_events_add_address.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log(migrationSQL);
  
  console.log('=' .repeat(80));
  console.log('🌐 Go to: https://ikefyhxelzydaogrnwxi.supabase.co/project/ikefyhxelzydaogrnwxi/sql');
}

// Run the migration
runMigration().then(() => {
  console.log('\n✅ Migration process completed');
  printMigrationSQL();
}).catch(error => {
  console.error('❌ Migration process failed:', error);
  printMigrationSQL();
});