import { supabase } from '../lib/supabase'

async function checkUpdatedArticles() {
  const { data } = await supabase
    .from('blog_posts')
    .select('title, slug, updated_at, content')
    .order('updated_at', { ascending: false })
    .limit(5)

  console.log('Articles récemment mis à jour:')
  console.log('=' .repeat(60))
  
  data?.forEach(article => {
    const wordCount = article.content?.split(' ').length || 0
    console.log(`\n📝 ${article.title}`)
    console.log(`   URL: https://www.guide-de-lyon.fr/blog/${article.slug}`)
    console.log(`   Mots: ${wordCount}`)
    console.log(`   Mis à jour: ${article.updated_at}`)
  })
}

checkUpdatedArticles().catch(console.error)