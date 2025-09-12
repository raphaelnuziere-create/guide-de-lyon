#!/usr/bin/env node

/**
 * Script pour créer automatiquement les utilisateurs test dans Directus
 * Usage: node scripts/create-directus-test-users.js
 */

const { DirectusApi } = require('@directus/sdk');

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';

async function createTestUsers() {
  console.log('🚀 Création des utilisateurs test Directus...');
  
  const directus = new DirectusApi(DIRECTUS_URL);
  
  try {
    // 1. Login admin (à adapter selon vos credentials admin)
    console.log('📝 Connexion admin...');
    await directus.auth.login({
      email: 'admin@admin.com', // À adapter
      password: 'admin' // À adapter
    });
    
    // 2. Créer le rôle "Professional User" s'il n'existe pas
    console.log('🔧 Création du rôle Professional User...');
    
    let professionalRole;
    try {
      professionalRole = await directus.request(
        createRole({
          name: 'Professional User',
          description: 'Utilisateurs professionnels du Guide de Lyon',
          icon: 'business',
          admin_access: false,
          app_access: true
        })
      );
      console.log('✅ Rôle créé:', professionalRole.id);
    } catch (error) {
      if (error.message.includes('already exists') || error.status === 409) {
        console.log('ℹ️ Le rôle existe déjà, récupération...');
        const roles = await directus.request(readRoles({
          filter: { name: { _eq: 'Professional User' } }
        }));
        professionalRole = roles[0];
      } else {
        throw error;
      }
    }
    
    // 3. Créer les utilisateurs test
    const testUsers = [
      {
        email: 'pro@test.com',
        password: 'ProTest123!',
        first_name: 'Test',
        last_name: 'Pro',
        role: professionalRole.id,
        status: 'active'
      },
      {
        email: 'expert@test.com', 
        password: 'ExpertTest123!',
        first_name: 'Test',
        last_name: 'Expert',
        role: professionalRole.id,
        status: 'active'
      }
    ];
    
    console.log('👤 Création des utilisateurs...');
    
    for (const user of testUsers) {
      try {
        const createdUser = await directus.request(
          createUser(user)
        );
        console.log(`✅ Utilisateur créé: ${user.email} (ID: ${createdUser.id})`);
      } catch (error) {
        if (error.message.includes('already exists') || error.status === 409) {
          console.log(`ℹ️ L'utilisateur ${user.email} existe déjà`);
        } else {
          console.error(`❌ Erreur création ${user.email}:`, error.message);
        }
      }
    }
    
    // 4. Créer les collections si nécessaire
    console.log('📚 Vérification des collections...');
    
    const collections = ['professional_users', 'establishments', 'events'];
    
    for (const collectionName of collections) {
      try {
        await directus.request(readCollection(collectionName));
        console.log(`✅ Collection ${collectionName} existe`);
      } catch (error) {
        console.log(`📝 Création de la collection ${collectionName}...`);
        
        let schema = {};
        if (collectionName === 'professional_users') {
          schema = {
            collection: collectionName,
            schema: {
              name: collectionName
            },
            meta: {
              collection: collectionName,
              note: 'Utilisateurs professionnels du Guide de Lyon'
            }
          };
        } else if (collectionName === 'establishments') {
          schema = {
            collection: collectionName,
            schema: {
              name: collectionName
            },
            meta: {
              collection: collectionName,
              note: 'Établissements du Guide de Lyon'
            }
          };
        } else if (collectionName === 'events') {
          schema = {
            collection: collectionName,
            schema: {
              name: collectionName
            },
            meta: {
              collection: collectionName,
              note: 'Événements des établissements'
            }
          };
        }
        
        try {
          await directus.request(createCollection(schema));
          console.log(`✅ Collection ${collectionName} créée`);
        } catch (createError) {
          console.log(`⚠️ Collection ${collectionName}: ${createError.message}`);
        }
      }
    }
    
    console.log('🎉 Configuration Directus terminée !');
    console.log('\n📋 RÉSUMÉ:');
    console.log('🔗 Admin Directus: http://localhost:8055/admin');
    console.log('👤 Comptes test créés:');
    console.log('   • PRO: pro@test.com / ProTest123!');
    console.log('   • EXPERT: expert@test.com / ExpertTest123!');
    console.log('\n🚀 Vous pouvez maintenant vous connecter sur: http://localhost:3000/auth/pro/connexion');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n🔧 Actions manuelles:');
    console.log('1. Connectez-vous à http://localhost:8055/admin');
    console.log('2. Créez les utilisateurs manuellement');
    console.log('3. Utilisez les credentials ci-dessus');
  }
}

// Fonctions helpers pour Directus SDK
function createRole(data) {
  return {
    path: '/roles',
    method: 'POST',
    body: JSON.stringify(data)
  };
}

function readRoles(query = {}) {
  return {
    path: '/roles',
    method: 'GET',
    params: query
  };
}

function createUser(data) {
  return {
    path: '/users',
    method: 'POST', 
    body: JSON.stringify(data)
  };
}

function readCollection(collection) {
  return {
    path: `/collections/${collection}`,
    method: 'GET'
  };
}

function createCollection(data) {
  return {
    path: '/collections',
    method: 'POST',
    body: JSON.stringify(data)
  };
}

// Exécuter le script
if (require.main === module) {
  createTestUsers().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createTestUsers };