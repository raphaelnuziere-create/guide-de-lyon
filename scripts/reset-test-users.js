#!/usr/bin/env node

/**
 * Script pour recréer complètement les utilisateurs de test
 * avec des mots de passe simples et vérifiables
 */

const { createDirectus, rest, authentication, readItems, createItem, updateItem, deleteItem } = require('@directus/sdk');

const DIRECTUS_URL = 'https://guide-lyon-cms.directus.app';
const ADMIN_EMAIL = 'admin@guide-lyon.fr';
const ADMIN_PASSWORD = 'AdminPassword123!';

// Utilisateurs de test avec mots de passe simples
const TEST_USERS = [
  {
    email: 'pro@test.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'Pro',
    status: 'active'
  },
  {
    email: 'expert@test.com', 
    password: 'password123',
    first_name: 'Test',
    last_name: 'Expert',
    status: 'active'
  }
];

async function main() {
  console.log('🔄 RESET COMPLET DES UTILISATEURS DE TEST');
  console.log('📍 URL:', DIRECTUS_URL);
  console.log('');

  const client = createDirectus(DIRECTUS_URL)
    .with(rest())
    .with(authentication());

  try {
    // 1. Connexion admin
    console.log('🔐 Connexion admin...');
    await client.login({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    console.log('✅ Admin connecté');

    // 2. Supprimer les anciens utilisateurs test s'ils existent
    console.log('');
    console.log('🗑️  Suppression des anciens utilisateurs...');
    
    try {
      const existingUsers = await client.request(readItems('directus_users', {
        filter: {
          email: {
            _in: ['pro@test.com', 'expert@test.com']
          }
        }
      }));

      for (const user of existingUsers) {
        try {
          await client.request(deleteItem('directus_users', user.id));
          console.log(`  ✅ Supprimé: ${user.email}`);
        } catch (error) {
          console.log(`  ⚠️  Erreur suppression ${user.email}:`, error.message);
        }
      }
    } catch (error) {
      console.log('  ⚠️  Erreur lors de la suppression:', error.message);
    }

    // 3. Récupérer ou créer le rôle Professional
    console.log('');
    console.log('🛡️  Configuration du rôle...');
    
    let professionalRole;
    try {
      const roles = await client.request(readItems('directus_roles', {
        filter: { name: { _eq: 'Professional' } }
      }));
      
      if (roles.length > 0) {
        professionalRole = roles[0];
        console.log('  ✅ Rôle Professional trouvé:', professionalRole.id);
      } else {
        // Créer le rôle
        professionalRole = await client.request(createItem('directus_roles', {
          name: 'Professional',
          description: 'Rôle pour les professionnels de l\'application',
          app_access: false,
          admin_access: false
        }));
        console.log('  ✅ Rôle Professional créé:', professionalRole.id);
      }
    } catch (error) {
      console.error('  ❌ Erreur avec le rôle:', error.message);
      return;
    }

    // 4. Créer les nouveaux utilisateurs
    console.log('');
    console.log('👤 Création des nouveaux utilisateurs...');
    
    for (const userData of TEST_USERS) {
      try {
        const newUser = await client.request(createItem('directus_users', {
          ...userData,
          role: professionalRole.id
        }));
        
        console.log(`  ✅ Créé: ${userData.email} (ID: ${newUser.id})`);
        
        // Test de connexion immédiat
        const testClient = createDirectus(DIRECTUS_URL)
          .with(rest())
          .with(authentication());
          
        try {
          await testClient.login({
            email: userData.email,
            password: userData.password
          });
          console.log(`    ✅ Test connexion: OK`);
          await testClient.logout();
        } catch (error) {
          console.log(`    ❌ Test connexion: FAILED (${error.message})`);
        }
        
      } catch (error) {
        console.log(`  ❌ Erreur création ${userData.email}:`, error.message);
      }
    }

    console.log('');
    console.log('🎯 UTILISATEURS DE TEST RECRÉÉS');
    console.log('');
    console.log('📋 Identifiants pour les tests:');
    TEST_USERS.forEach(user => {
      console.log(`  • ${user.email} / ${user.password}`);
    });
    console.log('');
    console.log('🌐 Page de connexion: https://www.guide-de-lyon.fr/auth/pro/connexion');

  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

main().catch(console.error);