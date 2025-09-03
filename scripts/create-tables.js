#!/usr/bin/env node

/**
 * Script automatique pour créer les tables dans Supabase
 * Exécution directe via l'API
 */

const https = require('https');

// Configuration Supabase
const SUPABASE_URL = 'https://ikefyhxelzydaogrnwxi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTY3NTQsImV4cCI6MjA3MTI3Mjc1NH0.vJHDlWKUK0xUoXB_CCxNkVNnWhb7Wpq-mA097blKmzc';

// Lire la clé service depuis .env.local
const fs = require('fs');
const path = require('path');

function getServiceKey() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env.local non trouvé');
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);
  
  if (!match || !match[1] || match[1].trim() === '') {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY non trouvée ou vide dans .env.local');
    console.log('📝 Ajoutez votre clé service dans .env.local');
    console.log('👉 https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/settings/api');
    return null;
  }
  
  return match[1].trim();
}

async function executeSQLViaSupabase() {
  console.log('🚀 Création automatique des tables...\n');

  // Script SQL de création
  const sqlCommands = [
    // Supprimer les anciennes tables
    `DROP TABLE IF EXISTS events CASCADE`,
    `DROP TABLE IF EXISTS places CASCADE`,
    `DROP TABLE IF EXISTS merchants CASCADE`,
    
    // Créer merchants
    `CREATE TABLE merchants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      phone TEXT,
      plan TEXT DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      onboarding_completed BOOLEAN DEFAULT false
    )`,
    
    // Créer places
    `CREATE TABLE places (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      merchant_id UUID REFERENCES merchants(id),
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      address TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    
    // Créer events
    `CREATE TABLE events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      merchant_id UUID REFERENCES merchants(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      start_date TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    
    // Activer RLS
    `ALTER TABLE merchants ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE places ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE events ENABLE ROW LEVEL SECURITY`,
    
    // Créer les policies
    `CREATE POLICY "all_merchants" ON merchants FOR ALL USING (true)`,
    `CREATE POLICY "all_places" ON places FOR ALL USING (true)`,
    `CREATE POLICY "all_events" ON events FOR ALL USING (true)`
  ];

  const serviceKey = getServiceKey();
  if (!serviceKey) {
    console.log('\n💡 Alternative : Utilisez le Supabase CLI');
    console.log('npm install -g supabase');
    console.log('supabase login');
    console.log('supabase db reset --project-ref ikefyhxelzydaogrnwxi');
    return;
  }

  // Exécuter chaque commande
  for (const sql of sqlCommands) {
    const commandName = sql.substring(0, 50).replace(/\n/g, ' ');
    process.stdout.write(`⏳ ${commandName}...`);
    
    try {
      // Utiliser l'API REST de Supabase pour exécuter du SQL
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({ query: sql })
      });
      
      if (response.ok) {
        console.log(' ✅');
      } else {
        console.log(' ❌');
        console.error('Erreur:', await response.text());
      }
    } catch (error) {
      console.log(' ❌');
      console.error('Erreur:', error.message);
    }
  }
  
  // Vérification finale
  console.log('\n📊 Vérification des tables créées...\n');
  
  const tables = ['merchants', 'places', 'events'];
  for (const table of tables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact'
        }
      });
      
      if (response.ok) {
        console.log(`✅ Table ${table} : créée avec succès`);
      } else {
        console.log(`❌ Table ${table} : non trouvée`);
      }
    } catch (error) {
      console.log(`❌ Table ${table} : erreur de vérification`);
    }
  }
  
  console.log('\n✅ Script terminé !');
  console.log('🎯 Testez maintenant : https://www.guide-de-lyon.fr/pro/register');
}

// Alternative : utiliser directement psql si disponible
async function executeSQLDirectly() {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  const serviceKey = getServiceKey();
  if (!serviceKey) {
    return executeSQLViaSupabase();
  }
  
  // Construire l'URL de connexion PostgreSQL
  const dbUrl = `postgresql://postgres.ikefyhxelzydaogrnwxi:${serviceKey}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`;
  
  const sql = `
    DROP TABLE IF EXISTS events CASCADE;
    DROP TABLE IF EXISTS places CASCADE; 
    DROP TABLE IF EXISTS merchants CASCADE;
    
    CREATE TABLE merchants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      company_name TEXT NOT NULL,
      phone TEXT,
      plan TEXT DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      onboarding_completed BOOLEAN DEFAULT false
    );
    
    CREATE TABLE places (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      merchant_id UUID REFERENCES merchants(id),
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      address TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE TABLE events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      merchant_id UUID REFERENCES merchants(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      start_date TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
    ALTER TABLE places ENABLE ROW LEVEL SECURITY;
    ALTER TABLE events ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "all_merchants" ON merchants FOR ALL USING (true);
    CREATE POLICY "all_places" ON places FOR ALL USING (true);
    CREATE POLICY "all_events" ON events FOR ALL USING (true);
  `;
  
  try {
    console.log('🔧 Tentative de connexion directe à PostgreSQL...');
    const { stdout, stderr } = await execPromise(`echo "${sql}" | psql "${dbUrl}" 2>&1`);
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.error('Erreur:', stderr);
    } else {
      console.log('✅ Tables créées avec succès !');
      console.log(stdout);
    }
  } catch (error) {
    console.log('psql non disponible, utilisation de l\'API REST...');
    return executeSQLViaSupabase();
  }
}

// Lancer le script
console.log('=================================');
console.log('🔧 CRÉATION AUTOMATIQUE DES TABLES');
console.log('=================================\n');

executeSQLDirectly().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});