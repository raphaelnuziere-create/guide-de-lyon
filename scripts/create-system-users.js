#!/usr/bin/env node

const DIRECTUS_URL = 'https://guide-lyon-cms.directus.app';

async function createSystemUsers() {
  console.log('👥 CRÉATION DES UTILISATEURS SYSTÈME DIRECTUS');
  console.log(`📍 URL: ${DIRECTUS_URL}`);
  console.log('');

  try {
    // 1. Connexion admin
    const loginResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'raphael.nuziere@gmail.com',
        password: 'Azerty25!'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Connexion admin échouée');
      return;
    }
    
    const { data } = await loginResponse.json();
    const token = data.access_token;
    console.log('✅ Connecté comme admin');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. D'abord créer un rôle pour les utilisateurs pro si nécessaire
    console.log('🛡️  Création du rôle professional...');
    
    let professionalRoleId = null;
    
    try {
      const createRoleResponse = await fetch(`${DIRECTUS_URL}/roles`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Professional',
          icon: 'business',
          description: 'Rôle pour les professionnels',
          admin_access: false,
          app_access: true
        })
      });
      
      if (createRoleResponse.ok) {
        const roleData = await createRoleResponse.json();
        professionalRoleId = roleData.data.id;
        console.log('✅ Rôle Professional créé:', professionalRoleId);
      } else {
        // Le rôle existe peut-être déjà
        const rolesResponse = await fetch(`${DIRECTUS_URL}/roles`, { headers });
        const rolesData = await rolesResponse.json();
        const existingRole = rolesData.data.find(role => role.name === 'Professional');
        if (existingRole) {
          professionalRoleId = existingRole.id;
          console.log('✅ Rôle Professional existant trouvé:', professionalRoleId);
        }
      }
    } catch (error) {
      console.log('⚠️  Erreur création rôle:', error.message);
    }

    // 3. Créer les utilisateurs système
    const testUsers = [
      {
        email: 'pro@test.com',
        password: 'ProTest123!',
        first_name: 'Test',
        last_name: 'Pro',
        role: professionalRoleId,
        status: 'active'
      },
      {
        email: 'expert@test.com',
        password: 'ExpertTest123!',
        first_name: 'Test',
        last_name: 'Expert',
        role: professionalRoleId,
        status: 'active'
      }
    ];

    console.log('');
    console.log('👤 Création des utilisateurs système:');
    
    for (const user of testUsers) {
      try {
        console.log(`\n  🔧 Création de ${user.email}...`);
        
        const createUserResponse = await fetch(`${DIRECTUS_URL}/users`, {
          method: 'POST',
          headers,
          body: JSON.stringify(user)
        });
        
        if (createUserResponse.ok) {
          const userData = await createUserResponse.json();
          console.log(`    ✅ Utilisateur créé: ${userData.data.id}`);
          
          // Associer à un établissement dans notre collection personnalisée
          const establishmentData = {
            user_id: userData.data.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.email.includes('expert') ? 'expert' : 'pro'
          };
          
          try {
            const createEstablishmentUserResponse = await fetch(`${DIRECTUS_URL}/items/users`, {
              method: 'POST',
              headers,
              body: JSON.stringify(establishmentData)
            });
            
            if (createEstablishmentUserResponse.ok) {
              console.log(`    ✅ Lien établissement créé`);
            }
          } catch (error) {
            console.log(`    ⚠️  Erreur lien établissement: ${error.message}`);
          }
          
        } else {
          const errorData = await createUserResponse.json();
          console.log(`    ❌ Erreur création: ${errorData.errors?.[0]?.message || 'Erreur inconnue'}`);
          
          // Si l'utilisateur existe déjà, essayer de le mettre à jour
          if (errorData.errors?.[0]?.message?.includes('already exists')) {
            console.log(`    🔄 Tentative de mise à jour...`);
            
            // Trouver l'ID de l'utilisateur existant
            const usersResponse = await fetch(`${DIRECTUS_URL}/users?filter[email][_eq]=${user.email}`, { headers });
            const usersData = await usersResponse.json();
            
            if (usersData.data && usersData.data.length > 0) {
              const existingUserId = usersData.data[0].id;
              
              const updateUserResponse = await fetch(`${DIRECTUS_URL}/users/${existingUserId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                  password: user.password,
                  status: 'active',
                  role: professionalRoleId
                })
              });
              
              if (updateUserResponse.ok) {
                console.log(`    ✅ Utilisateur existant mis à jour`);
              }
            }
          }
        }
        
      } catch (error) {
        console.log(`    ❌ Erreur: ${error.message}`);
      }
    }

    // 4. Test final
    console.log('');
    console.log('🔐 Test de connexion final:');
    
    for (const user of testUsers) {
      try {
        const testResponse = await fetch(`${DIRECTUS_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            password: user.password
          })
        });
        
        if (testResponse.ok) {
          console.log(`  ✅ ${user.email} - Connexion OK`);
        } else {
          const errorData = await testResponse.json();
          console.log(`  ❌ ${user.email} - Échec: ${errorData.errors?.[0]?.message}`);
        }
      } catch (error) {
        console.log(`  ❌ ${user.email} - Erreur: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

createSystemUsers();