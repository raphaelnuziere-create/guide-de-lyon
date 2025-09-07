// Script pour vérifier l'état de la base de données
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Vérification de la base de données\n');
  
  // Vérifier les tables
  const tables = ['scraped_articles', 'scraping_sources'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table}: Non trouvée`);
        console.log(`   Erreur: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: Existe`);
        
        // Compter les enregistrements
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        console.log(`   Enregistrements: ${count || 0}`);
      }
    } catch (err) {
      console.log(`❌ Table ${table}: Erreur de connexion`);
    }
  }
  
  console.log('\n📝 État du système:');
  
  // Vérifier les sources actives
  try {
    const { data: sources, error } = await supabase
      .from('scraping_sources')
      .select('*')
      .eq('is_active', true);
    
    if (!error && sources) {
      console.log(`✅ Sources actives: ${sources.length}`);
      sources.forEach(s => {
        console.log(`   - ${s.name} (${s.type})`);
      });
    }
  } catch (err) {
    console.log('⚠️  Impossible de vérifier les sources');
  }
  
  // Vérifier les articles publiés
  try {
    const { data: articles, error } = await supabase
      .from('scraped_articles')
      .select('*')
      .eq('status', 'published')
      .limit(5);
    
    if (!error && articles) {
      console.log(`\n✅ Articles publiés: ${articles.length}`);
      articles.forEach(a => {
        console.log(`   - ${a.rewritten_title || a.original_title}`);
      });
    }
  } catch (err) {
    console.log('⚠️  Impossible de vérifier les articles');
  }
  
  console.log('\n💡 Actions requises:');
  
  try {
    const { error } = await supabase
      .from('scraped_articles')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('not found')) {
      console.log('1. ⚠️  Exécutez la migration SQL dans Supabase');
      console.log('   - Allez dans SQL Editor');
      console.log('   - Copiez le contenu de: supabase/migrations/20250108_scraping_system_fixed.sql');
      console.log('   - Exécutez le script');
    } else {
      console.log('1. ✅ Base de données configurée');
      console.log('2. Démarrez le serveur: npm run dev');
      console.log('3. Déclenchez le scraping: npx tsx scripts/trigger-scraping.ts');
    }
  } catch (err) {
    console.log('❌ Erreur de connexion à Supabase');
  }
}

checkDatabase()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });