/**
 * Script de debug pour analyser les données blog
 */

import { supabase } from '../lib/supabase'

async function debugBlogData() {
  console.log('🔍 DEBUG DES DONNÉES BLOG\n')
  console.log('=' .repeat(50))
  
  // Vérifier original_blog_posts
  console.log('\n📊 TABLE: original_blog_posts')
  console.log('-'.repeat(30))
  
  const { data: origPosts, error: origError } = await supabase
    .from('original_blog_posts')
    .select('id, slug, title, status, published')
    .limit(10)
  
  if (origError) {
    console.error('Erreur:', origError.message)
  } else {
    console.log(`${origPosts?.length || 0} articles trouvés`)
    origPosts?.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Published: ${post.published}`)
    })
  }
  
  // Vérifier blog_posts
  console.log('\n📊 TABLE: blog_posts')
  console.log('-'.repeat(30))
  
  const { data: blogPosts, error: blogError } = await supabase
    .from('blog_posts')
    .select('id, slug, title, status, published')
    .limit(10)
  
  if (blogError) {
    console.error('Erreur:', blogError.message)
  } else {
    console.log(`${blogPosts?.length || 0} articles trouvés`)
    blogPosts?.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Published: ${post.published}`)
    })
  }
  
  // Compter les articles publiés
  console.log('\n📈 STATISTIQUES')
  console.log('-'.repeat(30))
  
  const { count: origPublished } = await supabase
    .from('original_blog_posts')
    .select('*', { count: 'exact', head: true })
    .or('published.eq.true,status.eq.published')
  
  const { count: blogPublished } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .or('published.eq.true,status.eq.published')
  
  console.log(`original_blog_posts publiés: ${origPublished || 0}`)
  console.log(`blog_posts publiés: ${blogPublished || 0}`)
  
  // Tester un slug spécifique
  console.log('\n🔎 TEST SLUG SPÉCIFIQUE')
  console.log('-'.repeat(30))
  
  const testSlug = 'zoo-lyon'
  console.log(`Test avec slug: "${testSlug}"`)
  
  const { data: testOrig } = await supabase
    .from('original_blog_posts')
    .select('*')
    .eq('slug', testSlug)
    .single()
  
  if (testOrig) {
    console.log(`✅ Trouvé dans original_blog_posts: ${testOrig.title}`)
  } else {
    console.log('❌ Non trouvé dans original_blog_posts')
  }
  
  const { data: testBlog } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', testSlug)
    .single()
  
  if (testBlog) {
    console.log(`✅ Trouvé dans blog_posts: ${testBlog.title}`)
  } else {
    console.log('❌ Non trouvé dans blog_posts')
  }
}

debugBlogData().catch(console.error)