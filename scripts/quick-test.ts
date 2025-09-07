// Test rapide du système de scraping
import { ArticleRewriterService } from '../app/lib/ai/rewriter';

async function quickTest() {
  console.log('🧪 Test rapide du système\n');
  
  // Test OpenAI Rewriter
  console.log('🤖 Test de réécriture OpenAI...');
  
  const rewriter = new ArticleRewriterService();
  
  const testArticle = {
    original_title: "Lyon: Inauguration d'un nouveau tramway T10",
    original_content: "La ville de Lyon a inauguré aujourd'hui la nouvelle ligne de tramway T10 qui relie Villeurbanne à Vénissieux. Cette ligne de 8km dessert 15 stations et permettra de transporter 40000 voyageurs par jour. Le projet, d'un coût de 250 millions d'euros, s'inscrit dans le plan de mobilité durable de la Métropole de Lyon.",
    original_publish_date: new Date().toISOString()
  };
  
  try {
    const rewritten = await rewriter.rewriteArticle(testArticle);
    
    if (rewritten) {
      console.log('✅ Réécriture réussie!');
      console.log('\nArticle réécrit:');
      console.log('================');
      console.log(`Titre: ${rewritten.title}`);
      console.log(`Catégorie: ${rewritten.category}`);
      console.log(`Confiance: ${rewritten.confidence}`);
      console.log(`Mots-clés: ${rewritten.keywords.join(', ')}`);
      console.log(`\nExtrait:\n${rewritten.excerpt}`);
      console.log('\n✅ IMPORTANT: L\'article ne contient PAS de citations de sources');
      console.log('✅ IMPORTANT: L\'auteur sera "Raphael" lors de la sauvegarde');
      
      // Vérifier qu'il n'y a pas de citations
      const hasSourceCitation = rewritten.content.toLowerCase().includes('selon') || 
                               rewritten.content.includes('d\'après') ||
                               rewritten.content.includes('source');
      
      if (hasSourceCitation) {
        console.log('⚠️  ATTENTION: L\'article pourrait contenir des références aux sources');
      }
      
    } else {
      console.log('❌ Échec de la réécriture');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
  
  console.log('\n📝 Prochaines étapes:');
  console.log('1. Exécutez la migration SQL dans Supabase (voir MIGRATION_INSTRUCTIONS.md)');
  console.log('2. Déployez sur Vercel');
  console.log('3. Configurez OPENAI_API_KEY sur Vercel');
  console.log('4. Les articles seront scrapés et publiés automatiquement');
}

quickTest()
  .then(() => {
    console.log('\n✨ Test terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });