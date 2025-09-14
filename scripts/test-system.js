#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 TESTS AUTOMATISÉS - GUIDE LYON V3');
console.log('===================================');

// Couleurs pour les messages
const colors = {
  red: '\033[0;31m',
  green: '\033[0;32m',
  yellow: '\033[1;33m',
  blue: '\033[0;34m',
  reset: '\033[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

async function runTests() {
  const testResults = {
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: Vérifier les dépendances
  log.info('Test 1: Vérification des dépendances...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Vérifier que Directus est installé
    if (packageJson.dependencies['@directus/sdk']) {
      log.success('Directus SDK installé');
      testResults.passed++;
    } else {
      log.error('Directus SDK manquant');
      testResults.failed++;
    }

    // Vérifier que Supabase n'est plus là
    if (!packageJson.dependencies['@supabase/supabase-js']) {
      log.success('Supabase supprimé');
      testResults.passed++;
    } else {
      log.warning('Supabase encore présent');
      testResults.failed++;
    }

    // Vérifier Stripe
    if (packageJson.dependencies['stripe']) {
      log.success('Stripe configuré');
      testResults.passed++;
    } else {
      log.error('Stripe manquant');
      testResults.failed++;
    }

  } catch (error) {
    log.error('Impossible de lire package.json');
    testResults.failed++;
  }

  // Test 2: Vérifier les fichiers essentiels
  log.info('Test 2: Vérification des fichiers...');
  const requiredFiles = [
    'lib/directus-unified.ts',
    'components/ui/badge.tsx',
    'components/ui/button.tsx',
    'app/tarifs/page.tsx',
    'app/annuaire-v3/page.tsx',
    'app/admin-v3/page.tsx',
    'app/api/stripe/webhook/route.ts',
    'app/api/stripe/create-checkout-session/route.ts'
  ];

  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      log.success(`${file} existe`);
      testResults.passed++;
    } else {
      log.error(`${file} manquant`);
      testResults.failed++;
    }
  }

  // Test 3: Vérifier les variables d'environnement
  log.info('Test 3: Vérification des variables d\'environnement...');
  const requiredEnvVars = [
    'NEXT_PUBLIC_DIRECTUS_URL',
    'DIRECTUS_ADMIN_EMAIL',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      log.success(`${envVar} définie`);
      testResults.passed++;
    } else {
      log.warning(`${envVar} manquante`);
      testResults.failed++;
    }
  }

  // Test 4: Essayer de build le projet
  log.info('Test 4: Build du projet...');
  try {
    const buildProcess = spawn('npm', ['run', 'build'], { 
      stdio: 'pipe',
      shell: true
    });

    let buildOutput = '';
    buildProcess.stdout.on('data', (data) => {
      buildOutput += data.toString();
    });

    buildProcess.stderr.on('data', (data) => {
      buildOutput += data.toString();
    });

    await new Promise((resolve) => {
      buildProcess.on('close', (code) => {
        if (code === 0) {
          log.success('Build réussi');
          testResults.passed++;
        } else {
          log.error('Build échoué');
          testResults.failed++;
          testResults.details.push('Build failed with code: ' + code);
        }
        resolve(code);
      });
    });

  } catch (error) {
    log.error('Impossible de lancer le build');
    testResults.failed++;
  }

  // Test 5: Vérifier la syntaxe TypeScript
  log.info('Test 5: Vérification TypeScript...');
  try {
    const tscProcess = spawn('npx', ['tsc', '--noEmit'], { 
      stdio: 'pipe',
      shell: true
    });

    await new Promise((resolve) => {
      tscProcess.on('close', (code) => {
        if (code === 0) {
          log.success('TypeScript OK');
          testResults.passed++;
        } else {
          log.warning('Problèmes TypeScript détectés');
          testResults.failed++;
        }
        resolve(code);
      });
    });

  } catch (error) {
    log.error('Impossible de vérifier TypeScript');
    testResults.failed++;
  }

  // Résultats finaux
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSULTATS DES TESTS');
  console.log('='.repeat(50));
  
  if (testResults.failed === 0) {
    log.success(`Tous les tests passés! (${testResults.passed}/${testResults.passed + testResults.failed})`);
    log.success('🚀 Votre projet est prêt pour le déploiement!');
    
    // Générer le rapport de succès
    const successReport = {
      date: new Date().toISOString(),
      tests_passed: testResults.passed,
      tests_failed: testResults.failed,
      status: 'SUCCESS',
      ready_for_deployment: true,
      next_steps: [
        'npm run dev  # Tester localement',
        'vercel --prod  # Déployer en production',
        'Configurer les webhooks Stripe',
        'Tester les paiements'
      ]
    };
    
    fs.writeFileSync('test-report-success.json', JSON.stringify(successReport, null, 2));
    log.info('Rapport généré: test-report-success.json');
    
  } else {
    log.error(`${testResults.failed} tests échoués, ${testResults.passed} réussis`);
    log.warning('Corrigez les erreurs avant le déploiement');
    
    const failureReport = {
      date: new Date().toISOString(),
      tests_passed: testResults.passed,
      tests_failed: testResults.failed,
      status: 'FAILED',
      details: testResults.details,
      recommendations: [
        'Vérifier les variables d\'environnement',
        'Installer les dépendances manquantes: npm install',
        'Corriger les erreurs TypeScript',
        'Relancer les tests: npm run test:system'
      ]
    };
    
    fs.writeFileSync('test-report-failure.json', JSON.stringify(failureReport, null, 2));
    log.info('Rapport d\'erreur généré: test-report-failure.json');
  }

  return testResults.failed === 0;
}

// Lancer les tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Erreur durant les tests:', error);
    process.exit(1);
  });