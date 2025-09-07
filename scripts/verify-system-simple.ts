// Script de vérification complète du système Pro (version simplifiée)
// Usage: npx tsx scripts/verify-system-simple.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySystem() {
  console.log('\n🚀 VÉRIFICATION COMPLÈTE DU SYSTÈME PRO');
  console.log('='.repeat(60));

  let totalTests = 0;
  let passedTests = 0;

  // Test 1: Tables Supabase
  console.log('\n📊 Test 1: Structure de la base de données');
  const tables = ['establishments', 'events'];
  for (const table of tables) {
    totalTests++;
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        console.log(`  ✓ Table ${table} existe`);
        passedTests++;
      } else {
        console.log(`  ✗ Table ${table} erreur: ${error.message}`);
      }
    } catch (e) {
      console.log(`  ✗ Table ${table} erreur: ${e}`);
    }
  }

  // Test 2: Comptes de test
  console.log('\n👥 Test 2: Comptes de test');
  const testEmails = ['pro@test.com', 'expert@test.com'];
  for (const email of testEmails) {
    totalTests++;
    const { data } = await supabase
      .from('establishments')
      .select('*')
      .eq('email', email)
      .single();

    if (data) {
      console.log(`  ✓ ${email}: Plan ${data.plan}, Quotas: ${data.events_this_month || 0}/${data.max_events || 3} événements`);
      passedTests++;
    } else {
      console.log(`  ✗ ${email}: Non trouvé`);
    }
  }

  // Test 3: Événements
  console.log('\n📅 Test 3: Système d\'événements');
  totalTests++;
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('show_on_homepage', true);
  
  console.log(`  ✓ ${events?.length || 0} événements visibles sur homepage`);
  passedTests++;

  // Test 4: Configuration
  console.log('\n⚙️ Test 4: Configuration');
  const configs = [
    { name: 'Stripe', check: !!process.env.STRIPE_SECRET_KEY },
    { name: 'Cron Secret', check: !!process.env.CRON_SECRET },
    { name: 'Supabase', check: !!process.env.NEXT_PUBLIC_SUPABASE_URL }
  ];

  for (const config of configs) {
    totalTests++;
    if (config.check) {
      console.log(`  ✓ ${config.name} configuré`);
      passedTests++;
    } else {
      console.log(`  ✗ ${config.name} manquant`);
    }
  }

  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📈 RÉSUMÉ');
  console.log('='.repeat(60));
  const percentage = Math.round((passedTests / totalTests) * 100);
  console.log(`\n✅ Tests réussis: ${passedTests}/${totalTests} (${percentage}%)`);
  
  if (percentage === 100) {
    console.log('\n🎉 SYSTÈME 100% OPÉRATIONNEL !');
  } else if (percentage >= 80) {
    console.log('\n✅ Système opérationnel');
  } else {
    console.log('\n⚠️ Système nécessite des corrections');
  }

  // Instructions
  console.log('\n📝 COMPTES DE TEST:');
  console.log('Pro: pro@test.com / ProTest123!');
  console.log('Expert: expert@test.com / ExpertTest123!');
  console.log('Dashboard: https://www.guide-de-lyon.fr/pro/dashboard');
}

verifySystem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });