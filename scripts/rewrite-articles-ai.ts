#!/usr/bin/env npx tsx
/**
 * Script de réécriture intelligente des articles avec OpenAI
 * Génère du contenu unique et spécifique pour chaque article
 */

import { supabase } from '../lib/supabase'
import { generateArticleContent } from '../lib/openai/content-generator'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  meta_description?: string
  category?: string
}

// Configuration optimisée pour une exécution lente et stable
const BATCH_SIZE = 2 // Traiter seulement 2 articles à la fois (réduit la charge)
const DELAY_BETWEEN_BATCHES = 15000 // 15 secondes entre les lots (laisse respirer le système)
const DELAY_BETWEEN_ARTICLES = 3000 // 3 secondes entre chaque article
const MAX_RETRIES = 2 // Moins de retries pour éviter la surcharge

async function rewriteArticle(article: Article, retryCount = 0): Promise<boolean> {
  try {
    console.log(`\n📝 Traitement: ${article.title}`)
    
    // Générer le nouveau contenu
    const result = await generateArticleContent({
      title: article.title,
      slug: article.slug,
      currentContent: article.content,
      excerpt: article.excerpt
    })

    if (!result) {
      console.error(`❌ Échec génération pour: ${article.title}`)
      return false
    }

    // Valider que le contenu est spécifique
    if (!validateSpecificity(result.content, article.title)) {
      console.warn(`⚠️ Contenu trop générique, régénération...`)
      if (retryCount < MAX_RETRIES) {
        return rewriteArticle(article, retryCount + 1)
      }
      return false
    }

    // Mettre à jour dans la base de données
    const { error } = await supabase
      .from('blog_posts')
      .update({
        content: result.content,
        excerpt: result.excerpt,
        meta_description: result.metaDescription,
        updated_at: new Date().toISOString()
      })
      .eq('id', article.id)

    if (error) {
      console.error(`❌ Erreur mise à jour BDD pour ${article.title}:`, error)
      return false
    }

    console.log(`✅ Article réécrit avec succès (${result.content.split(' ').length} mots)`)
    return true

  } catch (error) {
    console.error(`❌ Erreur traitement ${article.title}:`, error)
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Nouvelle tentative (${retryCount + 1}/${MAX_RETRIES})...`)
      await delay(2000)
      return rewriteArticle(article, retryCount + 1)
    }
    return false
  }
}

function validateSpecificity(content: string, title: string): boolean {
  // Vérifier la longueur minimale
  const wordCount = content.split(' ').length
  if (wordCount < 1000) {
    console.log(`⚠️ Contenu trop court: ${wordCount} mots`)
    return false
  }

  // Vérifier que le contenu est spécifique et non générique
  const genericPhrases = [
    'toutes les informations pratiques',
    'découvrez tous les secrets',
    'pour tous les goûts'
  ]

  const contentLower = content.toLowerCase()
  const hasGenericContent = genericPhrases.some(phrase => 
    contentLower.includes(phrase)
  )

  if (hasGenericContent) {
    console.log(`⚠️ Contenu trop générique détecté`)
    return false
  }

  // Le contenu doit mentionner Lyon plusieurs fois
  const lyonMentions = (contentLower.match(/lyon/g) || []).length
  if (lyonMentions < 3) {
    console.log(`⚠️ Pas assez de mentions de Lyon: ${lyonMentions}`)
    return false
  }

  return true
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function processBatch(articles: Article[]): Promise<number> {
  console.log(`\n🚀 Traitement d'un lot de ${articles.length} articles...`)
  
  // Traiter séquentiellement avec pause entre chaque article
  const results: boolean[] = []
  for (let i = 0; i < articles.length; i++) {
    const result = await rewriteArticle(articles[i])
    results.push(result)
    
    // Pause entre chaque article du lot
    if (i < articles.length - 1) {
      console.log(`⏸️ Pause de ${DELAY_BETWEEN_ARTICLES / 1000}s avant le prochain article...`)
      await delay(DELAY_BETWEEN_ARTICLES)
    }
  }

  const successCount = results.filter(r => r).length
  console.log(`✅ Lot terminé: ${successCount}/${articles.length} réussis`)
  
  return successCount
}

async function main() {
  console.log('🤖 RÉÉCRITURE INTELLIGENTE DES ARTICLES AVEC OPENAI')
  console.log('=' .repeat(60))
  console.log('⚙️ Configuration: ')
  console.log(`   - Articles par lot: ${BATCH_SIZE}`)
  console.log(`   - Pause entre lots: ${DELAY_BETWEEN_BATCHES / 1000}s`)
  console.log(`   - Pause entre articles: ${DELAY_BETWEEN_ARTICLES / 1000}s`)
  console.log('   - Mode: Exécution lente et stable')
  console.log('=' .repeat(60))

  // Vérifier la configuration OpenAI
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY non trouvée dans .env.local')
    process.exit(1)
  }

  console.log('✅ Clé OpenAI détectée')

  try {
    // Option pour tester avec quelques articles d'abord
    const testMode = process.argv.includes('--test')
    const limit = testMode ? 3 : null

    // Récupérer les articles à réécrire
    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, content, excerpt, meta_description, category')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    // Optionnel: filtrer par catégorie
    const category = process.argv.find(arg => arg.startsWith('--category='))
    if (category) {
      const cat = category.split('=')[1]
      query = query.eq('category', cat)
      console.log(`📁 Filtrage par catégorie: ${cat}`)
    }

    const { data: articles, error } = await query

    if (error || !articles) {
      console.error('❌ Erreur récupération articles:', error)
      return
    }

    console.log(`\n📊 Articles à traiter: ${articles.length}`)
    
    if (testMode) {
      console.log('🧪 MODE TEST - Traitement de 3 articles seulement')
    }

    // Traiter par lots
    let totalSuccess = 0
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = articles.slice(i, i + BATCH_SIZE)
      const batchNum = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(articles.length / BATCH_SIZE)
      
      console.log(`\n📦 Lot ${batchNum}/${totalBatches}`)
      totalSuccess += await processBatch(batch)

      // Pause entre les lots pour éviter le rate limiting
      if (i + BATCH_SIZE < articles.length) {
        console.log(`⏸️ Pause de ${DELAY_BETWEEN_BATCHES / 1000}s avant le prochain lot...`)
        await delay(DELAY_BETWEEN_BATCHES)
      }
    }

    // Rapport final
    console.log('\n' + '=' .repeat(60))
    console.log('📊 RAPPORT FINAL')
    console.log(`✅ Articles réécris avec succès: ${totalSuccess}/${articles.length}`)
    console.log(`❌ Échecs: ${articles.length - totalSuccess}`)
    
    if (totalSuccess > 0) {
      console.log('\n🎉 Réécriture terminée ! Les articles sont maintenant uniques et spécifiques.')
      console.log('💡 Vérifiez les articles sur https://www.guide-de-lyon.fr/blog')
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  }
}

// Lancer le script
main().catch(console.error)