#!/usr/bin/env node

/**
 * 🚀 INITIALISATION AUTOMATIQUE DIRECTUS PRODUCTION
 * Configure les collections et données de test pour Guide de Lyon
 */

const { createDirectus, rest, authentication, createItem, createCollection, updateCollection, createField, createUser, createRole, updateRole } = require('@directus/sdk');

const DIRECTUS_URL = 'https://guide-lyon-cms.directus.app';
const ADMIN_EMAIL = 'raphael.nuziere@gmail.com';
const ADMIN_PASSWORD = 'Azerty25!';

class DirectusInitializer {
  constructor() {
    this.client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());
    this.token = null;
  }

  async init() {
    console.log('🚀 INITIALISATION DIRECTUS PRODUCTION');
    console.log(`📍 URL: ${DIRECTUS_URL}`);
    console.log('');

    try {
      // 1. Connexion admin
      await this.login();
      
      // 2. Créer les collections
      await this.createCollections();
      
      // 3. Configurer les permissions
      await this.setupPermissions();
      
      // 4. Créer les utilisateurs de test
      await this.createTestUsers();
      
      // 5. Créer les établissements de test
      await this.createTestEstablishments();
      
      console.log('');
      console.log('🎉 DIRECTUS CONFIGURÉ AVEC SUCCÈS !');
      console.log('');
      console.log('📋 COMPTES DE TEST :');
      console.log('👤 PRO    : pro@test.com / ProTest123!');
      console.log('⭐ EXPERT : expert@test.com / ExpertTest123!');
      console.log('');
      console.log('🔗 Admin  : https://guide-lyon-cms.directus.app/admin');
      console.log('🌐 Test   : https://www.guide-de-lyon.fr/auth/pro/connexion');
      
    } catch (error) {
      console.error('❌ Erreur:', error.message);
      if (error.errors) {
        console.error('Détails:', error.errors);
      }
      process.exit(1);
    }
  }

  async login() {
    console.log('🔐 Connexion admin...');
    try {
      const result = await this.client.login(ADMIN_EMAIL, ADMIN_PASSWORD, {
        mode: 'json'
      });
      console.log('✅ Connecté comme admin');
      return result;
    } catch (error) {
      // Essai avec l'API REST directe
      try {
        const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Connecté via API REST');
          this.token = data.data.access_token;
          return data;
        } else {
          const errorData = await response.json();
          throw new Error(`API REST échouée: ${errorData.errors?.[0]?.message || response.statusText}`);
        }
      } catch (restError) {
        throw new Error(`Connexion admin échouée: ${error.message} / REST: ${restError.message}`);
      }
    }
  }

  async createCollections() {
    console.log('📊 Création des collections...');
    
    // Collection users
    try {
      await this.client.request(createCollection({
        collection: 'users',
        meta: {
          accountability: 'all',
          collection: 'users',
          group: null,
          hidden: false,
          icon: 'person',
          item_duplication_fields: null,
          note: 'Utilisateurs professionnels',
          singleton: false,
          translations: null
        },
        schema: {
          name: 'users'
        }
      }));
      console.log('  ✅ Collection "users" créée');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('  ℹ️ Collection "users" existe déjà');
      } else {
        throw error;
      }
    }

    // Champs pour users
    const userFields = [
      { field: 'id', type: 'uuid', meta: { interface: 'input', primary_key: true } },
      { field: 'email', type: 'string', meta: { interface: 'input', required: true, unique: true } },
      { field: 'password', type: 'hash', meta: { interface: 'input-hash', hidden: true } },
      { field: 'role', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Pro', value: 'pro' }, { text: 'Expert', value: 'expert' }] } } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true } }
    ];

    for (const field of userFields) {
      try {
        await this.client.request(createField('users', field));
        console.log(`  ✅ Champ "users.${field.field}" créé`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️ Champ "users.${field.field}" existe déjà`);
        } else {
          console.log(`  ⚠️ Erreur champ ${field.field}:`, error.message);
        }
      }
    }

    // Collection establishments
    try {
      await this.client.request(createCollection({
        collection: 'establishments',
        meta: {
          accountability: 'all',
          collection: 'establishments',
          group: null,
          hidden: false,
          icon: 'business',
          item_duplication_fields: null,
          note: 'Établissements professionnels',
          singleton: false,
          translations: null
        },
        schema: {
          name: 'establishments'
        }
      }));
      console.log('  ✅ Collection "establishments" créée');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('  ℹ️ Collection "establishments" existe déjà');
      } else {
        throw error;
      }
    }

    // Champs pour establishments
    const establishmentFields = [
      { field: 'id', type: 'uuid', meta: { interface: 'input', primary_key: true } },
      { field: 'user_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', related_collection: 'users' } },
      { field: 'name', type: 'string', meta: { interface: 'input', required: true } },
      { field: 'slug', type: 'string', meta: { interface: 'input', unique: true } },
      { field: 'plan', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Pro', value: 'pro' }, { text: 'Expert', value: 'expert' }] } } },
      { field: 'email', type: 'string', meta: { interface: 'input' } },
      { field: 'address', type: 'string', meta: { interface: 'input' } },
      { field: 'city', type: 'string', meta: { interface: 'input' } },
      { field: 'postal_code', type: 'string', meta: { interface: 'input' } },
      { field: 'phone', type: 'string', meta: { interface: 'input' } },
      { field: 'website', type: 'string', meta: { interface: 'input' } },
      { field: 'description', type: 'text', meta: { interface: 'input-multiline' } },
      { field: 'category', type: 'string', meta: { interface: 'select-dropdown' } },
      { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true } },
      { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true } }
    ];

    for (const field of establishmentFields) {
      try {
        await this.client.request(createField('establishments', field));
        console.log(`  ✅ Champ "establishments.${field.field}" créé`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️ Champ "establishments.${field.field}" existe déjà`);
        } else {
          console.log(`  ⚠️ Erreur champ ${field.field}:`, error.message);
        }
      }
    }
  }

  async setupPermissions() {
    console.log('🔐 Configuration des permissions...');
    
    try {
      // Créer un rôle "Public" pour l'API
      await this.client.request(createRole({
        id: 'public-api',
        name: 'Public API',
        icon: 'public',
        description: 'Accès API public pour l\'application'
      }));
      console.log('  ✅ Rôle "Public API" créé');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('  ℹ️ Rôle "Public API" existe déjà');
      } else {
        console.log('  ⚠️ Erreur rôle:', error.message);
      }
    }

    // Note: Les permissions détaillées nécessitent l'API Directus avancée
    console.log('  ℹ️ Configuration manuelle des permissions requise dans l\'admin');
  }

  async createTestUsers() {
    console.log('👥 Création des utilisateurs de test...');
    
    const testUsers = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'pro@test.com',
        password: 'ProTest123!',
        role: 'pro'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'expert@test.com',
        password: 'ExpertTest123!',
        role: 'expert'
      }
    ];

    for (const user of testUsers) {
      try {
        await this.client.request(createItem('users', {
          ...user,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        console.log(`  ✅ Utilisateur ${user.email} créé`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('unique')) {
          console.log(`  ℹ️ Utilisateur ${user.email} existe déjà`);
        } else {
          console.log(`  ⚠️ Erreur utilisateur ${user.email}:`, error.message);
        }
      }
    }
  }

  async createTestEstablishments() {
    console.log('🏢 Création des établissements de test...');
    
    const testEstablishments = [
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Restaurant Le Gourmet Pro',
        slug: 'restaurant-le-gourmet-pro',
        plan: 'pro',
        email: 'pro@test.com',
        address: '25 Rue de la République',
        city: 'Lyon',
        postal_code: '69001',
        phone: '0478567890',
        website: 'https://restaurant-le-gourmet-pro.fr',
        description: 'Établissement Professionnel avec avantages Pro. Présence renforcée sur le Guide de Lyon.',
        category: 'restaurants'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Spa Luxe Expert',
        slug: 'spa-luxe-expert',
        plan: 'expert',
        email: 'expert@test.com',
        address: '10 Place Bellecour',
        city: 'Lyon',
        postal_code: '69002',
        phone: '0478901234',
        website: 'https://spa-luxe-expert.fr',
        description: 'Établissement Premium avec tous les avantages Expert. Visibilité maximale sur le Guide de Lyon.',
        category: 'beaute-bienetre'
      }
    ];

    for (const establishment of testEstablishments) {
      try {
        await this.client.request(createItem('establishments', {
          ...establishment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        console.log(`  ✅ Établissement "${establishment.name}" créé`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('unique')) {
          console.log(`  ℹ️ Établissement "${establishment.name}" existe déjà`);
        } else {
          console.log(`  ⚠️ Erreur établissement ${establishment.name}:`, error.message);
        }
      }
    }
  }
}

// Exécution
const initializer = new DirectusInitializer();
initializer.init();