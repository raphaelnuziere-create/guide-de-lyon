// Script pour vérifier les articles dans la base
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticles() {
  console.log('📰 VÉRIFICATION DES ARTICLES\n');
  console.log('='.repeat(60));
  
  // 1. Compter les articles par statut
  const statuses = ['published', 'rewritten', 'scraped'];
  
  for (const status of statuses) {
    const { count } = await supabase
      .from('scraped_articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    
    const emoji = status === 'published' ? '✅' : status === 'rewritten' ? '📝' : '⏳';
    console.log(`${emoji} Articles ${status}: ${count || 0}`);
  }
  
  // 2. Récupérer les articles publiés
  const { data: articles, error } = await supabase
    .from('scraped_articles')
    .select('rewritten_title, slug, author_name, category, views_count, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('\n❌ Erreur:', error);
    return;
  }
  
  if (articles && articles.length > 0) {
    console.log('\n📚 ARTICLES PUBLIÉS:');
    console.log('-'.repeat(60));
    
    articles.forEach((article, i) => {
      console.log(`\n${i + 1}. ${article.rewritten_title}`);
      console.log(`   Catégorie: ${article.category}`);
      console.log(`   Auteur: ${article.author_name}`);
      console.log(`   Vues: ${article.views_count}`);
      console.log(`   Slug: ${article.slug}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🔗 VOIR LES ARTICLES SUR LE SITE:');
    console.log('\n📌 Page principale:');
    console.log('   https://www.guide-de-lyon.fr/actualites');
    console.log('\n📌 Route Lyon:');
    console.log('   https://www.guide-de-lyon.fr/actualites/lyon');
    
    if (articles[0]?.slug) {
      console.log('\n📌 Premier article:');
      console.log(`   https://www.guide-de-lyon.fr/actualites/${articles[0].slug}`);
    }
  } else {
    console.log('\n⚠️  Aucun article publié');
    console.log('\n💡 Pour avoir des articles:');
    console.log('1. Exécutez le SQL: 20250108_insert_test_articles.sql');
    console.log('2. Ou lancez: npx tsx scripts/force-scraping.ts');
  }
  
  console.log('\n🚀 Note: Le déploiement peut prendre 1-2 minutes sur Vercel');
}

checkArticles()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });