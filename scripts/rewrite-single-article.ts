#!/usr/bin/env npx tsx
/**
 * Script pour réécrire un seul article avec OpenAI
 */

import { supabase } from '../lib/supabase'
import { generateArticleContent } from '../lib/openai/content-generator'

async function rewriteSingleArticle(slug: string) {
  console.log('🤖 RÉÉCRITURE D\'UN ARTICLE AVEC OPENAI')
  console.log('=' .repeat(60))

  // Récupérer l'article
  const { data: article, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !article) {
    console.error('❌ Article non trouvé:', slug)
    return
  }

  console.log(`\n📝 Article: ${article.title}`)
  console.log(`   Slug: ${article.slug}`)
  console.log(`   Contenu actuel: ${article.content?.split(' ').length || 0} mots`)

  // Générer le nouveau contenu
  console.log('\n🤖 Génération du nouveau contenu...')
  const result = await generateArticleContent({
    title: article.title,
    slug: article.slug,
    currentContent: article.content,
    excerpt: article.excerpt
  })

  if (!result) {
    console.error('❌ Échec de la génération')
    return
  }

  const wordCount = result.content.split(' ').length
  console.log(`✅ Contenu généré: ${wordCount} mots`)

  // Mettre à jour dans la base de données
  const { error: updateError } = await supabase
    .from('blog_posts')
    .update({
      content: result.content,
      excerpt: result.excerpt,
      meta_description: result.metaDescription,
      updated_at: new Date().toISOString()
    })
    .eq('id', article.id)

  if (updateError) {
    console.error('❌ Erreur mise à jour:', updateError)
    return
  }

  console.log('\n✅ Article réécrit avec succès!')
  console.log(`📎 URL: https://www.guide-de-lyon.fr/blog/${slug}`)
  console.log(`📊 Nouveau contenu: ${wordCount} mots`)
  console.log(`📝 Meta description: ${result.metaDescription}`)
}

// Récupérer le slug depuis les arguments
const slug = process.argv[2] || 'coworking-lyon-lyon-2025'

rewriteSingleArticle(slug).catch(console.error)