import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogTables() {
  console.log('🔍 ANALYSE DES TABLES BLOG\n');
  console.log('=' .repeat(50));

  // Vérifier blog_posts
  console.log('\n📊 TABLE: blog_posts');
  console.log('-'.repeat(30));
  
  const { data: blogPosts, error: blogPostsError } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, content, published')
    .limit(5);

  if (blogPostsError) {
    console.log('❌ Erreur:', blogPostsError.message);
  } else {
    console.log(`✅ ${blogPosts?.length || 0} articles trouvés`);
    
    if (blogPosts && blogPosts.length > 0) {
      console.log('\nÉchantillon:');
      blogPosts.forEach((post, i) => {
        console.log(`\n${i + 1}. ${post.title}`);
        console.log(`   Slug: ${post.slug || 'NON DÉFINI'}`);
        console.log(`   Excerpt: ${post.excerpt?.substring(0, 100)}...`);
        console.log(`   Content: ${post.content ? '✅ Présent' : '❌ Vide'}`);
        console.log(`   Published: ${post.published ? '✅' : '❌'}`);
      });
    }
  }

  // Vérifier original_blog_posts
  console.log('\n\n📊 TABLE: original_blog_posts');
  console.log('-'.repeat(30));
  
  const { data: originalPosts, error: originalPostsError } = await supabase
    .from('original_blog_posts')
    .select('id, title, slug, excerpt, content, status')
    .limit(5);

  if (originalPostsError) {
    console.log('❌ Erreur:', originalPostsError.message);
  } else {
    console.log(`✅ ${originalPosts?.length || 0} articles trouvés`);
    
    if (originalPosts && originalPosts.length > 0) {
      console.log('\nÉchantillon:');
      originalPosts.forEach((post, i) => {
        console.log(`\n${i + 1}. ${post.title}`);
        console.log(`   Slug: ${post.slug || 'NON DÉFINI'}`);
        console.log(`   Excerpt: ${post.excerpt?.substring(0, 100)}...`);
        console.log(`   Content: ${post.content ? '✅ Présent' : '❌ Vide'}`);
        console.log(`   Status: ${post.status || 'NON DÉFINI'}`);
      });
    }
  }

  // Comparer les tables
  console.log('\n\n🔄 COMPARAISON DES TABLES');
  console.log('-'.repeat(30));

  const { count: countBlogPosts } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true });

  const { count: countOriginalPosts } = await supabase
    .from('original_blog_posts')
    .select('*', { count: 'exact', head: true });

  console.log(`\nblog_posts: ${countBlogPosts || 0} articles au total`);
  console.log(`original_blog_posts: ${countOriginalPosts || 0} articles au total`);

  // Vérifier les slugs communs
  const { data: blogPostsSlugs } = await supabase
    .from('blog_posts')
    .select('slug');

  const { data: originalPostsSlugs } = await supabase
    .from('original_blog_posts')
    .select('slug');

  if (blogPostsSlugs && originalPostsSlugs) {
    const blogSlugs = new Set(blogPostsSlugs.map(p => p.slug).filter(Boolean));
    const originalSlugs = new Set(originalPostsSlugs.map(p => p.slug).filter(Boolean));
    
    const commonSlugs = [...blogSlugs].filter(slug => originalSlugs.has(slug));
    
    console.log(`\nSlugs en commun: ${commonSlugs.length}`);
    if (commonSlugs.length > 0) {
      console.log('Exemples:', commonSlugs.slice(0, 3).join(', '));
    }
  }

  // Recommandation
  console.log('\n\n💡 RECOMMANDATION');
  console.log('-'.repeat(30));
  
  if ((countBlogPosts || 0) > (countOriginalPosts || 0)) {
    console.log('➡️ Utiliser "blog_posts" comme table principale (plus de contenu)');
  } else if ((countOriginalPosts || 0) > (countBlogPosts || 0)) {
    console.log('➡️ Utiliser "original_blog_posts" comme table principale (plus de contenu)');
  } else {
    console.log('➡️ Analyser la qualité du contenu pour décider');
  }
}

// Exécuter le script
checkBlogTables().catch(console.error);