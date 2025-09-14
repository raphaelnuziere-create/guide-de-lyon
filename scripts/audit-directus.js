#!/usr/bin/env node

const { createDirectus, rest, authentication, readItems } = require('@directus/sdk');

// Configuration depuis .env
require('dotenv').config();

const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL)
  .with(rest())
  .with(authentication());

async function auditDirectus() {
  console.log('🔍 AUDIT DIRECTUS - GUIDE LYON V3');
  console.log('================================\n');
  
  try {
    // 1. Connexion avec les credentials admin
    console.log('📡 Connexion à Directus...');
    await directus.login({
      email: process.env.DIRECTUS_ADMIN_EMAIL, 
      password: process.env.DIRECTUS_ADMIN_PASSWORD
    });
    console.log('✅ Connexion réussie!\n');

    // 2. Lister toutes les collections
    console.log('📊 COLLECTIONS PRÉSENTES:');
    console.log('========================');
    
    const collections = await directus.request('/collections');
    const userCollections = collections.filter(col => 
      !col.collection.startsWith('directus_') && 
      !col.collection.startsWith('system_')
    );

    for (const collection of userCollections) {
      console.log(`\n🗂️  Collection: ${collection.collection}`);
      
      try {
        // Compter les éléments
        const items = await directus.request(readItems(collection.collection, {
          limit: 5,
          fields: ['*']
        }));
        
        console.log(`   📈 Nombre d'éléments: ${items.length} (sample)`);
        
        if (items.length > 0) {
          console.log(`   🔑 Champs détectés: ${Object.keys(items[0]).join(', ')}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur accès: ${error.message}`);
      }
    }

    // 3. Audit spécifique des tables importantes
    console.log('\n\n🎯 AUDIT DÉTAILLÉ DES TABLES CLÉS:');
    console.log('=================================');
    
    const keyTables = ['businesses', 'articles', 'events', 'users', 'blog_posts', 'companies'];
    
    for (const table of keyTables) {
      try {
        const items = await directus.request(readItems(table, {
          limit: 3,
          fields: ['*']
        }));
        
        console.log(`\n📋 ${table.toUpperCase()}:`);
        console.log(`   ✅ Existe - ${items.length} éléments (sample)`);
        
        if (items.length > 0) {
          console.log(`   🔍 Exemple de structure:`);
          const example = items[0];
          Object.keys(example).slice(0, 8).forEach(key => {
            const value = typeof example[key] === 'string' && example[key].length > 50 
              ? example[key].substring(0, 50) + '...' 
              : example[key];
            console.log(`     • ${key}: ${value}`);
          });
        }
        
      } catch (error) {
        console.log(`\n❌ ${table.toUpperCase()}: N'existe pas ou inaccessible`);
      }
    }

    // 4. Statistiques globales
    console.log('\n\n📊 STATISTIQUES GLOBALES:');
    console.log('========================');
    
    let totalItems = 0;
    const stats = {};
    
    for (const collection of userCollections) {
      try {
        const items = await directus.request(readItems(collection.collection, {
          aggregate: { count: '*' }
        }));
        const count = items[0]?.count || 0;
        stats[collection.collection] = count;
        totalItems += count;
      } catch (error) {
        stats[collection.collection] = 'Error';
      }
    }
    
    console.log(`📈 Total éléments tous collections: ${totalItems}`);
    console.log('\n📊 Répartition par collection:');
    Object.entries(stats).forEach(([name, count]) => {
      console.log(`   • ${name}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Erreur connexion Directus:', error.message);
    console.log('\n🔧 SOLUTIONS:');
    console.log('1. Vérifiez DIRECTUS_ADMIN_EMAIL et DIRECTUS_ADMIN_PASSWORD dans .env.local');
    console.log('2. Vérifiez que l\'URL Directus est correcte');
    console.log('3. Vérifiez les permissions utilisateur dans Directus');
  }
}

auditDirectus();