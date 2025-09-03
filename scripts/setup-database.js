#!/usr/bin/env node

/**
 * Script pour configurer la base de données Supabase
 * Usage: npm run setup:db
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.magenta}▶${colors.reset} ${msg}`)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function main() {
  console.log(`
${colors.blue}╔══════════════════════════════════════════════╗
║     Guide de Lyon - Setup Base de Données     ║
╚══════════════════════════════════════════════╝${colors.reset}
`)

  // Vérifier si .env.local existe
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    log.error('Fichier .env.local non trouvé!')
    log.info('Création depuis .env.local.example...')
    
    const examplePath = path.join(__dirname, '..', '.env.local.example')
    fs.copyFileSync(examplePath, envPath)
    
    log.warning('Veuillez remplir vos clés Supabase dans .env.local puis relancer ce script')
    process.exit(1)
  }

  // Charger les variables d'environnement
  require('dotenv').config({ path: envPath })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    log.error('Variables Supabase manquantes dans .env.local!')
    log.info('Nécessaire:')
    log.info('  - NEXT_PUBLIC_SUPABASE_URL')
    log.info('  - SUPABASE_SERVICE_ROLE_KEY')
    
    const openDashboard = await question('\nOuvrir le dashboard Supabase? (o/n) ')
    if (openDashboard.toLowerCase() === 'o') {
      const { exec } = require('child_process')
      exec('open https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/settings/api')
      log.info('Dashboard ouvert. Copiez les clés dans .env.local')
    }
    
    process.exit(1)
  }

  log.success('Variables d\'environnement chargées')
  log.info(`URL Supabase: ${supabaseUrl}`)

  // Créer le client Supabase avec la clé service (admin)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Demander confirmation
  console.log(`
${colors.yellow}⚠️  ATTENTION ⚠️${colors.reset}
Cette opération va créer/modifier les tables suivantes:
  - merchants (utilisateurs pro)
  - places (établissements)
  - events (événements)
  - reviews (avis)
  - merchant_plan_details (plans)
  - quotas_usage (quotas)
  - moderation_queue (modération)
  - email_logs (logs emails)
  - analytics_events (analytics)
`)

  const confirm = await question('Continuer? (o/n) ')
  if (confirm.toLowerCase() !== 'o') {
    log.info('Annulé')
    process.exit(0)
  }

  // Lire le fichier SQL
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql')
  const sqlContent = fs.readFileSync(sqlPath, 'utf8')

  log.step('Exécution de la migration SQL...')

  try {
    // Supabase n'a pas de méthode directe pour exécuter du SQL brut via le SDK
    // On doit utiliser l'API REST directement
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sqlContent })
    })

    if (!response.ok) {
      // Alternative: afficher les instructions manuelles
      log.warning('Impossible d\'exécuter le SQL automatiquement')
      log.info('Veuillez exécuter manuellement:')
      console.log(`
1. Ouvrir: ${colors.blue}https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/editor${colors.reset}
2. Copier le contenu de: ${colors.yellow}supabase/migrations/001_initial_schema.sql${colors.reset}
3. Coller dans l'éditeur SQL
4. Cliquer sur "Run"
`)
      
      const openEditor = await question('Ouvrir l\'éditeur SQL Supabase? (o/n) ')
      if (openEditor.toLowerCase() === 'o') {
        const { exec } = require('child_process')
        exec('open https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new')
        
        // Copier le SQL dans le presse-papier
        const { execSync } = require('child_process')
        execSync(`echo '${sqlContent.replace(/'/g, "'\\''")}' | pbcopy`)
        log.success('SQL copié dans le presse-papier!')
      }
    } else {
      log.success('Migration SQL exécutée avec succès!')
    }

  } catch (error) {
    log.error(`Erreur: ${error.message}`)
    log.info('Exécution manuelle recommandée (voir instructions ci-dessus)')
  }

  // Vérifier que les tables ont été créées
  log.step('Vérification des tables...')
  
  const tables = [
    'merchants',
    'places', 
    'events',
    'reviews',
    'merchant_plan_details',
    'quotas_usage',
    'moderation_queue'
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact' })
        .limit(1)
      
      if (error) {
        log.error(`❌ Table ${table} non trouvée`)
      } else {
        log.success(`✅ Table ${table} OK`)
      }
    } catch (e) {
      log.error(`❌ Table ${table}: ${e.message}`)
    }
  }

  console.log(`
${colors.green}╔══════════════════════════════════════════════╗
║            Setup Base de Données             ║
║                  TERMINÉ !                    ║
╚══════════════════════════════════════════════╝${colors.reset}

Prochaines étapes:
1. ${colors.yellow}npm run dev${colors.reset} - Lancer le serveur de développement
2. Créer un compte Stripe pour les paiements
3. Créer un compte Brevo pour les emails

Documentation: ${colors.blue}SECURITY_GUIDE.md${colors.reset}
`)

  rl.close()
}

main().catch(console.error)