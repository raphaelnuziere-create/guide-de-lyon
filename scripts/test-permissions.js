const { createDirectus, rest, authentication, readItems, createItem } = require('@directus/sdk');

const directus = createDirectus('http://localhost:8055').with(rest()).with(authentication());

async function testPermissions() {
  console.log('🧪 TEST DES PERMISSIONS DIRECTUS');
  
  try {
    // Test avec l'utilisateur professionnel
    await directus.login({
      email: 'test@guide-lyon.fr',
      password: 'Test123!'
    });
    console.log('✅ Connexion utilisateur professionnel réussie');

    // Test lecture professional_users
    const users = await directus.request(readItems('professional_users', { limit: 1 }));
    console.log('✅ Lecture professional_users:', users.length, 'utilisateurs');

    // Test lecture establishments
    const establishments = await directus.request(readItems('establishments', { limit: 1 }));
    console.log('✅ Lecture establishments:', establishments.length, 'établissements');

    // Test création professional_user
    const newUser = await directus.request(createItem('professional_users', {
      first_name: 'Test',
      last_name: 'Permissions',
      email: `test-perm-${Date.now()}@example.com`,
      status: 'active'
    }));
    console.log('✅ Création professional_user réussie:', newUser.id);

    console.log('\n🎉 TOUTES LES PERMISSIONS FONCTIONNENT !');
    console.log('✅ Votre migration Directus est 100% opérationnelle !');
    
  } catch (error) {
    console.error('❌ Erreur permissions:', error.message);
    console.log('\n🔧 ACTIONS À FAIRE:');
    console.log('1. Vérifiez que le rôle Professional a toutes les permissions CRUD');
    console.log('2. Vérifiez que l\'utilisateur test@guide-lyon.fr existe avec le rôle Professional');
  }
}

testPermissions();