const { createDirectus, rest, authentication, createItem } = require('@directus/sdk');
const fs = require('fs');
const path = require('path');

console.log('🚀 MIGRATION VERS DIRECTUS - Guide Lyon v3');
console.log('===========================================');

// Configuration Directus
const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL)
  .with(rest())
  .with(authentication());

// Plans et quotas - Source de vérité
const PLAN_QUOTAS = {
  basic: {
    photos: 1,
    events: 3,
    priority: 3,
    badge: null
  },
  pro: {
    photos: 6,
    events: 3,
    priority: 2,
    badge: 'verified'
  },
  expert: {
    photos: 10,
    events: 5,
    priority: 1,
    badge: 'expert'
  }
};

async function migrateData() {
  try {
    // Connexion à Directus
    console.log('\n🔐 Connexion à Directus...');
    await directus.login({
      email: process.env.DIRECTUS_ADMIN_EMAIL || 'admin@guide-lyon.fr',
      password: process.env.DIRECTUS_ADMIN_PASSWORD || 'AdminPassword123!'
    });
    console.log('✅ Connecté à Directus');

    const exportDir = path.join(__dirname, '../export');
    
    if (!fs.existsSync(exportDir)) {
      throw new Error('❌ Dossier export introuvable. Exécutez d\'abord export-supabase-data.js');
    }

    let migratedCount = {
      businesses: 0,
      events: 0,
      articles: 0
    };

    // =================================
    // 1. MIGRATION DES ÉTABLISSEMENTS
    // =================================
    const businessesFile = path.join(exportDir, 'businesses.json');
    if (fs.existsSync(businessesFile)) {
      console.log('\\n🏢 Migration des établissements...');
      
      const businessesData = JSON.parse(fs.readFileSync(businessesFile, 'utf8'));
      console.log(`📊 ${businessesData.length} établissements à migrer`);

      for (let i = 0; i < businessesData.length; i++) {
        const oldBusiness = businessesData[i];
        
        try {
          // Déterminer le plan (par défaut basic si pas spécifié)
          let plan = 'basic';
          if (oldBusiness.plan && ['basic', 'pro', 'expert'].includes(oldBusiness.plan)) {
            plan = oldBusiness.plan;
          } else if (oldBusiness.subscription_type) {
            // Mapper ancien système vers nouveau
            const planMapping = {
              'free': 'basic',
              'premium': 'pro',
              'enterprise': 'expert'
            };
            plan = planMapping[oldBusiness.subscription_type] || 'basic';
          }

          const quotas = PLAN_QUOTAS[plan];

          // Mapper les données vers le nouveau format
          const newBusiness = {
            // Identité
            name: oldBusiness.name || 'Établissement sans nom',
            slug: generateSlug(oldBusiness.name || oldBusiness.slug || `business-${i}`),
            description: oldBusiness.description || oldBusiness.long_description || null,
            
            // Plan et quotas
            plan: plan,
            photos_quota: quotas.photos,
            events_quota: quotas.events,
            display_priority: quotas.priority,
            badge_type: quotas.badge,
            events_used_this_month: 0,
            
            // Catégorie
            category: mapCategory(oldBusiness.category || oldBusiness.type),
            
            // Contact
            email: oldBusiness.email || null,
            phone: oldBusiness.phone || oldBusiness.telephone || null,
            website: oldBusiness.website || oldBusiness.url || null,
            
            // Adresse
            address: oldBusiness.address || oldBusiness.street_address || null,
            postal_code: oldBusiness.postal_code || oldBusiness.zip_code || null,
            city: oldBusiness.city || 'Lyon',
            latitude: oldBusiness.latitude || oldBusiness.lat || null,
            longitude: oldBusiness.longitude || oldBusiness.lng || null,
            
            // Propriétaire
            owner_email: oldBusiness.owner_email || oldBusiness.contact_email || `owner-${i}@guide-lyon.fr`,
            owner_name: oldBusiness.owner_name || oldBusiness.contact_name || null,
            
            // Statut
            status: oldBusiness.status === 'active' ? 'active' : 'pending',
            
            // Métadonnées
            views_count: oldBusiness.views || oldBusiness.view_count || 0,
            seo_title: oldBusiness.seo_title || null,
            seo_description: oldBusiness.seo_description || null,
            
            // Horaires (si disponibles)
            opening_hours: oldBusiness.opening_hours || oldBusiness.hours || null,
            
            // Stripe (si disponible)
            stripe_customer_id: oldBusiness.stripe_customer_id || null,
            stripe_subscription_id: oldBusiness.stripe_subscription_id || null,
            plan_expires_at: oldBusiness.subscription_expires || null
          };

          // Créer dans Directus
          const createdBusiness = await directus.request(
            createItem('businesses', newBusiness)
          );

          migratedCount.businesses++;
          console.log(`✅ ${migratedCount.businesses}/${businessesData.length} - ${newBusiness.name} (${plan})`);

        } catch (error) {
          console.error(`❌ Erreur migration business ${i}:`, error.message);
        }
      }
      
      console.log(`\\n✅ ${migratedCount.businesses} établissements migrés`);
    }

    // =================================
    // 2. MIGRATION DES ÉVÉNEMENTS
    // =================================
    const eventsFile = path.join(exportDir, 'events.json');
    if (fs.existsSync(eventsFile)) {
      console.log('\\n📅 Migration des événements...');
      
      const eventsData = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
      console.log(`📊 ${eventsData.length} événements à migrer`);

      for (let i = 0; i < eventsData.length; i++) {
        const oldEvent = eventsData[i];
        
        try {
          // Trouver le business correspondant dans Directus
          let businessId = null;
          if (oldEvent.business_id) {
            // TODO: Mapper les anciens IDs vers les nouveaux
            // Pour l'instant, on associe au premier business trouvé
            businessId = oldEvent.business_id;
          }

          const newEvent = {
            business_id: businessId,
            title: oldEvent.title || oldEvent.name || 'Événement sans titre',
            description: oldEvent.description || oldEvent.content || null,
            event_date: oldEvent.event_date || oldEvent.start_date || oldEvent.date || new Date().toISOString(),
            end_date: oldEvent.end_date || null,
            location: oldEvent.location || oldEvent.venue || null,
            price: oldEvent.price || 0,
            
            // Visibilités (seront ajustées par les hooks selon le plan)
            visible_homepage: oldEvent.visible_homepage || false,
            visible_newsletter: oldEvent.visible_newsletter || false,
            visible_social: oldEvent.visible_social || false,
            
            status: oldEvent.status === 'published' ? 'published' : 'draft'
          };

          const createdEvent = await directus.request(
            createItem('events', newEvent)
          );

          migratedCount.events++;
          console.log(`✅ ${migratedCount.events}/${eventsData.length} - ${newEvent.title}`);

        } catch (error) {
          console.error(`❌ Erreur migration event ${i}:`, error.message);
        }
      }
      
      console.log(`\\n✅ ${migratedCount.events} événements migrés`);
    }

    // =================================
    // 3. MIGRATION DES ARTICLES
    // =================================
    const articlesFile = path.join(exportDir, 'articles.json');
    if (fs.existsSync(articlesFile)) {
      console.log('\\n📝 Migration des articles...');
      
      const articlesData = JSON.parse(fs.readFileSync(articlesFile, 'utf8'));
      console.log(`📊 ${articlesData.length} articles à migrer`);

      for (let i = 0; i < articlesData.length; i++) {
        const oldArticle = articlesData[i];
        
        try {
          const newArticle = {
            title: oldArticle.title || 'Article sans titre',
            slug: generateSlug(oldArticle.title || oldArticle.slug || `article-${i}`),
            content: oldArticle.content || oldArticle.body || null,
            excerpt: oldArticle.excerpt || oldArticle.summary || null,
            category: oldArticle.category || 'general',
            tags: oldArticle.tags ? (Array.isArray(oldArticle.tags) ? oldArticle.tags : [oldArticle.tags]) : [],
            author: oldArticle.author || 'Guide de Lyon',
            status: oldArticle.status === 'published' ? 'published' : 'draft',
            published_at: oldArticle.published_at || oldArticle.created_at || new Date().toISOString(),
            views_count: oldArticle.views || 0
          };

          const createdArticle = await directus.request(
            createItem('articles', newArticle)
          );

          migratedCount.articles++;
          console.log(`✅ ${migratedCount.articles}/${articlesData.length} - ${newArticle.title}`);

        } catch (error) {
          console.error(`❌ Erreur migration article ${i}:`, error.message);
        }
      }
      
      console.log(`\\n✅ ${migratedCount.articles} articles migrés`);
    }

    // =================================
    // RAPPORT FINAL
    // =================================
    console.log('\\n🎉 MIGRATION TERMINÉE !');
    console.log('===========================================');
    console.log(`📊 RÉSUMÉ:`);
    console.log(`   🏢 Établissements: ${migratedCount.businesses}`);
    console.log(`   📅 Événements: ${migratedCount.events}`);
    console.log(`   📝 Articles: ${migratedCount.articles}`);
    console.log(`   📈 Total: ${migratedCount.businesses + migratedCount.events + migratedCount.articles} éléments`);

    console.log('\\n🎯 PROCHAINES ÉTAPES:');
    console.log('   1. Vérifier les données dans Directus');
    console.log('   2. Tester l\'affichage sur le site');
    console.log('   3. Configurer les webhooks Stripe');
    console.log('   4. Déployer en production');

    // Créer un rapport de migration
    const report = {
      migration_date: new Date().toISOString(),
      migrated_items: migratedCount,
      plans_configured: PLAN_QUOTAS,
      success: true,
      next_steps: [
        'Vérifier les données dans Directus',
        'Tester les quotas et permissions',
        'Configurer Stripe',
        'Déployer'
      ]
    };

    fs.writeFileSync(
      path.join(exportDir, '_migration_success.json'),
      JSON.stringify(report, null, 2)
    );

  } catch (error) {
    console.error('❌ ERREUR MIGRATION:', error);
    
    // Rapport d'erreur
    const errorReport = {
      migration_date: new Date().toISOString(),
      success: false,
      error: error.message,
      stack: error.stack
    };

    const exportDir = path.join(__dirname, '../export');
    fs.writeFileSync(
      path.join(exportDir, '_migration_error.json'),
      JSON.stringify(errorReport, null, 2)
    );

    process.exit(1);
  }
}

// Fonctions utilitaires
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\\s-]/g, '') // Supprimer caractères spéciaux
    .replace(/\\s+/g, '-') // Remplacer espaces par tirets
    .replace(/-+/g, '-') // Éviter tirets multiples
    .trim('-'); // Supprimer tirets en début/fin
}

function mapCategory(oldCategory) {
  const categoryMapping = {
    'restaurant': 'restaurant',
    'restaurants': 'restaurant',
    'bar': 'bar',
    'bars': 'bar',
    'cafe': 'cafe',
    'coffee': 'cafe',
    'shop': 'boutique',
    'shopping': 'boutique',
    'store': 'boutique',
    'boutique': 'boutique',
    'service': 'services',
    'services': 'services',
    'health': 'services',
    'medical': 'services',
    'culture': 'culture',
    'cultural': 'culture',
    'museum': 'culture',
    'theater': 'culture',
    'entertainment': 'loisirs',
    'fun': 'loisirs',
    'leisure': 'loisirs',
    'sport': 'loisirs',
    'sports': 'loisirs'
  };

  const category = oldCategory?.toLowerCase() || '';
  return categoryMapping[category] || 'services';
}

// Lancer la migration
if (require.main === module) {
  migrateData();
}

module.exports = { migrateData };