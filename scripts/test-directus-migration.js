#!/usr/bin/env node

/**
 * Script de test automatique pour la migration Directus
 * Vérifie que toutes les API Directus fonctionnent correctement
 */

const { createDirectus, rest, authentication, readItems, createItem, updateItem, deleteItem } = require('@directus/sdk');

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@guide-lyon.fr';
const ADMIN_PASSWORD = 'AdminPassword123!';

class DirectusMigrationTester {
  constructor() {
    this.client = createDirectus(DIRECTUS_URL).with(rest()).with(authentication());
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: '📝',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Test: ${testName}...`);
      await testFunction();
      this.testResults.passed++;
      this.log(`${testName} - RÉUSSI`, 'success');
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ test: testName, error: error.message });
      this.log(`${testName} - ÉCHOUÉ: ${error.message}`, 'error');
    }
  }

  async testAuthentication() {
    await this.client.login({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    this.log('Authentification réussie', 'success');
  }

  async testCollectionsExist() {
    const collections = await this.client.request(readItems('directus_collections'));
    const requiredCollections = ['professional_users', 'establishments', 'establishment_photos', 'events'];
    
    for (const collectionName of requiredCollections) {
      const exists = collections.some(c => c.collection === collectionName);
      if (!exists) {
        throw new Error(`Collection ${collectionName} n'existe pas`);
      }
    }
    
    this.log(`Toutes les collections requises existent (${requiredCollections.length})`, 'success');
  }

  async testProfessionalUserCRUD() {
    // CREATE
    const testUser = await this.client.request(createItem('professional_users', {
      first_name: 'Test',
      last_name: 'User',
      email: `test-${Date.now()}@example.com`,
      status: 'active'
    }));

    // READ
    const users = await this.client.request(readItems('professional_users', {
      filter: { id: { _eq: testUser.id } }
    }));
    
    if (users.length === 0) {
      throw new Error('Utilisateur créé non trouvé');
    }

    // UPDATE
    await this.client.request(updateItem('professional_users', testUser.id, {
      company_name: 'Test Company'
    }));

    // DELETE
    await this.client.request(deleteItem('professional_users', testUser.id));

    this.log('CRUD Professional Users fonctionnel', 'success');
  }

  async testEstablishmentCRUD() {
    // D'abord créer un utilisateur test
    const testUser = await this.client.request(createItem('professional_users', {
      first_name: 'Test',
      last_name: 'Owner',
      email: `owner-${Date.now()}@example.com`,
      status: 'active'
    }));

    // CREATE establishment
    const testEstablishment = await this.client.request(createItem('establishments', {
      name: 'Restaurant Test',
      slug: `restaurant-test-${Date.now()}`,
      address: '123 Test Street',
      postal_code: '69000',
      city: 'Lyon',
      category: 'restaurant',
      professional_user_id: testUser.id,
      status: 'published'
    }));

    // READ
    const establishments = await this.client.request(readItems('establishments', {
      filter: { id: { _eq: testEstablishment.id } }
    }));
    
    if (establishments.length === 0) {
      throw new Error('Établissement créé non trouvé');
    }

    // UPDATE
    await this.client.request(updateItem('establishments', testEstablishment.id, {
      description: 'Restaurant de test mis à jour'
    }));

    // DELETE
    await this.client.request(deleteItem('establishments', testEstablishment.id));
    await this.client.request(deleteItem('professional_users', testUser.id));

    this.log('CRUD Establishments fonctionnel', 'success');
  }

  async testRelationships() {
    // Créer un utilisateur et un établissement liés
    const testUser = await this.client.request(createItem('professional_users', {
      first_name: 'Relation',
      last_name: 'Test',
      email: `relation-${Date.now()}@example.com`,
      status: 'active'
    }));

    const testEstablishment = await this.client.request(createItem('establishments', {
      name: 'Restaurant Relations',
      slug: `restaurant-relations-${Date.now()}`,
      address: '456 Relation Street',
      postal_code: '69000',
      city: 'Lyon',
      category: 'restaurant',
      professional_user_id: testUser.id,
      status: 'published'
    }));

    // Vérifier la relation
    const establishmentWithUser = await this.client.request(readItems('establishments', {
      filter: { id: { _eq: testEstablishment.id } },
      fields: ['*', 'professional_user_id.first_name', 'professional_user_id.last_name']
    }));

    if (!establishmentWithUser[0].professional_user_id) {
      throw new Error('Relation establishment -> professional_user non fonctionnelle');
    }

    // Cleanup
    await this.client.request(deleteItem('establishments', testEstablishment.id));
    await this.client.request(deleteItem('professional_users', testUser.id));

    this.log('Relations entre collections fonctionnelles', 'success');
  }

  async testAPIPerformance() {
    const startTime = Date.now();
    
    // Test simple lecture
    await this.client.request(readItems('professional_users', { limit: 10 }));
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (responseTime > 5000) { // 5 secondes
      throw new Error(`API trop lente: ${responseTime}ms`);
    }
    
    this.log(`Performance API: ${responseTime}ms`, 'success');
  }

  async runAllTests() {
    this.log('🚀 DÉMARRAGE DES TESTS DE MIGRATION DIRECTUS', 'info');
    this.log(`Testing Directus instance: ${DIRECTUS_URL}`, 'info');

    try {
      await this.runTest('Authentification Admin', () => this.testAuthentication());
      await this.runTest('Vérification Collections', () => this.testCollectionsExist());
      await this.runTest('CRUD Professional Users', () => this.testProfessionalUserCRUD());
      await this.runTest('CRUD Establishments', () => this.testEstablishmentCRUD());
      await this.runTest('Relations entre Collections', () => this.testRelationships());
      await this.runTest('Performance API', () => this.testAPIPerformance());

      // Résultats
      this.log('\n📊 RÉSULTATS DES TESTS:', 'info');
      this.log(`✅ Tests réussis: ${this.testResults.passed}`, 'success');
      this.log(`❌ Tests échoués: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'error' : 'success');

      if (this.testResults.failed > 0) {
        this.log('\n🔍 DÉTAIL DES ERREURS:', 'error');
        this.testResults.errors.forEach(({ test, error }) => {
          this.log(`  • ${test}: ${error}`, 'error');
        });
      }

      if (this.testResults.failed === 0) {
        this.log('\n🎉 MIGRATION DIRECTUS TESTÉE AVEC SUCCÈS !', 'success');
        this.log('✅ Toutes les fonctionnalités sont opérationnelles', 'success');
        this.log('✅ Le frontend peut maintenant utiliser Directus', 'success');
      } else {
        this.log('\n⚠️ TESTS PARTIELLEMENT ÉCHOUÉS', 'warning');
        this.log('Vérifiez les erreurs ci-dessus avant de continuer', 'warning');
      }

    } catch (error) {
      this.log(`Erreur fatale durant les tests: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Exécution des tests
const tester = new DirectusMigrationTester();
tester.runAllTests();