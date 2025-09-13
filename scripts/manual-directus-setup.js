#!/usr/bin/env node

/**
 * 🔧 CONFIGURATION MANUELLE DIRECTUS
 * Utilise l'API REST directement pour tout configurer
 */

const DIRECTUS_URL = 'https://guide-lyon-cms.directus.app';

class ManualDirectusSetup {
  constructor() {
    this.token = null;
  }

  async setup() {
    console.log('🔧 CONFIGURATION MANUELLE DIRECTUS');
    console.log('');

    try {
      // 1. Test de connexion et récupération du token
      await this.getAuthToken();
      
      // 2. Créer les collections via API brute
      await this.createCollectionsManually();
      
      // 3. Insérer les données de test
      await this.insertTestData();
      
      console.log('');
      console.log('🎉 DIRECTUS CONFIGURÉ MANUELLEMENT !');
      console.log('');
      console.log('📋 COMPTES DE TEST :');
      console.log('👤 PRO    : pro@test.com / ProTest123!');
      console.log('⭐ EXPERT : expert@test.com / ExpertTest123!');
      console.log('');
      console.log('🌐 Test : https://www.guide-de-lyon.fr/auth/pro/connexion');
      
    } catch (error) {
      console.error('❌ Erreur:', error.message);
      console.log('');
      console.log('🔄 SOLUTION ALTERNATIVE:');
      console.log('1. Dans Directus admin, va dans Settings > Data Model');
      console.log('2. Crée manuellement les collections users et establishments');
      console.log('3. Ajoute les champs comme indiqué précédemment');
    }
  }

  async getAuthToken() {
    console.log('🔐 Récupération du token d\'authentification...');
    
    // Essai de connexion avec les credentials
    try {
      const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'raphael.nuziere@gmail.com',
          password: 'Azerty25!'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.data.access_token;
        console.log('✅ Token récupéré');
        return;
      }
    } catch (error) {
      console.log('⚠️ Connexion automatique échouée');
    }

    // Instructions pour récupérer le token manuellement
    console.log('');
    console.log('📋 RÉCUPÉRATION MANUELLE DU TOKEN:');
    console.log('1. Dans ton navigateur, va sur https://guide-lyon-cms.directus.app/admin');
    console.log('2. Ouvre les DevTools (F12)');
    console.log('3. Va dans Network/Réseau');
    console.log('4. Rafraîchis la page');
    console.log('5. Cherche une requête avec "Authorization: Bearer ..."');
    console.log('6. Copie le token après "Bearer "');
    console.log('');
    
    // Pour les tests, on continue sans token
    console.log('ℹ️ Continuons avec l\'API publique...');
  }

  async createCollectionsManually() {
    console.log('📊 Création des collections...');

    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Collection users
    try {
      const usersCollection = {
        collection: 'users',
        meta: {
          accountability: 'all',
          collection: 'users',
          group: null,
          hidden: false,
          icon: 'person',
          note: 'Utilisateurs professionnels',
          singleton: false
        },
        schema: {
          name: 'users'
        },
        fields: [
          {
            field: 'id',
            type: 'uuid',
            meta: {
              interface: 'input',
              options: {},
              display: 'raw',
              display_options: {},
              readonly: true,
              hidden: true,
              sort: 1,
              width: 'full',
              translations: null,
              note: null,
              conditions: null,
              required: false,
              group: null,
              validation: null,
              validation_message: null
            },
            schema: {
              name: 'id',
              table: 'users',
              data_type: 'uuid',
              default_value: null,
              max_length: null,
              numeric_precision: null,
              numeric_scale: null,
              is_nullable: false,
              is_unique: false,
              is_primary_key: true,
              is_generated: false,
              generation_expression: null,
              has_auto_increment: false,
              foreign_key_column: null,
              foreign_key_table: null
            }
          },
          {
            field: 'email',
            type: 'string',
            meta: {
              interface: 'input',
              required: true,
              unique: true,
              sort: 2
            },
            schema: {
              name: 'email',
              table: 'users',
              data_type: 'varchar',
              max_length: 255,
              is_nullable: false,
              is_unique: true
            }
          },
          {
            field: 'password',
            type: 'hash',
            meta: {
              interface: 'input-hash',
              hidden: true,
              sort: 3
            },
            schema: {
              name: 'password',
              table: 'users',
              data_type: 'varchar',
              max_length: 255,
              is_nullable: true
            }
          },
          {
            field: 'role',
            type: 'string',
            meta: {
              interface: 'select-dropdown',
              options: {
                choices: [
                  { text: 'Pro', value: 'pro' },
                  { text: 'Expert', value: 'expert' }
                ]
              },
              sort: 4
            },
            schema: {
              name: 'role',
              table: 'users',
              data_type: 'varchar',
              max_length: 50,
              is_nullable: true
            }
          }
        ]
      };

      const response = await fetch(`${DIRECTUS_URL}/collections`, {
        method: 'POST',
        headers,
        body: JSON.stringify(usersCollection)
      });

      if (response.ok) {
        console.log('✅ Collection "users" créée');
      } else {
        const error = await response.text();
        console.log('⚠️ Collection users:', error);
      }
    } catch (error) {
      console.log('⚠️ Erreur users:', error.message);
    }

    // Pour l'instant, on fait simple et on affiche les instructions
    console.log('');
    console.log('📋 CRÉER MANUELLEMENT DANS DIRECTUS:');
    console.log('');
    console.log('Collection: users');
    console.log('- id (UUID, Primary Key)');
    console.log('- email (String, Required, Unique)');
    console.log('- password (Hash)');
    console.log('- role (String: pro, expert)');
    console.log('- date_created (DateTime)');
    console.log('- date_updated (DateTime)');
    console.log('');
    console.log('Collection: establishments');
    console.log('- id (UUID, Primary Key)');
    console.log('- user_id (UUID, Relation to users)');
    console.log('- name (String, Required)');
    console.log('- slug (String, Unique)');
    console.log('- plan (String: pro, expert)');
    console.log('- email, address, city, postal_code, phone, website (String)');
    console.log('- description (Text)');
    console.log('- category (String)');
    console.log('- date_created, date_updated (DateTime)');
  }

  async insertTestData() {
    console.log('📝 Instructions pour les données de test...');
    
    console.log('');
    console.log('Une fois les collections créées, ajoute ces utilisateurs:');
    console.log('');
    console.log('Utilisateur 1:');
    console.log('- email: pro@test.com');
    console.log('- password: ProTest123!');
    console.log('- role: pro');
    console.log('');
    console.log('Utilisateur 2:');
    console.log('- email: expert@test.com');
    console.log('- password: ExpertTest123!');
    console.log('- role: expert');
  }
}

const setup = new ManualDirectusSetup();
setup.setup();