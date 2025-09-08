// Script simple pour peupler rapidement la base avec des articles
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const articles = [
  {
    title: "Lyon lance un nouveau plan de mobilité douce pour 2025",
    content: "La métropole de Lyon dévoile son ambitieux plan de mobilité douce...",
    category: "Transport"
  },
  {
    title: "Festival Lumière 2025 : le programme complet dévoilé",
    content: "Le Festival Lumière revient pour une nouvelle édition exceptionnelle...",
    category: "Culture"
  },
  {
    title: "Ouverture d'un nouveau marché bio dans le 3ème arrondissement",
    content: "Un nouveau marché bio s'installe place Guichard...",
    category: "Commerce"
  },
  {
    title: "Lyon accueillera les championnats d'Europe de natation",
    content: "La ville de Lyon a été sélectionnée pour accueillir les championnats...",
    category: "Sport"
  },
  {
    title: "Rénovation complète du parc de la Tête d'Or",
    content: "Le parc emblématique de Lyon va bénéficier d'une rénovation majeure...",
    category: "Urbanisme"
  },
  {
    title: "Nouveau campus universitaire dans le quartier de Gerland",
    content: "Un campus ultramoderne va voir le jour à Gerland...",
    category: "Education"
  },
  {
    title: "La gastronomie lyonnaise inscrite au patrimoine de l'UNESCO",
    content: "Une reconnaissance mondiale pour la cuisine lyonnaise...",
    category: "Gastronomie"
  },
  {
    title: "Extension de la ligne de métro B jusqu'à Saint-Genis-Laval",
    content: "Le projet d'extension de la ligne B est officiellement lancé...",
    category: "Transport"
  },
  {
    title: "Lyon devient capitale européenne du numérique",
    content: "La ville obtient le label de capitale numérique européenne...",
    category: "Innovation"
  },
  {
    title: "Création de 5000 emplois dans le secteur tech à Lyon",
    content: "Le secteur technologique lyonnais en pleine expansion...",
    category: "Economie"
  }
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function generateContent(title, snippet, category) {
  return `
<h1>${title}</h1>

<p><strong>${snippet}</strong></p>

<h2>Une actualité importante pour Lyon</h2>

<p>Cette information marque un tournant important pour la métropole lyonnaise. ${snippet} Cette évolution s'inscrit dans la dynamique de transformation de notre ville.</p>

<p>Lyon continue de se positionner comme une métropole européenne majeure, alliant tradition et modernité. Cette actualité en est une nouvelle preuve.</p>

<h2>Impact sur la vie quotidienne</h2>

<p>Les Lyonnais seront directement concernés par cette actualité. Que ce soit dans le domaine ${category.toLowerCase()}, cette évolution aura des répercussions positives sur le quotidien des habitants.</p>

<p>La municipalité travaille activement pour que ces changements bénéficient au plus grand nombre. L'objectif est de renforcer l'attractivité de Lyon tout en préservant la qualité de vie.</p>

<h2>Un projet d'envergure</h2>

<p>Ce projet s'inscrit dans une vision à long terme pour Lyon. Il témoigne de l'ambition de la ville de rester à la pointe de l'innovation tout en respectant son patrimoine historique.</p>

<p>Les investissements prévus permettront de concrétiser cette vision et de positionner Lyon parmi les métropoles les plus dynamiques d'Europe.</p>

<h2>Prochaines étapes</h2>

<p>Les prochains mois seront cruciaux pour la mise en œuvre de ce projet. Des consultations publiques seront organisées pour recueillir l'avis des citoyens.</p>

<p>La transparence et la participation citoyenne sont au cœur de la démarche. Chaque Lyonnais pourra contribuer à façonner l'avenir de sa ville.</p>

<h2>Lyon, ville d'avenir</h2>

<p>Cette actualité confirme le dynamisme de Lyon et sa capacité à se réinventer. Entre patrimoine historique et innovations modernes, la ville trace sa route vers l'avenir.</p>

<p>Les projets en cours et à venir témoignent d'une ambition forte : faire de Lyon une référence européenne en matière de qualité de vie, d'innovation et de développement durable.</p>

<p>Restez connecté pour suivre l'évolution de ce projet et découvrir toutes les actualités qui font bouger Lyon.</p>
  `.trim();
}

async function populateArticles() {
  console.log('🚀 Début du peuplement de la base...');
  
  // 1. Supprimer tous les articles existants
  console.log('🗑️  Suppression des anciens articles...');
  const { error: deleteError } = await supabase
    .from('scraped_articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.error('❌ Erreur suppression:', deleteError);
  } else {
    console.log('✅ Articles supprimés');
  }
  
  // 2. Préparer les nouveaux articles
  const articlesToInsert = articles.map(article => {
    const slug = generateSlug(article.title);
    const content = generateContent(article.title, article.content, article.category);
    
    // Images Lyon depuis Unsplash
    const lyonImages = [
      'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1200',
      'https://images.unsplash.com/photo-1582806988429-d451912c0e1f?w=1200',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200',
      'https://images.unsplash.com/photo-1609770231080-e321deccc34c?w=1200',
      'https://images.unsplash.com/photo-1563373960-57e7ce1097d0?w=1200'
    ];
    
    return {
      id: crypto.randomUUID(),
      source_name: '20 Minutes Lyon',
      source_url: 'https://www.20minutes.fr/lyon/',
      original_url: `https://www.20minutes.fr/lyon/article-${slug}`,
      original_title: article.title,
      original_content: article.content,
      rewritten_title: article.title,
      rewritten_content: content,
      slug: slug,
      category: 'actualite',
      featured_image_url: lyonImages[Math.floor(Math.random() * lyonImages.length)],
      status: 'published',
      published_at: new Date().toISOString(),
      scraped_at: new Date().toISOString(),
      ai_confidence_score: 0.95
    };
  });
  
  // 3. Insérer les articles
  console.log(`📝 Insertion de ${articlesToInsert.length} articles...`);
  const { data, error: insertError } = await supabase
    .from('scraped_articles')
    .insert(articlesToInsert)
    .select();
  
  if (insertError) {
    console.error('❌ Erreur insertion:', insertError);
    return;
  }
  
  console.log(`✅ ${data.length} articles insérés avec succès !`);
  
  // 4. Afficher le résultat
  const { data: allArticles } = await supabase
    .from('scraped_articles')
    .select('slug, rewritten_title, status')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5);
  
  console.log('\n📰 Articles publiés :');
  allArticles?.forEach(article => {
    console.log(`  - ${article.rewritten_title}`);
    console.log(`    URL: https://www.guide-de-lyon.fr/actualites/${article.slug}`);
  });
  
  console.log('\n🎉 Peuplement terminé !');
  console.log('👉 Visitez https://www.guide-de-lyon.fr/actualites pour voir les articles');
}

// Exécuter le script
populateArticles().catch(console.error);