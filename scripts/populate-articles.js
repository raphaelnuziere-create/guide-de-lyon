#!/usr/bin/env node

/**
 * Script pour peupler rapidement avec des articles de test
 * Sans passer par OpenAI pour éviter les timeouts
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🚀 PEUPLEMENT RAPIDE DE TEST\n');

async function populateArticles() {
  try {
    // 1. Nettoyer d'abord
    console.log('🧹 Nettoyage des articles existants...');
    const { error: deleteError } = await supabase
      .from('scraped_articles')
      .delete()
      .gte('id', 0); // Supprimer tout
    
    if (deleteError) {
      console.error('Erreur suppression:', deleteError);
    }

    // 2. Créer des articles de test
    console.log('📝 Création d\'articles de test...\n');
    
    const testArticles = [
      {
        title: "Ouverture du nouveau parc de la Tête d'Or",
        slug: "ouverture-nouveau-parc-tete-or",
        original_url: "https://example.com/article1",
        original_title: "Parc Tête d'Or",
        original_content: "Le parc s'agrandit",
        rewritten_content: "Le parc de la Tête d'Or s'agrandit avec une nouvelle zone de 5 hectares dédiée aux familles. Cette extension comprend des aires de jeux innovantes, des espaces de pique-nique ombragés et un parcours sportif adapté à tous les âges. Les travaux, qui ont duré 18 mois, ont permis de créer un espace vert supplémentaire très attendu par les habitants du 6ème arrondissement.",
        featured_image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        source_name: "20 Minutes Lyon",
        published_at: new Date().toISOString(),
        category: "Actualités",
        is_published: true
      },
      {
        title: "Festival des Lumières 2024 : Le programme dévoilé",
        slug: "festival-lumieres-2024-programme",
        original_url: "https://example.com/article2",
        original_title: "Fête des Lumières",
        original_content: "Programme du festival",
        rewritten_content: "La Fête des Lumières 2024 promet d'être exceptionnelle avec plus de 30 installations lumineuses réparties dans toute la ville. Les artistes internationaux proposeront des créations inédites sur les façades des monuments emblématiques. La place Bellecour accueillera une installation monumentale tandis que la cathédrale Saint-Jean bénéficiera d'un mapping vidéo spectaculaire. Le festival se déroulera du 5 au 8 décembre.",
        featured_image_url: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800",
        source_name: "20 Minutes Lyon",
        published_at: new Date(Date.now() - 3600000).toISOString(),
        category: "Culture",
        is_published: true
      },
      {
        title: "Nouvelle ligne de métro E : Début des travaux",
        slug: "nouvelle-ligne-metro-e-travaux",
        original_url: "https://example.com/article3",
        original_title: "Métro ligne E",
        original_content: "Travaux du métro",
        rewritten_content: "Les travaux de la ligne E du métro lyonnais ont officiellement débuté ce matin. Cette nouvelle ligne reliera Alaï à Part-Dieu en passant par le centre-ville, avec 15 stations prévues. Le projet, d'un coût de 2,5 milliards d'euros, devrait être achevé en 2030. Les perturbations de circulation seront minimisées grâce à l'utilisation de tunneliers dernière génération.",
        featured_image_url: "https://images.unsplash.com/photo-1555149385-c50f336e28b0?w=800",
        source_name: "20 Minutes Lyon",
        published_at: new Date(Date.now() - 7200000).toISOString(),
        category: "Transport",
        is_published: true
      },
      {
        title: "OL : Victoire éclatante contre Marseille",
        slug: "ol-victoire-marseille",
        original_url: "https://example.com/article4",
        original_title: "OL - OM",
        original_content: "Match de football",
        rewritten_content: "L'Olympique Lyonnais s'est imposé 3-1 face à Marseille lors du choc de la 15ème journée. Les buts de Lacazette (2) et Cherki ont permis aux Gones de reprendre la 3ème place du classement. Le Groupama Stadium a vibré devant les 58 000 spectateurs présents. Cette victoire relance les ambitions européennes du club rhodanien qui enchaîne une 5ème victoire consécutive.",
        featured_image_url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800",
        source_name: "20 Minutes Lyon",
        published_at: new Date(Date.now() - 10800000).toISOString(),
        category: "Sport",
        is_published: true
      },
      {
        title: "Gastronomie : Un nouveau restaurant étoilé",
        slug: "nouveau-restaurant-etoile-lyon",
        original_url: "https://example.com/article5",
        original_title: "Restaurant étoilé",
        original_content: "Nouvelle étoile Michelin",
        rewritten_content: "Le restaurant 'Les Terrasses de Lyon' vient de décrocher sa première étoile Michelin. Le chef David Delsart propose une cuisine inventive mêlant tradition lyonnaise et modernité. Le menu dégustation à 120€ offre un voyage culinaire en 7 services. La réservation est déjà complète pour les deux prochains mois. Cette distinction porte à 20 le nombre de restaurants étoilés dans la métropole.",
        featured_image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
        source_name: "20 Minutes Lyon",
        published_at: new Date(Date.now() - 14400000).toISOString(),
        category: "Gastronomie",
        is_published: true
      }
    ];

    // 3. Insérer les articles
    const { data, error } = await supabase
      .from('scraped_articles')
      .insert(testArticles)
      .select();

    if (error) {
      console.error('❌ Erreur insertion:', error);
      return;
    }

    console.log('✅ SUCCÈS !');
    console.log(`📊 ${data.length} articles créés\n`);
    
    // 4. Afficher les articles
    data.forEach(article => {
      console.log(`- ${article.title}`);
      console.log(`  ${article.slug}`);
      console.log(`  ${article.category}\n`);
    });

    console.log('🔍 Vérifiez sur :');
    console.log('- LOCAL : http://localhost:3000/actualites');
    console.log('- PROD : https://www.guide-de-lyon.fr/actualites');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Lancer
populateArticles();