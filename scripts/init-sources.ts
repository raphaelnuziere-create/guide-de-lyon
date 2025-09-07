// Script pour initialiser les sources de scraping
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function initSources() {
  console.log('🚀 Initialisation des sources de scraping\n');
  
  const sources = [
    {
      name: 'Le Progrès Lyon RSS',
      url: 'https://www.leprogres.fr/edition-lyon-villeurbanne/rss',
      type: 'rss',
      selectors: {
        title: 'title',
        description: 'description',
        link: 'link',
        pubDate: 'pubDate',
        image: 'enclosure[type="image/jpeg"]'
      },
      frequency_minutes: 60,
      is_active: true
    },
    {
      name: 'Lyon Capitale RSS',
      url: 'https://www.lyoncapitale.fr/feed/',
      type: 'rss',
      selectors: {
        title: 'title',
        description: 'description',
        link: 'link',
        pubDate: 'pubDate'
      },
      frequency_minutes: 90,
      is_active: true
    },
    {
      name: 'Tribune de Lyon RSS',
      url: 'https://tribunedelyon.fr/feed/',
      type: 'rss',
      selectors: {
        title: 'title',
        description: 'description',
        link: 'link',
        pubDate: 'pubDate'
      },
      frequency_minutes: 120,
      is_active: true
    }
  ];
  
  console.log(`📝 Insertion de ${sources.length} sources...`);
  
  for (const source of sources) {
    try {
      // Vérifier si la source existe déjà
      const { data: existing } = await supabase
        .from('scraping_sources')
        .select('id')
        .eq('url', source.url)
        .single();
      
      if (existing) {
        console.log(`⚠️  ${source.name}: Existe déjà`);
        continue;
      }
      
      // Insérer la nouvelle source
      const { error } = await supabase
        .from('scraping_sources')
        .insert(source);
      
      if (error) {
        console.log(`❌ ${source.name}: Erreur - ${error.message}`);
      } else {
        console.log(`✅ ${source.name}: Ajoutée`);
      }
    } catch (err) {
      console.log(`❌ ${source.name}: Erreur inattendue`);
    }
  }
  
  // Vérifier le résultat
  console.log('\n📊 Résumé:');
  const { data: allSources, error } = await supabase
    .from('scraping_sources')
    .select('*');
  
  if (!error && allSources) {
    console.log(`Total des sources: ${allSources.length}`);
    console.log(`Sources actives: ${allSources.filter(s => s.is_active).length}`);
    
    console.log('\n📰 Sources configurées:');
    allSources.forEach(s => {
      console.log(`  ${s.is_active ? '✅' : '❌'} ${s.name} - ${s.type} - ${s.frequency_minutes}min`);
    });
  }
  
  console.log('\n🎯 Prochaines étapes:');
  console.log('1. Démarrez le serveur: npm run dev');
  console.log('2. Déclenchez le scraping: npx tsx scripts/trigger-scraping.ts');
  console.log('3. Consultez les articles: http://localhost:3000/actualites');
}

initSources()
  .then(() => {
    console.log('\n✅ Initialisation terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });