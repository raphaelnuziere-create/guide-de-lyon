#!/usr/bin/env node
/**
 * Script pour générer automatiquement les redirections depuis la base de données
 * Crée un fichier de redirections basé sur les old_url
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration Supabase
const SUPABASE_URL = 'https://ikefyhxelzydaogrnwxi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTY3NTQsImV4cCI6MjA3MTI3Mjc1NH0.vJHDlWKUK0xUoXB_CCxNkVNnWhb7Wpq-mA097blKmzc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateRedirects() {
  console.log('🔍 Génération des redirections SEO depuis la base de données\n');
  console.log('================================================\n');

  try {
    // Récupérer tous les articles avec old_url
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('old_url, slug, title')
      .not('old_url', 'is', null)
      .not('old_url', 'eq', '');

    if (error) {
      console.error('❌ Erreur Supabase:', error.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('⚠️ Aucun article avec old_url trouvé');
      return;
    }

    console.log(`📚 ${posts.length} redirections à créer\n`);

    // Créer la map des redirections
    const redirects = {};
    const categoryPatterns = new Map();
    
    // Analyser chaque URL
    posts.forEach(post => {
      const oldUrl = post.old_url;
      const newUrl = `/blog/${post.slug}`;
      
      // Nettoyer l'ancienne URL
      let cleanOldUrl = oldUrl;
      if (cleanOldUrl.startsWith('http')) {
        cleanOldUrl = new URL(oldUrl).pathname;
      }
      
      // Ajouter la redirection exacte
      redirects[cleanOldUrl] = newUrl;
      
      // Extraire le pattern de catégorie
      const categoryMatch = cleanOldUrl.match(/^\/([^\/]+)\//);
      if (categoryMatch) {
        const category = categoryMatch[1];
        if (!categoryPatterns.has(category)) {
          categoryPatterns.set(category, []);
        }
        categoryPatterns.get(category).push({
          old: cleanOldUrl,
          new: newUrl,
          title: post.title
        });
      }
    });

    // Générer le fichier de redirections Next.js
    const nextConfigRedirects = `/**
 * Redirections SEO générées automatiquement depuis la base de données
 * Généré le: ${new Date().toISOString()}
 * Total: ${Object.keys(redirects).length} redirections
 */

export const dbRedirects = ${JSON.stringify(redirects, null, 2)};

// Catégories détectées
export const categoryPatterns = {
${Array.from(categoryPatterns.entries()).map(([category, urls]) => 
  `  '${category}': ${urls.length} // URLs`
).join(',\n')}
};

// Fonction pour obtenir la redirection depuis l'ancienne URL
export function getDbRedirect(oldUrl) {
  // Nettoyer l'URL
  let cleanUrl = oldUrl;
  if (cleanUrl.startsWith('http')) {
    try {
      cleanUrl = new URL(oldUrl).pathname;
    } catch (e) {
      // URL invalide
    }
  }
  
  // Recherche exacte
  if (dbRedirects[cleanUrl]) {
    return dbRedirects[cleanUrl];
  }
  
  // Recherche avec .html
  if (!cleanUrl.endsWith('.html') && dbRedirects[cleanUrl + '.html']) {
    return dbRedirects[cleanUrl + '.html'];
  }
  
  // Recherche sans .html
  if (cleanUrl.endsWith('.html') && dbRedirects[cleanUrl.replace('.html', '')]) {
    return dbRedirects[cleanUrl.replace('.html', '')];
  }
  
  return null;
}
`;

    // Écrire le fichier
    const outputPath = path.join(process.cwd(), 'app', 'seo', 'db-redirects.ts');
    fs.writeFileSync(outputPath, nextConfigRedirects);
    
    console.log(`✅ Fichier créé: app/seo/db-redirects.ts`);
    console.log(`   ${Object.keys(redirects).length} redirections exportées\n`);

    // Afficher les statistiques par catégorie
    console.log('📊 Statistiques par catégorie:\n');
    console.log('--------------------------------');
    
    const categories = {};
    posts.forEach(post => {
      const match = post.old_url.match(/\/([^\/]+)\//);
      if (match) {
        const cat = match[1];
        categories[cat] = (categories[cat] || 0) + 1;
      }
    });
    
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} articles`);
      });

    // Créer aussi un fichier de redirections pour Vercel
    const vercelRedirects = posts.map(post => {
      let oldUrl = post.old_url;
      if (oldUrl.startsWith('http')) {
        oldUrl = new URL(oldUrl).pathname;
      }
      return {
        source: oldUrl,
        destination: `/blog/${post.slug}`,
        permanent: true
      };
    });

    // Ajouter les patterns de catégories
    const categoryRedirects = [
      { source: '/monuments-lyon/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/restaurants-lyon/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/hotels-lyon/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/bars-lyon/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/musees-lyon/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/parcs-lyon/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/shopping-lyon/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/culture-lyon/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/visite-lyon/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/tourisme-lyon/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/evenements-lyon/:slug*', destination: '/evenements/:slug*', permanent: true },
    ];

    const vercelConfig = {
      redirects: [...categoryRedirects, ...vercelRedirects]
    };

    // Écrire vercel.json
    const vercelPath = path.join(process.cwd(), 'vercel.json');
    fs.writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
    
    console.log(`\n✅ Fichier créé: vercel.json`);
    console.log(`   ${vercelConfig.redirects.length} redirections Vercel\n`);

    // Créer un fichier CSV pour analyse
    const csvContent = 'Ancienne URL,Nouvelle URL,Titre\n' +
      posts.map(post => {
        let oldUrl = post.old_url;
        if (oldUrl.startsWith('http')) {
          oldUrl = new URL(oldUrl).pathname;
        }
        return `"${oldUrl}","/blog/${post.slug}","${post.title.replace(/"/g, '""')}"`;
      }).join('\n');

    fs.writeFileSync('redirections-seo.csv', csvContent);
    console.log('✅ Fichier créé: redirections-seo.csv');
    console.log('   Pour analyse dans Excel/Google Sheets\n');

    console.log('================================================');
    console.log('🎉 Génération terminée avec succès !');
    console.log('================================================\n');
    
    console.log('📋 Prochaines étapes:');
    console.log('1. Déployer sur Vercel pour activer les redirections');
    console.log('2. Tester quelques anciennes URLs');
    console.log('3. Vérifier dans Google Search Console\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

generateRedirects();