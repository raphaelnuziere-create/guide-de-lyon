// Test script to verify shopping inscription workflow
// Usage: npx tsx scripts/test-shopping-inscription.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testShoppingInscription() {
  console.log('\n🛍️ TEST INSCRIPTION SHOPPING');
  console.log('='.repeat(50));

  // Test 1: Verify expert account exists and has correct permissions
  console.log('\n📋 Test 1: Compte Expert');
  const { data: expertAccount, error: expertError } = await supabase
    .from('establishments')
    .select('*')
    .eq('email', 'expert@test.com')
    .single();

  if (expertError) {
    console.log('  ✗ Erreur récupération compte expert:', expertError.message);
  } else if (expertAccount) {
    console.log(`  ✓ Compte expert trouvé: ${expertAccount.name}`);
    console.log(`  ✓ Plan: ${expertAccount.plan}`);
    console.log(`  ✓ Max événements: ${expertAccount.max_events || 'non défini'}`);
    console.log(`  ✓ Max photos: ${expertAccount.max_photos || 'non défini'}`);
    console.log(`  ✓ Vérifié: ${expertAccount.is_verified ? 'Oui' : 'Non'}`);
    console.log(`  ✓ Featured: ${expertAccount.featured ? 'Oui' : 'Non'}`);
  } else {
    console.log('  ✗ Compte expert non trouvé');
  }

  // Test 2: Test business-specific fields for different categories
  console.log('\n🏪 Test 2: Champs spécifiques par type');
  
  const testEstablishments = [
    { category: 'shopping-mode', name: 'Test Boutique Mode' },
    { category: 'restaurant-food', name: 'Test Restaurant' },
    { category: 'hotel-hebergement', name: 'Test Hotel' }
  ];

  for (const test of testEstablishments) {
    const { data: existing } = await supabase
      .from('establishments')
      .select('*')
      .eq('name', test.name)
      .eq('category', test.category)
      .maybeSingle();

    if (existing) {
      console.log(`  ✓ ${test.category}: Établissement test existe`);
      console.log(`    - Spécialités: ${existing.specialties ? 'Oui' : 'Non'}`);
      console.log(`    - Services: ${existing.services ? 'Oui' : 'Non'}`);
      
      // Champs spécifiques selon le type
      if (test.category === 'shopping-mode') {
        console.log(`    - Catégories produits: ${existing.product_categories ? 'Oui' : 'Non'}`);
        console.log(`    - Marques: ${existing.brands ? 'Oui' : 'Non'}`);
        console.log(`    - Paiements: ${existing.payment_methods ? 'Oui' : 'Non'}`);
      } else if (test.category === 'restaurant-food') {
        console.log(`    - Menu: ${existing.menu ? 'Oui' : 'Non'}`);
        console.log(`    - Types cuisine: ${existing.cuisine_types ? 'Oui' : 'Non'}`);
      } else if (test.category === 'hotel-hebergement') {
        console.log(`    - Chambres: ${existing.rooms ? 'Oui' : 'Non'}`);
        console.log(`    - Équipements hôtel: ${existing.hotel_amenities ? 'Oui' : 'Non'}`);
      }
    } else {
      console.log(`  ⚠ ${test.category}: Aucun établissement test trouvé`);
    }
  }

  // Test 3: Verify database schema supports all adaptive form fields
  console.log('\n🗄️ Test 3: Schéma base de données');
  const { data: columns, error: schemaError } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', 'establishments')
    .order('column_name');

  if (schemaError) {
    console.log('  ✗ Erreur lecture schéma:', schemaError.message);
  } else {
    const requiredFields = [
      'product_categories', 'brands', 'payment_methods', // Shopping
      'menu', 'cuisine_types', 'dietary_options', // Restaurant
      'rooms', 'hotel_amenities', // Hôtel
      'specialties', 'services', 'features', // Général
      'plan', 'max_events', 'max_photos' // Plans
    ];

    const existingColumns = columns?.map(c => c.column_name) || [];
    
    requiredFields.forEach(field => {
      if (existingColumns.includes(field)) {
        console.log(`  ✓ Colonne ${field} existe`);
      } else {
        console.log(`  ✗ Colonne ${field} manquante`);
      }
    });
  }

  // Test 4: URL accessibility test
  console.log('\n🌐 Test 4: URLs clés');
  const urls = [
    'Dashboard expert: http://localhost:3003/pro/dashboard',
    'Inscription: http://localhost:3003/pro/inscription',
    'Connexion: http://localhost:3003/auth/pro/connexion'
  ];

  urls.forEach(url => {
    console.log(`  📍 ${url}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log('📋 INSTRUCTIONS DE TEST:');
  console.log('1. Connectez-vous avec expert@test.com / ExpertTest123!');
  console.log('2. Vérifiez les fonctionnalités expert dans le dashboard');
  console.log('3. Testez l\'inscription avec différentes catégories:');
  console.log('   - shopping-mode: doit montrer catégories produits, marques, paiements');
  console.log('   - restaurant-food: doit montrer menu, types cuisine, options alimentaires');
  console.log('   - hotel-hebergement: doit montrer chambres, équipements hôtel');
  
  console.log('\n🔍 POINTS DE VÉRIFICATION:');
  console.log('✓ Les options spécifiques apparaissent selon le type de business');
  console.log('✓ Les données sont sauvegardées correctement');
  console.log('✓ Le dashboard expert affiche toutes les fonctionnalités');
}

testShoppingInscription()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });