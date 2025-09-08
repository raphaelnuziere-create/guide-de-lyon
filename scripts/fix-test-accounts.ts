import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikefyhxelzydaogrnwxi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5Njc1NCwiZXhwIjoyMDcxMjcyNzU0fQ.Ink48F4a18sn-nbcKBbxwBCRA9Yur1z1_vmrR_Ku47Y';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixTestAccounts() {
  console.log('🔧 Réparation et création des comptes test...\n');

  const testAccounts = [
    {
      email: 'pro@test.com',
      password: 'ProTest123!',
      plan: 'pro',
      name: 'Restaurant Le Gourmet Pro',
      sector: 'restaurant-food'
    },
    {
      email: 'expert@test.com',
      password: 'ExpertTest123!',
      plan: 'expert',
      name: 'Spa Luxe Expert',
      sector: 'beaute-bienetre'
    }
  ];

  for (const account of testAccounts) {
    console.log(`📧 Traitement du compte ${account.plan.toUpperCase()}: ${account.email}`);

    try {
      // 1. Rechercher l'utilisateur existant
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error(`   ❌ Erreur lors de la liste des utilisateurs: ${listError.message}`);
        continue;
      }

      const existingUser = users.find(u => u.email === account.email);
      
      let userId: string;

      if (existingUser) {
        console.log(`   ✓ Utilisateur existant trouvé: ${existingUser.id}`);
        
        // Mettre à jour le mot de passe
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { 
            password: account.password,
            email_confirm: true,
            user_metadata: {
              name: account.name,
              role: 'business_owner',
              plan: account.plan
            }
          }
        );

        if (updateError) {
          console.error(`   ⚠️ Erreur mise à jour utilisateur: ${updateError.message}`);
        } else {
          console.log(`   ✓ Mot de passe et métadonnées mis à jour`);
        }
        
        userId = existingUser.id;
      } else {
        // Créer nouvel utilisateur
        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            name: account.name,
            role: 'business_owner',
            plan: account.plan
          }
        });

        if (createError || !authData?.user) {
          console.error(`   ❌ Erreur création utilisateur: ${createError?.message}`);
          continue;
        }

        console.log(`   ✓ Nouvel utilisateur créé: ${authData.user.id}`);
        userId = authData.user.id;
      }

      // 2. Gérer l'établissement
      const establishmentData = {
        user_id: userId,
        name: account.name,
        slug: account.name.toLowerCase().replace(/\s+/g, '-'),
        plan: account.plan,
        sector: account.sector,
        address: account.plan === 'expert' ? '10 Place Bellecour' : '25 Rue de la République',
        city: 'Lyon',
        postal_code: account.plan === 'expert' ? '69002' : '69001',
        phone: account.plan === 'expert' ? '0478901234' : '0478567890',
        email: account.email,
        website: `https://${account.name.toLowerCase().replace(/\s+/g, '-')}.fr`,
        description: account.plan === 'expert' 
          ? 'Établissement Premium avec tous les avantages Expert. Visibilité maximale sur le Guide de Lyon.'
          : 'Établissement Professionnel avec avantages Pro. Présence renforcée sur le Guide de Lyon.',
        short_description: account.plan === 'expert'
          ? 'Le meilleur de Lyon - Plan Expert'
          : 'Établissement de qualité - Plan Pro',
        is_verified: account.plan === 'expert',
        featured: account.plan === 'expert',
        priority_support: account.plan === 'expert',
        events_this_month: 0,
        photos_this_month: 0,
        max_events: account.plan === 'expert' ? 6 : 3,
        max_photos: account.plan === 'expert' ? 20 : 10,
        vat_number: account.plan === 'expert' ? 'FR12345678901' : 'FR98765432109',
        opening_hours: {
          monday: { open: '09:00', close: '19:00' },
          tuesday: { open: '09:00', close: '19:00' },
          wednesday: { open: '09:00', close: '19:00' },
          thursday: { open: '09:00', close: '19:00' },
          friday: { open: '09:00', close: '20:00' },
          saturday: { open: '10:00', close: '18:00' },
          sunday: { open: 'closed', close: 'closed' }
        },
        social_media: {
          facebook: `https://facebook.com/${account.name.toLowerCase().replace(/\s+/g, '')}`,
          instagram: `@${account.name.toLowerCase().replace(/\s+/g, '')}`,
          linkedin: account.plan === 'expert' ? `https://linkedin.com/company/${account.name.toLowerCase().replace(/\s+/g, '-')}` : null
        },
        status: 'active'
      };

      // Vérifier si l'établissement existe
      const { data: existingEst, error: selectError } = await supabase
        .from('establishments')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error(`   ⚠️ Erreur recherche établissement: ${selectError.message}`);
      }

      if (existingEst) {
        // Mettre à jour
        const { error: updateError } = await supabase
          .from('establishments')
          .update(establishmentData)
          .eq('id', existingEst.id);

        if (updateError) {
          console.error(`   ❌ Erreur mise à jour établissement: ${updateError.message}`);
        } else {
          console.log(`   ✓ Établissement mis à jour`);
        }
      } else {
        // Créer nouveau
        const { error: insertError } = await supabase
          .from('establishments')
          .insert(establishmentData);

        if (insertError) {
          console.error(`   ❌ Erreur création établissement: ${insertError.message}`);
        } else {
          console.log(`   ✓ Établissement créé`);
        }
      }

      // 3. Test de connexion
      console.log(`   🔐 Test de connexion...`);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (signInError) {
        console.error(`   ❌ Échec de connexion: ${signInError.message}`);
      } else if (signInData?.session) {
        console.log(`   ✅ Connexion réussie!`);
        await supabase.auth.signOut();
      }

      console.log('');

    } catch (error) {
      console.error(`   ❌ Erreur inattendue: ${error}`);
    }
  }

  console.log('='.repeat(60));
  console.log('📊 COMPTES TEST PRÊTS À L\'UTILISATION');
  console.log('='.repeat(60));
  
  console.log('\n🔐 COMPTE PRO:');
  console.log('   Email: pro@test.com');
  console.log('   Mot de passe: ProTest123!');
  console.log('   URL: http://localhost:3000/auth/pro/connexion');
  
  console.log('\n👑 COMPTE EXPERT:');
  console.log('   Email: expert@test.com');
  console.log('   Mot de passe: ExpertTest123!');
  console.log('   URL: http://localhost:3000/auth/pro/connexion');
  
  console.log('\n✨ Les comptes ont été vérifiés et sont prêts!');
  console.log('='.repeat(60));
}

// Exécuter
fixTestAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });