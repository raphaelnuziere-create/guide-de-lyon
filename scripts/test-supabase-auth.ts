import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ikefyhxelzydaogrnwxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTY3NTQsImV4cCI6MjA3MTI3Mjc1NH0.vJHDlWKUK0xUoXB_CCxNkVNnWhb7Wpq-mA097blKmzc';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5Njc1NCwiZXhwIjoyMDcxMjcyNzU0fQ.Ink48F4a18sn-nbcKBbxwBCRA9Yur1z1_vmrR_Ku47Y';

async function testSupabaseAuth() {
  console.log('🔍 Test de connexion Supabase...\n');
  
  // Test avec la clé anonyme
  console.log('1️⃣ Test avec clé anonyme:');
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data: anonData, error: anonError } = await supabaseAnon.auth.signInWithPassword({
      email: 'pro@test.com',
      password: 'ProTest123!'
    });
    
    if (anonError) {
      console.log(`   ❌ Erreur avec clé anon: ${anonError.message}`);
    } else if (anonData?.session) {
      console.log(`   ✅ Connexion réussie avec clé anon!`);
      console.log(`   User ID: ${anonData.user?.id}`);
      console.log(`   Email: ${anonData.user?.email}`);
      await supabaseAnon.auth.signOut();
    }
  } catch (error) {
    console.log(`   ❌ Exception: ${error}`);
  }

  console.log('\n2️⃣ Test avec clé service (admin):');
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Lister les utilisateurs
  try {
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.log(`   ❌ Erreur liste utilisateurs: ${listError.message}`);
    } else {
      console.log(`   ✅ ${users.length} utilisateurs trouvés`);
      
      const testUsers = users.filter(u => u.email === 'pro@test.com' || u.email === 'expert@test.com');
      
      if (testUsers.length > 0) {
        console.log('\n   📋 Comptes test existants:');
        for (const user of testUsers) {
          console.log(`      - ${user.email} (ID: ${user.id})`);
          console.log(`        Créé: ${new Date(user.created_at).toLocaleString()}`);
          console.log(`        Confirmé: ${user.email_confirmed_at ? '✓' : '✗'}`);
          console.log(`        Métadonnées: ${JSON.stringify(user.user_metadata)}`);
        }
      } else {
        console.log('   ⚠️ Aucun compte test trouvé');
      }
    }
  } catch (error) {
    console.log(`   ❌ Exception: ${error}`);
  }

  // Tenter de créer/mettre à jour les comptes
  console.log('\n3️⃣ Création/Mise à jour des comptes test:');
  
  const accounts = [
    { email: 'pro@test.com', password: 'ProTest123!', plan: 'pro' },
    { email: 'expert@test.com', password: 'ExpertTest123!', plan: 'expert' }
  ];

  for (const account of accounts) {
    console.log(`\n   📧 ${account.email}:`);
    
    try {
      // Chercher l'utilisateur existant
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users.find(u => u.email === account.email);
      
      if (existingUser) {
        // Mettre à jour le mot de passe
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          {
            password: account.password,
            email_confirm: true
          }
        );
        
        if (updateError) {
          console.log(`      ❌ Erreur mise à jour: ${updateError.message}`);
        } else {
          console.log(`      ✅ Mot de passe mis à jour`);
        }
      } else {
        // Créer nouvel utilisateur
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            plan: account.plan,
            role: 'business_owner'
          }
        });
        
        if (createError) {
          console.log(`      ❌ Erreur création: ${createError.message}`);
        } else {
          console.log(`      ✅ Utilisateur créé avec ID: ${createData.user?.id}`);
        }
      }
      
      // Test de connexion
      const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });
      
      if (signInError) {
        console.log(`      ⚠️ Test connexion échoué: ${signInError.message}`);
      } else if (signInData?.session) {
        console.log(`      ✅ Test connexion réussi!`);
        await supabaseAnon.auth.signOut();
      }
      
    } catch (error) {
      console.log(`      ❌ Exception: ${error}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  console.log('\nPour se connecter:');
  console.log('URL: http://localhost:3000/auth/pro/connexion');
  console.log('\n🔐 Compte PRO:');
  console.log('   Email: pro@test.com');
  console.log('   Mot de passe: ProTest123!');
  console.log('\n👑 Compte EXPERT:');
  console.log('   Email: expert@test.com');
  console.log('   Mot de passe: ExpertTest123!');
}

testSupabaseAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });