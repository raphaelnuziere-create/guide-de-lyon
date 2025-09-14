#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 DÉPLOIEMENT AUTOMATIQUE - GUIDE LYON V3');
console.log('==========================================');

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
  info: (msg) => console.log(`${colors.blue}🔍 ${msg}${colors.reset}`)
};

async function deploy() {
  try {
    // 1. Vérifier que nous sommes dans le bon projet
    if (!fs.existsSync('package.json')) {
      throw new Error('package.json non trouvé - êtes-vous dans le bon dossier?');
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.name !== 'guide-lyon-v2') {
      log.warning('Nom du projet différent de guide-lyon-v2');
    }

    log.info('Démarrage du déploiement Guide Lyon v3...');

    // 2. Nettoyer et installer les dépendances
    log.info('Étape 1: Installation des dépendances...');
    execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
    execSync('npm install', { stdio: 'inherit' });
    log.success('Dépendances installées');

    // 3. Lancer les tests automatiques
    log.info('Étape 2: Tests du système...');
    try {
      execSync('node scripts/test-system.js', { stdio: 'inherit' });
      log.success('Tests réussis');
    } catch (error) {
      log.error('Tests échoués - vérifiez test-report-failure.json');
      throw new Error('Tests failed - deployment aborted');
    }

    // 4. Build de production
    log.info('Étape 3: Build de production...');
    execSync('npm run build', { stdio: 'inherit' });
    log.success('Build réussi');

    // 5. Vérifier les variables d'environnement pour Vercel
    log.info('Étape 4: Vérification de la configuration...');
    
    const requiredVars = {
      'NEXT_PUBLIC_DIRECTUS_URL': process.env.NEXT_PUBLIC_DIRECTUS_URL,
      'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY?.substr(0, 10) + '...',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substr(0, 10) + '...'
    };

    console.log('Variables détectées:');
    Object.entries(requiredVars).forEach(([key, value]) => {
      if (value) {
        log.success(`${key}: ${value}`);
      } else {
        log.warning(`${key}: NON DÉFINIE`);
      }
    });

    // 6. Déployer sur Vercel
    log.info('Étape 5: Déploiement sur Vercel...');
    
    try {
      // Vérifier si vercel CLI est installé
      execSync('which vercel', { stdio: 'pipe' });
    } catch (error) {
      log.warning('Vercel CLI non installé - installation...');
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }

    // Déployer en production
    execSync('vercel --prod --yes', { stdio: 'inherit' });
    log.success('Déploiement Vercel terminé!');

    // 7. Instructions post-déploiement
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DÉPLOIEMENT RÉUSSI!');
    console.log('='.repeat(50));
    
    log.success('Guide Lyon v3 est maintenant en production!');
    
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. 🌐 Vérifier: https://www.guide-de-lyon.fr');
    console.log('2. 🧪 Tester: https://www.guide-de-lyon.fr/annuaire-v3');
    console.log('3. 💰 Tester: https://www.guide-de-lyon.fr/tarifs');
    console.log('4. 👨‍💼 Admin: https://www.guide-de-lyon.fr/admin-v3');
    console.log('5. 🔗 Configurer webhooks Stripe:');
    console.log('   https://dashboard.stripe.com/webhooks');
    console.log('   URL: https://www.guide-de-lyon.fr/api/stripe/webhook');
    
    console.log('\n🔧 CONFIGURATION STRIPE:');
    console.log('   - Événements à écouter: checkout.session.completed');
    console.log('   - customer.subscription.created/updated/deleted');
    console.log('   - invoice.payment_succeeded/failed');

    // Générer rapport de déploiement
    const deploymentReport = {
      timestamp: new Date().toISOString(),
      version: '3.0.0',
      platform: 'Vercel',
      database: 'Directus Cloud',
      payment: 'Stripe',
      status: 'SUCCESS',
      urls: {
        production: 'https://www.guide-de-lyon.fr',
        annuaire: 'https://www.guide-de-lyon.fr/annuaire-v3',
        pricing: 'https://www.guide-de-lyon.fr/tarifs',
        admin: 'https://www.guide-de-lyon.fr/admin-v3'
      },
      features: [
        'Plans tarifaires: Basic (0€), Pro (19€), Expert (49€)',
        'Directus Cloud avec hooks automatiques',
        'Affichage prioritaire Expert > Pro > Basic',
        'Badges professionnels avec couleurs',
        'Webhooks Stripe intégrés',
        'Dashboard admin complet'
      ]
    };

    fs.writeFileSync('deployment-report.json', JSON.stringify(deploymentReport, null, 2));
    log.info('Rapport de déploiement: deployment-report.json');

  } catch (error) {
    log.error('Erreur durant le déploiement:');
    console.error(error.message);
    
    const errorReport = {
      timestamp: new Date().toISOString(),
      status: 'FAILED',
      error: error.message,
      recommendations: [
        'Vérifier les variables d\'environnement',
        'Relancer npm install',
        'Vérifier la connexion Vercel',
        'Consulter les logs: vercel logs'
      ]
    };
    
    fs.writeFileSync('deployment-error.json', JSON.stringify(errorReport, null, 2));
    process.exit(1);
  }
}

// Lancer le déploiement
deploy();