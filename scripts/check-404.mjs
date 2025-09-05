#!/usr/bin/env node
/**
 * Script pour vérifier les anciennes URLs et détecter les 404
 * Utilise les données de la base pour tester les redirections
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration
const SITE_URL = 'https://www.guide-de-lyon.fr';
const SUPABASE_URL = 'https://ikefyhxelzydaogrnwxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTY3NTQsImV4cCI6MjA3MTI3Mjc1NH0.vJHDlWKUK0xUoXB_CCxNkVNnWhb7Wpq-mA097blKmzc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function checkUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      timeout: 5000
    });
    
    return {
      status: response.status,
      location: response.headers.get('location')
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message
    };
  }
}

async function check404s() {
  console.log('🔍 Vérification des anciennes URLs et détection des 404\n');
  console.log('========================================================\n');
  
  try {
    // Récupérer toutes les anciennes URLs
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('old_url, slug, title')
      .not('old_url', 'is', null)
      .not('old_url', 'eq', '')
      .limit(50); // Limiter pour les tests

    if (error) {
      console.error('❌ Erreur Supabase:', error.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('⚠️ Aucune ancienne URL trouvée');
      return;
    }

    console.log(`📋 ${posts.length} URLs à vérifier\n`);
    console.log('Statut | Ancienne URL → Nouvelle URL');
    console.log('-------|--------------------------------\n');

    let stats = {
      ok: 0,
      redirected: 0,
      notFound: 0,
      error: 0
    };

    // Extraire les patterns uniques
    const patterns = new Set();
    
    for (const post of posts) {
      let oldUrl = post.old_url;
      
      // Construire l'URL complète si nécessaire
      if (!oldUrl.startsWith('http')) {
        // Si c'est juste un path
        if (!oldUrl.startsWith('/')) {
          oldUrl = '/' + oldUrl;
        }
        oldUrl = SITE_URL + oldUrl;
      }
      
      // Extraire le pattern
      const urlPath = new URL(oldUrl).pathname;
      const match = urlPath.match(/^\/([^\/]+)\//);
      if (match) {
        patterns.add(match[1]);
      }
      
      // Tester l'URL
      const result = await checkUrl(oldUrl);
      const newUrl = `/blog/${post.slug}`;
      
      let status = '';
      let statusColor = colors.reset;
      
      if (result.status === 301 || result.status === 302 || result.status === 308) {
        status = '✅ 301';
        statusColor = colors.green;
        stats.redirected++;
        
        // Vérifier si la redirection est correcte
        if (result.location && !result.location.includes(post.slug)) {
          status = '⚠️ 301?';
          statusColor = colors.yellow;
        }
      } else if (result.status === 200) {
        status = '✅ 200';
        statusColor = colors.green;
        stats.ok++;
      } else if (result.status === 404) {
        status = '❌ 404';
        statusColor = colors.red;
        stats.notFound++;
      } else if (result.status === 0) {
        status = '❌ ERR';
        statusColor = colors.red;
        stats.error++;
      } else {
        status = `⚠️ ${result.status}`;
        statusColor = colors.yellow;
      }
      
      // Afficher le résultat
      const shortOldUrl = urlPath.length > 40 ? '...' + urlPath.slice(-37) : urlPath;
      console.log(`${statusColor}${status}${colors.reset} | ${shortOldUrl} → ${newUrl}`);
      
      // Si 404, afficher plus de détails
      if (result.status === 404) {
        console.log(`       ${colors.yellow}Titre: "${post.title}"${colors.reset}`);
      }
      
      // Pause pour éviter de surcharger le serveur
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Afficher les statistiques
    console.log('\n========================================================');
    console.log('📊 STATISTIQUES');
    console.log('========================================================\n');
    
    console.log(`${colors.green}✅ Redirections OK:${colors.reset} ${stats.redirected}`);
    console.log(`${colors.green}✅ Pages OK:${colors.reset} ${stats.ok}`);
    console.log(`${colors.red}❌ 404 (à corriger):${colors.reset} ${stats.notFound}`);
    console.log(`${colors.red}❌ Erreurs:${colors.reset} ${stats.error}`);
    
    // Afficher les patterns détectés
    console.log('\n📁 Catégories d\'URL détectées:');
    console.log('--------------------------------');
    Array.from(patterns).sort().forEach(pattern => {
      console.log(`   /${pattern}/`);
    });
    
    // Recommandations
    if (stats.notFound > 0) {
      console.log('\n${colors.yellow}⚠️ ACTIONS REQUISES:${colors.reset}');
      console.log('--------------------------------');
      console.log('1. Exécutez: node scripts/generate-redirects.mjs');
      console.log('2. Committez les fichiers générés');
      console.log('3. Déployez sur Vercel');
      console.log('4. Les redirections seront actives après le déploiement\n');
    } else if (stats.redirected === posts.length) {
      console.log(`\n${colors.green}🎉 Parfait ! Toutes les redirections fonctionnent !${colors.reset}\n`);
    }
    
    // Créer un rapport détaillé des 404
    if (stats.notFound > 0) {
      console.log('📝 Création du rapport des 404...');
      
      const report404 = [];
      for (const post of posts) {
        let oldUrl = post.old_url;
        if (!oldUrl.startsWith('http')) {
          if (!oldUrl.startsWith('/')) oldUrl = '/' + oldUrl;
          oldUrl = SITE_URL + oldUrl;
        }
        
        const result = await checkUrl(oldUrl);
        if (result.status === 404) {
          report404.push({
            old_url: new URL(oldUrl).pathname,
            new_slug: post.slug,
            title: post.title
          });
        }
      }
      
      // Créer un fichier SQL pour corriger
      const sqlFix = `-- Script pour corriger les 404
-- Exécutez dans Supabase SQL Editor

${report404.map(item => `
-- ${item.title}
UPDATE blog_posts 
SET old_url = '${item.old_url}'
WHERE slug = '${item.new_slug}';`).join('\n')}

-- Vérification
SELECT slug, old_url, title 
FROM blog_posts 
WHERE slug IN (${report404.map(item => `'${item.new_slug}'`).join(', ')});`;

      require('fs').writeFileSync('fix-404.sql', sqlFix);
      console.log('✅ Fichier créé: fix-404.sql\n');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Message d'info
console.log('⚠️  Ce script va tester les redirections sur le site en production.');
console.log('   Assurez-vous que le site est déployé avec les dernières modifications.\n');

// Lancer la vérification
check404s();