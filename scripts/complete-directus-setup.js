#!/usr/bin/env node

const DIRECTUS_URL = 'https://guide-lyon-cms.directus.app';

async function completeSetup() {
  console.log('🚀 FINALISATION DIRECTUS AUTOMATIQUE');
  
  // Récupération du token
  let token = null;
  try {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'raphael.nuziere@gmail.com',
        password: 'Azerty25!'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      token = data.data.access_token;
      console.log('✅ Connecté');
    }
  } catch (error) {
    console.log('❌ Connexion échouée');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Ajout des champs manquants à la collection users
  console.log('📝 Ajout des champs manquants...');
  
  const userFields = [
    {
      field: 'email',
      type: 'string',
      meta: { interface: 'input', required: true, unique: true }
    },
    {
      field: 'password', 
      type: 'hash',
      meta: { interface: 'input-hash', hidden: true }
    },
    {
      field: 'role',
      type: 'string', 
      meta: { 
        interface: 'select-dropdown',
        options: { choices: [{ text: 'Pro', value: 'pro' }, { text: 'Expert', value: 'expert' }] }
      }
    }
  ];

  for (const field of userFields) {
    try {
      const response = await fetch(`${DIRECTUS_URL}/fields/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(field)
      });
      
      if (response.ok) {
        console.log(`✅ Champ users.${field.field} ajouté`);
      } else {
        const error = await response.json();
        if (error.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
          console.log(`ℹ️ Champ users.${field.field} existe déjà`);
        } else {
          console.log(`⚠️ Erreur users.${field.field}:`, error.errors?.[0]?.message);
        }
      }
    } catch (error) {
      console.log(`⚠️ Erreur ${field.field}:`, error.message);
    }
  }

  // Création collection establishments
  console.log('🏢 Création collection establishments...');
  try {
    const response = await fetch(`${DIRECTUS_URL}/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        collection: 'establishments',
        meta: {
          icon: 'business',
          note: 'Établissements professionnels'
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ Collection establishments créée');
    } else {
      const error = await response.json();
      if (error.errors?.[0]?.message?.includes('already exists')) {
        console.log('ℹ️ Collection establishments existe déjà');
      }
    }
  } catch (error) {
    console.log('⚠️ Erreur establishments:', error.message);
  }

  // Ajout des champs establishments
  const establishmentFields = [
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
    { field: 'category', type: 'string', meta: { interface: 'input' } }
  ];

  for (const field of establishmentFields) {
    try {
      const response = await fetch(`${DIRECTUS_URL}/fields/establishments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(field)
      });
      
      if (response.ok) {
        console.log(`✅ Champ establishments.${field.field} ajouté`);
      } else {
        const error = await response.json();
        if (error.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
          console.log(`ℹ️ Champ establishments.${field.field} existe déjà`);
        } else {
          console.log(`⚠️ Erreur establishments.${field.field}:`, error.errors?.[0]?.message);
        }
      }
    } catch (error) {
      console.log(`⚠️ Erreur ${field.field}:`, error.message);
    }
  }

  // Création des utilisateurs de test
  console.log('👥 Création des utilisateurs de test...');
  const testUsers = [
    {
      email: 'pro@test.com',
      password: 'ProTest123!',
      role: 'pro'
    },
    {
      email: 'expert@test.com', 
      password: 'ExpertTest123!',
      role: 'expert'
    }
  ];

  for (const user of testUsers) {
    try {
      const response = await fetch(`${DIRECTUS_URL}/items/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(user)
      });
      
      if (response.ok) {
        console.log(`✅ Utilisateur ${user.email} créé`);
      } else {
        const error = await response.json();
        console.log(`ℹ️ Utilisateur ${user.email}:`, error.errors?.[0]?.message);
      }
    } catch (error) {
      console.log(`⚠️ Erreur ${user.email}:`, error.message);
    }
  }

  console.log('');
  console.log('🎉 CONFIGURATION TERMINÉE !');
  console.log('');
  console.log('🌐 Teste maintenant sur: https://www.guide-de-lyon.fr/auth/pro/connexion');
  console.log('👤 PRO: pro@test.com / ProTest123!');
  console.log('⭐ EXPERT: expert@test.com / ExpertTest123!');
}

completeSetup();