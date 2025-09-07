// Vérifier que les sources sont bien dans la base
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('🔍 Vérification des sources dans Supabase...\n');
  
  const { data: sources, error } = await supabase
    .from('scraping_sources')
    .select('*');
  
  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }
  
  if (sources && sources.length > 0) {
    console.log(`✅ ${sources.length} sources trouvées dans la base !`);
    console.log('-'.repeat(40));
    sources.forEach(s => {
      console.log(`\n📰 ${s.name}`);
      console.log(`   Type: ${s.type}`);
      console.log(`   Active: ${s.is_active ? '✅ OUI' : '❌ NON'}`);
      console.log(`   Fréquence: ${s.frequency_minutes} min`);
      console.log(`   URL: ${s.url}`);
    });
  } else {
    console.log('❌ Aucune source trouvée');
    console.log('Exécutez le SQL: 20250108_insert_sources_fixed.sql');
  }
  
  console.log('\n' + '='.repeat(40));
  console.log('Si les sources sont là, le scraping peut commencer !');
}

verify().then(() => process.exit(0));