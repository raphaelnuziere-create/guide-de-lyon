/**
 * Script d'audit complet du contenu blog
 * Identifie les incohérences titre/contenu et les articles à améliorer
 */

import { supabase } from '../lib/supabase'

interface ContentAuditResult {
  id: string
  title: string
  slug: string
  contentLength: number
  coherenceScore: number
  issues: string[]
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  excerpt: string
}

async function auditBlogContent() {
  console.log('🔍 AUDIT COMPLET DU CONTENU BLOG\n')
  console.log('=' .repeat(60))
  
  // Récupérer tous les articles
  const { data: articles, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
  
  if (error || !articles) {
    console.error('Erreur récupération articles:', error)
    return
  }
  
  console.log(`📊 Total articles à auditer: ${articles.length}\n`)
  
  const auditResults: ContentAuditResult[] = []
  const categories = new Map<string, number>()
  
  // Analyser chaque article
  for (const article of articles) {
    const result = analyzeArticle(article)
    auditResults.push(result)
    
    // Compter par catégorie
    const cat = article.category || 'Non catégorisé'
    categories.set(cat, (categories.get(cat) || 0) + 1)
  }
  
  // Afficher les statistiques par catégorie
  console.log('\n📂 RÉPARTITION PAR CATÉGORIE')
  console.log('-'.repeat(40))
  categories.forEach((count, cat) => {
    console.log(`${cat}: ${count} articles`)
  })
  
  // Identifier les articles problématiques
  const problematicArticles = auditResults.filter(r => r.coherenceScore < 50 || r.contentLength < 500)
  
  console.log('\n⚠️ ARTICLES PROBLÉMATIQUES (Priorité HAUTE)')
  console.log('-'.repeat(40))
  problematicArticles
    .filter(a => a.priority === 'HIGH')
    .slice(0, 10)
    .forEach((article, i) => {
      console.log(`\n${i + 1}. ${article.title}`)
      console.log(`   Slug: ${article.slug}`)
      console.log(`   Longueur: ${article.contentLength} caractères`)
      console.log(`   Cohérence: ${article.coherenceScore}%`)
      console.log(`   Problèmes: ${article.issues.join(', ')}`)
    })
  
  // Statistiques de contenu
  const avgLength = auditResults.reduce((sum, r) => sum + r.contentLength, 0) / auditResults.length
  const shortArticles = auditResults.filter(r => r.contentLength < 800).length
  const incohérentArticles = auditResults.filter(r => r.coherenceScore < 50).length
  
  console.log('\n📈 STATISTIQUES GLOBALES')
  console.log('-'.repeat(40))
  console.log(`Longueur moyenne: ${Math.round(avgLength)} caractères`)
  console.log(`Articles trop courts (<800 car): ${shortArticles} (${Math.round(shortArticles/articles.length*100)}%)`)
  console.log(`Articles incohérents: ${incohérentArticles} (${Math.round(incohérentArticles/articles.length*100)}%)`)
  
  // Sauvegarder le rapport
  const report = {
    date: new Date().toISOString(),
    totalArticles: articles.length,
    problematicCount: problematicArticles.length,
    averageLength: avgLength,
    shortArticlesCount: shortArticles,
    incoherentCount: incohérentArticles,
    detailedResults: auditResults
  }
  
  // Écrire le rapport JSON
  const fs = await import('fs/promises')
  await fs.writeFile(
    'blog-audit-report.json',
    JSON.stringify(report, null, 2)
  )
  
  console.log('\n✅ Rapport d\'audit sauvegardé dans blog-audit-report.json')
  
  // Générer les recommandations
  console.log('\n🎯 RECOMMANDATIONS PRIORITAIRES')
  console.log('-'.repeat(40))
  console.log('1. Réécrire en priorité les articles "Coworking" et "Restaurant"')
  console.log('2. Enrichir tous les articles <800 caractères')
  console.log('3. Corriger les incohérences titre/contenu')
  console.log('4. Ajouter des images et structurer avec H2/H3')
  console.log('5. Optimiser les meta descriptions pour le SEO')
}

function analyzeArticle(article: any): ContentAuditResult {
  const issues: string[] = []
  let coherenceScore = 100
  
  const title = article.title?.toLowerCase() || ''
  const content = article.content?.toLowerCase() || ''
  const contentLength = article.content?.length || 0
  
  // Vérifier la cohérence titre/contenu
  if (title.includes('coworking') && !content.includes('coworking')) {
    issues.push('Titre parle de coworking mais pas le contenu')
    coherenceScore -= 50
  }
  
  if (title.includes('restaurant') && !content.includes('restaurant')) {
    issues.push('Titre parle de restaurant mais pas le contenu')
    coherenceScore -= 50
  }
  
  if (title.includes('hôtel') && !content.includes('hôtel') && !content.includes('hotel')) {
    issues.push('Titre parle d\'hôtel mais pas le contenu')
    coherenceScore -= 50
  }
  
  // Vérifier la longueur
  if (contentLength < 500) {
    issues.push('Contenu trop court (<500 car)')
    coherenceScore -= 30
  } else if (contentLength < 800) {
    issues.push('Contenu court (<800 car)')
    coherenceScore -= 20
  }
  
  // Vérifier le contenu générique
  if (content.includes('toutes les informations pratiques')) {
    issues.push('Contenu générique non personnalisé')
    coherenceScore -= 30
  }
  
  // Vérifier la structure
  if (!content.includes('##') && !content.includes('h2')) {
    issues.push('Pas de sous-titres H2/H3')
    coherenceScore -= 10
  }
  
  // Déterminer la priorité
  let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
  if (coherenceScore < 50 || contentLength < 500) {
    priority = 'HIGH'
  } else if (coherenceScore < 70 || contentLength < 1000) {
    priority = 'MEDIUM'
  }
  
  return {
    id: article.id,
    title: article.title || 'Sans titre',
    slug: article.slug || '',
    contentLength,
    coherenceScore: Math.max(0, coherenceScore),
    issues,
    priority,
    category: article.category || 'Non catégorisé',
    excerpt: article.excerpt || ''
  }
}

// Exécuter l'audit
auditBlogContent().catch(console.error)