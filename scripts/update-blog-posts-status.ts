/**
 * Script pour mettre à jour le statut des articles blog
 * et les rendre visibles en production
 */

import { supabase } from '../lib/supabase'

async function updateBlogPostsStatus() {
  console.log('🚀 MISE À JOUR DES ARTICLES BLOG POUR PRODUCTION\n')
  console.log('=' .repeat(50))
  
  // 1. Vérifier et mettre à jour blog_posts
  console.log('\n📊 TABLE: blog_posts')
  console.log('-'.repeat(30))
  
  // Compter les articles actuellement publiés
  const { count: publishedBefore } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)
  
  console.log(`Articles publiés avant: ${publishedBefore || 0}`)
  
  // Mettre à jour les 50 premiers articles pour les publier
  const { data: toUpdate, error: selectError } = await supabase
    .from('blog_posts')
    .select('id, title, slug')
    .eq('published', false)
    .limit(50)
  
  if (selectError) {
    console.error('Erreur lors de la sélection:', selectError)
    return
  }
  
  if (toUpdate && toUpdate.length > 0) {
    console.log(`\n✏️ Mise à jour de ${toUpdate.length} articles...`)
    
    // Mettre à jour en lot
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ published: true })
      .in('id', toUpdate.map(a => a.id))
    
    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError)
    } else {
      console.log('✅ Articles mis à jour avec succès!')
      
      // Afficher quelques exemples
      console.log('\nExemples d\'articles publiés:')
      toUpdate.slice(0, 5).forEach((article, i) => {
        console.log(`${i + 1}. ${article.title}`)
        console.log(`   Slug: ${article.slug}`)
      })
    }
  } else {
    console.log('Tous les articles sont déjà publiés!')
  }
  
  // 2. Faire de même pour original_blog_posts
  console.log('\n📊 TABLE: original_blog_posts')
  console.log('-'.repeat(30))
  
  // Compter les articles actuellement publiés
  const { count: origPublishedBefore } = await supabase
    .from('original_blog_posts')
    .select('*', { count: 'exact', head: true })
    .or('published.eq.true,status.eq.published')
  
  console.log(`Articles publiés avant: ${origPublishedBefore || 0}`)
  
  // Mettre à jour le statut
  const { data: origToUpdate, error: origSelectError } = await supabase
    .from('original_blog_posts')
    .select('id, title, slug, status')
    .neq('status', 'published')
    .limit(50)
  
  if (origSelectError) {
    console.error('Erreur lors de la sélection:', origSelectError)
    return
  }
  
  if (origToUpdate && origToUpdate.length > 0) {
    console.log(`\n✏️ Mise à jour de ${origToUpdate.length} articles...`)
    
    // Mettre à jour en lot
    const { error: origUpdateError } = await supabase
      .from('original_blog_posts')
      .update({ 
        status: 'published',
        published: true 
      })
      .in('id', origToUpdate.map(a => a.id))
    
    if (origUpdateError) {
      console.error('Erreur lors de la mise à jour:', origUpdateError)
    } else {
      console.log('✅ Articles mis à jour avec succès!')
      
      // Afficher quelques exemples
      console.log('\nExemples d\'articles publiés:')
      origToUpdate.slice(0, 5).forEach((article, i) => {
        console.log(`${i + 1}. ${article.title}`)
        console.log(`   Slug: ${article.slug}`)
      })
    }
  } else {
    console.log('Tous les articles sont déjà publiés!')
  }
  
  // 3. Vérifier le résultat final
  console.log('\n📈 RÉSULTAT FINAL')
  console.log('-'.repeat(30))
  
  const { count: blogFinal } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('published', true)
  
  const { count: origFinal } = await supabase
    .from('original_blog_posts')
    .select('*', { count: 'exact', head: true })
    .or('published.eq.true,status.eq.published')
  
  console.log(`blog_posts publiés: ${blogFinal || 0}`)
  console.log(`original_blog_posts publiés: ${origFinal || 0}`)
  
  console.log('\n✅ Script terminé!')
}

updateBlogPostsStatus().catch(console.error)