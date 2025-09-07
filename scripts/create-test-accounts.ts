// Script pour créer des comptes de test Pro et Expert
// Usage: npx tsx scripts/create-test-accounts.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestAccounts() {
  console.log('🚀 Création des comptes de test Pro et Expert...\n');

  // 1. Créer les utilisateurs via Auth
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

  const createdEstablishments = [];

  for (const account of testAccounts) {
    console.log(`📧 Création du compte ${account.plan.toUpperCase()}: ${account.email}`);

    try {
      // 1. Créer l'utilisateur Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true, // Auto-confirmer l'email
        user_metadata: {
          name: account.name,
          role: 'business_owner',
          plan: account.plan
        }
      });

      if (authError) {
        console.log(`   ⚠️ Utilisateur peut-être déjà existant: ${authError.message}`);
        
        // Récupérer l'utilisateur existant
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === account.email);
        
        if (existingUser) {
          console.log(`   ✓ Utilisation de l'utilisateur existant`);
          
          // 2. Créer ou mettre à jour l'établissement
          const establishmentData = {
            user_id: existingUser.id,
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
            
            // Données spécifiques au plan
            is_verified: account.plan === 'expert',
            featured: account.plan === 'expert',
            priority_support: account.plan === 'expert',
            
            // Quotas
            events_this_month: 0,
            photos_this_month: 0,
            max_events: account.plan === 'expert' ? 6 : 3,
            max_photos: account.plan === 'expert' ? 20 : 10,
            
            // TVA pour les plans payants
            vat_number: account.plan === 'expert' ? 'FR12345678901' : 'FR98765432109',
            
            // Horaires
            opening_hours: {
              monday: { open: '09:00', close: '19:00' },
              tuesday: { open: '09:00', close: '19:00' },
              wednesday: { open: '09:00', close: '19:00' },
              thursday: { open: '09:00', close: '19:00' },
              friday: { open: '09:00', close: '20:00' },
              saturday: { open: '10:00', close: '18:00' },
              sunday: { open: 'closed', close: 'closed' }
            },
            
            // Réseaux sociaux
            social_media: {
              facebook: `https://facebook.com/${account.name.toLowerCase().replace(/\s+/g, '')}`,
              instagram: `@${account.name.toLowerCase().replace(/\s+/g, '')}`,
              linkedin: account.plan === 'expert' ? `https://linkedin.com/company/${account.name.toLowerCase().replace(/\s+/g, '-')}` : null
            },
            
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Vérifier si l'établissement existe déjà
          const { data: existingEst } = await supabase
            .from('establishments')
            .select('id')
            .eq('user_id', existingUser.id)
            .single();

          if (existingEst) {
            // Mettre à jour
            const { data: updated, error: updateError } = await supabase
              .from('establishments')
              .update(establishmentData)
              .eq('id', existingEst.id)
              .select()
              .single();

            if (updateError) {
              console.error(`   ❌ Erreur mise à jour: ${updateError.message}`);
            } else {
              console.log(`   ✅ Établissement ${account.plan.toUpperCase()} mis à jour`);
              createdEstablishments.push(updated);
            }
          } else {
            // Créer nouveau
            const { data: created, error: createError } = await supabase
              .from('establishments')
              .insert(establishmentData)
              .select()
              .single();

            if (createError) {
              console.error(`   ❌ Erreur création: ${createError.message}`);
            } else {
              console.log(`   ✅ Établissement ${account.plan.toUpperCase()} créé`);
              createdEstablishments.push(created);
            }
          }
        }
      } else if (authData?.user) {
        console.log(`   ✅ Utilisateur créé avec ID: ${authData.user.id}`);
        
        // Créer l'établissement pour le nouvel utilisateur
        const establishmentData = {
          user_id: authData.user.id,
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
          status: 'active'
        };

        const { data: created, error: createError } = await supabase
          .from('establishments')
          .insert(establishmentData)
          .select()
          .single();

        if (createError) {
          console.error(`   ❌ Erreur création établissement: ${createError.message}`);
        } else {
          console.log(`   ✅ Établissement ${account.plan.toUpperCase()} créé`);
          createdEstablishments.push(created);
        }
      }
    } catch (error) {
      console.error(`   ❌ Erreur générale: ${error}`);
    }
  }

  // 3. Créer des événements de test pour chaque établissement
  console.log('\n📅 Création des événements de test...');
  
  for (const establishment of createdEstablishments) {
    const eventCount = establishment.plan === 'expert' ? 4 : 2;
    const events = [];
    
    for (let i = 0; i < eventCount; i++) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + i * 2);
      
      events.push({
        establishment_id: establishment.id,
        title: `${establishment.plan === 'expert' ? '⭐' : '🎯'} Événement ${establishment.plan.toUpperCase()} #${i + 1}`,
        description: `Événement test pour le plan ${establishment.plan}. ${
          establishment.plan === 'expert' 
            ? 'Visibilité maximale sur homepage, newsletter et réseaux sociaux.'
            : 'Visible sur homepage et newsletter.'
        }`,
        start_date: eventDate.toISOString(),
        end_date: new Date(eventDate.getTime() + 3 * 60 * 60 * 1000).toISOString(),
        location: establishment.address,
        status: 'published',
        show_on_establishment_page: true,
        show_on_homepage: true,
        show_in_newsletter: true,
        show_on_social: establishment.plan === 'expert',
        published_at: new Date().toISOString()
      });
    }
    
    const { error: eventError } = await supabase
      .from('events')
      .insert(events);
    
    if (eventError) {
      console.error(`   ❌ Erreur création événements: ${eventError.message}`);
    } else {
      console.log(`   ✅ ${events.length} événements créés pour ${establishment.name}`);
    }
  }

  // 4. Afficher le récapitulatif
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉCAPITULATIF DES COMPTES DE TEST');
  console.log('='.repeat(60));
  
  console.log('\n🔐 COMPTE PRO:');
  console.log('   Email: pro@test.com');
  console.log('   Mot de passe: ProTest123!');
  console.log('   Dashboard: https://www.guide-de-lyon.fr/pro/dashboard');
  console.log('   Plan: Pro (3 événements/mois, 10 photos/mois)');
  
  console.log('\n👑 COMPTE EXPERT:');
  console.log('   Email: expert@test.com');
  console.log('   Mot de passe: ExpertTest123!');
  console.log('   Dashboard: https://www.guide-de-lyon.fr/pro/dashboard');
  console.log('   Plan: Expert (6 événements/mois, 20 photos/mois)');
  
  console.log('\n✨ Fonctionnalités à tester:');
  console.log('   - Dashboard adaptatif selon le plan');
  console.log('   - Création d\'événements (avec quotas)');
  console.log('   - Upload de photos (avec limites)');
  console.log('   - Visibilité sur homepage (Pro/Expert seulement)');
  console.log('   - Badge vérifié (Expert seulement)');
  console.log('   - Support prioritaire (Expert seulement)');
  
  console.log('\n✅ Comptes de test créés avec succès !');
  console.log('='.repeat(60));
}

// Exécuter le script
createTestAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });